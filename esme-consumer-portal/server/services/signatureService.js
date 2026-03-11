const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

const saveSignature = async (email, name, signatureImage, location, signedDate) => {
  return {
    email,
    name,
    signatureImage,
    location,
    signedDate,
    savedAt: new Date().toISOString()
  };
};

const applySignatureToPDF = async (pdfBuffer, signatureImage, location, date) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    const signatureImageBytes = Buffer.from(signatureImage.split(',')[1], 'base64');
    const signatureImg = await pdfDoc.embedPng(signatureImageBytes);
    
    const signatureWidth = 100;
    const signatureHeight = 40;
    
    const dateStr = new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      const signatureX = width - signatureWidth - 50;
      const signatureY = 80;
      
      page.drawImage(signatureImg, {
        x: signatureX,
        y: signatureY,
        width: signatureWidth,
        height: signatureHeight,
      });
      
      page.drawText(`Date: ${dateStr}`, {
        x: signatureX,
        y: signatureY - 15,
        size: 8,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`Place: ${location}`, {
        x: signatureX,
        y: signatureY - 28,
        size: 8,
        color: rgb(0, 0, 0),
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error applying signature to PDF:', error);
    throw error;
  }
};

const applySignatureToMultiplePDFs = async (pdfFiles, signatureImage, location, date) => {
  const signedPDFs = [];
  
  for (const pdfFile of pdfFiles) {
    try {
      const signedPDF = await applySignatureToPDF(pdfFile.buffer, signatureImage, location, date);
      signedPDFs.push({
        originalName: pdfFile.name,
        signedPDF: signedPDF,
        success: true
      });
    } catch (error) {
      signedPDFs.push({
        originalName: pdfFile.name,
        success: false,
        error: error.message
      });
    }
  }
  
  return signedPDFs;
};

module.exports = {
  saveSignature,
  applySignatureToPDF,
  applySignatureToMultiplePDFs
};
