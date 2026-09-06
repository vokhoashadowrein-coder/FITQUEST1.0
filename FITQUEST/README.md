# FITQUEST — bộ mã nguồn cho GitHub Pages

Bản xuất ngày 06/09/2026 từ website FITQUEST đang phát triển. Đây là mã HTML, CSS, JavaScript và hình ảnh thực tế; các đường dẫn đã được đổi theo thư mục mới. Không cần bước biên dịch hoặc cài thư viện để đưa lên hosting tĩnh.

## 1. Có gì trong bộ mã nguồn?

- Trang chủ: buổi tập, biểu đồ tuần, thẻ thành tích và bảng tự chỉnh sửa giao diện.
- Khởi động nhẹ: 6 bài, hướng dẫn và phần thưởng 70 XP.
- Khởi động chính: 6 bài theo hiệp, nghỉ giữa hiệp, checkpoint và 215 XP.
- Thể chất & thang dây: 10 bài, bộ đếm hiệp/vòng, nghỉ và 370 XP.
- Dây kháng lực: 6 bài chia hai nhóm; bộ đếm từng chân; Squat chọn 5–8 lần; Sprint chọn 1–2 hiệp và quãng chạy 3–5 m; nghỉ 60/90/120 giây; tổng 220 XP.
- Dummy 3D cho 28 bài: hướng dẫn 90 giây, phát/dừng, lặp, tốc độ 0.5x/1x, góc trước/bên/360°. Module dây kháng lực có dây chuyển động theo nhân vật và người hỗ trợ trong bài Sprint.

AI Sports Coach hiện là tên định hướng sản phẩm. Chưa có AI huấn luyện, nhận diện camera, đăng nhập, cơ sở dữ liệu hoặc đồng bộ học sinh.

## 2. Cấu trúc và file cần sửa

| File / thư mục | Vai trò |
| --- | --- |
| `index.html` | Trang chủ, chữ, các khối giao diện và liên kết module |
| `warmup.html` | Trang Khởi động nhẹ |
| `main-warmup.html` | Trang Khởi động chính |
| `strength.html` | Trang Thể chất & thang dây |
| `resistance.html` | Trang Dây kháng lực |
| `css/style.css` | Kiểu chung, màu, bố cục trang chủ, responsive |
| `css/animation.css` | Khung hiển thị và các nút điều khiển mô phỏng |
| `css/warmup.css`, `main-warmup.css`, `strength.css`, `resistance.css` | Giao diện từng module; có dùng chung các lớp CSS |
| `css/editor.css` | Bảng tự chỉnh sửa giao diện trang chủ |
| `js/app.js` | Tương tác trang chủ và biểu đồ |
| `js/warmup.js`, `main-warmup.js`, `strength.js`, `resistance.js` | Dữ liệu bài tập, điều hướng màn hình, bộ đếm, nghỉ và XP của từng module |
| `js/editor.js` | Chỉnh chữ, màu, cỡ chữ, thứ tự khối; lưu/xuất/nhập thiết kế |
| `js/dummy.js` | Nhân vật 3D, camera, timeline và điều khiển phát |
| `js/motion/poses.js` | Các tư thế của 22 bài khởi động/thể chất/thang dây |
| `js/motion/band-poses.js` | Sáu chuyển động dây kháng lực và người hỗ trợ |
| `js/motion/band-visual.js` | Dựng và cập nhật hình dáng dây theo khớp nhân vật |
| `js/vendor/` | Three.js 0.180.0 được đóng gói cùng mã nguồn và giấy phép MIT |
| `assets/images/runners.png` | Hình minh họa ở trang chủ |
| `.nojekyll` | Cho phép phục vụ trực tiếp website tĩnh trên GitHub Pages |

Sơ đồ `timer.js` và `exercise.js` trước đó là gợi ý tổ chức, chưa phải tên các file thực tế. Trong bản này, timer và danh sách bài nằm trong file JavaScript của từng module. Giữ cách tổ chức đó giúp bảo toàn website đang hoạt động. Các module ở gốc cùng `index.html`, nên không cần thư mục `pages/`.

Dummy được dựng bằng hình học trong JavaScript, chưa dùng file `.glb`/`.gltf`; vì vậy không có tài nguyên mô hình cần đặt vào `assets/models/`. Biểu tượng hiện tại chủ yếu là chữ, emoji và CSS.

## 3. Chạy thử trên máy tính

1. Giải nén ZIP và mở thư mục **FITQUEST**.
2. Nếu máy đã có Python, mở Terminal trong thư mục này và chạy:

```sh
python -m http.server 8000
```

Trên Windows, nếu lệnh `python` chưa được nhận diện nhưng đã cài Python, có thể dùng:

```sh
py -m http.server 8000
```

3. Mở `http://localhost:8000/` trong trình duyệt.
4. Dừng máy chủ bằng `Ctrl+C`.

