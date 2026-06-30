// Dashboard.js - Fixed with proper animation timing
import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  ThumbsUp,
  Clock as ClockIcon,
  IndianRupee,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';
import './Dashboard.css';
import { secureStorage } from '../../utils/secureStorage';
import { getPaymentData } from '../../services/paymentService';
import { useComplaintCounts, useComplaints } from '../../hooks/useComplaints';
import { usePayments } from '../../hooks/usePayments';
import { useWorkDetails, useLastWorkStatus } from "../../hooks/useWorkDetails";
import { useScholar } from '../../hooks/useScholar';
import { Link, useNavigate } from 'react-router-dom';
import Loader from './../../components/Loader/Loader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pendingPayment, setPendingPayment] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [workProgress, setWorkProgress] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);

  // Store actual values for animation targets
  const [targetPendingPayment, setTargetPendingPayment] = useState(0);
  const [targetTotalPaid, setTargetTotalPaid] = useState(0);
  const [targetResolvedComplaints, setTargetResolvedComplaints] = useState(0);
  const [targetPendingComplaints, setTargetPendingComplaints] = useState(0);
  const [targetWorkProgress, setTargetWorkProgress] = useState(0);
  const navigate = useNavigate();

// In your component
const [activeTooltip, setActiveTooltip] = useState(null);
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const scholar = secureStorage.getScholar();
  const { data: paymentData = [] } = usePayments();
  const payment = paymentData[0];

  const { data: apiResponse } = useComplaints(1, 10, 'all', '');
  const complaint = apiResponse?.data?.[0];

  const company = secureStorage.getCompany();
  const { data: counts } = useComplaintCounts();

  const { data: work } = useWorkDetails();
  const workDetails = work?.[0];
  const workStatusList = workDetails?.work_dtls_sts || [];

  const { data: lastStatus } = useLastWorkStatus();
  const lastWorkStatus = lastStatus?.status;
  const lastWorkStatusDate = lastStatus?.date;
  const lastWorkStatusNote = lastStatus?.note;

  const [resolvedComplaints, setResolvedComplaints] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  const { data: companyData } = useScholar();

  // Track data loading states
  const [dataStates, setDataStates] = useState({
    paymentsLoaded: false,
    complaintsLoaded: false,
    workLoaded: false,
    countsLoaded: false,
    scholarLoaded: false
  });


  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

const handleTooltipToggle = (id) => {
  if (activeTooltip === id) {
    setActiveTooltip(null);
  } else {
    setActiveTooltip(id);
  }
};

