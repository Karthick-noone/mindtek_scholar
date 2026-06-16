import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CreditCard, Download, Eye, FileText, IndianRupee, Wallet, XCircle } from 'lucide-react';
import Shimmer from '../../components/Shimmer/Shimmer';
import './PaymentHistory.css';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import { usePayments } from '../../hooks/usePayments';
import { secureStorage } from '../../utils/secureStorage';
import logo from './../../assets/img/logo.png'
import { useScholar } from '../../hooks/useScholar';
import Loader from '../../components/Loader/Loader';

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
  // const payment = paymentData[paymentData?.length - 1];

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDataReady, setIsDataReady] = useState(false);

  // const companyDetails = secureStorage.getCompany()
  // const scholarDetails = secureStorage.getScholar()
  const { data: scholarDetails, isLoading: scholarLoading } = useScholar()
  const { data: companyDetails, isLoading: companyLoading } = useScholar()
  // const companyLogo = `http://scholarapi.seasense.in/${companyDetails?.com_logo}`;
  // console.log("scholarDetails", scholarDetails)
  // if (loading) {
  //   return <Shimmer type="table" count={1} />;
  // }
  // Track loading states
  useEffect(() => {
    // Check if both hooks have finished loading
    if (!scholarLoading && !companyLoading) {
      // Small delay for smooth transition
      setTimeout(() => {
        setLoading(false);
        setIsDataReady(true);
      }, 100);
    }
  }, [scholarLoading, companyLoading]);

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

  const approvedPayments = paymentData.filter(p => p.pay_status === 'approved');

  // Add this function before the return statement
  const handlePrintAll = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Get company and scholar details
    const companyName = companyDetails?.company.company_name || 'Company Name';
    const companyAddress = companyDetails?.company.address || '';
    const companyEmail = companyDetails?.company.email_id || '';
    const companyContact = companyDetails?.company.com_contact || '';
    const scholarName = scholarDetails?.user_name || '';
    const scholarId = scholarDetails?.user_id || '';
    const scholarEmail = scholarDetails?.email || '';
    const scholarContact = scholarDetails?.contact || '';
    const workDescription = scholarDetails?.work_description || '';

    // Filter only approved payments
    // const approvedPayments = paymentData.filter(p => p.pay_status === 'approved');

    // Calculate totals
    const totalAmount = paymentData[0]?.total_amount || 0;
    const totalPaid = paymentData[0]?.tot_paid || 0;
    const balanceAmount = paymentData[0]?.bal_amt || 0;

    // Create the print HTML
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment History Report</title>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px 10px;
          background: white;
          color: #1f2937;
        }
        
        .print-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        /* Header Section */
        .print-header {
          text-align: center;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .company-logo {
          max-width: 200px;
          margin-bottom: 5px;
        }
        
        .company-name {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 3px;
        }
        
        .company-details {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .company-details-date {
          display: flex;
          align-items: flex-start;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          margin-top:10px;
        }
        
        .report-title {
          font-size: 20px;
          font-weight: 600;
          margin: 20px 0 10px;
          color: #374151;
        }
        
        /* Scholar Info Section */
        .scholar-section {
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 10px;
        }
        
        .scholar-section h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #374151;
          border-left: 3px solid #10b981;
          padding-left: 12px;
        }
        
        .scholar-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px;
        }
        
        .scholar-item {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }
        
        .scholar-label {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          min-width: 120px;
        }
        
        .scholar-value {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }
        
        /* Stats Section */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: #f9fafb;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
        }
        
        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        .stat-amount {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .stat-amount.green {
          color: #10b981;
        }
        
        .stat-amount.orange {
          color: #f59e0b;
        }
        
        .stat-amount.purple {
          color: #8b5cf6;
        }
        
        /* Payment Table */
        .payments-table-section {
          margin-top: 10px;
        }
        
        .payments-table-section h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #374151;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        th {
          background: #f3f4f6;
          padding: 12px 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        td {
          padding: 12px 12px;
          font-size: 13px;
          color: #4b5563;
          border-bottom: 1px solid #e5e7eb;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        .amount {
          font-weight: 600;
          color: #059669;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .status-badge.approved {
          background: #d1fae5;
          color: #059669;
        }
        
        /* Footer */
        .print-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
        
        .signature {
          margin-top: 50px;
          text-align: right;
        }
        
        .signature-line {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px dashed #d1d5db;
          width: 250px;
          margin-left: auto;
        }
        
        .signature-text {
          font-size: 12px;
          color: #6b7280;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none;
          }
          .stat-card, .scholar-section {
            break-inside: avoid;
          }
          tr {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <!-- Header -->
        <div class="print-header">
          <img src="${logo}" class="company-logo" alt="Logo" style="max-width: 150px;" />
          <div class="company-name">${companyName}</div>
          <div class="company-details">${companyAddress}</div>
          <div class="company-details">Email: ${companyEmail} | Contact: ${companyContact}</div>
          <!-- <div class="report-title">Payment History Report</div>-->
          <div class="company-details-date"> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        
        <!-- Scholar Details -->
        <div class="scholar-section">
          <h4>Scholar Information</h4>
          <div class="scholar-grid">
            <div class="scholar-item">
              <span class="scholar-label">Scholar Name:</span>
              <span class="scholar-value">${scholarName}</span>
            </div>
            <div class="scholar-item">
              <span class="scholar-label">Scholar ID:</span>
              <span class="scholar-value">${scholarId}</span>
            </div>
            <div class="scholar-item">
              <span class="scholar-label">Email:</span>
              <span class="scholar-value">${scholarEmail}</span>
            </div>
            <div class="scholar-item">
              <span class="scholar-label">Contact:</span>
              <span class="scholar-value">${scholarContact}</span>
            </div>
            <div class="scholar-item" style="grid-column: span 2;">
              <span class="scholar-label">Work Description:</span>
              <span class="scholar-value">${workDescription}</span>
            </div>
          </div>
        </div>
        
    
        
        <!-- Payment History Table -->
        <div class="payments-table-section">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h4>Payment Transaction Details</h4>
          <span style="font-size: 14px; font-weight: 600;">Total Amount: ₹${totalAmount.toLocaleString()}</span>
        </div>
          <table>
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Date</th>
                <th>Payment Purpose</th>
                <th>Paid (₹)</th>
                <th>Balance (₹)</th>
                <th>Bank</th>
              </tr>
            </thead>
            <tbody>
              ${approvedPayments.map((payment, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${new Date(payment.pay_dt_tm).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })}</td>
                  <td>${payment.purpose.pay_purpose}</td>
                  <td class="amount">₹${payment.pay_received.toLocaleString()}</td>
                  <td >₹${payment.bal_amt.toLocaleString()}</td>
                  <td>${payment.bank.bank_nm}</td>

                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Summary Row -->
        <table style="width: auto; margin-left: auto; background: #f9fafb;">
          <tr>
            <th style="background: #e5e7eb; border-bottom: none;">Total Payments</th>
            <td style="font-weight: 700; color: #059669;">₹${totalPaid}</td>
          </tr>
        </table>
        

        <!--
        <div class="signature">
          <div class="signature-line"></div>
          <div class="signature-text">Authorized Signature</div>
          <div class="signature-text" style="font-size: 11px;">${companyName}</div>
        </div>
        -->
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 1000);
        }
      </script>
    </body>
    </html>
  `;

    // Write to the new window and print
    printWindow.document.write(printContent);
    printWindow.document.close();
  };



  const handleDownloadReceipt = async () => {
    try {
      // Show loading indicator
      const downloadBtn = document.querySelector('.receipt-premium-download');
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = 'Generating PDF...';
      downloadBtn.disabled = true;

      const element = document.getElementById('receipt-content');

      //  Create a clone of the element to avoid modifying the original
      const cloneElement = element.cloneNode(true);
      cloneElement.style.width = '800px';
      cloneElement.style.padding = '10px';
      cloneElement.style.margin = '0';
      cloneElement.style.background = 'white';
      cloneElement.style.boxShadow = 'none';

      // Temporarily append clone to body (hidden)
      cloneElement.style.position = 'absolute';
      cloneElement.style.left = '-9999px';
      cloneElement.style.top = '-9999px';
      document.body.appendChild(cloneElement);

      //  Handle all images - convert to base64 to avoid CORS issues
      const images = cloneElement.querySelectorAll('img');
      const imagePromises = Array.from(images).map(async (img) => {
        try {
          // Skip if already data URL
          if (img.src && img.src.startsWith('data:')) {
            return;
          }

          // Fetch and convert image to base64
          const response = await fetch(img.src, {
            mode: 'cors',
            headers: {
              'Origin': window.location.origin
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const blob = await response.blob();
          const reader = new FileReader();

          return new Promise((resolve) => {
            reader.onloadend = () => {
              img.src = reader.result;
              resolve();
            };
            reader.onerror = () => {
              console.warn('Failed to convert image:', img.src);
              resolve();
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Could not load image:', img.src, error);
          // Try alternative: use canvas to convert
          try {
            const base64 = await convertImageToBase64Alternative(img.src);
            if (base64) {
              img.src = base64;
            }
          } catch (e) {
            console.warn('Alternative conversion also failed');
          }
          return Promise.resolve();
        }
      });

      // Wait for all images to be converted
      await Promise.all(imagePromises);

      // Additional delay to ensure images are rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      //  Configure html2canvas with optimal settings
      const canvas = await html2canvas(cloneElement, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 0, // No timeout
        onclone: (clonedDoc, element) => {
          // Ensure all images are properly loaded in clone
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach(img => {
            if (img.src && !img.src.startsWith('data:')) {
              img.crossOrigin = 'anonymous';
            }
          });
        }
      });

      // Remove the temporary clone
      document.body.removeChild(cloneElement);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions
      const imgWidth = 190; // mm (A4 width minus margins)
      const pageHeight = 277; // mm (A4 height minus margins)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`Payment_receipt_${companyDetails?.company.company_name || 'receipt'}_${Date.now()}.pdf`);

      // Show success message
      showToastMessage('Receipt downloaded successfully!', 'success');

      // Reset button
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;

    } catch (error) {
      console.error('Error generating PDF:', error);
      showToastMessage('Error generating receipt. Please try again.', 'error');

      // Reset button
      const downloadBtn = document.querySelector('.receipt-premium-download');
      if (downloadBtn) {
        downloadBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Receipt';
        downloadBtn.disabled = false;
      }
    }
  };

  //  Alternative image to base64 converter using canvas
  const convertImageToBase64Alternative = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          const base64 = canvas.toDataURL('image/png');
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Add timestamp to avoid cache issues
      img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    });
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

  // Get page numbers to display - Maximum 4 pages
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 4; // Changed to 4

    if (totalPages <= maxPagesToShow) {
      // If 4 pages or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // For more than 4 pages
      if (currentPage <= 2) {
        // Current page is 1 or 2
        // Show: 1, 2, 3, ..., last
        pageNumbers.push(1, 2, 3);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
      else if (currentPage >= totalPages - 1) {
        // Current page is last or second last
        // Show: 1, ..., last-2, last-1, last
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
      }
      else {
        // Current page is in the middle
        // Show: 1, ..., current, ..., last
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const capsLetter = (name) => {
    if (!name) return;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  if (loading || isFetching) {
    return (
      <div className="dashboard-loader-wrapper">
        <Loader
          type="scholar"
          size="large"
          text="Loading payments data...."
        />
      </div>
    );
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
          <div className='row-section'>
            {/*
             <button
            className="print-all-btn"
            onClick={handlePrintAll}
            disabled={approvedPayments.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9V3h12v6" />
              <path d="M6 21H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
              <path d="M6 15h12v6H6z" />
              <path d="M18 9v6" />
              <path d="M6 9v6" />
              <path d="M8 6h8" />
            </svg>
            Print All
          </button>

          */}
            <div className="pagination-info-premium">
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, paymentData.length)} of {paymentData.length} entries
            </div>
          </div>
        </div>

        <div className="payments-table-wrapper">
          <div className="payments-table-responsive">
            <table className="payments-data-table">
              <thead className="payments-table-header">
                <tr>
                  <th className="payments-table-head">Date</th>
                  <th className="payments-table-head">Payment Purpose</th>
                  <th className="payments-table-head">Paid Amount</th>
                  <th className="payments-table-head">Bank</th>
                  <th className="payments-table-head">Status</th>
                  <th className="payments-table-head">View</th>
                  <th className="payments-table-head">Receipt</th>
                </tr>
              </thead>
              <tbody className="payments-table-body">
                {isLoading || isFetching ? (
                  <tr className="payments-loading-row">
                    <td colSpan="7" className="payments-loading-cell">
                      <div className="payments-loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading payments...</p>
                      </div>
                    </td>
                  </tr>
                ) : (currentRows.length > 0 ? (
                  currentRows.map(payment => (
                    <tr key={payment.id} className="payments-table-row">
                      <td className="payments-table-cell" data-label="Date">
                        {new Date(payment.pay_dt_tm).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="payments-table-cell" data-label="Payment Purpose">
                        {payment.purpose.pay_purpose}
                      </td>
                      <td className="payments-table-cell amount-cell" data-label="Paid Amount">
                        ₹{payment.pay_received.toLocaleString()}
                      </td>
                      <td className="payments-table-cell" data-label="Bank">
                        {payment.bank.bank_nm}
                      </td>
                      <td className="payments-table-cell" data-label="Status">
                        <span className={`status-badge ${payment.pay_status}`}>
                          {capsLetter(payment.pay_status)}
                        </span>
                      </td>
                      <td className="payments-table-cell" data-label="View">
                        <div className="payments-action-buttons">
                          <button
                            className="payments-action-btn payments-view-btn"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="payments-table-cell" data-label="Receipt">
                        <div className="payments-action-buttons">
                          <button
                            className="payments-action-btn payments-receipt-btn"
                            onClick={() => setDownloadReceipt(payment)}
                          >
                            <FileText size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="payments-table-row">
                    <td colSpan="7" className="payments-no-data-cell">
                      <AlertCircle size={48} />
                      <p className="payments-no-data-text">No payment records found</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {paymentData.length > 0 && totalPages > 1 && (
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
            <div
              className={`modal-content ${selectedPayment?.pay_status === 'completed' ? 'payment-completed-watermark' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Payment Details </h3>
                <button className="complaint-modal-close-btn" onClick={() => setSelectedPayment(null)}>
                  <XCircle size={24} />
                </button>
              </div>
              <div className="modal-details">
                {/* <div className="payment-detail-row">
                  <span className="detail-label">Receipt Number:</span>
                  <span>{selectedPayment.receipt}</span>
                </div> */}
                <div className="payment-detail-row">
                  <span className="detail-label">Date:</span>
                  <span className='detail-value'>{new Date(selectedPayment.pay_dt_tm).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Payment Purpose:</span>
                  <span className='detail-value'>{selectedPayment.purpose.pay_purpose}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className='detail-value'>₹{payment?.total_amount}</span>
                </div>
                <div className="payment-detail-row paid-amount-row" >
                  <span className="detail-label">Last Payment Amount:</span>
                  <span className='detail-value'>₹{selectedPayment.pay_received}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Total Paid Amount:</span>
                  <div className='detail-value-wrapper'>
                    <span className='detail-value'>₹{selectedPayment.tot_paid}</span>

                  </div>
                </div>
                {selectedPayment?.bal_amt > 0 && (
                  <div className="payment-detail-row balance-amount-row">
                    <span className="detail-label">Balance Amount:</span>
                    <span className='detail-value'>₹{selectedPayment.bal_amt}</span>
                  </div>
                )}
                <div className="payment-detail-row">
                  <span className="detail-label">Payment Bank:</span>
                  <span className='detail-value'>{selectedPayment.bank.bank_nm}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`payment-status-badge-${selectedPayment.pay_status}`}>
                    {capsLetter(selectedPayment.pay_status)}
                  </span>
                </div>
                {selectedPayment?.total_amount === selectedPayment?.tot_paid && (
                  <div className="payment-completed-container"><span className="payment-completed-message">✓ Payment Completed</span></div>
                )}
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
                  <div className='receipt-company-logo-container'>
                    <img src={logo} className='receipt-company-logo' />
                  </div>

                  <div className="receipt-premium-company">
                    <h3>{companyDetails?.company.company_name}</h3>
                    <p>{companyDetails?.company.address}</p>
                    {/* <p>{companyDetails.location}, India</p> */}
                    <p>Email: {companyDetails?.company.email_id} | Contact: {companyDetails?.company.com_contact}</p>
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
                    <h4>Scholar Details</h4>
                    <div className="receipt-premium-info-row">
                      <div className="receipt-premium-info-item">
                        <label>Scholar Name</label>
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
                          <th>Last Payment Amount</th>
                          <td>₹{downloadReceipt.pay_received}</td>
                        </tr>

                        <tr>
                          <th>Total Paid</th>
                          <td>₹{downloadReceipt.tot_paid}</td>
                        </tr>
                        {/* {downloadReceipt?.bal_amt > 0 && ( */}
                        <tr className='balance-row'>
                          <th>Balance Amount</th>
                          <td className='balance-row-value'>₹{downloadReceipt.bal_amt}</td>
                        </tr>
                        {/* )} */}

                        <tr className="full-width-row">
                          <th>Last Payment Amount in Words</th>
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
                      {/* <div className="receipt-premium-info-item">
                        <label>Transaction ID</label>
                        <p>{downloadReceipt.id || 'N/A'}</p>
                      </div> */}
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
                  {/* <div className="receipt-premium-footer">
                    <div className="receipt-premium-signature">
                      <p>Authorized Signature</p>
                      <span>{companyDetails.company_name}</span>
                    </div>

                  </div> */}
                </div>
              </div>

              {/* Footer Actions */}
              {/* <div className="receipt-premium-actions">
                <button className="receipt-premium-cancel" onClick={() => setDownloadReceipt(null)}>
                  Close
                </button>
                <button className="receipt-premium-download" onClick={() => handleDownloadReceipt()}>
                  <Download size={16} />
                  Download Receipt
                </button>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;