import React, { useState } from 'react';
import { AlertCircle, Send, CheckCircle, FileText, Clock, CheckCircle as ResolvedIcon, XCircle, Plus, Eye, Trash2, Star, MessageSquare, ThumbsUp, ThumbsDown, Award } from 'lucide-react';
import './ComplainRegister.css';

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
  const [viewShowModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [complaints, setComplaints] = useState([
    {
      id: 'CMP-001',
      description: 'The air conditioning in the library is not functioning properly for the past week, making it difficult to study in the heat.',
      status: 'in-progress',
      date: '2024-12-20',
      reply: 'We have informed the maintenance team. They will fix it within 2 days.',
      repliedAt: '2024-12-21',
      rating: null,
      resolved: false
    },
    {
      id: 'CMP-002',
      description: 'Request for late assignment submission due to medical emergency. I was hospitalized for 3 days.',
      status: 'resolved',
      date: '2024-12-18',
      reply: 'Your request has been approved. You can submit within 5 days.',
      repliedAt: '2024-12-19',
      rating: null,
      resolved: true
    },
   
    {
      id: 'CMP-003',
      description: 'Unable to access student portal for last 2 days. Getting authentication error repeatedly.',
      status: 'pending',
      date: '2024-12-22',
      reply: null,
      repliedAt: null,
      rating: null,
      resolved: false
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Stats calculations
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
  const resolvedComplaintsCount = complaints.filter(c => c.status === 'resolved').length;

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
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      const newComplaint = {
        id: `CMP-${Date.now()}`,
        description: formData.description,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        reply: null,
        repliedAt: null,
        rating: null,
        resolved: false
      };

      setComplaints([newComplaint, ...complaints]);
      setSubmittedMessage('Complaint submitted successfully!');
      setSubmitted(true);
      setShowModal(false);
      setFormData({
        description: ''
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
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

  const handleRating = (complaintId, ratingValue) => {
    const updatedComplaints = complaints.map(c =>
      c.id === complaintId
        ? { ...c, rating: ratingValue }
        : c
    );
    setComplaints(updatedComplaints);
    setSubmittedMessage(`Thank you for rating this response as ${ratingValue.toUpperCase()}!`);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);

    setShowReplyModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'in-progress':
        return <span className="status-badge status-in-progress">In Progress</span>;
      case 'resolved':
        return <span className="status-badge status-resolved">Resolved</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getRatingBadge = (rating) => {
    if (!rating) return null;
    switch (rating) {
      case 'excellent':
        return <span className="rating-badge rating-excellent"><Award size={14} /> Excellent</span>;
      case 'good':
        return <span className="rating-badge rating-good"><ThumbsUp size={14} /> Good</span>;
      case 'bad':
        return <span className="rating-badge rating-bad"><ThumbsDown size={14} /> Bad</span>;
      default:
        return null;
    }
  };

  // Get short description (first 60 characters)
  const getShortDescription = (description) => {
    if (description.length <= 40) return description;

    let trimmed = description.substring(0, 40);

    trimmed = trimmed.substring(0, trimmed.lastIndexOf(' '));

    return trimmed + '...';
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesSearch = complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="complaint-management-dashboard">
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
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="complaint-filters-section">
        <div className="complaint-filter-tabs">
          <button
            className={`complaint-filter-tab ${filterStatus === 'all' ? 'complaint-filter-tab-active' : ''}`}
            onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
          >
            All
          </button>
          <button
            className={`complaint-filter-tab ${filterStatus === 'pending' ? 'complaint-filter-tab-active' : ''}`}
            onClick={() => { setFilterStatus('pending'); setCurrentPage(1); }}
          >
            Pending
          </button>
          <button
            className={`complaint-filter-tab ${filterStatus === 'in-progress' ? 'complaint-filter-tab-active' : ''}`}
            onClick={() => { setFilterStatus('in-progress'); setCurrentPage(1); }}
          >
            In Progress
          </button>
          <button
            className={`complaint-filter-tab ${filterStatus === 'resolved' ? 'complaint-filter-tab-active' : ''}`}
            onClick={() => { setFilterStatus('resolved'); setCurrentPage(1); }}
          >
            Resolved
          </button>
        </div>
        <div className="complaint-search-wrapper">
          <input
            type="search"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="complaint-search-input"
          />
        </div>
      </div>

      {/* Complaints Table - Responsive */}
      <div className="complaint-table-wrapper">
        <div className="complaint-table-responsive">
          <table className="complaint-data-table">
            <thead className="complaint-table-header">
              <tr className="complaint-table-row">
                <th className="complaint-table-head">ID</th>
                <th className="complaint-table-head">Description</th>
                <th className="complaint-table-head">View</th>
                <th className="complaint-table-head">Status</th>
                <th className="complaint-table-head">Date</th>
                <th className="complaint-table-head">Reply</th>
                <th className="complaint-table-head">Rating</th>
              </tr>
            </thead>
            <tbody className="complaint-table-body">
              {currentItems.length > 0 ? (
                currentItems.map(complaint => (
                  <tr key={complaint.id} className="complaint-table-row">
                    <td className="complaint-table-cell" data-label="ID">
                      <span className="complaint-id-cell">{complaint.id}</span>
                    </td>
                    <td className="complaint-table-cell" data-label="Description" title={complaint.description}>
                      {getShortDescription(complaint.description)}
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
                        {/* <button className="complaint-action-btn complaint-delete-btn" title="Delete">
                          <Trash2 size={16} />
                        </button> */}
                      </div>
                    </td>
                    <td className="complaint-table-cell" data-label="Status">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="complaint-table-cell" data-label="Date">
                      {complaint.date}
                    </td>
                    <td className="complaint-table-cell" data-label="Reply">
                      {complaint.reply ? (
                        <button
                          className="view-reply-btn"
                          onClick={() => handleViewReply(complaint)}
                        >
                          <MessageSquare size={16} />
                          View Reply
                        </button>
                      ) : (
                        <span className="no-reply-text">No reply yet</span>
                      )}
                    </td>
                    <td className="complaint-table-cell" data-label="Rating">
                      {getRatingBadge(complaint.rating)}
                    </td>
              
                  </tr>
                ))
              ) : (
                <tr className="complaint-table-row">
                  <td colSpan="7" className="complaint-no-data-cell">
                    <AlertCircle size={48} />
                    <p className="complaint-no-data-text">No complaints found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="complaint-pagination">
          <button
            className="pagination-btn"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Success Message */}
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
                    {selectedComplaint.description}
                  </div>
                </div>

                <div className="reply-section">
                  <label className="reply-label">Response from Support:</label>
                  <div className="reply-content response-text">
                    {selectedComplaint.reply}
                  </div>
                  <div className="reply-date">
                    Replied on: {selectedComplaint.repliedAt}
                  </div>
                </div>

                {selectedComplaint.reply && selectedComplaint.resolved === true && !selectedComplaint.rating && (
                  <div className="rating-section">
                    <label className="reply-label">Rate this Response:</label>
                    <div className="rating-options">
                      <button
                        className="rating-option excellent"
                        onClick={() => handleRating(selectedComplaint.id, 'excellent')}
                      >
                        <Award size={20} />
                        Excellent
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
                )}

                {/* Show existing rating */}
                {selectedComplaint.rating && (
                  <div className="rating-section">
                    <label className="reply-label">Your Rating:</label>
                    <div className="existing-rating">
                      {getRatingBadge(selectedComplaint.rating)}
                      <p className="rating-thanks">Thank you for your feedback!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


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
                  <label className="reply-label">Description:</label>
                  <div className="reply-content complaint-text">
                    {selectedComplaint.description}
                  </div>
                  <div className="reply-date">
                    Registered on: {selectedComplaint.date}
                  </div>
                </div>

                {/* <div className="reply-section">
                                    <label className="reply-label">Response from Support:</label>
                                    <div className="reply-content response-text">
                                        {selectedComplaint.reply}
                                    </div>
                                    <div className="reply-date">
                                        Replied on: {selectedComplaint.repliedAt}
                                    </div>
                                </div> */}




              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplainRegister;