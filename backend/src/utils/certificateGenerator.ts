import puppeteer from 'puppeteer';

interface CertificateData {
  recipientName: string;
  certificateType: string;
  issuedFor: string;
  issuedDate: string;
  issuedBy: string;
  certificateNumber?: string;
  purpose?: string;
  achievements?: string;
  recommendations?: string;
  eventTitle?: string;
  eventDate?: string;
  studentInfo?: any;
  patientInfo?: any;
}

export const generateCertificatePDF = async (data: CertificateData): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  
  const html = generateCertificateHTML(data);
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });
  
  await browser.close();
  return Buffer.from(pdf);
};

const generateCertificateHTML = (data: CertificateData): string => {
  const currentDate = new Date(data.issuedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4 landscape;
          margin: 0;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: white;
          width: 297mm;
          height: 210mm;
          margin: 0;
          padding: 0;
        }
        
        .certificate {
          width: 297mm;
          height: 210mm;
          background: white;
          position: relative;
          padding: 12mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .border-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, hsl(105, 93%, 23%), hsl(104, 57%, 34%), hsl(44, 70%, 53%));
        }
        
        .border-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, hsl(105, 93%, 23%), hsl(104, 57%, 34%), hsl(44, 70%, 53%));
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8mm;
        }
        
        .org-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo {
          width: 55px;
          height: 55px;
          background: linear-gradient(135deg, hsl(105, 93%, 23%), hsl(104, 57%, 34%));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 22px;
          font-weight: bold;
        }
        
        .org-details h2 {
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 3px;
        }
        
        .org-details p {
          font-size: 14px;
          color: #718096;
        }
        
        .cert-number {
          font-size: 12px;
          color: #718096;
          text-align: right;
        }
        
        .main-content {
          text-align: center;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 18px;
        }
        
        .recipient {
          margin: 15px 0;
        }
        
        .recipient-label {
          font-size: 14px;
          color: #718096;
          margin-bottom: 10px;
        }
        
        .recipient-name {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          border-bottom: 3px solid hsl(105, 93%, 23%);
          display: inline-block;
          padding-bottom: 5px;
          margin-bottom: 18px;
        }
        
        .description {
          font-size: 16px;
          color: #4a5568;
          line-height: 1.5;
          max-width: 600px;
          margin: 0 auto 18px;
        }
        
        .details {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin: 15px 0;
        }
        
        .detail-item {
          text-align: center;
        }
        
        .detail-label {
          font-size: 12px;
          color: #718096;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 6px;
        }
        
        .detail-value {
          font-size: 15px;
          color: #2d3748;
          font-weight: 600;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 8mm;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }
        
        .signature {
          text-align: center;
          width: 150px;
        }
        
        .signature-line {
          height: 1px;
          background: #2d3748;
          margin-bottom: 6px;
        }
        
        .signature-name {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 3px;
        }
        
        .signature-title {
          font-size: 12px;
          color: #718096;
        }
        
        .decorative-corners {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid hsl(105, 93%, 23%);
        }
        
        .corner-tl {
          top: 8mm;
          left: 8mm;
          border-right: none;
          border-bottom: none;
        }
        
        .corner-tr {
          top: 8mm;
          right: 8mm;
          border-left: none;
          border-bottom: none;
        }
        
        .corner-bl {
          bottom: 8mm;
          left: 8mm;
          border-right: none;
          border-top: none;
        }
        
        .corner-br {
          bottom: 8mm;
          right: 8mm;
          border-left: none;
          border-top: none;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="border-top"></div>
        <div class="border-bottom"></div>
        <div class="decorative-corners corner-tl"></div>
        <div class="decorative-corners corner-tr"></div>
        <div class="decorative-corners corner-bl"></div>
        <div class="decorative-corners corner-br"></div>
        
        <div class="header">
          <div class="org-info">
            <div class="logo">TC</div>
            <div class="org-details">
              <h2>Barangay Binitayan</h2>
              <p>Daraga, Albay, Philippines</p>
            </div>
          </div>
          ${data.certificateNumber ? `<div class="cert-number">Certificate No: ${data.certificateNumber}</div>` : ''}
        </div>
        
        <div class="main-content">
          <h1 class="title">Certificate of ${data.certificateType}</h1>
          <p class="subtitle">This is to certify that</p>
          
          <div class="recipient">
            <div class="recipient-label">This certificate is proudly presented to</div>
            <div class="recipient-name">${data.recipientName}</div>
          </div>
          
          <div class="description">
            ${data.achievements || data.purpose || `for ${data.issuedFor}`}
            ${data.eventTitle ? `<br><br><strong>Event:</strong> ${data.eventTitle}` : ''}
            ${data.eventDate ? `<br><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
          </div>
          
          ${data.recommendations ? `
            <div class="description" style="margin-top: 10px; font-style: italic; color: #718096;">
              <strong>Recommendations:</strong> ${data.recommendations}
            </div>
          ` : ''}
          
          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Date Issued</div>
              <div class="detail-value">${currentDate}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Certificate Type</div>
              <div class="detail-value">${data.certificateType}</div>
            </div>
          </div>
        </div>
        
        <div class="signatures">
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-name">${data.issuedBy}</div>
            <div class="signature-title">Authorized Signatory</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-name">Juan Dela Cruz</div>
            <div class="signature-title">Barangay Captain</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};