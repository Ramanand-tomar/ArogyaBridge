// src/assets/generatePrescriptionPdf.js (Updated file)
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { uploadFileToIPFS } from './uploadToPinata'; // Assuming this is correct
import { saveAs } from 'file-saver'; // Assuming this is correct

const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Star_of_life2.svg/640px-Star_of_life2.svg.png'; // Placeholder logo

export const generateMedicalReportPdf = async ({
  doctorProfile,
  patientNumber,
  title,
  description,
  date,
  diagnosticReport,
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  // Color palette (enhanced)
  const primaryColor = rgb(0.05, 0.25, 0.45); // Deep Blue
  const secondaryColor = rgb(0.9, 0.95, 0.98); // Very Light Blue for backgrounds
  const accentColor = rgb(0.85, 0.3, 0.1); // Warm Orange/Red for emphasis
  const textColor = rgb(0.2, 0.2, 0.2); // Dark Gray for body text
  const lightGray = rgb(0.65, 0.65, 0.65); // For lines and subtle text
  const headerFooterBg = rgb(0.1, 0.4, 0.6); // Slightly lighter blue for header/footer bars

  let cursorY = height - 40; // Starting Y position from top

  // --- Header Section ---
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width,
    height: 90,
    color: headerFooterBg,
  });

  // Logo (positioned better and with error handling)
  try {
    const logoBytes = await fetch(LOGO_URL).then((res) => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.15); // Adjust scale as needed
    page.drawImage(logoImage, {
      x: width - logoDims.width - 40,
      y: height - 75, // Adjust Y for better alignment
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch (e) {
    console.warn('Failed to load logo, skipping image embedding:', e);
    // Optionally draw a placeholder text if logo fails
    page.drawText('ArogyaBridge', {
      x: width - 150,
      y: height - 50,
      size: 14,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
  }

  // Main Title
  page.drawText('Medical Report', {
    x: 40,
    y: height - 60,
    size: 32,
    font: titleFont,
    color: rgb(1, 1, 1),
  });

  cursorY = height - 120; // Adjust cursor after header

  // --- Helper Functions for consistent styling ---
  const drawSectionHeader = (text, yPos) => {
    page.drawRectangle({
      x: 30,
      y: yPos - 25, // Adjusted for height
      width: width - 60,
      height: 35,
      color: secondaryColor,
      borderColor: primaryColor,
      borderWidth: 0.8,
      xRadius: 5,
      yRadius: 5,
    });
    page.drawText(text, {
      x: 45,
      y: yPos - 15, // Adjusted for centering text
      size: 16,
      font: boldFont,
      color: primaryColor,
    });
    return yPos - 50; // Space after header
  };

  const drawLabelValue = (label, value, startX, currentY, labelWidth = 100) => {
    page.drawText(label, {
      x: startX,
      y: currentY,
      size: 11,
      font: boldFont,
      color: primaryColor,
    });
    page.drawText(value, {
      x: startX + labelWidth,
      y: currentY,
      size: 11,
      font: font,
      color: textColor,
    });
    return currentY - 16; // Reduced line spacing
  };

  const drawParagraph = (text, startX, currentY, widthLimit, color = textColor) => {
    const textLines = wrapText(text, widthLimit, font, 11);
    let newY = currentY;
    textLines.forEach((line) => {
      page.drawText(line, {
        x: startX,
        y: newY,
        size: 11,
        font,
        color,
      });
      newY -= 15;
    });
    return newY;
  };

  // --- Doctor Information ---
  cursorY = drawSectionHeader('Doctor Information', cursorY);
  let doctorInfoY = cursorY;
  doctorInfoY = drawLabelValue('Name:', `Dr. ${doctorProfile.name}`, 60, doctorInfoY);
  doctorInfoY = drawLabelValue('Specialization:', doctorProfile.specialization, 60, doctorInfoY);
  doctorInfoY = drawLabelValue('Hospital:', doctorProfile.hospital || 'N/A', 60, doctorInfoY);
  doctorInfoY = drawLabelValue('Email:', doctorProfile.email || 'N/A', 60, doctorInfoY);
  doctorInfoY = drawLabelValue('License No:', 'N/A', 60, doctorInfoY); // Assuming no license number in profile

  cursorY = doctorInfoY - 20; // Space after this section

  // --- Patient Information ---
  cursorY = drawSectionHeader('Patient Information', cursorY);
  let patientInfoY = cursorY;
  patientInfoY = drawLabelValue('Patient ID:', patientNumber, 60, patientInfoY);
  patientInfoY = drawLabelValue('Report Date:', date, 60, patientInfoY);
  patientInfoY = drawLabelValue('Report Title:', title, 60, patientInfoY);
  cursorY = patientInfoY - 20; // Space after this section

  // --- Diagnostic Report Section ---
  cursorY = drawSectionHeader('Diagnostic Findings', cursorY);
  let reportY = cursorY;

  // Diagnosis Summary
  page.drawText('Summary:', {
    x: 60,
    y: reportY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });
  reportY = drawParagraph(diagnosticReport.report.summary, 70, reportY - 15, 480);
  reportY -= 10;

  // Critical Findings
  if (diagnosticReport.report.critical_findings && diagnosticReport.report.critical_findings.length > 0) {
    page.drawText('Critical Findings:', {
      x: 60,
      y: reportY,
      size: 12,
      font: boldFont,
      color: accentColor, // Highlight critical findings
    });
    reportY -= 15;
    diagnosticReport.report.critical_findings.forEach((finding) => {
      reportY = drawParagraph(`• ${finding}`, 70, reportY, 480, accentColor);
    });
    reportY -= 10;
  }

  // Recommended Tests
  if (diagnosticReport.report.recommended_tests && diagnosticReport.report.recommended_tests.length > 0) {
    page.drawText('Recommended Tests:', {
      x: 60,
      y: reportY,
      size: 12,
      font: boldFont,
      color: primaryColor,
    });
    reportY -= 15;
    diagnosticReport.report.recommended_tests.forEach((test, index) => {
      reportY = drawParagraph(`${index + 1}. ${test}`, 70, reportY, 480);
    });
    reportY -= 10;
  }

  // Treatment Plan
  if (diagnosticReport.report.suggested_treatment && diagnosticReport.report.suggested_treatment.length > 0) {
    page.drawText('Suggested Treatment:', {
      x: 60,
      y: reportY,
      size: 12,
      font: boldFont,
      color: primaryColor,
    });
    reportY -= 15;
    diagnosticReport.report.suggested_treatment.forEach((treatment, index) => {
      reportY = drawParagraph(`${index + 1}. ${treatment}`, 70, reportY, 480);
    });
    reportY -= 10;
  }

  // Urgency Level
  const urgencyColor =
    diagnosticReport.report.urgency === 'High'
      ? rgb(0.8, 0.1, 0.1)
      : diagnosticReport.report.urgency === 'Medium'
      ? rgb(0.9, 0.6, 0.1)
      : rgb(0.2, 0.6, 0.2); // Green for Low

  page.drawText('Urgency Level:', {
    x: 60,
    y: reportY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });
  page.drawText(diagnosticReport.report.urgency, {
    x: 160, // Adjusted for better alignment
    y: reportY,
    size: 12,
    font: boldFont,
    color: urgencyColor,
  });
  page.drawCircle({
    x: 150,
    y: reportY + 5,
    size: 4,
    color: urgencyColor,
    // border color can also be added here, but circle is usually filled.
  });
  cursorY = reportY - 30;

  // --- Prescription Details (if description is provided) ---
 

  // --- Signature Section ---
  const signatureLineY = 120;
  page.drawLine({
    start: { x: width - 250, y: signatureLineY },
    end: { x: width - 70, y: signatureLineY },
    thickness: 1,
    color: primaryColor,
  });

  page.drawText(`Dr. ${doctorProfile.name}`, {
    x: width - 240,
    y: signatureLineY - 20,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  page.drawText(doctorProfile.specialization, {
    x: width - 240,
    y: signatureLineY - 35,
    size: 10,
    font: italicFont,
    color: lightGray,
  });

  page.drawText(doctorProfile.hospital || '', {
    x: width - 240,
    y: signatureLineY - 48,
    size: 10,
    font: italicFont,
    color: lightGray,
  });

  // --- Footer ---
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 60,
    color: headerFooterBg,
  });

  page.drawText('This is an electronically generated medical report from ArogyaBridge.', {
    x: 40,
    y: 40,
    size: 10,
    font: italicFont,
    color: rgb(1, 1, 1),
  });

  page.drawText('For verification, visit https://arogya-bridge.vercel.app', {
    x: 40,
    y: 25,
    size: 9,
    font: italicFont,
    color: rgb(1, 1, 1),
  });

  // --- Watermark ---
  page.drawText('CONFIDENTIAL', {
    x: width / 2 - 100, // Adjusted position for better centering
    y: height / 2,
    size: 48,
    font: titleFont,
    color: rgb(0.9, 0.9, 0.9),
    opacity: 0.1,
    rotate: { type: 'degrees', angle: 45 },
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
  const filename = `Medical_Report_${patientNumber}_${timestamp}.pdf`;

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, filename); // This will trigger a download in the browser

  // Upload to IPFS
  try {
    const file = new File([blob], filename, { type: 'application/pdf' });
    const ipfsHash = await uploadFileToIPFS(file); // Make sure uploadFileToIPFS returns the CID

    return {
      ipfsHash, // This is the CID returned from IPFS
      filename,
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error; // Re-throw to handle in calling function
  }
};

// Helper function to wrap text based on font and size
function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const potentialLine = currentLine === '' ? word : `${currentLine} ${word}`;
    const textWidth = font.widthOfTextAtSize(potentialLine, fontSize);

    if (textWidth < maxWidth) {
      currentLine = potentialLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}