const API_BASE = 'http://localhost:3000/api';
export const uploadPdfToDrive = async (email, pdfBytes, formName, customFileName = null) => {
  try {
    let base64Data;
    if (pdfBytes instanceof Uint8Array) {
      base64Data = btoa(String.fromCharCode.apply(null, pdfBytes));
    } else if (pdfBytes instanceof ArrayBuffer) {
      base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(pdfBytes)));
    } else if (typeof pdfBytes === 'string') {
      base64Data = pdfBytes;
    } else {
      throw new Error('Invalid PDF data format');
    }
    const response = await fetch(`${API_BASE}/upload-pdf-to-drive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        pdfBase64: base64Data,
        formName,
        fileName: customFileName
      })
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || 'Upload failed' };
    }
    return {
      success: true,
      document: result.document,
      folderLink: result.folderLink
    };
  } catch (error) {
    console.error('Drive upload error:', error);
    return { success: false, error: error.message };
  }
};
export const uploadPdfWithNotification = async (email, pdfBytes, formName, showToast = null) => {
  const result = await uploadPdfToDrive(email, pdfBytes, formName);
  if (result.success) {
    if (showToast) {
      showToast('PDF uploaded to Google Drive!', 'success');
    }
    console.log(`✅ ${formName} uploaded to Drive successfully`);
  } else {
    if (showToast) {
      showToast(`Drive upload failed: ${result.error}`, 'error');
    }
    console.error(`❌ ${formName} Drive upload failed:`, result.error);
  }
  return result;
};
export default { uploadPdfToDrive, uploadPdfWithNotification };
