// Hướng dẫn thiết lập Google Apps Script để lưu dữ liệu từ ứng dụng
// 1. Tạo một Google Sheet mới
// 2. Vào Tiện ích mở rộng (Extensions) > Apps Script
// 3. Dán đoạn code bên dưới vào file Mã.gs (Code.gs)
// 4. (Tùy chọn) Chọn hàm setup() ở thanh công cụ phía trên và nhấn "Chạy" (Run) để tạo sheet mẫu ngay lập tức.
// 5. Chọn Triển khai (Deploy) > Tùy chọn triển khai mới (New deployment)
// 6. Chọn loại: Ứng dụng web (Web app)
// 7. Quyền truy cập: Bất kỳ ai (Anyone)
// 8. Nhấn Triển khai (Deploy) và copy URL Web app
// 9. Dán URL đó vào biến môi trường VITE_GAS_URL trong file .env của ứng dụng (hoặc cấu hình trong AI Studio)

var SHEET_NAME = "Kết quả học tập";
var SPREADSHEET_ID = "1M02Q134ucjTzZA6_qCfHGUY6ywMMBRXoQmBZdON-HAc"; // ID từ link bạn gửi

// Hàm này dùng để tạo và định dạng sheet mẫu (có thể chạy thủ công)
function setup() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  // Nếu chưa có sheet, tạo mới
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Thiết lập tiêu đề
  var headers = [
    'ID', 
    'Tên học sinh', 
    'Lớp',
    'Khối',
    'Điểm số', 
    'Tổng số câu', 
    'Tỷ lệ (%)', 
    'Mã Chủ đề', 
    'Mã Cấp độ', 
    'Thời gian (s)',
    'Ngày giờ'
  ];
  
  // Nếu sheet trống (chưa có dòng nào), thêm tiêu đề
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    // Nếu đã có dữ liệu, ghi đè dòng 1 bằng tiêu đề để đảm bảo format
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // Định dạng dòng tiêu đề
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4f46e5'); // Màu nền xanh indigo
  headerRange.setFontColor('#ffffff'); // Chữ màu trắng
  headerRange.setHorizontalAlignment('center');
  
  // Đóng băng dòng đầu tiên
  sheet.setFrozenRows(1);
  
  // Tự động điều chỉnh độ rộng cột
  sheet.autoResizeColumns(1, headers.length);
  
  return sheet;
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    // Nếu sheet chưa tồn tại hoặc bị xóa mất, gọi lại hàm setup để tạo lại
    if (!sheet) {
      sheet = setup();
    }
    
    // Nếu sheet trống (chưa có tiêu đề), tạo lại tiêu đề
    if (sheet.getLastRow() === 0) {
      setup();
    }
    
    // Parse dữ liệu từ request body
    var data = JSON.parse(e.postData.contents);
    
    // Thêm dòng mới vào sheet
    sheet.appendRow([
      data.id || '',
      data.name || '',
      data.className || '',
      data.studentGrade || '',
      data.score || 0,
      data.total || 0,
      data.percentage || 0,
      data.topicId || '',
      data.levelId || '',
      data.timeSpent || 0,
      data.date || new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