// Close tooltip when clicking outside
useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest('.progress-list-note')) {
      setActiveTooltip(null);
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);



  // Set target values when data arrives
  useEffect(() => {
    if (counts) {
      setTargetResolvedComplaints(counts.resolved || 0);
      setTargetPendingComplaints(counts.pending || 0);
      setDataStates(prev => ({ ...prev, countsLoaded: true }));
    }
  }, [counts]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const scholarData = secureStorage.getScholar();
        if (!scholarData?.id) {
          setLoading(false);
          return;
        }

        const res = await getPaymentData(scholarData.id);
        const response = res.data;
        const paymentDataFromApi = response.data?.[0];

        setTargetPendingPayment(Number(paymentDataFromApi?.bal_amt) || 0);
        setTargetTotalPaid(Number(paymentDataFromApi?.tot_paid) || 0);

        setDataStates(prev => ({ ...prev, paymentsLoaded: true }));
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setDataStates(prev => ({ ...prev, paymentsLoaded: true }));
      }
    };

    fetchDashboard();
  }, []);

  // Set target work progress when data arrives
  useEffect(() => {
    if (lastWorkStatus !== undefined) {
      setTargetWorkProgress(Number(lastWorkStatus) || 0);
      setDataStates(prev => ({ ...prev, workLoaded: true }));
    }
  }, [lastWorkStatus]);

  // Track other data loading states
  useEffect(() => {
    if (apiResponse !== undefined) {
      setDataStates(prev => ({ ...prev, complaintsLoaded: true }));
    }
  }, [apiResponse]);

  useEffect(() => {
    if (work !== undefined) {
      setDataStates(prev => ({ ...prev, workLoaded: true }));
    }
  }, [work]);

  useEffect(() => {
    if (companyData !== undefined) {
      setDataStates(prev => ({ ...prev, scholarLoaded: true }));
    }
  }, [companyData]);

  // Check when all data is loaded and start animations
  useEffect(() => {
    const allDataLoaded =
      dataStates.paymentsLoaded &&
      dataStates.complaintsLoaded &&
      dataStates.workLoaded &&
      dataStates.countsLoaded &&
      dataStates.scholarLoaded;

    if (allDataLoaded && !isDataReady) {
      // First hide the loader
      setLoading(false);
      setIsDataReady(true);

      // Small delay to ensure DOM is ready, then start animations
      setTimeout(() => {
        // Animate counts
        animateCount(setResolvedComplaints, targetResolvedComplaints, 1200);
        animateCount(setPendingComplaints, targetPendingComplaints, 1200);
        animateCount(setTotalPaid, targetTotalPaid, 1200);
        animateCount(setPendingPayment, targetPendingPayment, 1200);

        // Animate progress bar
        animateProgress(targetWorkProgress);
      }, 100);
    }
  }, [dataStates, isDataReady, targetResolvedComplaints, targetPendingComplaints, targetTotalPaid, targetPendingPayment, targetWorkProgress]);

  const progressRef = useRef(null);
  const countRefs = useRef({
    resolved: null,
    pending: null,
    totalPaid: null,
    pendingPayment: null
  });

  const animateProgress = (end) => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }

    let progress = 0;
    const stepTime = 16; // ~60fps
    const duration = 1000; // 1 second for progress bar
    const increment = end / (duration / stepTime);

    progressRef.current = setInterval(() => {
      progress += increment;
      if (progress >= end) {
        setWorkProgress(end);
        clearInterval(progressRef.current);
        progressRef.current = null;
      } else {
        setWorkProgress(Math.floor(progress));
      }
    }, stepTime);
  };

  const animateCount = (setValue, end, duration = 1200) => {
    let start = 0;
    const stepTime = 16;
    const increment = end / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, stepTime);

    return timer;
  };


  const stats = [
    {
      icon: CheckCircle,
      label: 'Total Paid',
      value: `₹${totalPaid.toLocaleString()}`,
      change: '+₹15,000',
      color: '#10b981',
      path: "/payment-history"

    },

    {
      icon: IndianRupee,
      label: 'Pending Payment',
      value: pendingPayment === 0
        ? 'No pending payment'
        : `₹${pendingPayment}`,
      change: '+12.5%',
      trend: 'up',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      isZero: pendingPayment === 0,
      path: "/payment-history"

    },
    {
      icon: ThumbsUp,
      label: 'Resolved Complaints',
      value: resolvedComplaints,
      change: '+5',
      color: '#34d399',
      path: "/complaint-register",
      status: 'resolved'

    },
    {
      icon: AlertCircle,
      label: 'Pending Complaints',
      value: pendingComplaints === 0
        ? 'No pending complaints'
        : `₹${pendingComplaints.toLocaleString()}`,
      change: '-2',
      color: '#ef4444',
      isZero: pendingComplaints === 0,
      path: "/complaint-register",
      status: 'pending'


    },
  ];

  const recentActivities = [
    //  Payment Activity (only if exists)
    ...(payment
      ? [{
        id: 1,
        activity: `Payment Paid for ${payment?.purpose?.pay_purpose || ''}`,
        date: new Date(payment?.pay_dt_tm).toLocaleString("en-GB", {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          // hour: '2-digit',
          // minute: '2-digit',
          // hour12: true
        }),
        status: payment?.pay_status,
        amount: payment?.pay_received || 0,


      }]
      : []),

    //  Complaint Activity (ONLY if complaint exists)
    ...(complaint?.complaint
      ? [{
        id: 2,
        activity: `Complaint ${complaint?.resolve_status === "resolved" && complaint?.reply_content
          ? 'Resolved'
          : complaint?.resolve_status === null && !complaint?.reply_content
            ? 'Pending'
            : 'In-Progress'
          } - Last Submission`,
        date: new Date(complaint?.complt_reg_dt).toLocaleString("en-GB", {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          // hour: '2-digit',
          // minute: '2-digit',
          // hour12: true
        }),
        status:
          complaint?.resolve_status === "resolved" && complaint?.reply_content
            ? 'Resolved'
            : complaint?.resolve_status === null && complaint?.reply_content
              ? 'In Progress'
              : 'Pending',
        complaint: complaint?.complaint
      }]
      : [])
  ];

  if (loading) {
    return (
      <div className="dashboard-loader-wrapper">
        <Loader
          type="scholar"
          size="large"
          text="Loading dashboard data...."
        />
      </div>
    );
  }
  const capsLetter = (str) => {
    if (!str) return;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const getShortDescription = (description) => {
    if (!description) return '';

    if (description.length <= 30) return description;

    const trimmed = description.substring(0, 55);

    //  If no space (single word), just cut directly
    if (!trimmed.includes(' ')) {
      return trimmed + '...';
    }

    //  Otherwise cut at last full word
    return trimmed.substring(0, trimmed.lastIndexOf(' ')) + '...';
  };

  const statusClass = complaint?.status
    ?.toLowerCase()
    .replace(/\s+/g, '-'); // "In Progress" → "in-progress"


  const getStatusClass = (status) =>
    status?.toLowerCase().replace(/\s+/g, '-');

  // Helper function to truncate text at 50 characters with full words
const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  // Trim to maxLength and find the last space
  let truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If there's a space, cut at the last space, otherwise cut at maxLength
  if (lastSpace > 0) {
    truncated = truncated.substring(0, lastSpace);
  }
  
  return truncated + '...';
};


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {companyData?.user_name || "Scholar"}!</h1>
        <p>{companyData?.company.company_name || "MindTek Research and IT Solutions Pvt. Ltd."}</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const CardContent = (
            <div
              className={`stat-card ${stat.isZero ? "disabled-card" : ""}`}
              onClick={() => {
                if (!stat.isZero && stat.path) {
                  navigate(stat.path, { state: { status: stat.status } });
                }
              }}
            >
              {!stat.isZero && (
                <div
                  className="stat-icon"
                  style={{ background: `${stat.color}20`, color: stat.color }}
                >
                  <stat.icon size={24} />
                </div>
              )}

              <div className="stat-info">
                <h3
                  style={{
                    fontSize: stat.isZero ? "14px" : "",
                    textAlign: stat.isZero ? "center" : ""
                  }}
                >
                  {stat.value}
                </h3>

                {!stat.isZero && <p>{stat.label}</p>}
              </div>
            </div>
          );

          return stat.isZero ? (
            <div key={index}>{CardContent}</div>
          ) : (
            <Link
              key={index}
              to={stat.path}
              state={{ status: stat.status }}
              style={{ textDecoration: "none" }}
            >
              {CardContent}
            </Link>
          );
        })}
      </div>

      <div className="full-width-card work-progress-full">
        <div className='progress-main-section'>
          <div className="work-progress-header">
            <h3 className='work-progress-title'><span>Work Completion Progress</span> </h3>
            <div className="progress-status-badge">
              {/* <span className="badge"><TrendingUp size={18} /></span> */}
            </div>
          </div>
            {workProgress > 0 ? (

          <div className="main-progress-container">
            <div className="progress-label">
              <span>Overall Progress</span>
              <span className="progress-percentage" style={{ color: workProgress === 100 ? " #22c55e" : '' }}>{workProgress}%</span>
            </div>
            <div className="progress-bar-main">
              <div
                className="progress-fill-main"
                style={{
                  width: `${workProgress}%`,
                  background:
                    workProgress === 100
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : ""
                }}
              >
                <div className="progress-glow"></div>
              </div>
            </div>
            <div className="progress-stats-full">
              {lastStatus?.note && (
                <>
                  <span className="overview-note"><b>Notes:</b> {capsLetter(lastStatus?.note)}</span>

                </>
              )}
              {lastStatus?.date && !isNaN(new Date(lastStatus.date).getTime()) && (
                <span>
                  {new Date(lastStatus.date).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              {/* <span>Remaining: {100 - workProgress}%</span> */}
            </div>


          </div>
            ) : (
               <div className="empty-progress-stats">
                      <div className="empty-icon"><TrendingUp size={25} /></div>
                      <p className="empty-title">Work progress data not available</p>
                      <p className="empty-description">Work status updates will appear here once available</p>
                    </div>
            )}
        </div>
        {workStatusList && workStatusList.length > 1 && (

          <div className="progress-stats-section">
            <div className="work-progress-header">
              <h3 className='work-progress-title'><span>Recent Updates</span> </h3>

            </div>
            <div className="progress-stats">
              <div className="progress-list">
                {workStatusList && workStatusList.length > 1 ? (
                  <>
                    {workStatusList.slice(-4, -1).map((item, index) => (
                      <div key={index} className="progress-list-item">
                        <div className="progress-list-header">
                          <span className="progress-list-date">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: "numeric" })}
                          </span>
                          <span className="progress-list-percent">{item.status}%</span>
                        </div>
                        <div className="progress-list-bar">
                          <div
                            className="progress-list-fill"
                            style={{
                              width: `${item.status}%`,
                              background: `linear-gradient(90deg, var(--primary-color), ${item.status >= 70 ? '#10b981' : item.status >= 40 ? '#f59e0b' : '#ef4444'})`
                            }}
                          ></div>
                        </div>
        {item.note && (
  <div 
    className="progress-list-note"
    onMouseEnter={() => !isMobile && setActiveTooltip(item.id || `note-${index}`)}
    onMouseLeave={() => !isMobile && setActiveTooltip(null)}
    onClick={() => isMobile && handleTooltipToggle(item.id || `note-${index}`)}
  >
    <span 
      className="note-text" 
      data-fulltext={capsLetter(item.note)}
    >
      {truncateText(capsLetter(item.note), 50)}
    </span>
    {(activeTooltip === (item.id || `note-${index}`)) && (
      <div className="tooltip-popup">
        {capsLetter(item.note)}
        {isMobile && (
          <button 
            className="close-tooltip" 
            onClick={(e) => {
              e.stopPropagation();
              setActiveTooltip(null);
            }}
          >
            ✕
          </button>
        )}
      </div>
    )}
  </div>
)}

    </div>
                    ))}
                  </>
                ) : (
                  /* Empty State - No Data Available */
                  <div className="empty-progress-stats">
                    <div className="empty-icon">
                      <TrendingUp size={32} />
                    </div>
                    <p className="empty-title">Work progress data not available</p>
                    <p className="empty-description">Work status updates will appear here once available</p>
                  </div>
                )}

              </div>
              <div className="progress-bar-mini">
                <div className="progress-fill-mini" style={{ width: `${workProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="dashboard-grid">
        <div className="card activities-card">
          <h3>Recent Activities</h3>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-status ${getStatusClass(activity.status)}`}></div>

                <div className="activity-info">
                  <p className="activity-title" >{activity.activity}</p>

                  <div className='activity-footer'>
                    {activity.amount && (
                      <span className="activity-amount">₹{activity.amount}</span>
                    )}

                    {activity.complaint && (
                      <span className={`activity-complaint-${statusClass}`} title={activity.complaint}>
                        {getShortDescription(activity.complaint)}
                      </span>
                    )}

                    <span className="activity-date">{activity.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-summary">
          <h3>Payment Summary</h3>
          <div className="payment-details">
            <div className="payment-item">
              <span>Total Amount</span>
              <strong>₹{(totalPaid + pendingPayment).toLocaleString()}</strong>
            </div>
            <div className="payment-item">
              <span>Total Paid</span>
              <strong className="paid-amount">₹{totalPaid.toLocaleString()}</strong>
            </div>
            {pendingPayment > 0 && (
              <div className="payment-item">
                <span>Pending Payment</span>
                <strong className="pending-amount">₹{pendingPayment.toLocaleString()}</strong>
              </div>
            )}
            <div className="payment-progress">
              <div className="payment-bar">
                <div
                  className="payment-fill"
                  style={{ width: `${(totalPaid / (totalPaid + pendingPayment)) * 100}%` }}
                ></div>
              </div>
              <span>{Math.round((totalPaid / (totalPaid + pendingPayment)) * 100)}% Paid</span>
            </div>
          </div>
        </div>

        {/* <div className="card complaints-summary">
          <h3>Complaints Overview</h3>
          <div className="complaints-stats">
            <div className="complaint-stat resolved">
              <div className="complaint-icon">
                <ThumbsUp size={32} />
              </div>
              <div className="complaint-info">
                <span className="complaint-label">Resolved</span>
                <strong className="complaint-value">{resolvedComplaints}</strong>
              </div>
            </div>
            <div className="complaint-stat pending">
              <div className="complaint-icon">
                <ClockIcon size={32} />
              </div>
              <div className="complaint-info">
                <span className="complaint-label">Pending</span>
                <strong className="complaint-value">{pendingComplaints}</strong>
              </div>
            </div>
          </div>
          <div className="complaints-resolution">
            <div className="resolution-bar">
              <div 
                className="resolution-fill" 
                style={{ width: `${(resolvedComplaints / (resolvedComplaints + pendingComplaints)) * 100}%` }}
              ></div>
            </div>
            <span>{Math.round((resolvedComplaints / (resolvedComplaints + pendingComplaints)) * 100)}% Resolution Rate</span>
          </div>
        </div>
        
        <div className="card quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn">
              <BookOpen size={20} />
              <span>Start Learning</span>
            </button>
            <button className="action-btn">
              <Calendar size={20} />
              <span>Schedule Meeting</span>
            </button>
            <button className="action-btn">
              <TrendingUp size={20} />
              <span>View Progress</span>
            </button>
            <button className="action-btn">
              <Users size={20} />
              <span>Study Group</span>
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;