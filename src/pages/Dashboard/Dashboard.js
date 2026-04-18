import React, { useState, useEffect } from 'react';
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
  IndianRupee
} from 'lucide-react';
import Shimmer from '../../components/Shimmer/Shimmer';
import './Dashboard.css';
import { secureStorage } from '../../utils/secureStorage';
import { useComplaintCounts, useComplaints } from '../../hooks/useComplaints'
import { getPaymentData } from '../../services/paymentService';
import { usePayments } from '../../hooks/usePayments';
import { useWorkDetails, useLastWorkStatus } from "../../hooks/useWorkDetails";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [workProgress, setWorkProgress] = useState(0);

  const [pendingPayment, setPendingPayment] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);


  const scholar = secureStorage.getScholar();

  // console.log("SCholor details", scholar)
  const company = secureStorage.getCompany();
  const { data: counts } = useComplaintCounts();

  const { data: paymentData = [] } = usePayments();
  const payment = paymentData[0];

  const { data: apiResponse } = useComplaints(1, 10, 'all', '');

  const complaint = apiResponse?.data?.[0];

  const { data: lastStatus } = useLastWorkStatus();

  const lastWorkStatus = lastStatus?.status;

  const { data: work } = useWorkDetails();
  const workDetails = work?.[0];

  const workStatusList = workDetails?.work_dtls_sts || [];

  useEffect(() => {
    if (lastWorkStatus !== undefined) {
      animateProgress(Number(lastWorkStatus) || 0);
    }
  }, [lastWorkStatus]);


  const [resolvedComplaints, setResolvedComplaints] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    if (counts) {
      // console.log("Counts", counts);

      animateCount(setResolvedComplaints, counts.resolved || 0);
      animateCount(setPendingComplaints, counts.pending || 0);
    }
  }, [counts]);

  // const [resolvedComplaints, setResolvedComplaints] = useState(counts?.resolved);
  // const [pendingComplaints, setPendingComplaints] = useState(counts?.pending);
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const scholar = secureStorage.getScholar();
        if (!scholar?.id) return;

        const res = await getPaymentData(scholar.id);
        const response = res.data;

        const payment = response.data?.[0];

        setLoading(false);

        animateCount(setPendingPayment, Number(payment?.bal_amt) || 0);
        animateCount(setTotalPaid, Number(payment?.tot_paid) || 0);

        // const total = Number(payment?.total_amount) || 0;
        // const paid = Number(payment?.tot_paid) || 0;

        // const progress = total ? Math.round((paid / total) * 100) : 0;
        // animateProgress(progress);

      } catch (err) {
        console.error("Dashboard API Error:", err);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const animateProgress = (end) => {
    let progress = 0;

    const timer = setInterval(() => {
      progress += 1;

      if (progress >= end) {
        setWorkProgress(end);
        clearInterval(timer);
      } else {
        setWorkProgress(progress);
      }
    }, 10);
  };

  const animateCount = (setValue, end, duration = 1000) => {
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
  };

  const stats = [
    { icon: CheckCircle, label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, change: '+₹15,000', color: '#10b981' },
    {
      icon: IndianRupee,
      label: 'Pending Payment',
      value: pendingPayment === 0
        ? 'No pending payment'
        : `₹${pendingPayment.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      isZero: pendingPayment === 0
    },
    { icon: ThumbsUp, label: 'Resolved Complaints', value: resolvedComplaints, change: '+5', color: '#34d399' },
    {
      icon: AlertCircle,
      label: 'Pending Complaints',
       value: pendingComplaints === 0
        ? 'No pending complaints'
        : `₹${pendingComplaints.toLocaleString()}`,
      change: '-2',
      color: '#ef4444',
      isZero: pendingComplaints === 0

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
        amount: payment?.pay_received || 0
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
  // if (loading) {
  //   return (
  //     <div className="dashboard">
  //       <div className="dashboard-header">
  //         <Shimmer width="300px" height="32px" marginBottom="16px" />
  //         <Shimmer width="400px" height="20px" marginBottom="32px" />
  //       </div>
  //       <div className="stats-grid">
  //         {[1, 2, 3, 4].map(i => (
  //           <Shimmer key={i} height="120px" borderRadius="12px" />
  //         ))}
  //       </div>
  //       <Shimmer height="300px" borderRadius="12px" marginBottom="24px" />
  //       <div className="dashboard-grid">
  //         <Shimmer height="400px" borderRadius="12px" />
  //         <Shimmer height="400px" borderRadius="12px" />
  //       </div>
  //     </div>
  //   );
  // }

  const capsLetter = (str) => {
    if (!str) return;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

const getShortDescription = (description) => {
  if (!description) return '';

  if (description.length <= 30) return description;

  const trimmed = description.substring(0, 30);

  //  If no space (single word), just cut directly
  if (!trimmed.includes(' ')) {
    return trimmed + '...';
  }

  //  Otherwise cut at last full word
  return trimmed.substring(0, trimmed.lastIndexOf(' ')) + '...';
};
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, Scholar!</h1>
        <p>MindTek Research and IT Solutions Pvt. Ltd.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            {!stat.isZero && (
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
            )}
            <div className="stat-info">
              <h3 style={{fontSize:stat.isZero ? "14px" :'',  textAlign: stat.isZero ? "center" : '' }}>{stat.value}</h3>
              {!stat.isZero && <p >{stat.label}</p>}
              {/* <span className="stat-change">{stat.change} this month</span> */}
            </div>
          </div>
        ))}
      </div>

      <div className="full-width-card work-progress-full">
        <div className='progress-main-section'>
          <div className="work-progress-header">
            <h3 className='work-progress-title'><span>Work Completion Progress</span> </h3>
            <div className="progress-status-badge">
              {/* <span className="badge"><TrendingUp size={18} /></span> */}
            </div>
          </div>

          <div className="main-progress-container">
            <div className="progress-label">
              <span>Overall Progress</span>
              <span className="progress-percentage">{workProgress}%</span>
            </div>
            <div className="progress-bar-main">
              <div
                className="progress-fill-main"
                style={{ width: `${workProgress}%` }}
              >
                <div className="progress-glow"></div>
              </div>
            </div>
            <div className="progress-stats-full">
              {lastStatus?.note && (
                <>
                  <span>Notes: {capsLetter(lastStatus?.note)}</span>
                  <span> {new Date(lastStatus?.date).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </>
              )}
              {/* <span>Remaining: {100 - workProgress}%</span> */}
            </div>


          </div>
        </div>

        <div className="progress-stats-section">
          <div className="work-progress-header">
            <h3 className='work-progress-title'><span>Recent Updates</span> </h3>

          </div>
          <div className="progress-stats">
            <div className="progress-list">
              {workStatusList && workStatusList.length > 0 ? (
                <>
                  {workStatusList.slice(0, -1).map((item, index) => (
                    <div key={index} className="progress-list-item">
                      <div className="progress-list-header">
                        <span className="progress-list-date">
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
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
                        <div className="progress-list-note">
                          <span>{capsLetter(item.note)}</span>
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
      </div>

      <div className="dashboard-grid">
        <div className="card activities-card">
          <h3>Recent Activities</h3>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-status ${activity.status}`}></div>

                <div className="activity-info">
                  <p className="activity-title">{activity.activity}</p>

                  <div className='activity-footer'>
                    {activity.amount && (
                      <span className="activity-amount">₹{activity.amount}</span>
                    )}

                    {activity.complaint && (
                      <span className="activity-complaint" title={activity.complaint}>{getShortDescription(activity.complaint)}</span>
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