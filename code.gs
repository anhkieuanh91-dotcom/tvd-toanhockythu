/**
 * GOOGLE APPS SCRIPT FOR MATH GAME
 * 
 * Hướng dẫn sử dụng:
 * 1. Mở Google Sheets bạn muốn lưu dữ liệu.
 * 2. Chọn Tiện ích mở rộng > Apps Script.
 * 3. Xóa hết mã hiện tại và dán mã này vào.
 * 4. Nhấn nút "Chạy" hàm setupSpreadsheet để tạo các sheet mẫu.
 * 5. Nhấn nút "Triển khai" > "Triển khai mới".
 * 6. Chọn loại là "Ứng dụng web".
 * 7. Ở mục "Người có quyền truy cập", chọn "Bất kỳ ai".
 * 8. Copy URL ứng dụng web và dán vào file .env hoặc constants của dự án (VITE_GAS_URL).
 */

function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var grades = ["Khối 1", "Khối 2", "Khối 3", "Khối 4", "Khối 5"];
  
  var headers = [
    "Thời gian", 
    "Họ và tên", 
    "Lớp", 
    "Khối", 
    "Điểm số", 
    "Tổng câu", 
    "Tỷ lệ (%)", 
    "Chủ đề", 
    "Mức độ", 
    "Thời gian làm (giây)"
  ];
  
  grades.forEach(function(gradeName) {
    var sheet = ss.getSheetByName(gradeName);
    if (!sheet) {
      sheet = ss.insertSheet(gradeName);
    }
    
    // Thiết lập header
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
    
    // Tự động điều chỉnh độ rộng cột
    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  });
  
  // Xóa sheet mặc định nếu trống
  var defaultSheet = ss.getSheetByName("Trang tính1") || ss.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }
  
  Logger.log("Đã tạo mẫu trang tính thành công!");
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Xác định sheet dựa trên khối lớp
    // studentGrade thường có giá trị như "1", "2", "3", "4", "5"
    var gradeNum = data.studentGrade || data.gradeId;
    var sheetName = "Khối " + gradeNum;
    
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      // Nếu không tìm thấy sheet khối, lưu vào sheet chung hoặc tạo mới
      sheet = ss.getSheetByName("Khác") || ss.insertSheet("Khác");
      if (sheet.getLastRow() === 0) {
        var headers = ["Thời gian", "Họ và tên", "Lớp", "Khối", "Điểm số", "Tổng câu", "Tỷ lệ (%)", "Chủ đề", "Mức độ", "Thời gian làm (giây)"];
        sheet.appendRow(headers);
      }
    }
    
    // Định dạng ngày tháng
    var date = new Date(data.date);
    var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    // Chuẩn bị dòng dữ liệu
    var row = [
      formattedDate,
      data.name,
      data.className,
      gradeNum,
      data.score,
      data.total,
      data.percentage + "%",
      data.topicId,
      data.levelId,
      data.timeSpent
    ];
    
    // Thêm vào sheet
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Hệ thống lưu điểm Toán Học Kỳ Thú đang hoạt động.");
}
