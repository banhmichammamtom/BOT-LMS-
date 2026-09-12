import puppeteer from 'puppeteer';
import axios from 'axios';

// === CONFIG THÔNG TIN ===
// Các giá trị này được đọc từ GitHub Secrets (Settings → Secrets and variables → Actions)
// KHÔNG hardcode trực tiếp vào đây để tránh lộ thông tin khi push lên GitHub

const LMS_URL = 'https://lms.vaa.edu.vn/login/index.php';

// Điền vào GitHub Secret tên là: LMS_USERNAME — giá trị là MSSV của bạn (vd: 12345678)
const USERNAME = process.env.LMS_USERNAME;

// Điền vào GitHub Secret tên là: LMS_PASSWORD — giá trị là mật khẩu LMS của bạn
const PASSWORD = process.env.LMS_PASSWORD;

// Điền vào GitHub Secret tên là: DISCORD_WEBHOOK — giá trị là URL Webhook Discord của bạn
// Lấy tại: Discord Server → Server Settings → Integrations → Webhooks → Copy Webhook URL
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

// ======================================

async function runBot() {
    console.log("🚀 Bot bắt đầu khởi động trên đám mây GitHub Actions...");
    
    // CẤU HÌNH ĐẶC BIỆT CHO SERVER LINUX (GITHUB ACTIONS)
    const browser = await puppeteer.launch({ 
        headless: true, // Bắt buộc phải là true để chạy được trên GitHub Actions
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
        ] 
    }); 
    const page = await browser.newPage();

    // Giả lập trình duyệt thật để không bị LMS chặn bot
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        console.log("🌐 Đang truy cập LMS VAA...");
        // Tăng timeout lên 60s tránh lỗi server GitHub bị lag mạng
        await page.goto(LMS_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.type('#username', USERNAME);
        await page.type('#password', PASSWORD);

        await Promise.all([
            page.click('#loginbtn'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
        ]);

        if (page.url().includes('login/index.php')) {
            console.log("❌ ĐĂNG NHẬP THẤT BẠI! Kiểm tra lại MSSV hoặc Mật khẩu.");
            await axios.post(DISCORD_WEBHOOK, { content: "⚠️ **Cảnh báo:** Bot không đăng nhập được LMS. Check lại mật khẩu trong code nhé!" });
            await browser.close();
            return;
        }

        console.log("🔓 Đăng nhập thành công, đang phi thẳng vào kho bài tập...");

        await page.goto('https://lms.vaa.edu.vn/calendar/view.php?view=upcoming', { waitUntil: 'networkidle2', timeout: 60000 });

        // MẮT THẦN QUÉT BÀI TẬP VAA 
        const baiTapList = await page.evaluate(() => {
            let items = [];
            let events = document.querySelectorAll('[data-region="event-item"], .event, .list-group-item, .card, .calendar_event_upcoming'); 
            
            events.forEach(event => {
                let nameEl = event.querySelector('h3, h4, h5, .name, [data-region="event-name"]');
                let name = nameEl ? nameEl.innerText.trim() : null;

                let course = "Chưa rõ môn học";
                let courseEl = event.querySelector('a[href*="course/view.php"], [data-region="course-details"] a, .course');
                if (courseEl) {
                    course = courseEl.innerText.trim();
                }

                let deadline = "Chưa rõ thời gian";
                let textElements = event.querySelectorAll('div, span, li');
                for (let el of textElements) {
                    let text = el.innerText.trim();
                    if ((text.includes('tháng') || text.includes('AM') || text.includes('PM')) && text.length < 60) {
                        deadline = text;
                        break;
                    }
                }
                
                if (name && name.length > 2 && !items.some(i => i.name === name)) {
                    items.push({ 
                        name: name.replace(/\n/g, ' '), 
                        course: course.replace(/\n/g, ' '),
                        deadline: deadline.replace(/\n/g, ' ') 
                    });
                }
            });
            return items;
        });

        // XỬ LÝ KẾT QUẢ & BẮN VỀ DISCORD
        if (baiTapList.length === 0) {
            console.log("🎉 Không tìm thấy bài tập nào sắp tới hạn.");
        } else {
            console.log(`🎯 BINGO! Bắt được ${baiTapList.length} bài tập! Đang bắn tin nhắn...`);
            
            let tinNhan = "🚨 **CẢNH BÁO BÀI TẬP TỪ VAA LMS** 🚨\n\n";
            baiTapList.forEach((bt, index) => {
                tinNhan += `**${index + 1}. Môn:** ${bt.course}\n📝 **Bài tập:** ${bt.name}\n📅 **Hạn nộp:** ${bt.deadline}\n-----------------------\n`;
            });

            await axios.post(DISCORD_WEBHOOK, { content: tinNhan });
            console.log("🚀 Đã bắn thông báo thành công về Discord!");
        }

        await browser.close();

    } catch (error) {
        console.error("❌ Có lỗi xảy ra:", error.message);
        try { await browser.close(); } catch(e) {}
    }
}

// Chạy bot
runBot();
