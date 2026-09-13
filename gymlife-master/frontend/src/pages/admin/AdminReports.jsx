import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const AdminReports = () => {
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetReports();
      if (res && res.status === 'success') {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      showError('Failed to generate reports.');
    } finally {
      setLoading(false);
    }
  };

  const exportSummaryCSV = () => {
    if (!data) return;
    const lines = [
      ['GymLife Production Operational Financial Report (INR - ₹)', new Date().toLocaleDateString('en-IN')],
      [],
      ['EXECUTIVE FINANCIAL METRICS'],
      ['Total Collected Revenue (₹)', `₹${Number(data.total_revenue_overall || 0).toLocaleString('en-IN')}`],
      ['Total Members Registered', data.total_members_overall || 0],
      [],
      ['MEMBERSHIP PLAN DISTRIBUTION'],
      ['Plan Name', 'Subscribers Count', 'Estimated Revenue Potential (₹)'],
      ...(data.plan_distribution || []).map(p => [`"${p.name}"`, p.count, `₹${Number(p.revenue_potential || 0).toLocaleString('en-IN')}`]),
      [],
      ['MONTHLY FINANCIAL & REGISTRATION PERFORMANCE'],
      ['Month', 'New Members', 'Collected Revenue (₹)'],
      ...(data.monthly_trends || []).map(m => [m.month, m.new_members, `₹${Number(m.revenue || 0).toLocaleString('en-IN')}`]),
      [],
      ['REVENUE BY PAYMENT METHOD'],
      ['Payment Method', 'Total Collected (₹)'],
      ...(data.revenue_by_method || []).map(r => [`"${r.method}"`, `₹${Number(r.total || 0).toLocaleString('en-IN')}`]),
      [],
      ['CLASS & SESSION POPULARITY'],
      ['Class Name', 'Category', 'Coach', 'Weekly Sessions', 'Capacity'],
      ...(data.class_stats || []).map(c => [`"${c.name}"`, c.category, `"${c.trainer}"`, c.weekly_sessions, c.capacity])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map(row => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GymLife_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Analytics CSV report (INR ₹) downloaded successfully!');
  };

  const planDist = data?.plan_distribution || [];
  const monthlyTrends = data?.monthly_trends || [];
  const classStats = data?.class_stats || [];
  const statusBreakdown = data?.status_breakdown || {};
  const revenueByMethod = data?.revenue_by_method || [];
  const totalRevenue = data?.total_revenue_overall || 0;
  const totalMembers = data?.total_members_overall || 0;
  const totalPotential = planDist.reduce((acc, p) => acc + (p.revenue_potential || 0), 0);

  return (
    <div className="admin-module-page">
      <div className="module-top-header">
        <div>
          <h2 className="module-title">EXECUTIVE REPORTS & GYM ANALYTICS</h2>
          <p className="module-subtitle">Aggregated metrics on membership growth, Indian Rupee (₹) revenue velocity, and discipline popularity.</p>
        </div>
        <button type="button" onClick={exportSummaryCSV} className="admin-btn primary">
          <i className="fa fa-file-excel-o"></i> Export Comprehensive CSV
        </button>
      </div>

      {loading ? (
        <div className="admin-empty-state" style={{ padding: '60px' }}>
          <div className="skeleton-bar" style={{ width: '40%', height: '30px', margin: '0 auto 12px' }}></div>
          <p>Compiling real-time database metrics in Indian Rupees (₹)...</p>
        </div>
      ) : (
        <div className="reports-layout-grid">
          {/* Executive Revenue Overview Banner */}
          <div className="reports-section-card full-width">
            <h3 className="section-card-title">
              <i className="fa fa-inr" style={{ color: '#22c55e', marginRight: '8px' }}></i>
              EXECUTIVE REVENUE & FINANCIAL PERFORMANCE (INR)
            </h3>
            <div className="revenue-kpi-row">
              <div className="revenue-kpi-item green">
                <div className="kpi-icon-badge">
                  <i className="fa fa-inr"></i>
                </div>
                <div className="kpi-details">
                  <span className="revenue-kpi-label">TOTAL COLLECTED REVENUE</span>
                  <span className="revenue-kpi-num">
                    ₹{Number(totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="revenue-kpi-subtext">Verified Real-Time Collections</span>
                </div>
              </div>

              <div className="revenue-kpi-item orange">
                <div className="kpi-icon-badge">
                  <i className="fa fa-line-chart"></i>
                </div>
                <div className="kpi-details">
                  <span className="revenue-kpi-label">EST. REVENUE POTENTIAL</span>
                  <span className="revenue-kpi-num">
                    ₹{Number(totalPotential).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="revenue-kpi-subtext">From Active Tier Allocations</span>
                </div>
              </div>

              <div className="revenue-kpi-item blue">
                <div className="kpi-icon-badge">
                  <i className="fa fa-users"></i>
                </div>
                <div className="kpi-details">
                  <span className="revenue-kpi-label">ACTIVE CLUB SUBSCRIBERS</span>
                  <span className="revenue-kpi-num">{statusBreakdown.ACTIVE || 0}</span>
                  <span className="revenue-kpi-subtext">{totalMembers} Total Members Registered</span>
                </div>
              </div>

              <div className="revenue-kpi-item purple">
                <div className="kpi-icon-badge">
                  <i className="fa fa-calculator"></i>
                </div>
                <div className="kpi-details">
                  <span className="revenue-kpi-label">AVG. REVENUE / ACTIVE MEMBER</span>
                  <span className="revenue-kpi-num">
                    ₹{Math.round(totalRevenue / (statusBreakdown.ACTIVE || 1)).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="revenue-kpi-subtext">Lifetime Value Index</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Status Breakdown Cards */}
          <div className="reports-section-card full-width">
            <h3 className="section-card-title">MEMBER ENGAGEMENT & STATUS OVERVIEW</h3>
            <div className="status-kpi-row">
              <div className="status-kpi-item green">
                <span className="status-kpi-num">{statusBreakdown.ACTIVE || 0}</span>
                <span className="status-kpi-label">Active Members</span>
              </div>
              <div className="status-kpi-item yellow">
                <span className="status-kpi-num">{statusBreakdown.INACTIVE || 0}</span>
                <span className="status-kpi-label">Inactive Accounts</span>
              </div>
              <div className="status-kpi-item red">
                <span className="status-kpi-num">{statusBreakdown.EXPIRED || 0}</span>
                <span className="status-kpi-label">Expired Passes</span>
              </div>
              <div className="status-kpi-item gray">
                <span className="status-kpi-num">{statusBreakdown.SUSPENDED || 0}</span>
                <span className="status-kpi-label">Suspended</span>
              </div>
            </div>
          </div>

          {/* Monthly Growth & Revenue Trends */}
          <div className="reports-section-card">
            <h3 className="section-card-title">MONTHLY REVENUE & REGISTRATION TRENDS</h3>
            <div className="admin-table-responsive">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>New Registrations</th>
                    <th>Collected Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrends.map((trend, idx) => (
                    <tr key={idx}>
                      <td><strong>{trend.month}</strong></td>
                      <td>
                        <span className="stat-pill blue">+{trend.new_members} Members</span>
                      </td>
                      <td>
                        <span className="stat-pill green">₹{Number(trend.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="reports-section-card">
            <h3 className="section-card-title">MEMBERSHIP PLAN ALLOCATION</h3>
            <div className="admin-table-responsive">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Subscribers</th>
                    <th>Revenue Potential (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {planDist.map((plan, idx) => (
                    <tr key={idx}>
                      <td><strong>{plan.name}</strong></td>
                      <td>{plan.count} Members</td>
                      <td style={{ color: '#22c55e', fontWeight: 'bold' }}>
                        ₹{Number(plan.revenue_potential || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue by Payment Method */}
          {revenueByMethod.length > 0 && (
            <div className="reports-section-card full-width">
              <h3 className="section-card-title">
                <i className="fa fa-credit-card" style={{ color: '#f36100', marginRight: '8px' }}></i>
                REVENUE BY PAYMENT METHOD (INR ₹)
              </h3>
              <div className="payment-methods-grid">
                {revenueByMethod.map((item, idx) => (
                  <div key={idx} className="payment-method-card">
                    <div className="method-icon-wrap">
                      <i className={
                        item.method.includes('UPI') ? 'fa fa-mobile' :
                        item.method.includes('Credit') || item.method.includes('Debit') ? 'fa fa-credit-card' :
                        item.method.includes('Cash') ? 'fa fa-money' : 'fa fa-bank'
                      }></i>
                    </div>
                    <div className="method-info">
                      <span className="method-name">{item.method}</span>
                      <span className="method-amount">₹{Number(item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class Popularity & Timetable Load */}
          <div className="reports-section-card full-width">
            <h3 className="section-card-title">DISCIPLINE CAPACITY & WEEKLY TIMETABLE LOAD</h3>
            <div className="admin-table-responsive">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Class Discipline</th>
                    <th>Category</th>
                    <th>Lead Coach</th>
                    <th>Weekly Timetable Sessions</th>
                    <th>Capacity / Session</th>
                  </tr>
                </thead>
                <tbody>
                  {classStats.map((c, idx) => (
                    <tr key={idx}>
                      <td><strong>{c.name}</strong></td>
                      <td><span className="difficulty-tag">{c.category}</span></td>
                      <td>{c.trainer}</td>
                      <td><span className="stat-pill orange">{c.weekly_sessions} sessions / wk</span></td>
                      <td>{c.capacity} max spots</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
