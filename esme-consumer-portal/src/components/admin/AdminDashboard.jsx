import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, Clock, CheckCircle2, Search, Menu, X, LogOut, Download, 
  FileText, ExternalLink, FolderOpen, Shield, Settings, Key, Eye, EyeOff, 
  Upload, Cloud, CloudOff, Home, ClipboardList, UserCog, FileSpreadsheet,
  ChevronRight, MoreVertical, Trash2, Lock, Unlock, Plus, Pen, RotateCcw, AlertCircle
} from 'lucide-react';
import EsmeLogo from '../../assets/Esme-Logo-01.png';
import CandidateDetailView from './CandidateDetailView';
const API_URL = import.meta.env.VITE_API_URL || '/api';
const SIDEBAR_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'admins', label: 'Manage Admins', icon: Shield, superAdminOnly: true },
];
export default function AdminDashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [driveStatus, setDriveStatus] = useState({ connected: false, checking: true });
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  useEffect(() => {
    fetchCandidates();
    checkDriveStatus();
    if (user.role === 'super_admin') {
      fetchAdmins();
    }
  }, []);
  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const res = await fetch(`${API_URL}/admin/list`);
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };
  const checkDriveStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/google/status`);
      const data = await res.json();
      setDriveStatus({ ...data, checking: false });
    } catch (e) {
      setDriveStatus({ connected: false, checking: false, message: 'Unable to check status' });
    }
  };
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/candidates`);
      const data = await res.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    try {
      setUpdatingPassword(true);
      const res = await fetch(`${API_URL}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Error changing password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (!profileForm.name || !profileForm.email) {
      setProfileError('Name and email are required');
      return;
    }
    try {
      setUpdatingProfile(true);
      const res = await fetch(`${API_URL}/admin/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: user.email,
          name: profileForm.name,
          email: profileForm.email,
          mobile: profileForm.mobile
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileSuccess('Profile updated successfully');
        setTimeout(() => setProfileSuccess(''), 3000);
      } else {
        setProfileError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setProfileError('Error updating profile. Please try again.');
    } finally {
      setUpdatingProfile(false);
    }
  };
  const fetchCandidateDetails = async (candidateId) => {
    try {
      setLoadingDetails(true);
      const res = await fetch(`${API_URL}/candidates/${candidateId}`);
      const data = await res.json();
      setCandidateDetails(data);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };
  const handleViewCandidate = (candidateId) => {
    setSelectedCandidateId(candidateId);
    fetchCandidateDetails(candidateId);
  };
  const handleApproveCandidate = async (candidateId, department, employeeId) => {
    try {
      const res = await fetch(`${API_URL}/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'approved',
          department,
          employeeId,
          approvedBy: user.email,
          approvedAt: new Date()
        })
      });
      if (res.ok) {
        await fetchCandidates();
        await fetchCandidateDetails(candidateId);
        alert('Candidate approved successfully');
      }
    } catch (error) {
      console.error('Error approving candidate:', error);
      alert('Failed to approve candidate');
    }
  };
  const handleRejectCandidate = async (candidateId, reason) => {
    try {
      const res = await fetch(`${API_URL}/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: reason,
          rejectedBy: user.email,
          rejectedAt: new Date()
        })
      });
      if (res.ok) {
        await fetchCandidates();
        await fetchCandidateDetails(candidateId);
        alert('Candidate rejected');
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      alert('Failed to reject candidate');
    }
  };
  const exportCandidatesToExcel = () => {
    const headers = [
      'Name', 'Email', 'Mobile', 'Status', 'Date of Joining', 'Designation', 'Department', 'Division', 
      'Employee Code', 'Work Location', 'Employment Type', 'Reporting Manager', 'Reporting Manager Designation',
      'Father Name', 'Mother Name', 'Date of Birth', 'Age', 'Gender', 'Blood Group', 'Marital Status',
      'Spouse Name', 'Religion', 'Nationality', 'Current Address', 'Current City', 'Current State', 'Current Pincode',
      'Permanent Address', 'Permanent City', 'Permanent State', 'Permanent Pincode', 
      'PAN Number', 'Aadhaar Number', 'Passport Number', 'Passport Validity', 'Driving License',
      'Bank Name', 'Bank Branch', 'Bank Account Number', 'IFSC Code', 'MICR Code', 'Account Holder Name',
      'UAN Number', 'Previous PF Number', 'ESIC Number', 'Emergency Contact Name', 'Emergency Contact Relation',
      'Emergency Contact Mobile', 'Emergency Contact Address', 'Highest Qualification', 'University', 
      'Year of Passing', 'Registered Date', 'Submission Date', 'Approved By', 'Approved At', 'Rejected By', 
      'Rejected At', 'Rejection Reason', 'HR Verified'
    ];
    
    const rows = filteredCandidates.map(c => {
      const pd = c.profileData || {};
      return [
        c.name || pd.fullName || '',
        c.email || pd.personalEmail || '',
        c.mobile || pd.mobileNumber || '',
        c.status || '',
        pd.dateOfJoining || '',
        pd.designation || '',
        pd.department || '',
        pd.division || '',
        pd.employeeCode || '',
        pd.workLocation || '',
        pd.employmentType || '',
        pd.reportingManager || '',
        pd.reportingManagerDesignation || '',
        pd.fatherName || '',
        pd.motherName || '',
        pd.dateOfBirth || '',
        pd.age || '',
        pd.gender || '',
        pd.bloodGroup || '',
        pd.maritalStatus || '',
        pd.spouseName || '',
        pd.religion || '',
        pd.nationality || '',
        pd.currentAddress || '',
        pd.currentCity || '',
        pd.currentState || '',
        pd.currentPincode || '',
        pd.permanentAddress || '',
        pd.permanentCity || '',
        pd.permanentState || '',
        pd.permanentPincode || '',
        pd.panNumber || '',
        pd.aadhaarNumber || '',
        pd.passportNumber || '',
        pd.passportValidity || '',
        pd.drivingLicense || '',
        pd.bankName || '',
        pd.bankBranch || '',
        pd.bankAccountNumber || '',
        pd.ifscCode || '',
        pd.micrCode || '',
        pd.accountHolderName || '',
        pd.uanNumber || '',
        pd.previousPFNumber || '',
        pd.esicNumber || '',
        pd.emergencyContactName || '',
        pd.emergencyContactRelation || '',
        pd.emergencyContactMobile || '',
        pd.emergencyContactAddress || '',
        pd.joiningFormData?.educationList?.[0]?.qualification || pd.highestQualification || '',
        pd.joiningFormData?.educationList?.[0]?.university || pd.university || '',
        pd.joiningFormData?.educationList?.[0]?.yearOfPassing || pd.yearOfPassing || '',
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
        c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '',
        c.approvedBy || '',
        c.approvedAt ? new Date(c.approvedAt).toLocaleDateString() : '',
        c.rejectedBy || '',
        c.rejectedAt ? new Date(c.rejectedAt).toLocaleDateString() : '',
        c.rejectionReason || '',
        c.hrVerified ? 'Yes' : 'No'
      ];
    });
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_comprehensive_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    completed: candidates.filter(c => c.status === 'completed').length,
    verified: candidates.filter(c => c.verificationStatus?.aadhaar === 'verified').length
  };
  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all-smooth hover:scale-105-smooth animate-slideUp">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Candidates</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Verified</p>
              <p className="text-3xl font-bold text-teal-600 mt-2">{stats.verified}</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderCandidates = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Candidates</h2>
        <button
          onClick={exportCandidatesToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all-smooth hover:scale-105-smooth text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search candidates..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all-smooth"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all-smooth"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Candidate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-sm">
                  No candidates found
                </td>
              </tr>
            ) : (
              filteredCandidates.map(candidate => (
                <tr key={candidate._id} className="hover:bg-gray-50 transition-all-smooth cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-teal-600 font-semibold text-xs">
                          {candidate.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{candidate.name}</p>
                        <p className="text-xs text-gray-500 truncate">{candidate.designation || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-800 truncate">{candidate.email}</p>
                    <p className="text-xs text-gray-500">{candidate.mobile || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      candidate.status === 'approved' ? 'bg-green-100 text-green-700' :
                      candidate.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      candidate.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {candidate.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(candidate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewCandidate(candidate._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-all-smooth hover:scale-105-smooth text-xs font-medium"
                    >
                      <FileText className="w-3 h-3" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all-smooth hover:scale-105-smooth animate-slideUp">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all-smooth hover:scale-105-smooth animate-slideUp" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all-smooth hover:scale-105-smooth animate-slideUp" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all-smooth hover:scale-105-smooth animate-slideUp" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Verified</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">{stats.verified}</p>
            </div>
            <div className="p-2 bg-teal-50 rounded-lg">
              <Shield className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>
      </div>
      {renderCandidates()}
    </div>
  );
  const handleCreateAdmin = async () => {
    try {
      if (!adminForm.name || !adminForm.email || !adminForm.password) {
        alert('Please fill all required fields');
        return;
      }
      if (adminForm.role === 'super_admin') {
        const existingSuperAdmin = admins.find(a => a.role === 'super_admin');
        if (existingSuperAdmin) {
          alert('Only one Super Admin is allowed. A Super Admin already exists.');
          return;
        }
      }
      const res = await fetch(`${API_URL}/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });
      if (res.ok) {
        alert('Admin created successfully!');
        setShowCreateAdminModal(false);
        setAdminForm({ name: '', email: '', password: '', role: 'admin' });
        fetchAdmins();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create admin');
      }
    } catch (error) {
      alert('Error creating admin');
    }
  };
  const handleUpdateAdmin = async () => {
    try {
      if (!adminForm.name || !adminForm.email) {
        alert('Please fill all required fields');
        return;
      }
      if (adminForm.role === 'super_admin' && selectedAdmin.role !== 'super_admin') {
        const existingSuperAdmin = admins.find(a => a.role === 'super_admin' && a._id !== selectedAdmin._id);
        if (existingSuperAdmin) {
          alert('Only one Super Admin is allowed. A Super Admin already exists.');
          return;
        }
      }
      if (selectedAdmin.role === 'super_admin' && adminForm.role !== 'super_admin') {
        alert('Cannot demote the Super Admin. There must be exactly one Super Admin.');
        return;
      }
      const res = await fetch(`${API_URL}/admin/update/${selectedAdmin._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          role: adminForm.role
        })
      });
      if (res.ok) {
        alert('Admin updated successfully!');
        setShowEditAdminModal(false);
        setSelectedAdmin(null);
        setAdminForm({ name: '', email: '', password: '', role: 'admin' });
        fetchAdmins();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update admin');
      }
    } catch (error) {
      alert('Error updating admin');
    }
  };
  const handleDeleteAdmin = async () => {
    try {
      if (selectedAdmin.email === user.email) {
        alert('You cannot delete your own account');
        return;
      }
      if (selectedAdmin.role === 'super_admin') {
        alert('Cannot delete the Super Admin account. There must be exactly one Super Admin.');
        return;
      }
      const res = await fetch(`${API_URL}/admin/delete/${selectedAdmin._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Admin deleted successfully!');
        setShowDeleteConfirm(false);
        setSelectedAdmin(null);
        fetchAdmins();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to delete admin');
      }
    } catch (error) {
      alert('Error deleting admin');
    }
  };
  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role
    });
    setShowEditAdminModal(true);
  };
  const openDeleteConfirm = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteConfirm(true);
  };
  const filteredAdmins = admins.filter(a => 
    a.name?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );
  const renderAdminManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
        <button
          onClick={() => setShowCreateAdminModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all-smooth hover:scale-105-smooth text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create New Admin
        </button>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search admins..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all-smooth"
            value={adminSearchTerm}
            onChange={e => setAdminSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingAdmins ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading admins...
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No admins found
                  </td>
                </tr>
              ) : (
                filteredAdmins.map(admin => (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-all-smooth">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {admin.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{admin.name}</p>
                          {admin._id === user._id && (
                            <span className="text-xs text-teal-600 font-medium">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{admin.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admin.role === 'super_admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all-smooth hover:scale-110"
                          title="Edit admin"
                        >
                          <Pen className="w-4 h-4 text-gray-600" />
                        </button>
                        {admin._id !== user._id && (
                          <button
                            onClick={() => openDeleteConfirm(admin)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all-smooth hover:scale-110"
                            title="Delete admin"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <img src={EsmeLogo} alt="ESME" className="h-8" />}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
              </div>
            </div>
          </div>
        )}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {SIDEBAR_MENU.map((item) => {
            if (item.superAdminOnly && user.role !== 'super_admin') return null;
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all-smooth ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:scale-105-smooth'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowProfileSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all-smooth hover:scale-105-smooth"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all-smooth hover:scale-105-smooth"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-6">
          {selectedCandidateId ? (
            loadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <CandidateDetailView 
                candidate={candidateDetails}
                onBack={() => setSelectedCandidateId(null)}
                onApprove={handleApproveCandidate}
                onReject={handleRejectCandidate}
                onRefresh={() => fetchCandidateDetails(selectedCandidateId)}
              />
            )
          ) : (
            <>
              {activeSection === 'dashboard' && renderDashboard()}
              {activeSection === 'admins' && renderAdminManagement()}
            </>
          )}
        </div>
      </main>
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Create New Admin</h3>
              <button
                onClick={() => {
                  setShowCreateAdminModal(false);
                  setAdminForm({ name: '', email: '', password: '', role: 'admin' });
                }}
                className="p-1 hover:bg-gray-100 rounded transition-all-smooth"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateAdminModal(false);
                    setAdminForm({ name: '', email: '', password: '', role: 'admin' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all-smooth hover:scale-105-smooth text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdmin}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all-smooth hover:scale-105-smooth text-sm font-medium"
                >
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Edit Admin</h3>
              <button
                onClick={() => {
                  setShowEditAdminModal(false);
                  setSelectedAdmin(null);
                  setAdminForm({ name: '', email: '', password: '', role: 'admin' });
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditAdminModal(false);
                    setSelectedAdmin(null);
                    setAdminForm({ name: '', email: '', password: '', role: 'admin' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all-smooth hover:scale-105-smooth text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAdmin}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all-smooth hover:scale-105-smooth text-sm font-medium"
                >
                  Update Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Admin</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedAdmin?.name}</span>? 
              This will permanently remove their access to the admin panel.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAdmin(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all-smooth hover:scale-105-smooth text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all-smooth hover:scale-105-smooth text-sm font-medium"
              >
                Delete Admin
              </button>
            </div>
          </div>
        </div>
      )}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 animate-scaleIn">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Settings</h3>
                  <p className="text-xs text-gray-500">Manage your account preferences</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfileSettings(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setProfileError('');
                  setProfileSuccess('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all-smooth"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <UserCog className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-teal-600 text-white text-xs font-medium rounded">
                      {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <UserCog className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800">Profile Information</h4>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {profileError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{profileError}</p>
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-600">{profileSuccess}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Mobile Number</label>
                    <input
                      type="tel"
                      value={profileForm.mobile}
                      onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      placeholder="Enter your mobile number"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all-smooth hover:scale-105-smooth text-sm font-medium"
                  >
                    {updatingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Key className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800">Change Password</h4>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{passwordError}</p>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-600">{passwordSuccess}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-all-smooth"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-all-smooth"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-all-smooth"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Password Requirements:</strong> Minimum 6 characters
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all-smooth hover:scale-105-smooth text-sm font-medium"
                  >
                    {updatingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
