import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, CreditCard, Download, Eye, FileText, IndianRupee, Wallet, XCircle } from 'lucide-react';
import Shimmer from '../../components/Shimmer/Shimmer';
import './PaymentHistory.css';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';

const PaymentHistory = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [downloadReceipt, setDownloadReceipt] = useState(null);
  
  const payments = [
    { id: 1, date: '2024-12-01', purpose: 'Tuition Fee - Fall Semester', amount: 2500, status: 'paid', bank: 'IOB', receipt: '#INV-001' },
    { id: 2, date: '2024-11-15', purpose: 'Library Fee', amount: 150, status: 'paid', bank: 'Axis', receipt: '#INV-002' },
    { id: 3, date: '2024-11-01', purpose: 'Tuition Fee - Spring Semester', amount: 2500, status: 'paid', bank: 'SBI', receipt: '#INV-003' },
    { id: 4, date: '2024-10-20', purpose: 'Research Materials', amount: 300, status: 'pending', bank: 'Karnataka', receipt: '#INV-004' },
    { id: 5, date: '2024-10-01', purpose: 'Lab Fee', amount: 200, status: 'paid', bank: 'BOB', receipt: '#INV-005' },
  ];
  
  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);
  // }, []);
  
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  
  // if (loading) {
  //   return <Shimmer type="table" count={1} />;
  // }

  // Add this helper function to convert amount to words
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertToWords = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertToWords(n % 100) : '');
    if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertToWords(n % 1000) : '');
    if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convertToWords(n % 100000) : '');
    return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convertToWords(n % 10000000) : '');
  };

  if (num === 0) return 'Zero';
  return convertToWords(Math.floor(num));
};
  

