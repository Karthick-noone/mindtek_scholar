import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CreditCard, Download, Eye, FileText, IndianRupee, Wallet, XCircle } from 'lucide-react';
import Shimmer from '../../components/Shimmer/Shimmer';
import './PaymentHistory.css';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import { usePayments } from '../../hooks/usePayments';
import { secureStorage } from '../../utils/secureStorage';


const PaymentHistory = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [downloadReceipt, setDownloadReceipt] = useState(null);
  const {
    data: paymentData = [],
    isLoading,
    isFetching,
    refetch
  } = usePayments();
  // console.log("Payment data:", paymentData)
  const payment = paymentData[0];

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const companyDetails = secureStorage.getCompany()
  const scholarDetails = secureStorage.getScholar()
  // console.log("scholarDetails", scholarDetails)
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
      const downloadBtn = document.querySelector('.receipt-premium-download');
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
      pdf.save(`Payment_receipt_${companyDetails.company_name}_${new Date().getTime()}.pdf`);

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

  // Calculate pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = paymentData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(paymentData.length / rowsPerPage);

  // Change page
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  // Change rows per page
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Get page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const capsLetter = (name) => {
    if (!name) return;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return (
    <div className="payment-history-page">
      <div className="payment-limit">

        <div className="payment-header">
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
              <span className="stat-value">₹{payment?.total_amount}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Paid</span>
              <span className="stat-value">₹{payment?.tot_paid}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Pending Payment</span>
              <span className="stat-value">₹{payment?.bal_amt}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon violet">
              <Wallet size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Transactions</span>
              {/* <span className="stat-value">{paymentData?.length}</span> */}
              <span className="stat-value">{paymentData?.filter(p => p.pay_status === 'approved').length}</span>
            </div>
          </div>

        </div>

        <div className="payment-pagination-premium-controls top">
          <div className="rows-per-page-premium">
            <label>Rows per page:</label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="rows-select-premium"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="pagination-info-premium">
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, paymentData.length)} of {paymentData.length} entries
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
              {isLoading || isFetching ? (
                <tr className="complaint-loading-row">
                  <td colSpan="7" className="complaint-loading-cell">
                    <div className="complaint-loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading payments...</p>
                    </div>
                  </td>
                </tr>
              ) : (currentRows.length > 0 ? (
                currentRows.map(payment => (
                  <tr key={payment.id}>
                    <td>
                      {new Date(payment.pay_dt_tm).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td>{payment.purpose.pay_purpose}</td>
                    <td className="amount-cell">₹{payment.pay_received.toLocaleString()}</td>
                    <td>{payment.bank.bank_nm}</td>
                    <td>
                      <span className={`payment-status-badge-${payment.pay_status}`}>
                        {capsLetter(payment.pay_status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="payment-action-btn view-btn"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="payment-action-btn view-btn"
                          onClick={() => setDownloadReceipt(payment)}
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    <div className="empty-table-state">
                      {/* <span>📭</span> */}
                      <p>No payment records found</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paymentData.length > 0 && (
          <div className="payment-pagination-premium-controls bottom">
            <div className="payment-pagination-buttons-premium">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="payment-pagination-btn-premium"
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="payment-pagination-btn-premium"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="payment-pagination-numbers-premium">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && goToPage(page)}
                    className={`payment-pagination-number-premium ${currentPage === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="payment-pagination-btn-premium"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="payment-pagination-btn-premium"
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>

            <div className="payment-pagination-stats-premium">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}

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
                {/* <div className="detail-row">
                  <span className="detail-label">Receipt Number:</span>
                  <span>{selectedPayment.receipt}</span>
                </div> */}
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span>{new Date(selectedPayment.pay_dt_tm).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Purpose:</span>
                  <span>{selectedPayment.purpose.pay_purpose}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span>₹{selectedPayment.pay_received}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Bank:</span>
                  <span>{selectedPayment.bank.bank_nm}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`payment-status-badge-${selectedPayment.pay_status}`}>
                    {capsLetter(selectedPayment.pay_status)}
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
          <div className="receipt-premium-overlay" onClick={() => setDownloadReceipt(null)}>
            <div className="receipt-premium-container" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="receipt-premium-header">
                <h3>Payment Receipt</h3>
                <button className="receipt-premium-close" onClick={() => setDownloadReceipt(null)}>
                  <XCircle size={22} />
                </button>
              </div>

              {/* Body */}
              <div className="receipt-premium-body">
                <div className="receipt-premium-content" id="receipt-content">


                  {/* <div className="receipt-premium-badge">
              <FileText size={18} />
              <span>RECEIPT</span>
            </div> */}

                  <div className="receipt-premium-company">
                    <h3>{companyDetails.company_name}</h3>
                    <p>{companyDetails.address}</p>
                    {/* <p>{companyDetails.location}, India</p> */}
                    <p>Email: {companyDetails.email_id} | Contact: {companyDetails.com_contact}</p>
                  </div>

                  {/* Date Row */}
                  <div className="receipt-premium-row date-row">
                    <strong>
                      {new Date(downloadReceipt.pay_dt_tm).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </strong>
                    <div>
                      <span className={`receipt-premium-status ${downloadReceipt.pay_status}`}>{capsLetter(downloadReceipt.pay_status)}</span>
                    </div>
                  </div>

                  <div className="receipt-premium-divider"></div>

                  {/* Section 1: Customer Details */}
                  <div className="receipt-premium-section">
                    <h4>Customer Details</h4>
                    <div className="receipt-premium-info-row">
                      <div className="receipt-premium-info-item">
                        <label>Customer Name</label>
                        <p>{scholarDetails.user_name}</p>
                      </div>
                      <div className="receipt-premium-info-item">
                        <label>Scholar ID</label>
                        <p>{scholarDetails.user_id}</p>
                      </div>
                      <div className="receipt-premium-info-item">
                        <label>Email</label>
                        <p>{scholarDetails.email}</p>
                      </div>
                      <div className="receipt-premium-info-item">
                        <label>Contact Number</label>
                        <p>{scholarDetails.contact}</p>
                      </div>
                      <div className="receipt-premium-info-item full-width">
                        <label>Work Description</label>
                        <p>{scholarDetails.work_description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Payment Details */}
                  <div className="receipt-premium-section">
                    <h4>Payment Details</h4>

                    <table className="receipt-premium-table">
                      <tbody>
                        <tr>
                          <th>Payment Purpose</th>
                          <td>{downloadReceipt.purpose.pay_purpose}</td>
                        </tr>

                        <tr>
                          <th>Total Amount</th>
                          <td>₹{downloadReceipt.total_amount}</td>
                        </tr>

                        <tr className="highlight-row">
                          <th>Paid Amount</th>
                          <td>₹{downloadReceipt.pay_received}</td>
                        </tr>

                        <tr>
                          <th>Balance Amount</th>
                          <td>₹{downloadReceipt.bal_amt}</td>
                        </tr>

                        <tr className="full-width-row">
                          <th>Amount in Words</th>
                          <td>
                            {numberToWords(downloadReceipt.pay_received)} Rupees Only
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: Bank Details */}
                  <div className="receipt-premium-section">
                    <h4>Bank Details</h4>
                    <div className="receipt-bank-info-row">
                      <div className="receipt-premium-info-item">
                        <label>Payment Method</label>
                        <p>Bank Transfer - {downloadReceipt.bank.bank_nm}</p>
                      </div>
                      <div className="receipt-premium-info-item">
                        <label>Transaction ID</label>
                        <p>{downloadReceipt.id || 'N/A'}</p>
                      </div>
                      <div className="receipt-premium-info-item">
                        <label>Account Status</label>
                        <p>{scholarDetails.gst_status === "gst" ? "Account 1" : "Account 2"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Status */}
                  {/* <div className="receipt-premium-section status-section">
            <div className={`receipt-premium-status ${downloadReceipt.pay_status}`}>
              {downloadReceipt.pay_status === 'approved' ? '✓ PAYMENT SUCCESSFUL' : 
               downloadReceipt.pay_status === 'pending' ? '⏳ PAYMENT PENDING' : '✗ PAYMENT FAILED'}
            </div>
          </div> */}

                  <div className="receipt-premium-divider"></div>

                  {/* Footer */}
                  <div className="receipt-premium-footer">
                    <div className="receipt-premium-signature">
                      <p>Authorized Signature</p>
                      {/* <div className="signature-line"></div> */}
                      <span>{companyDetails.company_name}</span>
                    </div>
                    {/* <div className="receipt-premium-thanks">
              <p>Thank you for your payment!</p>
            </div> */}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="receipt-premium-actions">
                <button className="receipt-premium-cancel" onClick={() => setDownloadReceipt(null)}>
                  Close
                </button>
                <button className="receipt-premium-download" onClick={() => handleDownloadReceipt()}>
                  <Download size={16} />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;