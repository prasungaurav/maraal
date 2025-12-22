import React, { useState } from 'react';
import '../Style/Term.css'; 
import { 
    Shield, 
    FileText, 
    Clock, 
    Briefcase, 
    Lock, 
    ChevronRight,
    CheckCircle
} from 'lucide-react';

function EmployeeTerms() {
    // State to track which policy is currently visible
    const [activeTab, setActiveTab] = useState('general');

    // Data for Policies (Easy to manage)
    const policies = [
        {
            id: 'general',
            title: 'General Terms',
            icon: <FileText size={20} />,
            content: (
                <>
                    <h3>General Terms of Employment</h3>
                    <p>By accessing the <strong>Maraal Employee Dashboard</strong>, you agree to comply with the company's internal policies. These terms govern your employment, attendance tracking, and use of company resources.</p>
                    <div className="highlight-box">
                        <strong>Note:</strong> Misuse of the portal or sharing credentials with non-employees is strictly prohibited and may result in immediate termination.
                    </div>
                    <ul className="policy-list">
                        <li>Employees must log in daily to mark attendance via the dashboard.</li>
                        <li>All data displayed here is the confidential property of Maraal Aerospace.</li>
                        <li>Company assets (laptops, IDs) must be surrendered upon resignation.</li>
                    </ul>
                </>
            )
        },
        {
            id: 'attendance',
            title: 'Attendance Policy',
            icon: <Clock size={20} />,
            content: (
                <>
                    <h3>Attendance Rules</h3>
                    <p>Standard working hours are from <strong>10:00 AM to 6:00 PM</strong> (Monday to Saturday). Punctuality is essential for team coordination.</p>
                    
                    <div className="policy-grid">
                        <div className="policy-item">
                            <h4>Grace Period</h4>
                            <p>15 mins (up to 10:15 AM). Late marks apply afterwards.</p>
                        </div>
                        <div className="policy-item">
                            <h4>Half Day</h4>
                            <p>Working less than 4 hours is considered a Half Day.</p>
                        </div>
                    </div>

                    <ul className="policy-list">
                        <li><strong>Late Mark Rule:</strong> Every 3 late marks result in a deduction of <strong>0.5 Casual Leave</strong>.</li>
                        <li><strong>Missed Punch:</strong> Must be regularized within 24 hours via the "Requests" tab.</li>
                        <li><strong>Overtime:</strong> Must be pre-approved by the reporting manager.</li>
                    </ul>
                </>
            )
        },
        {
            id: 'leave',
            title: 'Leave Rules',
            icon: <Briefcase size={20} />,
            content: (
                <>
                    <h3>Leave Regulations</h3>
                    <p>Employees are entitled to Paid (PL), Sick (SL), and Casual (CL) leaves as per their employment contract.</p>
                    <ul className="policy-list">
                        <li><strong>Sick Leave (SL):</strong> Requires a medical certificate if exceeding 2 consecutive days.</li>
                        <li><strong>Casual Leave (CL):</strong> Must be applied for at least 2 days in advance for approval.</li>
                        <li><strong>Privilege Leave (PL):</strong> Added to your balance every quarter. Can be encashed at year-end.</li>
                        <li><strong>Unpaid Leave (LWP):</strong> Applicable if leave balance is exhausted.</li>
                    </ul>
                </>
            )
        },
        {
            id: 'security',
            title: 'Data Security',
            icon: <Shield size={20} />,
            content: (
                <>
                    <h3>Data Security & Privacy</h3>
                    <p>As an employee of Maraal Aerospace, you handle sensitive data. Security is everyone's responsibility.</p>
                    <div className="highlight-box warning">
                        <strong>Warning:</strong> Downloading sensitive project data to personal devices without authorization is a violation of policy.
                    </div>
                    <ul className="policy-list">
                        <li>Lock your screen whenever you leave your desk.</li>
                        <li>Do not use public Wi-Fi for accessing critical company servers.</li>
                        <li>Report any suspicious email or phishing attempt to IT immediately.</li>
                    </ul>
                </>
            )
        },
        {
            id: 'conduct',
            title: 'Code of Conduct',
            icon: <Lock size={20} />,
            content: (
                <>
                    <h3>Code of Conduct</h3>
                    <p>We maintain a zero-tolerance policy towards harassment, discrimination, and unprofessional behavior within the workplace.</p>
                    <ul className="policy-list">
                        <li>Treat all colleagues with respect and dignity.</li>
                        <li>Office dress code must be strictly followed during client meetings.</li>
                        <li>Social media posts regarding internal company matters are prohibited.</li>
                    </ul>
                </>
            )
        }
    ];

    // Get the active content based on state
    const activeContent = policies.find(p => p.id === activeTab);

    return (
        <div className="terms-page-wrapper">
            <div className="terms-header">
                <h1 className="page-title">Company Policy</h1>
                <p className="page-subtitle">Rules & Guidelines for Employees.</p>
            </div>

            <div className="terms-container">
                
                {/* --- LEFT SIDEBAR (Navigation) --- */}
                <div className="terms-sidebar">
                    {policies.map((policy) => (
                        <div 
                            key={policy.id}
                            className={`terms-nav-item ${activeTab === policy.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(policy.id)}
                        >
                            <div className="nav-icon-wrapper">
                                {policy.icon}
                            </div>
                            <span>{policy.title}</span>
                            {activeTab === policy.id && <ChevronRight size={16} className="active-arrow"/>}
                        </div>
                    ))}
                </div>

                {/* --- RIGHT CONTENT (Dynamic) --- */}
                <div className="terms-content-card animate-fade-in">
                    {activeContent.content}
                    
                    <div className="agreement-footer">
                        <CheckCircle size={16} color="#10B981" />
                        <span>I have read and understood this policy.</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default EmployeeTerms;