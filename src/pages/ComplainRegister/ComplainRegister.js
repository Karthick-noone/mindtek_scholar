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
  Award,
  Handshake,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  EditIcon,
  Trash2,
  X
} from 'lucide-react';
import { BsStarFill } from 'react-icons/bs';
import './ComplainRegister.css';
import { useComplaints, useCreateComplaint, useComplaintCounts, useUpdateRating, useDeleteComplaint } from '../../hooks/useComplaints';
import { secureStorage } from '../../utils/secureStorage';
import trashOff  from './../../assets/img/recycle-bin.png';

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

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  // Fetch complaints from backend with pagination
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch
  } = useComplaints(currentPage, rowsPerPage, filterStatus, searchTerm);


  // const {data: apiComplaints = []} = useAllComplaints();

  // const allComplaints = apiComplaints?.data || [];

  // console.log("allComplaints", allComplaints)
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

  const { data: counts } = useComplaintCounts();

  // Stats calculations (from API data)
  const totalComplaints = counts?.total_complaints;
  const pendingComplaints = counts?.pending;
  const inProgressComplaints = counts?.in_progress;
  const resolvedComplaintsCount = counts?.resolved;




  const statsCards = [
    {
      title: 'Total Complaints',
      value: totalComplaints,
      icon: <FileText size={24} />,
      color: '#3b82f6',
      bgColor: '#3b82f610'
    },
    {
      title: 'Pending',
      value: pendingComplaints,
      icon: <Clock size={24} />,
      color: '#f59e0b',
      bgColor: '#f59e0b10'
    },
    {
      title: 'In Progress',
      value: inProgressComplaints,
      icon: <AlertCircle size={24} />,
      color: '#8b5cf6',
      bgColor: '#8b5cf610'
    },
    {
      title: 'Resolved',
      value: resolvedComplaintsCount,
      icon: <ResolvedIcon size={24} />,
      color: '#10b981',
      bgColor: '#10b98110'
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
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    if (formData.description.length > 500) newErrors.description = 'Complaint must be at most 500 characters';

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

  deleteComplaint(selectedComplaintId, {
    onSuccess: () => {
      setSubmittedMessage('Complaint deleted successfully!');
      setSubmitted(true);

      setShowDeleteConfirm(false);   //  now works properly
      setSelectedComplaintId(null);  //  reset

      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: () => {
      setSubmittedMessage('Failed to delete complaint.');
      setSubmitted(true);

      setTimeout(() => setSubmitted(false), 3000);
    }
  });
};

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
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
            refetch(); // Refresh the list
            setTimeout(() => setSubmitted(false), 3000);
          },
          onError: () => {
            setSubmittedMessage('Failed to submit complaint. Please try again.');
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
          }
        }
      );
    } else {
      setErrors(newErrors);
    }
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
    const ratingMap = {
      excellent: 1,
      veryGood: 2,
      good: 3,
      bad: 4
    };

    updateRating(
      {
        id: complaintId,
        data: {
          ratings: ratingMap[ratingValue],
        },
      },
      {
        onSuccess: () => {
          setSubmittedMessage(
            `Thank you for rating this response as ${ratingValue.toUpperCase()}!`
          );
          setSubmitted(true);

          setTimeout(() => setSubmitted(false), 3000);
          setShowRatingModal(false);

          // refetch(); // optional (React Query already refetches)
        },

        onError: (err) => {
          console.error("Rating update failed:", err);
        },
      }
    );
  };

  const getStatusBadge = (complaint) => {
    if (complaint.resolve_status === 'resolved' && complaint.reply_content !== null) {
      return <span className="status-badge status-resolved">Resolved</span>;
    } else if (complaint.resolve_status === null && complaint.reply_content !== null) {
      return <span className="status-badge status-in-progress">In Progress</span>;
    } else {
      return <span className="status-badge status-pending">Pending</span>;
    }
  };

  const mapRatingToDisplay = (rating) => {
    switch (String(rating)) {
      case "1": return "excellent";
      case "2": return "veryGood";
      case "3": return "good";
      case "4": return "bad";
      default: return null;
    }
  };

  const getRatingBadge = (ratings) => {
    const displayRating = mapRatingToDisplay(ratings);
    if (!displayRating) return null;

    switch (displayRating) {
      case 'excellent':
        return <span className="rating-badge rating-excellent"><Award size={14} /> Excellent</span>;
      case 'veryGood':
        return <span className="rating-badge rating-very-good"><Handshake size={14} /> Very Good</span>;
      case 'good':
        return <span className="rating-badge rating-good"><ThumbsUp size={14} /> Good</span>;
      case 'bad':
        return <span className="rating-badge rating-bad"><ThumbsDown size={14} /> Bad</span>;
      default:
        return null;
    }
  };

