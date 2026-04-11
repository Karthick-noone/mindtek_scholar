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

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [workProgress, setWorkProgress] = useState(0);

  const [pendingPayment, setPendingPayment] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [resolvedComplaints, setResolvedComplaints] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);

      // animate after loading
      animateCount(setPendingPayment, 12500);
      animateCount(setTotalPaid, 87500);
      animateCount(setResolvedComplaints, 42);
      animateCount(setPendingComplaints, 8);

      // animate progress
      let progress = 0;
      const end = 65;

      const timer = setInterval(() => {
        progress += 1;

        if (progress >= end) {
          setWorkProgress(end);
          clearInterval(timer);
        } else {
          setWorkProgress(progress);
        }
      }, 20); // speed (lower = faster)

    },);
  }, []);

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
    { icon: IndianRupee, label: 'Pending Payment', value: `₹${pendingPayment.toLocaleString()}`, change: '+₹2,500', color: '#f59e0b' },
    { icon: CheckCircle, label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, change: '+₹15,000', color: '#10b981' },
    { icon: ThumbsUp, label: 'Resolved Complaints', value: resolvedComplaints, change: '+5', color: '#34d399' },
    { icon: AlertCircle, label: 'Pending Complaints', value: pendingComplaints, change: '-2', color: '#ef4444' },
  ];

  const recentActivities = [
    { id: 1, activity: 'Payment Received - Project Phase 1', date: '2 hours ago', status: 'completed', amount: '₹25,000' },
    { id: 2, activity: 'Complaint Resolved - Late Submission', date: 'Yesterday', status: 'completed' },
    { id: 3, activity: 'New Complaint Filed - Quality Issue', date: '2 days ago', status: 'pending' },
    { id: 4, activity: 'Payment Pending - Final Milestone', date: '3 days ago', status: 'pending', amount: '₹12,500' },
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, Scholar!</h1>
        <p>MindTek Research and IT Solutions Pvt. Ltd.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
              <span className="stat-change">{stat.change} this month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Width Work Progress Card */}
      <div className="full-width-card work-progress-full">
        <div className="work-progress-header">
          <h3 className='work-progress-title'><span>Work Completion Progress</span> <TrendingUp size={28} className="progress-trend-icon" /></h3>
          <div className="progress-status-badge">
            <span className="badge">{workProgress}% Complete</span>
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
            <span>Notes:</span>
            {/* <span>Completed: {workProgress}%</span> */}
            {/* <span>Remaining: {100 - workProgress}%</span> */}
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
                  {activity.amount && <span className="activity-amount">{activity.amount}</span>}
                  <span className="activity-date">{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card payment-summary">
          <h3>Payment Summary</h3>
          <div className="payment-details">
            <div className="payment-item">
              <span>Total Projects Value</span>
              <strong>₹{(totalPaid + pendingPayment).toLocaleString()}</strong>
            </div>
            <div className="payment-item">
              <span>Total Paid</span>
              <strong className="paid-amount">₹{totalPaid.toLocaleString()}</strong>
            </div>
            <div className="payment-item">
              <span>Pending Payment</span>
              <strong className="pending-amount">₹{pendingPayment.toLocaleString()}</strong>
            </div>
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