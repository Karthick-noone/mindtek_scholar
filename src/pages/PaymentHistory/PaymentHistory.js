import React, { useState, useEffect } from 'react';
import { AlertCircle, Printer, X, CheckCircle, landMark, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CreditCard, Download, Eye, FileText, IndianRupee, Wallet, XCircle, Calendar, Tag, IndianRupeeIcon, InfoIcon, Building2, Users } from 'lucide-react';
import Shimmer from '../../components/Shimmer/Shimmer';
import './PaymentHistory.css';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import { usePayments } from '../../hooks/usePayments';
import { secureStorage } from '../../utils/secureStorage';
import logo from './../../assets/img/logo.png'
import { useScholar } from '../../hooks/useScholar';
import Loader from '../../components/Loader/Loader';
import { FaUsers } from 'react-icons/fa';

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
  // console.log("downloadReceipt:", downloadReceipt)
  // const payment = paymentData[0];
  const payment = paymentData[paymentData.length - 1];
  const totalReferralAmount = Number(
    paymentData?.overall_referral_amount ?? paymentData?.[0]?.overall_referral_amount ?? 0
  );  // const payment = paymentData[paymentData?.length - 1];



  // Inside your component, add these event handlers
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleKeyDown = (e) => {
    // Prevent Ctrl+P (Print)
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Prevent Ctrl+Shift+P (Print using system dialog)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Add this useEffect to manage event listeners
  useEffect(() => {
    if (downloadReceipt) {
      // Disable right-click on the entire document
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [downloadReceipt]);


  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDataReady, setIsDataReady] = useState(false);

  // const companyDetails = secureStorage.getCompany()
  // const scholarDetails = secureStorage.getScholar()
  const { data: scholarDetails, isLoading: scholarLoading } = useScholar()
  const { data: companyDetails, isLoading: companyLoading } = useScholar()

  console.log("scholarDetails", scholarDetails)
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

  // Add this function before the return statement
  const getUniqueReferralData = (payment) => {
    if (!payment.referral_data || payment.referral_data.length === 0) {
      return [];
    }
    return payment.referral_data;
  };

  const hasReferral = (payment) => {
    return payment.referral_data && payment.referral_data.length > 0;
  };

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
              <span className="stat-label">Amount Paid</span>
              <span className="stat-value">₹{payment?.tot_paid}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Balance Payment</span>
              <span className="stat-value">₹{payment?.bal_amt}</span>
            </div>
          </div>
          {totalReferralAmount > 0 && (
            <div className="stat-card referral-stat">
              <div className="stat-icon referral">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Referral Amount</span>
                <span className="stat-value card-referral-amount">₹{totalReferralAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
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
                  <th className="payments-table-head">#</th>
                  <th className="payments-table-head">Date</th>
                  <th className="payments-table-head">Payment Purpose</th>
                  <th className="payments-table-head">Paid Amount</th>
                  {/* <th className="payments-table-head">Bank</th> */}
                  {/* <th className="payments-table-head">Status</th> */}
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
                  currentRows.map((payment, index) => (
                    <tr key={payment.id} className="payments-table-row">
                      <td className="payments-table-cell" data-label="#">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="payments-table-cell" data-label="Date">
                        {new Date(payment.pay_dt_tm).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="payments-table-cell" data-label="Payment Purpose">
                        {payment.purpose?.pay_purpose}
                      </td>
                      <td className="payments-table-cell amount-cell" data-label="Paid Amount">
                        <div className="amount-wrapper">
                          <div className="paid-amount">
                            ₹{payment.pay_received.toLocaleString()}
                          </div>
                          {payment.referral_data && payment.referral_data.length > 0 && (
                            <div className="referral-amount-wrapper" title={`Referral Amount: ₹${payment.total_referral_amt?.toLocaleString() || 0}`}>
                              <FaUsers className="referral-icon" />
                              <span className="referral-amount">
                                ₹{payment.total_referral_amt?.toLocaleString() || 0}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      {/* <td className="payments-table-cell" data-label="Bank">
                        {payment.bank?.bank_nm}
                      </td> */}
                      {/* <td className="payments-table-cell" data-label="Status">
                        <span className={`status-badge ${payment.pay_status}`}>
                          {capsLetter(payment.pay_status)}
                        </span>
                      </td> */}
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
          <div className="payment-modal-overlay" onClick={() => setSelectedPayment(null)}
            onContextMenu={handleContextMenu}

          >
            <div className="payment-modal-container" onClick={(e) => e.stopPropagation()}
              onContextMenu={handleContextMenu}

            >
              <div className="payment-modal-header">
                <h3 className="payment-modal-title">Payment Details</h3>
                <button className="payment-modal-close" onClick={() => setSelectedPayment(null)}>
                  <XCircle size={20} />
                </button>
              </div>

              <div className="payment-modal-body"
                onContextMenu={handleContextMenu}
                onKeyDown={handleKeyDown}
              >
                {/* Grid Layout for Payment Details - 3 columns */}
                <div className="payment-details-grid">
                  {/* Date */}
                  <div className="payment-detail-item">
                    <div className="payment-detail-icon">
                      <Calendar size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Transaction Date</span>
                      <span className="payment-detail-value">
                        {new Date(selectedPayment.pay_dt_tm).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Payment Purpose */}
                  <div className="payment-detail-item">
                    <div className="payment-detail-icon">
                      <Tag size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Payment Purpose</span>
                      <span className="payment-detail-value">{selectedPayment.purpose.pay_purpose}</span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="payment-detail-item">
                    <div className="payment-detail-icon">
                      <Wallet size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Total Amount</span>
                      <span className="payment-detail-value">₹{payment?.total_amount}</span>
                    </div>
                  </div>

                  {/* Last Payment Amount */}
                  <div className="payment-detail-item highlight-item">
                    <div className="payment-detail-icon">
                      <IndianRupeeIcon size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Last Payment Amount</span>
                      <span className="payment-detail-value highlight-value">₹{selectedPayment.pay_received}</span>
                    </div>
                  </div>

                  {/* Total Paid */}
                  <div className="payment-detail-item">
                    <div className="payment-detail-icon">
                      <CheckCircle size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Amount Paid</span>
                      <span className="payment-detail-value">₹{selectedPayment?.tot_paid}</span>
                    </div>
                  </div>

                  {/* Balance Amount */}
                  <div className="payment-detail-item balance-item">
                    <div className="payment-detail-icon">
                      <InfoIcon size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Balance Amount</span>
                      <span className="payment-detail-value balance-value">₹{selectedPayment?.bal_amt}</span>
                    </div>
                  </div>

                  {/* Bank */}
                  {/* <div className="payment-detail-item">
                    <div className="payment-detail-icon">
                      <landMark size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Bank</span>
                      <span className="payment-detail-value">{selectedPayment.bank.bank_nm}</span>
                    </div>
                  </div> */}

                  {/* <div className="payment-detail-item">
                    <div className="payment-detail-icon">
                      <Building2 size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Account Type</span>
                      <span className="payment-detail-value">{selectedPayment.bank?.account_type === "gst" ? "Account 1" : "Account 2"}</span>
                    </div>
                  </div> */}

                  {/* Status */}
                  {/* <div className="payment-detail-item">
                    <div className="payment-detail-icon">
                      <CreditCard size={16} />
                    </div>
                    <div className="payment-detail-content">
                      <span className="payment-detail-label">Status</span>
                      <span className={`payment-status payment-status-${selectedPayment.pay_status}`}>
                        {capsLetter(selectedPayment.pay_status)}
                      </span>
                    </div>
                  </div> */}

                  {/* Payment Completed */}
                  {selectedPayment?.total_amount === selectedPayment?.tot_paid && (
                    <div className="payment-detail-item completed-item">
                      <div className="payment-detail-icon">
                        <CheckCircle size={16} />
                      </div>
                      <div className="payment-detail-content">
                        <span className="payment-detail-label">Payment Status</span>
                        <span className="payment-completed-badge">✓ Completed</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Referral Section - Show only if referral exists */}
                {hasReferral(selectedPayment) && (
                  <>
                    <div className="referral-header-section">
                      <div className="referral-header-left">
                        <Users size={18} className="referral-header-icon" />
                        <span className="referral-header-title">Referral Details</span>
                      </div>
                      <div className="referral-header-right">
                        <span className="referral-total-label">Total:</span>
                        <span className="referral-total-amount">₹{selectedPayment.total_referral_amt || 0}</span>
                      </div>
                    </div>

                    <div className="referral-table-wrapper">
                      <table className="referral-details-table">
                        <thead>
                          <tr>
                            <th>S.No.</th>
                            <th>Referred Person</th>
                            <th>Referral Amount</th>
                            <th>Reason</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPayment.referral_data.map((referral, index) => (
                            <tr key={referral.id}>
                              <td>{index + 1}</td>
                              <td>{referral.referred_person}</td>
                              <td>₹{referral.referral_amount}</td>
                              <td>{referral.referral_reason || '-'}</td>
                              <td>{new Date(referral.referral_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })}</td>
                              <td>
                                <span className={`referral-status-badge ${referral.referral_status}`}>
                                  {capsLetter(referral.referral_status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

         {downloadReceipt && (
          <div className="billPopupOverlay" onClick={() => setDownloadReceipt(null)}>
            <div
              className="billPopupContainer"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="billPopupHeader">
                <h2 className="billPopupTitle">
                  <Printer className="billPopupTitleIcon" />
                  Payment Receipt
                </h2>
                <button
                  className="billPopupClose"
                  onClick={() => setDownloadReceipt(null)}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Body */}
              <div className="billPopupContent">
                <div className="printWrapper">
                  <div className="billContainer" id="receipt-content">
                    {/* Company Header */}
                    <div className="billHeader">
                      <div className="billHeaderCenter">
                        {/* <div className='receipt-company-logo-container'>
                  <img src={logo} className='receipt-company-logo' alt="Logo" />
                </div> */}
                        <h1 className="billCompanyName">
                          {companyDetails?.company.company_name || "Company Name"}
                        </h1>
                        <p className="billCompanyDetails">
                          {companyDetails?.company.address}
                        </p>
                        <span className="billReceiptBadge">
                          Payment Receipt
                        </span>
                      </div>
                    </div>

                    {/* Scholar Details & Date */}
                    <div className="billInfoGrid">
                      <div className="billInfoLeft">
                        <div className="billInfoItem">
                          <span className="billInfoLabel">Scholar Name</span>
                          <span className="billInfoValue">{scholarDetails?.user_name}</span>
                        </div>
                        <div className="billInfoItem">
                          <span className="billInfoLabel">Scholar ID</span>
                          <span className="billInfoValue">{scholarDetails?.user_id}</span>
                        </div>
                      </div>
                      <div className="billInfoRight">
                        <div className="billInfoItem">
                          <span className="billInfoDateLabel">Date</span>
                          <span className="billInfoValue">
                            {new Date(downloadReceipt.pay_dt_tm).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="billDivider"></div>

                    {/* Amount Section */}
                    <div className="billAmountSection">
                      <div className="billAmountRow">
                        <span className="billAmountLabel">Amount Paid</span>
                        <span className="billAmountValue">₹{downloadReceipt.pay_received}</span>
                      </div>

                      {/* Amount in Words */}
                      <div className="billAmountWords">
                        <span className="billAmountWordsLabel">Amount in Words</span>
                        <span className="billAmountWordsValue">
                          {numberToWords(downloadReceipt.pay_received)} Rupees Only
                        </span>
                      </div>
                    </div>

                    {/* Work Description */}
                    <div className="billWorkDescription">
                      <div className="billWorkDescriptionLabel">Description</div>
                      <div className="billWorkDescriptionValue">
                        {scholarDetails?.work_description || "N/A"}
                      </div>
                    </div>

                    <div className="billDivider"></div>

                    {/* Footer */}
                    <div className="billFooter">
                      <div className="billFooterMessage">
                        This is a computer-generated bill and does not require a signature.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              {/* <div className="billPopupFooter">
        <button 
          className="billPopupButtonSecondary" 
          onClick={() => setDownloadReceipt(null)}
        >
          Close
        </button>
        <button 
          className="billPopupButtonPrimary" 
          onClick={handleDownloadReceipt}
        >
          <FiPrinter className="billPopupButtonIcon" />
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