const getShortDescription = (description) => {
  if (!description) return '';

  if (description.length <= 30) return description;

  const trimmed = description.substring(0, 15);

  //  If no space (single word), just cut directly
  if (!trimmed.includes(' ')) {
    return trimmed + '...';
  }

  //  Otherwise cut at last full word
  return trimmed.substring(0, trimmed.lastIndexOf(' ')) + '...';
};


  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  // Calculate showing entries info
  const startEntry = (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, totalCount);

  return (
    <div className="complaint-management-dashboard">
      <div className="complaint-limit">
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
                <h3 className="complaint-stat-value">{stat.value}</h3>
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
           {searchTerm && (
            <div className='search-term'>
              <p>Searching: <span>"{searchTerm}"</span></p>
            </div>
          )}
          <div className="complaint-search-wrapper">
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
        </div>


        {/* Complaints Table */}
        <div className="complaint-table-wrapper">
          <div className="complaint-table-responsive">
            <table className="complaint-data-table">
              <thead className="complaint-table-header">
                <tr className="complaint-table-row">
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
                    <td colSpan="8" className="complaint-loading-cell">
                      <div className="complaint-loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading complaints...</p>
                      </div>
                    </td>
                  </tr>
                ) : (complaints.length > 0 ? (
                  complaints.map(complaint => (
                    <tr key={complaint.id} className="complaint-table-row">
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
                        {(complaint.resolve_status === "resolved" && complaint.reply_content !== null) ? (

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                            {complaint.ratings && getRatingBadge(complaint.ratings)}

                            <button
                              className="view-rate-btn"
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setShowRatingModal(true);
                              }}
                            >
                              {complaint.ratings ? <EditIcon size={14} /> : <BsStarFill size={14} />}
                              {complaint.ratings ? "Update" : "Rate"}
                            </button>

                          </div>

                        ) : (
                          <span className="no-reply-text">No Rating</span>
                        )}
                      </td>
                      <td className="complaint-table-cell" data-label="Status">
                        {complaint.reply_content === null ? (
                          <div className="complaint-delete-button"
                          onClick={() => handleDelete(complaint.id)}
                          >
                          <Trash2 size={16}
                        />
                        </div>
                      
                      ) : (
                        <div className="complaint-delete-off-button">
                          <img src={trashOff} width={'20px'}/>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="complaint-table-row">
                    <td colSpan="8" className="complaint-no-data-cell">
                      <AlertCircle size={48} />
                      <p className="complaint-no-data-text">No complaints found</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-premium-controls">
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

            <div className="pagination-info-premium">
              Showing {startEntry} to {endEntry} of {totalCount} entries
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
                    <div className="complaint-character-count">
                      {formData.description.length}/500 characters
                    </div>
                  </div>

                  <div className="complaint-form-info">
                    <AlertCircle size={16} />
                    <span className="complaint-info-text">All complaints are confidential and will be handled by the appropriate department.</span>
                  </div>

                  <div className="complaint-modal-buttons">
                    <button type="button" className="complaint-cancel-btn" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="complaint-submit-btn">
                      <Send size={18} />
                      Submit Complaint
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
                    <div className="reply-content complaint-text">
                      {selectedComplaint.complaint}
                    </div>
                    <div className="reply-date">
                      Registered on: {new Date(selectedComplaint.complt_reg_dt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                  </div>

                  <div className="reply-section">
                    <label className="reply-label">Response from Support:</label>
                    <div className="reply-content response-text">
                      {selectedComplaint.reply_content || "No response yet"}
                    </div>
                    {selectedComplaint.reply_dt && (
                      <div className="reply-date">
                        Replied on: {new Date(selectedComplaint.reply_dt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedComplaint && (
          <div className="complaint-modal-overlay" onClick={() => setShowRatingModal(false)}>
            <div className="complaint-modal-container reply-modal" onClick={(e) => e.stopPropagation()}>
              <div className="complaint-modal-header">
                <h2 className="complaint-modal-title">Rate This Response</h2>
                <button className="complaint-modal-close-btn" onClick={() => setShowRatingModal(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              <div className="complaint-modal-body">
                <div className="rating-section">
                  <div className="rating-options">
                    <button
                      className="rating-option excellent"
                      onClick={() => handleRating(selectedComplaint.id, 'excellent')}
                    >
                      <Award size={20} />
                      Excellent
                    </button>
                    <button
                      className="rating-option very-good"
                      onClick={() => handleRating(selectedComplaint.id, 'veryGood')}
                    >
                      <Handshake size={20} />
                      Very Good
                    </button>
                    <button
                      className="rating-option good"
                      onClick={() => handleRating(selectedComplaint.id, 'good')}
                    >
                      <ThumbsUp size={20} />
                      Good
                    </button>
                    <button
                      className="rating-option bad"
                      onClick={() => handleRating(selectedComplaint.id, 'bad')}
                    >
                      <ThumbsDown size={20} />
                      Bad
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {/* <p className="warning-text">This action cannot be undone.</p> */}
              </div>
              <div className="confirmation-modal-footer">
                <button className="confirmation-btn cancel" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="confirmation-btn delete" onClick={confirmDelete}>
                  Delete
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
                    {/* <label className="reply-label">Description:</label> */}
                    <div className="reply-content complaint-text">
                     <p> {selectedComplaint.complaint}</p>
                    </div>
                    <div className="reply-date">
                      Registered on: {new Date(selectedComplaint.complt_reg_dt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
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