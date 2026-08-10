// ComplainRegister.js - Updated with Enhanced Loader
import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Send,
  CheckCircle,
  FileText,
  Clock,
  CheckCircle as ResolvedIcon,
  XCircle,
  Plus,
  Eye,
  MessageSquareMore,
  ThumbsUp,
  ThumbsDown,
  Crown,
  Handshake,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  EditIcon,
  Trash2,
  X,
  Award,
  Meh,
  Search
} from 'lucide-react';
import { BsStarFill } from 'react-icons/bs';
import './ComplainRegister.css';
import { useComplaints, useCreateComplaint, useComplaintCounts, useUpdateRating, useDeleteComplaint } from '../../hooks/useComplaints';
import { secureStorage } from '../../utils/secureStorage';
import trashOff from './../../assets/img/recycle-bin.png';
import { useLocation } from "react-router-dom";
import Loader from './../../components/Loader/Loader';

const ComplainRegister = () => {
  const [formData, setFormData] = useState({
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [viewShowModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRating, setIsRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Fetch complaints from backend with pagination
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch
  } = useComplaints(currentPage, rowsPerPage, filterStatus, searchTerm);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.status) {
      handleFilterChange(location.state.status);
    }
  }, [location.state]);

  // Extract data from API response
  const complaints = apiResponse?.data || [];
  const pagination = apiResponse?.pagination || {};
  const totalCount = apiResponse?.count || 0;
  const totalPages = pagination?.total_pages || 1;

  const { mutate: submitComplaint } = useCreateComplaint();
  const { mutate: deleteComplaint } = useDeleteComplaint();

  const scholarDetails = secureStorage.getScholar();
  const scholar_id = scholarDetails?.id;
  const user_id = scholarDetails?.user_id;
  const date = new Date().toISOString().split('T')[0];

  const { data: counts, isLoading: countsLoading } = useComplaintCounts();

  // Track loading states
  useEffect(() => {
    // Check if both complaints data and counts data have loaded
    if (!isLoading && !countsLoading && apiResponse !== undefined) {
      // Small delay for smooth transition
      setTimeout(() => {
        setLoading(false);
        setIsDataReady(true);
      }, 100);
    }
  }, [isLoading, countsLoading, apiResponse]);

  // Stats calculations (from API data)
  const totalComplaints = counts?.total_complaints || 0;
  const pendingComplaints = counts?.pending || 0;
  const inProgressComplaints = counts?.in_progress || 0;
  const resolvedComplaintsCount = counts?.resolved || 0;

  const statsCards = [
    {
      title: 'Total Complaints',
      // value: totalComplaints,
      value: totalComplaints === 0 ? 'Not Updated' : totalComplaints,
      icon: <FileText size={24} />,
      color: '#3b82f6',
      bgColor: '#3b82f610',
      isZero: totalComplaints === 0,
    },
    {
      title: 'Pending Complaints',
      // value: pendingComplaints,
      value: pendingComplaints === 0 ? 'Not Updated' : pendingComplaints,
      icon: <Clock size={24} />,
      color: '#f59e0b',
      bgColor: '#f59e0b10',
      isZero: pendingComplaints === 0,

    },
    {
      title: 'In Progress',
      // value: inProgressComplaints,
      value: inProgressComplaints === 0 ? 'Not Updated' : inProgressComplaints,

      icon: <AlertCircle size={24} />,
      color: '#8b5cf6',
      bgColor: '#8b5cf610',
      isZero: inProgressComplaints === 0,


    },
    {
      title: 'Resolved Complaints',
      // value: resolvedComplaintsCount,
      value: resolvedComplaintsCount === 0 ? 'Not Updated' : resolvedComplaintsCount,

      icon: <ResolvedIcon size={24} />,
      color: '#10b981',
      bgColor: '#10b98110',
      isZero: resolvedComplaintsCount === 0,

    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Complaint is required';
    if (formData.description.length < 10) newErrors.description = 'Complaint must be at least 10 characters';
    // if (formData.description.length > 500) newErrors.description = 'Complaint must be at most 500 characters';
    return newErrors;
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedComplaintId(null);
  };

  const handleDelete = (id) => {
    setSelectedComplaintId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!selectedComplaintId) return;
    setIsDeleting(true)

    deleteComplaint(selectedComplaintId, {
      onSuccess: () => {
        setIsDeleting(false)

        setSubmittedMessage('Complaint deleted successfully!');
        setSubmitted(true);
        setShowDeleteConfirm(false);
        setSelectedComplaintId(null);
        setTimeout(() => setSubmitted(false), 3000);
      },
      onError: () => {
        setIsDeleting(false)

        setSubmittedMessage('Failed to delete complaint.');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    // If validation errors exist
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Clear previous errors
    setErrors({});

    // Start loader only after validation success
    setIsSubmitting(true);

    submitComplaint(
      {
        complaint: formData.description,
        reg_id: scholar_id,
        user_id,
        complt_reg_dt: date
      },
      {
        onSuccess: () => {
          setSubmittedMessage('Complaint submitted successfully!');
          setSubmitted(true);
          setShowModal(false);
          setFormData({ description: '' });

          refetch();

          setTimeout(() => setSubmitted(false), 3000);

          setIsSubmitting(false);
        },

        onError: () => {
          setSubmittedMessage('Failed to submit complaint. Please try again.');
          setSubmitted(true);

          setTimeout(() => setSubmitted(false), 3000);

          setIsSubmitting(false);
        }
      }
    );
  };

  const handleViewReply = (complaint) => {
    setSelectedComplaint(complaint);
    setShowReplyModal(true);
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  const { mutate: updateRating } = useUpdateRating();

  const handleRating = (complaintId, ratingValue) => {
    setIsRating(true);
    setSelectedRating(ratingValue);

    updateRating(
      {
        id: complaintId,
        data: {
          ratings: ratingValue, // ratingValue is already a number (1-5)
        },
      },
      {
        onSuccess: () => {
          setIsRating(false);
          setSelectedRating(null);

          // Map rating number to label for display
          const ratingLabels = {
            1: 'POOR',
            2: 'AVERAGE',
            3: 'GOOD',
            4: 'GREAT',
            5: 'EXCELLENT'
          };

          setSubmittedMessage(`Thank you for rating this response as ${ratingLabels[ratingValue]}!`);
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 3000);
          setShowRatingModal(false);
        },
        onError: (err) => {
          setIsRating(false);
          setSelectedRating(null);

          console.error("Rating update failed:", err);
        },
      }
    );
  };

  const getStatusBadge = (complaint) => {
    if (complaint.status === "Resolved") {
      return <span className="status-badge status-resolved">Resolved</span>;
    } else if (complaint.status === "In Progress") {
      return <span className="status-badge status-in-progress">In Progress</span>;
    } else {
      return <span className="status-badge status-pending">Pending</span>;
    }
  };

  const mapRatingToDisplay = (rating) => {
    switch (String(rating)) {
      case "1": return "bad";
      case "2": return "average";
      case "3": return "good";
      case "4": return "great";
      case "5": return "excellent";
      default: return null;
    }
  };

  const getRatingBadge = (ratings) => {
    const displayRating = mapRatingToDisplay(ratings);
    if (!displayRating) return null;

    switch (displayRating) {
      case 'excellent':
        return <span className="rating-badge rating-excellent"><Crown size={14} /> Excellent</span>;
      case 'great':
        return <span className="rating-badge rating-great"><Award size={14} /> Great</span>;
      case 'good':
        return <span className="rating-badge rating-good"><ThumbsUp size={14} /> Good</span>;
      case 'average':
        return <span className="rating-badge rating-average"><Meh size={14} /> Average</span>;
      case 'bad':
        return <span className="rating-badge rating-bad"><ThumbsDown size={14} /> Bad</span>;
      default:
        return null;
    }
  };

  const getRatingStars = (ratings) => {
    return (
      <span className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= ratings ? 'star-filled' : 'star-empty'}>
            {star <= ratings ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };


  const getShortDescription = (description) => {
    if (!description) return '';
    if (description.length <= 30) return description;
    const trimmed = description.substring(0, 15);
    if (!trimmed.includes(' ')) {
      return trimmed + '...';
    }
    return trimmed.substring(0, trimmed.lastIndexOf(' ')) + '...';
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  // Calculate showing entries info
  const startEntry = (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, totalCount);

  // Show enhanced loader while data is being fetched
  if (loading) {
    return (
      <div className="dashboard-loader-wrapper">
        <Loader
          type="scholar"
          size="large"
          text="Loading complaints data...."
        />
      </div>
    );
  }


  return (
    <div className="complaint-management-dashboard">
      <div className="complaint-limit">
        <div className='sticky-top-header'></div>

        <div className="complaint-dashboard-header">
          <div className="complaint-header-content">
            <h1 className="complaint-dashboard-title">Complaint Management</h1>
            <p className="complaint-dashboard-subtitle">Track and manage your complaints efficiently</p>
          </div>
          <button className="complaint-register-trigger-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Register New Complaint
          </button>
        </div>

        {/* Stats Cards */}
        <div className="complaint-stats-grid">
          {statsCards.map((stat, index) => (
            <div key={index} className="complaint-stat-card">
              <div className="complaint-stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="complaint-stat-info">
                <h3 className="complaint-stat-value" 
                 style={{
                    fontSize: stat.isZero ? "14px" : "",
                    textAlign: stat.isZero ? "center" : ""
                  }}
                >{stat.value}</h3>
                <p className="complaint-stat-label">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="complaint-filters-section">
          <div className="complaint-filter-tabs">
            <button
              className={`complaint-filter-tab ${filterStatus === 'all' ? 'complaint-filter-tab-active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              className={`complaint-filter-tab ${filterStatus === 'pending' ? 'complaint-filter-tab-active' : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              Pending
            </button>
            <button
              className={`complaint-filter-tab ${filterStatus === 'in_progress' ? 'complaint-filter-tab-active' : ''}`}
              onClick={() => handleFilterChange('in_progress')}
            >
              In Progress
            </button>
            <button
              className={`complaint-filter-tab ${filterStatus === 'resolved' ? 'complaint-filter-tab-active' : ''}`}
              onClick={() => handleFilterChange('resolved')}
            >
              Resolved
            </button>
          </div>
          {/* {searchTerm && (
            <div className='search-term'>
              <p>Searching: <span>"{searchTerm}"</span></p>
            </div>
          )} */}

          <div className="complaint-search-wrapper">
            <Search className='search-icon' size={18} />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={handleSearch}
              className="complaint-search-input"
            />
            {searchTerm && (
              <X size={15} className="search-clear-icon" onClick={() => setSearchTerm('')} />
            )}
          </div>
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
            Showing {startEntry} to {endEntry} of {totalCount} entries
          </div>
        </div>

        {/* Complaints Table */}
        <div className="complaint-table-wrapper">
          <div className="complaint-table-responsive">
            <table className="complaint-data-table">
              <thead className="complaint-table-header">
                <tr className="complaint-table-row">
                  <th className="complaint-table-head">#</th>
                  <th className="complaint-table-head">Ticket ID</th>
                  <th className="complaint-table-head">Complaints</th>
                  <th className="complaint-table-head">View</th>
                  <th className="complaint-table-head">Date</th>
                  <th className="complaint-table-head">Reply</th>
                  <th className="complaint-table-head">Status</th>
                  <th className="complaint-table-head">Rating</th>
                  <th className="complaint-table-head">Delete</th>
                </tr>
              </thead>
              <tbody className="complaint-table-body">
                {isLoading || isFetching ? (
                  <tr className="complaint-loading-row">
                    <td colSpan="9" className="complaint-loading-cell">
                      <div className="complaint-loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading complaints...</p>
                      </div>
                    </td>
                  </tr>
                ) : complaints.length > 0 ? (
                  complaints.map((complaint, idx) => (
                    <tr key={complaint.id} className="complaint-table-row">
                      <td className="complaint-table-cell" data-label="#">
                        {(currentPage - 1) * rowsPerPage + idx + 1}
                      </td>
                      <td className="complaint-table-cell" data-label="ID">
                        <span className="complaint-id-cell">{complaint.ticket_id}</span>
                      </td>
                      <td className="complaint-table-cell" data-label="Description" title={complaint.complaint}>
                        {getShortDescription(complaint.complaint)}
                      </td>
                      <td className="complaint-table-cell" data-label="Actions">
                        <div className="complaint-action-buttons">
                          <button
                            className="complaint-action-btn complaint-view-btn"
                            title="View Details"
                            onClick={() => handleViewComplaint(complaint)}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="complaint-table-cell" data-label="Date">
                        {new Date(complaint.complt_reg_dt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="complaint-table-cell" data-label="Reply">
                        {complaint.reply_content ? (
                          <button
                            className="view-reply-btn"
                            onClick={() => handleViewReply(complaint)}
                          >
                            <MessageSquareMore size={16} />
                            View Reply
                          </button>
                        ) : (
                          <span className="no-reply-text">No reply yet</span>
                        )}
                      </td>
                      <td className="complaint-table-cell" data-label="Status">
                        {getStatusBadge(complaint)}
                      </td>
                      <td className="complaint-table-cell" data-label="Rating">
                        {complaint.status === "Resolved" ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {complaint.ratings && getRatingStars(complaint.ratings)}
                            <button
                              className="view-rate-btn"
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setSelectedRating(complaint.ratings || 0); // This will set the existing rating

                                setShowRatingModal(true);
                              }}
                            >
                              {complaint.ratings ? <EditIcon size={14} /> : <BsStarFill size={14} />}
                              {complaint.ratings ? "Update" : "Rate"}
                            </button>
                          </div>
                        ) : (
                          <span className="no-reply-text">No rating</span>
                        )}
                      </td>
                      <td className="complaint-table-cell" data-label="Delete">
                        {complaint.reply_content === null ? (
                          <div className="complaint-delete-button" onClick={() => handleDelete(complaint.id)}>
                            <Trash2 size={16} />
                          </div>
                        ) : (
                          <div className="complaint-delete-off-button">
                            <img src={trashOff} width={'20px'} alt="Cannot delete" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="complaint-table-row">
                    <td colSpan="9" className="complaint-no-data-cell">
                      <AlertCircle size={48} />
                      <p className="complaint-no-data-text">No complaints found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-premium-controls">

            <div className="pagination-buttons-premium">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="pagination-btn-premium"
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn-premium"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="pagination-numbers-premium">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && goToPage(page)}
                    className={`pagination-number-premium ${currentPage === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn-premium"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-btn-premium"
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>


          </div>
        )}

        {/* Success Toast */}
        {submitted && (
          <div className="complaint-success-toast">
            <CheckCircle size={20} />
            <span className="complaint-success-message">{submittedMessage}</span>
          </div>
        )}

        {/* Register Complaint Modal */}
        {showModal && (
          <div className="complaint-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="complaint-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="complaint-modal-header">
                <h2 className="complaint-modal-title">Register New Complaint</h2>
                <button className="complaint-modal-close-btn" onClick={() => setShowModal(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              <div className="complaint-modal-body">
                <form onSubmit={handleSubmit} className="complaint-registration-form">
                  <div className="complaint-form-field">
                    <label htmlFor="complaint-description-textarea" className="complaint-form-label">Description *</label>
                    <textarea
                      id="complaint-description-textarea"
                      name="description"
                      rows="5"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Please provide detailed information about your complaint..."
                      className="complaint-form-textarea"
                      autoFocus
                    ></textarea>
                    {errors.description && <span className="complaint-error-text">{errors.description}</span>}
                    {/* <div className="complaint-character-count">
                      {formData.description.length}/500 characters
                    </div> */}
                  </div>

                  <div className="complaint-form-info">
                    <AlertCircle size={16} />
                    <span className="complaint-info-text">All complaints are confidential and will be handled by the appropriate department.</span>
                  </div>

                  <div className="complaint-modal-buttons">
                    <button type="button" className="complaint-cancel-btn" onClick={() => setShowModal(false)}
                      disabled={isSubmitting}

                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="complaint-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="btn-loader"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Submit Complaint
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Reply Modal */}
        {showReplyModal && selectedComplaint && (
          <div className="complaint-modal-overlay" onClick={() => setShowReplyModal(false)}>
            <div className="complaint-modal-container reply-modal" onClick={(e) => e.stopPropagation()}>
              <div className="complaint-modal-header">
                <h2 className="complaint-modal-title">Complaint Response</h2>
                <button className="complaint-modal-close-btn" onClick={() => setShowReplyModal(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              <div className="complaint-modal-body">
                <div className="reply-details">
                  <div className="reply-section">
                    <label className="reply-label">Your Complaint:</label>
                    <div className="reply-date">
                      <span >Ticket ID: {selectedComplaint.ticket_id}
                      </span>
                      <span>
                        Registered on: {new Date(selectedComplaint.complt_reg_dt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}</span>
                    </div>
                    <div className="reply-content complaint-text">
                      <p>{selectedComplaint.complaint}</p>
                    </div>
                    {/* <div className="reply-date">
                      Registered on: {new Date(selectedComplaint.complt_reg_dt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </div> */}
                  </div>

                  <div className="reply-section">
                    {selectedComplaint.reply_dt && (
                      <div className="reply-date">
                        <label className="reply-label">Response from Support:</label>

                        Replied on: {new Date(selectedComplaint.reply_dt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    )}
                    <div className="reply-content complaint-text">
                      <p>{selectedComplaint.reply_content || "No response yet"}</p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRatingModal && selectedComplaint && (
          <div className="complaint-modal-overlay" onClick={() => setShowRatingModal(false)}>
            <div className="complaint-modal-container reply-modal" onClick={(e) => e.stopPropagation()}>
              <div className="complaint-modal-header">
                <h2 className="complaint-modal-title">Rate Our Response</h2>
                <button className="complaint-modal-close-btn" onClick={() => setShowRatingModal(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              <div className="complaint-modal-body">
                <div className="rating-section">
                  <div className="rating-options">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`rating-option ${selectedRating >= star ? 'active' : ''}`}
                        onClick={() => handleRating(selectedComplaint.id, star)}
                        disabled={isRating}
                      >
                        {isRating && selectedRating === star ? (
                          <span className="btn-loader"></span>
                        ) : (
                          <span className="star-icon">
                            {selectedRating >= star ? '★' : '☆'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="rating-label">
                    {selectedRating === 1 && "Poor"}
                    {selectedRating === 2 && "Average"}
                    {selectedRating === 3 && "Good"}
                    {selectedRating === 4 && "Great"}
                    {selectedRating === 5 && "Excellent"}
                    {!selectedRating && "Click a star to rate"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-premium-overlay" onClick={cancelDelete}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="confirmation-modal-header">
                <AlertCircle size={24} color="#ef4444" />
                <h3>Delete This Complaint</h3>
                <button
                  className="modal-close-icon"
                  onClick={cancelDelete}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <XCircle size={20} />
                </button>
              </div>
              <div className="confirmation-modal-body">
                <p>Are you sure you want to delete this complaint?</p>
              </div>
              <div className="confirmation-modal-footer">
                <button className="confirmation-btn cancel" onClick={cancelDelete} disabled={isDeleting}>
                  Cancel
                </button>
                <button
                  className="confirmation-btn delete"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <span className="btn-loader"></span>
                      <span>Deleting...</span>
                    </span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Complaint Modal */}
        {viewShowModal && selectedComplaint && (
          <div className="complaint-modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="complaint-modal-container reply-modal" onClick={(e) => e.stopPropagation()}>
              <div className="complaint-modal-header">
                <h2 className="complaint-modal-title">Your Complaint</h2>
                <button className="complaint-modal-close-btn" onClick={() => setShowViewModal(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              <div className="complaint-modal-body">
                <div className="reply-details">
                  <div className="reply-section">
                    <div className="reply-date">
                      <span >Ticket ID: {selectedComplaint.ticket_id}
                      </span>
                      <span>
                        Registered on: {new Date(selectedComplaint.complt_reg_dt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}</span>
                    </div>
                    <div className="reply-content complaint-text">
                      <p>{selectedComplaint.complaint}</p>
                    </div>
                    {/* <div className="reply-date">
                      Registered on: {new Date(selectedComplaint.complt_reg_dt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplainRegister;