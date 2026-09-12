# 🤖 Bot LMS VAA — Nhắc Bài Tự Động

Bot tự động đăng nhập vào hệ thống **LMS của Học viện Hàng không Việt Nam (VAA)**, quét các bài tập sắp đến hạn và gửi thông báo về **Discord** qua Webhook.

Bot chạy hoàn toàn tự động trên **GitHub Actions** — miễn phí, không cần máy chủ riêng.

---

## ✨ Tính năng

- 🔐 Tự động đăng nhập LMS VAA
- 📅 Quét danh sách bài tập sắp đến hạn từ lịch upcoming
- 📢 Gửi thông báo về kênh Discord qua Webhook
- ⏰ Chạy tự động mỗi ngày lúc **7:00 sáng (GMT+7)**
- ☁️ Chạy hoàn toàn trên GitHub Actions — không tốn chi phí

---

## 🚀 Hướng dẫn cài đặt

### Bước 1 — Fork repo này

Nhấn nút **Fork** ở góc trên bên phải trang GitHub để sao chép repo về tài khoản của bạn.

---

### Bước 2 — Tạo Discord Webhook

1. Vào **Discord Server** của bạn
2. Chọn kênh muốn nhận thông báo → **Edit Channel** (⚙️)
3. Chọn tab **Integrations** → **Webhooks** → **New Webhook**
4. Đặt tên bot (vd: `Bot LMS VAA`), chọn kênh
5. Nhấn **Copy Webhook URL** — lưu lại URL này

---

### Bước 3 — Thêm GitHub Secrets

Vào repo GitHub đã fork của bạn:

> **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Thêm lần lượt **3 secret** sau:

| Tên Secret | Giá trị cần điền |
|---|---|
| `LMS_USERNAME` | MSSV của bạn (vd: `12345678`) |
| `LMS_PASSWORD` | Mật khẩu đăng nhập LMS của bạn |
| `DISCORD_WEBHOOK` | URL Webhook Discord ở Bước 2 |

> ⚠️ **Lưu ý:** Không bao giờ điền thông tin thật trực tiếp vào file code. Luôn dùng GitHub Secrets.

---

### Bước 4 — Kích hoạt GitHub Actions

1. Vào tab **Actions** trên repo của bạn
2. Nếu thấy thông báo yêu cầu kích hoạt, nhấn **"I understand my workflows, go ahead and enable them"**
3. Chọn workflow **LMS VAA Auto Scraper** → nhấn **Run workflow** để chạy thử ngay

---

## ⏰ Lịch chạy tự động

Bot được lên lịch chạy mỗi ngày lúc **00:00 UTC** (tức **7:00 sáng GMT+7**).

Để thay đổi giờ, sửa dòng `cron` trong file `.github/workflows/main.yml`:

```yaml
# Cú pháp: phút giờ ngày tháng thứ (UTC)
- cron: '0 0 * * *'   # 00:00 UTC = 07:00 GMT+7
- cron: '0 2 * * *'   # 02:00 UTC = 09:00 GMT+7
- cron: '30 13 * * *' # 13:30 UTC = 20:30 GMT+7
```

Dùng [crontab.guru](https://crontab.guru) để tạo biểu thức cron theo ý muốn.

---

## 📁 Cấu trúc project

```
bot-lms-main/
├── .github/
│   └── workflows/
│       └── main.yml       # Cấu hình GitHub Actions (lịch chạy, các bước thực thi)
├── bot-lms.js             # Toàn bộ logic của bot
├── package.json           # Khai báo thư viện Node.js
└── README.md              # File hướng dẫn này
```

---

## 🛠️ Công nghệ sử dụng

| Thư viện | Mục đích |
|---|---|
| [Puppeteer](https://pptr.dev) | Điều khiển trình duyệt, đăng nhập và scrape LMS |
| [Axios](https://axios-http.com) | Gửi HTTP request tới Discord Webhook |
| [GitHub Actions](https://docs.github.com/en/actions) | Nền tảng chạy bot tự động miễn phí |

---

## ❓ Câu hỏi thường gặp

**Q: Bot có lưu mật khẩu của tôi không?**
A: Không. Mật khẩu được lưu trong GitHub Secrets — được mã hoá, chỉ GitHub Actions mới đọc được khi chạy, không ai khác xem được kể cả chủ repo.

**Q: Bot có chạy được nếu LMS đổi giao diện không?**
A: Có thể không. Nếu LMS VAA thay đổi cấu trúc HTML, bạn cần cập nhật lại các CSS selector trong file `bot-lms.js`.

**Q: Tôi muốn chạy thử thủ công được không?**
A: Được. Vào tab **Actions** → chọn workflow → nhấn **Run workflow**.

**Q: Bot báo lỗi đăng nhập thất bại?**
A: Kiểm tra lại giá trị của secret `LMS_USERNAME` và `LMS_PASSWORD` trong phần Settings của repo.

---

## 📄 License

MIT — Tự do sử dụng, chỉnh sửa và chia sẻ.

