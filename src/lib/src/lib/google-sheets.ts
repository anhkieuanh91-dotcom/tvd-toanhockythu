import { API_CONSTANTS } from '@/src/constants';

export const saveToGoogleSheets = async (data: any) => {
  // Lấy URL từ biến môi trường
  const gasUrl = API_CONSTANTS.GAS_URL;
  console.log('Using Google Apps Script URL:', gasUrl);
  
  if (!gasUrl) {
    console.warn('VITE_GAS_URL is not defined. Skipping save to Google Sheets.');
    return;
  }

  try {
    console.log('Attempting to save data to Google Sheets...', data);
    
    // Sử dụng fetch với mode: 'no-cors' vì Google Apps Script không hỗ trợ CORS preflight
    // Lưu ý: Với no-cors, chúng ta không thể đọc được nội dung phản hồi (response)
    const response = await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    
    console.log('Request sent to Google Sheets successfully (no-cors mode).');
    console.log('Please check your Google Sheet and Apps Script Executions log to verify.');
  } catch (error) {
    console.error('CRITICAL ERROR saving to Google Sheets:', error);
  }
};
