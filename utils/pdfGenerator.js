// utils/pdfGenerator.js
import jsPDF from 'jspdf';

export const generateCertificatePDF = (certificate) => {
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Certificate - ${certificate.policyNo}`,
    subject: 'Insurance Backed Guarantee Certificate',
    author: 'Renewably UK'
  });
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text('RENEWABLY UK', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Insurance Backed Guarantee Certificate', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Policy Number: ${certificate.policyNo}`, 105, 40, { align: 'center' });
  
  // Draw line
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  let yPos = 55;
  
  // Contractor Details
  doc.setFontSize(14);
  doc.setTextColor(55, 65, 81); // Gray-700
  doc.text('Contractor Details', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${certificate.rawData?.insurance?.contractorName || 'Not Provided'}`, 20, yPos);
  yPos += 8;
  doc.text(`Address: ${certificate.rawData?.insurance?.contractorAddress || 'Not Provided'}`, 20, yPos);
  yPos += 15;
  
  // Policy Holder Details
  doc.setFontSize(14);
  doc.setTextColor(55, 65, 81);
  doc.text('Policy Holder Details', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${certificate.holderName}`, 20, yPos);
  yPos += 8;
  doc.text(`Email: ${certificate.rawData?.insurance?.email || 'Not Provided'}`, 20, yPos);
  yPos += 8;
  doc.text(`Phone: ${certificate.rawData?.insurance?.phone || 'Not Provided'}`, 20, yPos);
  yPos += 8;
  doc.text(`Address: ${certificate.rawData?.insurance?.address || 'Not Provided'}`, 20, yPos);
  yPos += 15;
  
  // Product Details
  doc.setFontSize(14);
  doc.setTextColor(55, 65, 81);
  doc.text('Product Details', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Product Type: ${certificate.productType}`, 20, yPos);
  yPos += 8;
  doc.text(`Cover Option: ${certificate.rawData?.product?.coverOption || 'Insurance Backed Guarantee'}`, 20, yPos);
  yPos += 8;
  doc.text(`Inception Date: ${certificate.inceptionDate}`, 20, yPos);
  yPos += 8;
  doc.text(`Expiry Date: ${certificate.expiryDate}`, 20, yPos);
  yPos += 8;
  doc.text(`Contract Value: ${certificate.contractValue}`, 20, yPos);
  yPos += 8;
  doc.setTextColor(37, 99, 235); // Blue for price
  doc.text(`Certificate Price: ${certificate.price}`, 20, yPos);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 105, 280, { align: 'center' });
  doc.text('Renewably UK - Powering Renewables', 105, 285, { align: 'center' });
  
  // Save the PDF
  doc.save(`${certificate.policyNo}_certificate.pdf`);
};