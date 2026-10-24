# Web cập nhật dữ liệu trường hợp 1

Website TH1 đọc nguồn Google công khai tại thời điểm sử dụng, chạy tĩnh trên GitHub Pages. Không cần máy tính cá nhân chạy và không có máy chủ riêng.

## Cập nhật số liệu
1. Sửa dữ liệu tại https://docs.google.com/spreadsheets/d/1Mifwp9v0Geh5KZMpmrRZ9bSgmrm9xDDG/edit và đợi Google lưu xong.
2. Mở website hoặc bấm **Làm mới dữ liệu**. App tự kiểm tra mỗi 60 giây khi tab hiển thị và ngay khi quay lại tab.
3. Xem trạng thái và **Đọc thành công gần nhất** ở đầu trang. Số liệu thay đổi không cần xuất HTML, upload hay deploy lại. Các bộ lọc hợp lệ được giữ, vì vậy quý mới sẽ xuất hiện trong danh sách nhưng không ép đổi quý đang phân tích.

Google có thể giữ cache hoặc chậm xuất bản chỉnh sửa. App dùng `cache: no-store`, tham số thời gian, `credentials: omit`; chu kỳ kiểm tra 60 giây không bảo đảm dữ liệu vừa sửa xuất hiện trong đúng 60 giây. Mốc hiển thị là lúc đọc nguồn thành công, không phải lúc Google xác nhận mọi chỉnh sửa đã được phản ánh.

## Nguồn và đổi nguồn
- Nguồn hiện là `.xlsx` mở trong giao diện Google Sheets; đã kiểm tra đọc ẩn danh thành công. App tải bản xuất XLSX trực tiếp từ đúng ID nguồn, không chuyển đổi hoặc thay quyền chia sẻ.
- Sửa `spreadsheetId`, `sourceName`, `flowMode` trong `config.js` rồi commit lên GitHub nếu đổi nguồn. `flowMode: quarterly` cho số riêng quý; `ytd` cho số lũy kế từ đầu năm.
- Giữ các tab `MaCK` và `BCTC`, tên header đầy đủ và đơn vị đồng. Mapping theo tên header; không phụ thuộc thứ tự cột, số dòng hay quý cuối. Kỳ trùng, mã ngoài danh mục hoặc thiếu header bắt buộc sẽ bị từ chối.
- Không tự sửa nguồn hoặc công khai thêm dữ liệu. Nếu quyền bị thu hồi, chủ file cần tự đặt Chia sẻ → Quyền truy cập chung → Bất kỳ ai có đường liên kết → Người xem, **chỉ khi vẫn muốn dùng TH1 công khai**. Với Google Sheets gốc mới, dùng Tệp → Lưu dưới dạng Google Trang tính nếu chủ file muốn chuyển đổi, rồi thay ID; app không tự làm bước này.

## Lỗi và dữ liệu cũ
- Lỗi HTTP/mạng/CORS/timeout: kiểm tra Internet và mở link nguồn bằng cửa sổ không đăng nhập. Bấm Làm mới dữ liệu để thử lại. Không chuyển sang file nhúng, nguồn khác hay dữ liệu mẫu.
- Sai schema: khôi phục các tab và header bắt buộc, cột Năm/Quý phải là số, Mã CK–Năm–Quý duy nhất; không nhập số tiền dưới dạng chuỗi có dấu phân cách.
- Thiếu dữ liệu, thiếu 4 quý liên tiếp hoặc mẫu số 0: KPI N/A cùng DataFlag; không thay bằng 0. Kiểm tra Chất lượng dữ liệu và Export Audit Excel.
- Khi lỗi sau lần đọc thành công, toàn bộ bản hợp lệ trước được giữ trong phiên và hiện **DỮ LIỆU CŨ** cùng mốc đọc thành công. Lần mở đầu mà lỗi thì không hiển thị KPI dự phòng.
- Upload Excel là chế độ thủ công trong phiên, tạm dừng tự đọc Google; bấm Làm mới dữ liệu để quay về nguồn cấu hình. Không ghi ngược Google. Dữ liệu không lưu lâu dài trong trình duyệt.

## Chức năng giữ nguyên
Hai tab, bộ lọc, biểu đồ ECharts tương tác, phân tích tự động, nhóm cố định, TTM đúng 4 quý, AVG4 đúng 4 số dư cuối quý, tỷ lệ nhóm/ngành từ tổng tử số/mẫu số, median riêng, Export Audit Excel công thức thật và báo cáo HTML 3 trang A4 (In / Lưu PDF). Bộ máy core và audit giữ nguyên từ HTML gốc; sheet Methodology bổ sung nguồn và trạng thái đọc lúc xuất.

Tải HTML kết nối nguồn chỉ tải mã trang, không đóng băng dữ liệu và cần hai file JS bên cạnh. Không cần chức năng này để cập nhật số liệu chia sẻ.

## Triển khai
Upload đầy đủ `index.html`, `config.js`, `public-source.js`, `.nojekyll` và hướng dẫn này vào gốc repository. GitHub Settings → Pages → Deploy from a branch → main → /(root). Các đường dẫn JS đều tương đối để chạy tại /tên-repository/. Không upload bản Excel, log, test, cache hay credential.

## Phạm vi kiểm chứng
Không sửa dữ liệu thật để thử. Đã đọc trực tiếp nguồn ẩn danh; việc thay đổi/quý mới, mất kết nối, lỗi mapping, cache không đổi và bảo toàn bộ lọc được thử trên bản thử hoặc dữ liệu giả lập. Không coi kiểm thử mô phỏng là bằng chứng về độ trễ cập nhật chỉnh sửa thật trên Google.