Không mở bằng cách nhấp đúp file HTML nếu muốn kiểm tra đầy đủ 3D: ES modules cần được phục vụ qua HTTP/HTTPS. Nhân vật 3D cần trình duyệt và thiết bị hỗ trợ WebGL 2; khi không hỗ trợ, trang vẫn có hướng dẫn bằng chữ.

## 4. Đưa lên GitHub Pages bằng giao diện web

1. Đăng nhập GitHub và tạo repository tên **FITQUEST**. Nếu dùng GitHub Free để xuất bản Pages theo cách này, chọn repository **Public**.
2. Chọn **Add file → Upload files**. Tải lên **toàn bộ nội dung bên trong thư mục FITQUEST đã giải nén**, gồm HTML và các thư mục `css`, `js`, `assets`, README. Giữ cả `.nojekyll`.
3. Chọn **Commit changes**. Không chỉ tải file ZIP: GitHub Pages cần các file đã giải nén. `index.html` phải ở gốc repository, không nằm trong một thư mục FITQUEST lồng thêm.
4. Mở **Settings → Pages → Build and deployment**.
5. Ở **Source**, chọn **Deploy from a branch**; chọn nhánh **main**, thư mục **/(root)**, rồi **Save**.
6. Chờ GitHub hoàn tất triển khai và mở đường dẫn được hiển thị trong **Pages**. Dạng thường gặp là `https://TEN-TAI-KHOAN.github.io/FITQUEST/` — đây là mẫu, không phải link đã được tạo cho bạn.

Bộ mã nguồn này chưa được tải lên tài khoản GitHub của bạn. Khi bật Pages công khai, người khác có thể xem website; repository Public cũng công khai mã nguồn.

Tài liệu chính thức:

- [Tải file lên repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Cấu hình nguồn xuất bản GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Tạo GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## 5. Tự thiết kế giao diện và cập nhật sau này

**Sửa bằng bảng có sẵn:** mở trang chủ → **Chỉnh sửa giao diện**. Bạn có thể thay chữ, màu, phông, cỡ chữ, bo góc và thứ tự các khu vực. Chọn **Lưu trên trình duyệt này**, hoặc **Xuất thiết kế** để giữ file JSON.

Thiết kế lưu trên trình duyệt chỉ áp dụng tại trình duyệt và tên miền đó. Nó không tự sửa mã nguồn GitHub cho tất cả người dùng. Muốn chuyển thiết kế từ website cũ sang GitHub Pages, hãy **Xuất thiết kế** ở website cũ, sau đó **Nhập thiết kế** trên website mới.

**Sửa mã nguồn để mọi người thấy:** sửa `index.html` và `css/style.css` rồi commit các file thay đổi vào nhánh xuất bản. Muốn sửa bài tập, mở file `js` tương ứng, tìm mảng `exercises` ở đầu file. Khi cập nhật đường dẫn, giữ tên file và chữ hoa/thường chính xác.

## 6. Dữ liệu và trạng thái bản trải nghiệm

- Thông tin Minh, Level 12, streak 7 ngày và biểu đồ trên trang chủ là dữ liệu mẫu.
- XP/hiệp/vòng trong mỗi module được giữ trong bộ nhớ của lượt mở trang, chưa lưu hồ sơ. Tải lại hoặc chuyển khỏi trang sẽ đặt lại lượt tập; XP chưa cộng chung vào trang chủ.
- Xem animation không tự xác nhận đã tập. Người tập hoặc bạn cùng tập bấm xác nhận số lần. Thời gian kết quả đo thời gian tập/nghỉ thực tế, không gán sẵn “12 phút”.
- `Streak +1` ở màn hình hoàn thành là minh họa, chưa có lịch sử theo ngày.
- Dây “15 kg” là nhãn theo yêu cầu thiết kế, không phải lực mặc định cho mọi học sinh. Đọc khung an toàn trên trang; giáo viên cần chọn dụng cụ và mức lực phù hợp.
- Hình mô phỏng dây không thể hiện tỉ lệ chiều dài, lực căng hoặc giới hạn giãn của sản phẩm thật. Bài Sprint cần dụng cụ phù hợp và người hỗ trợ.

## 7. Kiểm tra kỹ thuật và tài nguyên

Đã kiểm tra cú pháp JavaScript, đường dẫn nội bộ, luồng 6 bài dây kháng lực, bộ đếm hai chân, nghỉ/tạm dừng và tổng 220 XP. Đã kiểm tra phép tính hình học của 28 hướng dẫn, vị trí dây và điều khiển bằng môi trường kiểm tra không có GPU. Chưa xác nhận hiển thị WebGL trên điện thoại thực tế; hãy mở các bài và kiểm tra trước khi dùng trong lớp.

Three.js được giữ kèm giấy phép tại `js/vendor/THREE-LICENSE.txt`. Không có khóa API, tài khoản hoặc thông tin xác thực hosting trong gói xuất này.