const handleDownloadReceipt = async () => {
  try {
    // Show loading indicator (optional)
    const downloadBtn = document.querySelector('.receipt-download-btn');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = 'Generating PDF...';
    downloadBtn.disabled = true;

    const element = document.getElementById('receipt-content');
    
    // Store original styles
    const originalWidth = element.style.width;
    const originalPadding = element.style.padding;
    const originalMargin = element.style.margin;
    const originalBoxShadow = element.style.boxShadow;
    
    // Temporarily style for better PDF capture
    element.style.width = '800px';
    element.style.padding = '40px';
    element.style.margin = '0';
    element.style.background = 'white';
    element.style.boxShadow = 'none';
    
    // Generate canvas
    const canvas = await html2canvas(element, {
      scale: 3, // Higher scale for better quality
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    
    // Restore original styles
    element.style.width = originalWidth;
    element.style.padding = originalPadding;
    element.style.margin = originalMargin;
    element.style.boxShadow = originalBoxShadow;
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate dimensions
    const imgWidth = 190; // A4 width in mm (with margins)
    const pageHeight = 277; // A4 height in mm (with margins)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pageNumber++;
    }
    
    // Save the PDF
    pdf.save(`receipt_${downloadReceipt.receipt}_${new Date().getTime()}.pdf`);
    
    // Show success message
    showToastMessage('Receipt downloaded successfully!', 'success');
    
    // Reset button
    downloadBtn.innerHTML = originalText;
    downloadBtn.disabled = false;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Show error message
    showToastMessage('Error generating receipt. Please try again.', 'error');
    
    // Reset button
    const downloadBtn = document.querySelector('.receipt-download-btn');
    if (downloadBtn) {
      downloadBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Receipt';
      downloadBtn.disabled = false;
    }
  }
};

// Helper function for toast message (if you don't have one)
const showToastMessage = (message, type = 'success') => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `complaint-success-toast ${type === 'error' ? 'error-toast' : ''}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' ? '<path d="M20 6L9 17l-5-5"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    <span class="complaint-success-message">${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

// Add this CSS for error toast and slideOut animation
const additionalCSS = `
.error-toast {
  background: #ef4444 !important;
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;

// Add CSS to document
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);


  return (
    <div className="payment-history-page">
      <div className="page-header">
        <h1>Payment History</h1>
        <p>View and manage your payment transactions</p>
      </div>
      
      <div className="payment-stats">
        <div className="stat-card">
          <div className="stat-icon green">
            <IndianRupee size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Amount</span>
            <span className="stat-value">{"50000"}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Paid</span>
            <span className="stat-value">₹{totalPaid.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Payment</span>
            <span className="stat-value">₹{totalPending.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon violet">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value">{payments.filter(p => p.status === 'paid').length}</span>
          </div>
        </div>
        
      </div>
      
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Payment Purpose</th>
              <th>Amount</th>
              <th>Bank</th>
              <th>Status</th>
              <th>View</th>
              <th>Print</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{new Date(payment.date).toLocaleDateString()}</td>
                <td>{payment.purpose}</td>
                <td>₹{payment.amount.toLocaleString()}</td>
                <td>{payment.bank}</td>
                <td>
                  <span className={`status-badge ${payment.status}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Eye size={16} />
                    </button>
                    
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => setDownloadReceipt(payment)}
                    >
                      <Download size={16} />
                    </button>
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
            <h3>Payment Details</h3>
            <button className="complaint-modal-close-btn" onClick={() => setSelectedPayment(null)}>
                <XCircle size={24} />
              </button>
            </div>
            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">Receipt Number:</span>
                <span>{selectedPayment.receipt}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span>{new Date(selectedPayment.date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Purpose:</span>
                <span>{selectedPayment.purpose}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span>₹{selectedPayment.amount.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Bank:</span>
                <span>{selectedPayment.bank}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${selectedPayment.status}`}>
                  {selectedPayment.status}
                </span>
              </div>
            </div>
            {/* <button className="close-modal" onClick={() => setSelectedPayment(null)}>
              Close
            </button> */}
          </div>
        </div>
      )}
     {downloadReceipt && (
  <div className="modal-overlay" onClick={() => setDownloadReceipt(null)}>
    <div className="receipt-modal-container" onClick={(e) => e.stopPropagation()}>
      {/* Fixed Header */}
      <div className="receipt-modal-header">
        <h3>Payment Receipt</h3>
        <button className="receipt-modal-close-btn" onClick={() => setDownloadReceipt(null)}>
          <XCircle size={24} />
        </button>
      </div>
      
      {/* Scrollable Body */}
      <div className="receipt-modal-body">
        <div className="receipt-content" id="receipt-content">
          {/* Receipt Header */}
          <div className="receipt-header">
            <div className="receipt-logo">
              <FileText size={25} className="receipt-logo-icon"/>
              <h2>Payment Receipt</h2>
            </div>
            <div className="receipt-number">
              <span className="receipt-label">Receipt No:</span>
              <span className="receipt-value">{downloadReceipt.receipt}</span>
            </div>
          </div>

          {/* Company Info */}
          <div className="company-info">
            <h3>Complaint Management System</h3>
            <p>123 Business Avenue, Corporate Park</p>
            <p>Mumbai - 400001, India</p>
            <p>Email: support@complaintsystem.com | Tel: +91 22 1234 5678</p>
          </div>

          <div className="receipt-divider"></div>

          {/* Receipt Details */}
          <div className="receipt-details">
            <div className="detail-section">
              <h4>Transaction Details</h4>
              <div className="detail-row">
                <span className="download-detail-label">Receipt Number:</span>
                <span className="detail-value">{downloadReceipt.receipt}</span>
              </div>
              <div className="detail-row">
                <span className="download-detail-label">Transaction Date:</span>
                <span className="detail-value">{new Date(downloadReceipt.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="detail-row">
                <span className="download-detail-label">Transaction Time:</span>
                <span className="detail-value">{new Date(downloadReceipt.date).toLocaleTimeString('en-IN')}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Payment Information</h4>
              <div className="detail-row">
                <span className="download-detail-label">Payment Purpose:</span>
                <span className="detail-value">{downloadReceipt.purpose}</span>
              </div>
              <div className="detail-row">
                <span className="download-detail-label">Amount Paid:</span>
                <span className="detail-value amount">₹{downloadReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="detail-row">
                <span className="download-detail-label">Amount in Words:</span>
                <span className="detail-value">{numberToWords(downloadReceipt.amount)} Rupees Only</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Bank Details</h4>
              <div className="detail-row">
                <span className="download-detail-label">Bank Name:</span>
                <span className="detail-value">{downloadReceipt.bank}</span>
              </div>
              <div className="detail-row">
                <span className="download-detail-label">Transaction ID:</span>
                <span className="detail-value">{downloadReceipt.transactionId || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="download-detail-label">Payment Mode:</span>
                <span className="detail-value">{downloadReceipt.paymentMode || 'Online Transfer'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Status</h4>
              <div className="detail-row">
                <span className={`receipt-status-badge ${downloadReceipt.status === 'success' ? 'status-success' : downloadReceipt.status === 'pending' ? 'status-pending' : 'status-failed'}`}>
                  {downloadReceipt.status === 'success' ? '✓ Payment Successful' : 
                   downloadReceipt.status === 'pending' ? '⏳ Payment Pending' : 
                   '✗ Payment Failed'}
                </span>
              </div>
            </div>
          </div>

          <div className="receipt-divider"></div>

          {/* Footer */}
          <div className="receipt-footer">
            <div className="footer-note">
              <p>This is a computer generated receipt and does not require signature.</p>
              <p>For any queries, please contact support within 7 days of transaction.</p>
            </div>
            <div className="footer-thankyou">
              <p>Thank you for your payment!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer with Download Button */}
      <div className="receipt-modal-footer">
        <button className="receipt-cancel-btn" onClick={() => setDownloadReceipt(null)}>
          Close
        </button>
        <button className="receipt-download-btn" onClick={() => handleDownloadReceipt()}>
          <Download size={18} />
          Download Receipt
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default PaymentHistory;