import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, Clock, CheckCircle2, 
  Search, Filter, MoreVertical, LogOut, Download, FileText, ExternalLink, FolderOpen, ClipboardList, CloudOff, Cloud, Lock, Unlock, Trash2, FileSpreadsheet, Settings, Shield, Key, Plus, X, Eye, EyeOff, Pen, RotateCcw, Upload
} from 'lucide-react';
import { Button, Input } from '../shared/UI';
import { useTheme } from '../../contexts/ThemeContext';
import { downloadChecklistPDF, viewChecklistPDF } from '../../utils/generateChecklist';
import { viewFormPDF, downloadFormPDF } from '../../utils/pdfGenerator';
import * as XLSX from 'xlsx';
import EsmeLogo from '../../assets/Esme-Logo-01.png';
import ThemeToggle from '../shared/ThemeToggle';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AdminDashboard({ user, onLogout }) {
  const { isDark } = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [driveStatus, setDriveStatus] = useState({ connected: false, checking: true });
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);


  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', mobile: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Admin Signature State
  const [adminSignature, setAdminSignature] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const signatureCanvasRef = useRef(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const fileInputRef = useRef(null);

  // Generated Forms Modal State
  const [showFormsModal, setShowFormsModal] = useState(false);
  const [selectedCandidateForForms, setSelectedCandidateForForms] = useState(null);

  useEffect(() => {
    fetchCandidates();
    checkDriveStatus();
    loadAdminSignature();
  }, []);

  // Load admin signature from localStorage or backend
  const loadAdminSignature = () => {
    const savedSignature = localStorage.getItem(`adminSignature_${user.id}`);
    if (savedSignature) {
      setAdminSignature(savedSignature);
    }
  };

  // Save admin signature
  const saveAdminSignature = (signature) => {
    setAdminSignature(signature);
    localStorage.setItem(`adminSignature_${user.id}`, signature);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowFilterMenu(false);
    if (showFilterMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFilterMenu]);

  const checkDriveStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/google/status`);
      const data = await res.json();
      setDriveStatus({ ...data, checking: false });
    } catch (e) {
      setDriveStatus({ connected: false, checking: false, message: 'Unable to check status' });
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/google`);
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (e) {
      console.error('Failed to get auth URL:', e);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_URL}/candidates`);
      const data = await res.json();
      setCandidates(data);
    } catch (e) {
      console.error(e);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin list
  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch(`${API_URL}/admin/admins?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdminList(data);
      }
    } catch (e) {
      console.error('Failed to fetch admins:', e);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Create new admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.mobile || !newAdmin.password) {
      setAdminError('All fields are required');
      return;
    }
    
    if (newAdmin.password.length < 8) {
      setAdminError('Password must be at least 8 characters');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/admin/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAdmin, creatorId: user.id })
      });
      const data = await res.json();
      
      if (data.success) {
        setAdminSuccess('Admin created successfully!');
        setNewAdmin({ name: '', email: '', mobile: '', password: '' });
        setShowCreateAdmin(false);
        fetchAdmins();
      } else {
        setAdminError(data.message || 'Failed to create admin');
      }
    } catch (e) {
      setAdminError('Failed to create admin. Please try again.');
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      const res = await fetch(`${API_URL}/admin/admins/${adminId}?userId=${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        setAdminSuccess('Admin deleted successfully');
        fetchAdmins();
      } else {
        setAdminError(data.message || 'Failed to delete admin');
      }
    } catch (e) {
      setAdminError('Failed to delete admin');
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
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setShowProfileSettings(false), 2000);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (e) {
      setPasswordError('Failed to change password. Please try again.');
    }
  };


  const openAdminPanel = () => {
    setShowAdminPanel(true);
    fetchAdmins();
  };

  const DEPARTMENTS = [
    { team: 'Ordering Team', tags: ['Sales Orders', 'SS Stock'] },
    { team: 'SAP Team', tags: ['Invoicing'] },
    { team: 'Sales IT Team', tags: ['Secondary Sales'] },
    { team: 'Sales Commercial Team', tags: ['Sales Commercial Data'] },
    { team: 'Supply Chain Team', tags: ['Inventory & Stock'] },
    { team: 'Financial Team', tags: ['Financials & Margins'] },
    { team: 'Auditing Team', tags: ['Audit & Compliance'] },
    { team: 'MIS Team', tags: ['MIS Reporting'] },
    { team: 'Marketing Data Analyst', tags: ['Consumer, Pricing & Competition Data'] },
    { team: 'Product Quality Analyst', tags: ['Product Quality'] },
    { team: 'Infra IT Team', tags: ['Infrastructure & Security'] },
    { team: 'Procurement Team', tags: ['Purchase Orders'] },
  ];

  const [approveModal, setApproveModal] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [useCustomDept, setUseCustomDept] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [hrRemarks, setHrRemarks] = useState('');

  const updateStatus = async (id, status, department = null, empId = '', remarks = '') => {
    try {
      await fetch(`${API_URL}/candidates/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, department, employeeId: empId, hrRemarks: remarks })
      });
      fetchCandidates();
      setSelectedCandidate(null);
      setApproveModal(null);
      setSelectedDepartment('');
      setCustomDepartment('');
      setUseCustomDept(false);
      setEmployeeId('');
      setHrRemarks('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = (candidate) => {
    setApproveModal(candidate);
    setSelectedDepartment(candidate.profileData?.department || '');
    setCustomDepartment('');
    setUseCustomDept(false);
    setEmployeeId(candidate.employeeId || '');
    setHrRemarks(candidate.hrRemarks || '');
  };

  const confirmApprove = () => {
    const finalDepartment = useCustomDept ? customDepartment.trim() : selectedDepartment;
    if (!finalDepartment) return;
    updateStatus(approveModal._id, 'approved', finalDepartment, employeeId.trim(), hrRemarks.trim());
  };

  const getDepartmentValue = () => {
    return useCustomDept ? customDepartment.trim() : selectedDepartment;
  };

  // Signature Canvas Functions
  const initSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 150;
    
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, 400, 150);
    ctx.strokeStyle = isDark ? '#ffffff' : '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const getSignatureCoords = (e) => {
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawingSignature = (e) => {
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getSignatureCoords(e);
    
    setIsDrawingSignature(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const drawSignature = (e) => {
    if (!isDrawingSignature) return;
    e.preventDefault();
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getSignatureCoords(e);
    
    ctx.strokeStyle = isDark ? '#ffffff' : '#1e293b';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawingSignature = (e) => {
    if (!isDrawingSignature) return;
    e.preventDefault();
    setIsDrawingSignature(false);
  };

  const clearSignatureCanvas = () => {
    initSignatureCanvas();
  };

  const saveSignatureFromCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      saveAdminSignature(dataUrl);
      setShowSignatureModal(false);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      saveAdminSignature(event.target.result);
      setShowSignatureModal(false);
    };
    reader.readAsDataURL(file);
  };

  // Open forms modal for a candidate
  const openFormsModal = (candidate) => {
    console.log('Opening forms modal for candidate:', candidate);
    console.log('Candidate profileData:', candidate.profileData);
    console.log('Signature locations check:', {
      signature: !!candidate.profileData?.signature,
      form11Signature: !!candidate.profileData?.form11Signature,
      formFSignature: !!candidate.profileData?.formFSignature,
      form11DataSignature: !!candidate.profileData?.form11Data?.employeeSignature,
      formFDataSignature: !!candidate.profileData?.formFData?.employeeSignature,
      joiningFormDataSignature: !!candidate.profileData?.joiningFormData?.employeeSignature
    });
    setSelectedCandidateForForms(candidate);
    setShowFormsModal(true);
  };

  const toggleLock = async (id, currentLockState) => {
    try {
      const res = await fetch(`${API_URL}/candidates/${id}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !currentLockState })
      });
      const updated = await res.json();
      setCandidates(prev => prev.map(c => c._id === id ? { ...c, isLocked: updated.isLocked } : c));
      if (selectedCandidate?._id === id) {
        setSelectedCandidate({ ...selectedCandidate, isLocked: updated.isLocked });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const deleteCandidate = async (id) => {
    try {
      const res = await fetch(`${API_URL}/candidates/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c._id !== id));
        setSelectedCandidate(null);
        setDeleteConfirm(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportToExcel = () => {
    const data = candidates.map(c => ({

      'Employee ID': c.employeeId || '',
      'HR Verified': c.hrVerified ? 'Yes' : 'No',
      'HR Remarks': c.hrRemarks || '',
      'Submitted Date': c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('en-IN') : '',
      'Approved Date': c.approvedAt ? new Date(c.approvedAt).toLocaleDateString('en-IN') : '',
      'Status': c.status?.toUpperCase(),
      
 
      'Full Name': c.profileData?.fullName || c.name,
      'Father\'s Name': c.profileData?.fatherName || '',
      'Gender': c.profileData?.gender || '',
      'Date of Birth': c.profileData?.dateOfBirth || '',
      'Age': c.profileData?.age || '',
      'Blood Group': c.profileData?.bloodGroup || '',
      'Marital Status': c.profileData?.maritalStatus || '',
      
      
      'Mobile': c.mobile || c.profileData?.mobileNumber || '',
      'Alternate Mobile': c.profileData?.alternateMobileNumber || '',
      'Email': c.email || c.profileData?.email || '',
      'Current City': c.profileData?.currentCity || '',
      'Current Address': c.profileData?.currentAddress || '',
      'Permanent Address': c.profileData?.permanentAddress || '',
      'Pincode': c.profileData?.pincode || '',

      'Profession/Title': c.profileData?.profession || '',
      'Entity': c.profileData?.entity || '',
      'Department': c.profileData?.department || 'Unassigned',
      'Date of Joining': c.profileData?.dateOfJoining || '',
      
  
      'Aadhaar Number': c.profileData?.aadhaarNumber || '',
      'PAN Number': c.profileData?.panNumber || '',
      'Bank Name': c.profileData?.bankName || '',
      'Account Number': c.profileData?.accountNumber || '',
      'IFSC Code': c.profileData?.ifscCode || '',
      'Account Holder Name': c.profileData?.accountHolderName || '',
      'UAN Number': c.profileData?.uanNumber || '',
      'Passport Number': c.profileData?.passportNumber || '',
      
      
      'Emergency Contact Name': c.profileData?.emergencyContactName || '',
      'Emergency Contact Relationship': c.profileData?.emergencyContactRelation || '',
      'Emergency Contact Number': c.profileData?.emergencyContactNumber || '',
     
      'Spouse Name': c.profileData?.spouseName || '',
      'Nominee Name': c.profileData?.nomineeName || '',
      'Nominee Relationship': c.profileData?.nomineeRelationship || '',
      'Nominee DOB': c.profileData?.nomineeDOB || '',
      
 
      'Documents Uploaded': c.documents?.length || 0,
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
    
   
    const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, `Candidates_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status', color: 'slate' },
    { value: 'pending', label: 'Pending', color: 'amber' },
    { value: 'submitted', label: 'Submitted', color: 'blue' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
  ];

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className={`backdrop-blur-md border-b sticky top-0 z-20 px-8 py-4 animate-fade-in-down transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-800/80 border-slate-700 text-white' 
          : 'bg-white/80 border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={EsmeLogo} alt="ESME Logo" className="h-12 w-auto object-contain" />
            <div>
               <h1 className={`text-lg font-bold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Control Center</h1>
               <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Resource Management & Onboarding</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Super Admin: Manage Admins button */}
            {(user.role === 'super_admin' || user.role === 'admin') && (
              <button 
                onClick={openAdminPanel}
                className={`p-2 transition-all duration-200 rounded-lg hover:scale-110 active:scale-95 ${
                  isDark 
                    ? 'text-slate-400 hover:text-purple-400 bg-slate-700 dark:hover:bg-purple-900/30' 
                    : 'text-slate-400 hover:text-purple-500 bg-slate-50 hover:bg-purple-50'
                }`}
                title="Manage Admins"
              >
                <Shield size={20}/>
              </button>
            )}
            <button 
              onClick={() => setShowProfileSettings(true)}
              className={`p-2 transition-all duration-200 rounded-lg hover:scale-110 active:scale-95 ${
                isDark 
                  ? 'text-slate-400 hover:text-blue-400 bg-slate-700 hover:bg-blue-900/30' 
                  : 'text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50'
              }`}
              title="Profile Settings"
            >
              <Settings size={20}/>
            </button>
            <ThemeToggle />
            <div className="hidden md:block text-right">
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
            </div>
            <button onClick={onLogout} className={`p-2 transition-all duration-200 rounded-lg hover:scale-110 active:scale-95 ${
                isDark 
                  ? 'text-slate-400 hover:text-red-400 bg-slate-700 hover:bg-red-900/30' 
                  : 'text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50'
              }`}><LogOut size={20}/></button>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto p-8 animate-fade-in-up`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <StatCard label="Total Candidates" value={candidates.length} icon={Users} color="blue" delay={0} />
           <StatCard label="Pending Forms" value={candidates.filter(c => c.status === 'pending').length} icon={Clock} color="amber" delay={50} />
           <StatCard label="Completed" value={candidates.filter(c => c.status === 'completed').length} icon={CheckCircle2} color="emerald" delay={100} />
        </div>

        {!driveStatus.checking && (
          <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  driveStatus.connected 
                    ? isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'
                    : isDark ? 'bg-amber-900/50' : 'bg-amber-100'
                }`}>
                  {driveStatus.connected ? (
                    <Cloud className={isDark ? 'text-emerald-400' : 'text-emerald-600'} size={20} />
                  ) : (
                    <CloudOff className={isDark ? 'text-amber-400' : 'text-amber-600'} size={20} />
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {driveStatus.connected ? 'Google Drive Connected' : 'Google Drive Not Connected'}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {driveStatus.connected 
                      ? `Connected as ${driveStatus.user || driveStatus.displayName}` 
                      : 'Connect to enable file uploads to Google Drive'}
                  </p>
                </div>
              </div>
              {!driveStatus.connected && (
                <button
                  onClick={connectGoogleDrive}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center gap-2 active:scale-95"
                >
                  <Cloud size={18} />
                  Connect Google Drive
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
           <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Candidate Directory</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Track and manage new hire documentation</p>
              </div>
              <div className="flex gap-3">
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-teal-500 transition-colors duration-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search candidate..." 
                      className="pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:shadow-lg focus:shadow-teal-500/5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-500 w-64 bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900" 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="relative">
                   <Button 
                     variant="secondary" 
                     onClick={(e) => { e.stopPropagation(); setShowFilterMenu(!showFilterMenu); }}
                     className={`!py-2.5 !px-4 !rounded-xl hover:!-translate-y-1 active:!scale-95 transition-all duration-500 ${statusFilter !== 'all' ? '!border-teal-300 !bg-teal-50 !text-teal-600 dark:!bg-teal-900/30 dark:!text-teal-400 dark:!border-teal-700' : ''}`}
                   >
                     <Filter size={16}/> {statusFilter === 'all' ? 'Filter' : STATUS_OPTIONS.find(s => s.value === statusFilter)?.label}
                   </Button>
                   {showFilterMenu && (
                     <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
                       {STATUS_OPTIONS.map((option, idx) => (
                         <button
                           key={option.value}
                           onClick={() => { setStatusFilter(option.value); setShowFilterMenu(false); }}
                           className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-500 flex items-center gap-2 opacity-0 animate-fade-in-up ${statusFilter === option.value ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}
                           style={{ animationDelay: `${100 + idx * 40}ms`, animationFillMode: 'forwards' }}
                         >
                           <span className={`w-2 h-2 rounded-full ${option.color === 'slate' ? 'bg-slate-400' : option.color === 'amber' ? 'bg-amber-500' : option.color === 'blue' ? 'bg-blue-500' : option.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                           {option.label}
                           {statusFilter === option.value && <CheckCircle2 size={14} className="ml-auto text-teal-600" />}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
                 <Button 
                   onClick={exportToExcel}
                   className="!py-2.5 !px-4 !bg-emerald-600 hover:!bg-emerald-700 !rounded-xl hover:!-translate-y-1 active:!scale-95 transition-all duration-500"
                 >
                   <FileSpreadsheet size={16}/> Export Excel
                 </Button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-700 text-left">
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Candidate</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Department</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Progress</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Join Date</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                   {filtered.map((c, idx) => (
                     <tr 
                       key={idx} 
                       className="hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-emerald-50/50 dark:hover:from-teal-900/10 dark:hover:to-emerald-900/10 hover:-translate-y-px transition-all duration-500 cursor-pointer group opacity-0 animate-fade-in-up border-b border-slate-100 dark:border-slate-800" 
                       style={{ animationDelay: `${200 + idx * 60}ms`, animationFillMode: 'forwards' }}
                       onClick={() => setSelectedCandidate(c)}
                     >
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gradient-to-br from-teal-100 to-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-teal-500/20 transition-all duration-500">{c.name.charAt(0)}</div>
                              <div className="flex-1 transition-all duration-500">
                                 <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-500">{c.name}</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-500">{c.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="font-medium text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-500">{c.profileData?.department || <span className="text-slate-400 italic">Unassigned</span>}</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="w-24 bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden shadow-inner group-hover:shadow-md transition-shadow duration-300">
                               <div className="bg-gradient-to-r from-teal-500 to-teal-400 h-full transition-all duration-700 ease-out rounded-full relative group-hover:shadow-lg group-hover:shadow-teal-500/30" style={{ width: c.status === 'completed' || c.status === 'approved' ? '100%' : c.status === 'submitted' ? '75%' : '35%' }}>
                                 <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                               </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 group-hover:scale-105 group-hover:shadow-md ${c.status === 'completed' || c.status === 'submitted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm shadow-emerald-500/10 group-hover:shadow-emerald-500/20' : c.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100 shadow-sm shadow-green-500/10 group-hover:shadow-green-500/20' : c.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100 shadow-sm shadow-red-500/10 group-hover:shadow-red-500/20' : 'bg-amber-50 text-amber-700 border border-amber-100 shadow-sm shadow-amber-500/10 group-hover:shadow-amber-500/20'}`}>
                              {c.isLocked && <Lock size={11} className="group-hover:animate-pulse" />}
                              {c.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-all duration-500 hover:scale-110 active:scale-95"><MoreVertical size={18}/></button>
                        </td>
                     </tr>
                   ))}
                   {filtered.length === 0 && (
                     <tr>
                        <td colSpan="6" className="py-20 text-center">
                           <div className="flex flex-col items-center opacity-40 animate-fade-in-up hover:opacity-60 transition-opacity duration-300">
                              <Users size={48} className="mb-4 text-slate-400 dark:text-slate-600" />
                              <p className="text-lg font-bold text-slate-600 dark:text-slate-400">No candidates found</p>
                              <p className="text-sm text-slate-500 dark:text-slate-500">Try adjusting your search filters</p>
                           </div>
                        </td>
                     </tr>
                   )}
                </tbody>
              </table>
           </div>
        </div>
      </main>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-scale-in border border-slate-200 dark:border-slate-700">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                   <div className="flex items-center gap-2">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCandidate.name}</h3>
                     {selectedCandidate.isLocked && (
                       <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 rounded text-[10px] font-bold uppercase">
                         <Lock size={10}/> Locked
                       </span>
                     )}
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-400">{selectedCandidate.email} • {selectedCandidate.mobile}</p>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors font-bold text-slate-500 dark:text-slate-400">✕</button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 dark:text-slate-300">
                <div className="grid md:grid-cols-2 gap-10">
                <section>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Personal Details</h4>
                   <div className="space-y-3">
                      <DetailRow label="Full Name" value={selectedCandidate.profileData?.fullName || selectedCandidate.name} />
                      <DetailRow label="Father's Name" value={selectedCandidate.profileData?.fatherName} />
                      <DetailRow label="Gender" value={selectedCandidate.profileData?.gender} />
                      <DetailRow label="Date of Birth" value={selectedCandidate.profileData?.dateOfBirth} />
                      <DetailRow label="Age" value={selectedCandidate.profileData?.age} />
                      <DetailRow label="Blood Group" value={selectedCandidate.profileData?.bloodGroup} />
                      <DetailRow label="Marital Status" value={selectedCandidate.profileData?.maritalStatus} />
                   </div>
                </section>
                <section>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Contact & Address</h4>
                   <div className="space-y-3">
                      <DetailRow label="Mobile" value={selectedCandidate.mobile} />
                      <DetailRow label="Alternate Mobile" value={selectedCandidate.profileData?.alternateMobileNumber} />
                      <DetailRow label="Email" value={selectedCandidate.email} />
                      <DetailRow label="Current City" value={selectedCandidate.profileData?.currentCity} />
                      <DetailRow label="Current Address" value={selectedCandidate.profileData?.currentAddress} />
                      <DetailRow label="Permanent Address" value={selectedCandidate.profileData?.permanentAddress} />
                      <DetailRow label="Pincode" value={selectedCandidate.profileData?.pincode} />
                   </div>
                </section>
                </div>
                <div className="grid md:grid-cols-2 gap-10 mt-8">
                <section>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Employment Details</h4>
                   <div className="space-y-3">
                      <DetailRow label="Profession/Title" value={selectedCandidate.profileData?.profession} />
                      <DetailRow label="Entity" value={selectedCandidate.profileData?.entity} />
                      <DetailRow label="Date of Joining" value={selectedCandidate.profileData?.dateOfJoining} />
                   </div>
                </section>
                <section>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Bank & Identity</h4>
                   <div className="space-y-3">
                      <DetailRow label="Aadhaar Number" value={selectedCandidate.profileData?.aadhaarNumber} />
                      <DetailRow label="PAN Number" value={selectedCandidate.profileData?.panNumber} />
                      <DetailRow label="Bank Name" value={selectedCandidate.profileData?.bankName} />
                      <DetailRow label="Account Number" value={selectedCandidate.profileData?.accountNumber} />
                      <DetailRow label="IFSC Code" value={selectedCandidate.profileData?.ifscCode} />
                      <DetailRow label="Account Holder Name" value={selectedCandidate.profileData?.accountHolderName} />
                      <DetailRow label="UAN Number" value={selectedCandidate.profileData?.uanNumber} />
                      <DetailRow label="Passport Number" value={selectedCandidate.profileData?.passportNumber} />
                   </div>
                </section>
                </div>
                <div className="grid md:grid-cols-2 gap-10 mt-8">
                <section>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Emergency Contact</h4>
                   <div className="space-y-3">
                      <DetailRow label="Contact Name" value={selectedCandidate.profileData?.emergencyContactName} />
                      <DetailRow label="Relationship" value={selectedCandidate.profileData?.emergencyContactRelation} />
                      <DetailRow label="Contact Number" value={selectedCandidate.profileData?.emergencyContactNumber} />
                   </div>
                </section>
                <section>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Family & Nominee Details</h4>
                   <div className="space-y-3">
                      <DetailRow label="Spouse Name" value={selectedCandidate.profileData?.spouseName} />
                      <DetailRow label="Nominee Name" value={selectedCandidate.profileData?.nomineeName} />
                      <DetailRow label="Nominee Relationship" value={selectedCandidate.profileData?.nomineeRelationship} />
                      <DetailRow label="Nominee DOB" value={selectedCandidate.profileData?.nomineeDOB} />
                   </div>
                </section>
                </div>
             </div>

             <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-800/50">
                <div className="mb-4">
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Uploaded Documents</h4>
                     <div className="flex items-center gap-3">
                       <button
                         onClick={() => openFormsModal(selectedCandidate)}
                         className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all"
                       >
                         <FileText size={14}/> View Generated Forms
                       </button>
                       <button
                         onClick={() => viewChecklistPDF(selectedCandidate)}
                         className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1.5 rounded-lg border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800 transition-all"
                       >
                         <ClipboardList size={14}/> View Checklist
                       </button>
                       <button
                         onClick={() => downloadChecklistPDF(selectedCandidate)}
                         className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
                       >
                         <ClipboardList size={14}/> Download Checklist
                       </button>
                       {selectedCandidate.driveFolder?.folderLink && (
                         <a 
                           href={selectedCandidate.driveFolder.folderLink} 
                           target="_blank" 
                           rel="noreferrer"
                           className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                         >
                           <FolderOpen size={14}/> Open Drive Folder
                         </a>
                       )}
                     </div>
                   </div>
                   <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedCandidate.documents?.map((doc, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                        >
                           <div className="flex items-center gap-3">
                             <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                               <FileText size={16} className="text-indigo-600 dark:text-indigo-400"/>
                             </div>
                             <div>
                               <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block">{doc.type}</span>
                               <span className="text-[10px] text-slate-400 dark:text-slate-500">{doc.fileName || 'Document'}</span>
                             </div>
                           </div>
                           <div className="flex gap-2">
                             {doc.driveViewLink ? (
                               <>
                                 <a 
                                   href={doc.driveViewLink} 
                                   target="_blank" 
                                   rel="noreferrer"
                                   className="px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1 transition-colors"
                                 >
                                   <ExternalLink size={10}/> View
                                 </a>
                                 {doc.driveDownloadLink && (
                                   <a 
                                     href={doc.driveDownloadLink} 
                                     target="_blank" 
                                     rel="noreferrer"
                                     className="px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center gap-1 transition-colors"
                                   >
                                     <Download size={10}/> Download
                                   </a>
                                 )}
                               </>
                             ) : doc.localUrl ? (
                               <>
                                 <a 
                                   href={`${API_URL.replace('/api', '')}${doc.localUrl}`} 
                                   target="_blank" 
                                   rel="noreferrer"
                                   className="px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1 transition-colors"
                                 >
                                   <ExternalLink size={10}/> View
                                 </a>
                                 <a 
                                   href={`${API_URL.replace('/api', '')}${doc.localUrl}`} 
                                   download={doc.fileName}
                                   className="px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center gap-1 transition-colors"
                                 >
                                   <Download size={10}/> Download
                                 </a>
                               </>
                             ) : (
                               <span className="text-[10px] text-slate-400 dark:text-slate-500">Pending upload</span>
                             )}
                           </div>
                        </div>
                      ))}
                      {!selectedCandidate.documents?.length && (
                        <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                          <FileText size={32} className="mx-auto mb-2 opacity-30"/>
                          <p className="text-xs italic">No documents uploaded yet</p>
                        </div>
                      )}
                   </div>
                </div>

                <div className="flex gap-3">
                   {selectedCandidate.status === 'approved' ? (
                     <div className="flex-1 py-2.5 px-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                       <CheckCircle2 size={16}/> Already Approved
                     </div>
                   ) : (
                     <Button onClick={() => handleApprove(selectedCandidate)} className="flex-1 !bg-emerald-600 hover:!bg-emerald-700 text-white">Approve</Button>
                   )}
                   <Button onClick={() => updateStatus(selectedCandidate._id, 'rejected')} variant="secondary" className="flex-1 !bg-red-50 !text-red-600 hover:!bg-red-100 !border-red-200 dark:!bg-red-900/20 dark:!text-red-400 dark:!border-red-800 dark:hover:!bg-red-900/40">Reject</Button>
                   <Button 
                     onClick={() => toggleLock(selectedCandidate._id, selectedCandidate.isLocked)} 
                     variant="secondary" 
                     className={`!px-4 ${selectedCandidate.isLocked ? '!bg-amber-50 !text-amber-600 !border-amber-200 hover:!bg-amber-100 dark:!bg-amber-900/20 dark:!text-amber-400 dark:!border-amber-800 dark:hover:!bg-amber-900/40' : '!bg-slate-50 !text-slate-600 !border-slate-200 hover:!bg-slate-100 dark:!bg-slate-800 dark:!text-slate-300 dark:!border-slate-600 dark:hover:!bg-slate-700'}`}
                   >
                     {selectedCandidate.isLocked ? <><Unlock size={16}/> Unlock</> : <><Lock size={16}/> Lock</>}
                   </Button>
                   <Button 
                     onClick={() => setDeleteConfirm(selectedCandidate._id)} 
                     variant="secondary" 
                     className="!px-4 !bg-red-50 !text-red-600 !border-red-200 hover:!bg-red-600 hover:!text-white hover:!border-red-600 dark:!bg-red-900/20 dark:!text-red-400 dark:!border-red-800 dark:hover:!bg-red-600 dark:hover:!text-white"
                   >
                     <Trash2 size={16}/> Delete
                   </Button>
                   <button onClick={() => setSelectedCandidate(null)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Close</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {approveModal && (
        <div className={`fixed inset-0 backdrop-blur-sm z-[60] flex items-center justify-center p-6 ${isDark ? 'bg-slate-900/70' : 'bg-slate-900/50'}`}>
          <div className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-100'}`}>
                  <CheckCircle2 size={28} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Approve Candidate</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{approveModal.name} • {approveModal.email}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Assign Department / Team <span className="text-red-500">*</span>
                </label>
                
                {!useCustomDept ? (
                  <>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 transition-all duration-200 cursor-pointer ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                    >
                      <option value="">Select a department...</option>
                      {DEPARTMENTS.map((dept, idx) => (
                        <option key={idx} value={dept.team}>{dept.team} — {dept.tags.join(', ')}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => { setUseCustomDept(true); setSelectedDepartment(''); }}
                      className={`mt-2 text-xs font-medium flex items-center gap-1 transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                    >
                      + Add custom department
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      placeholder="Enter department name..."
                      className={`w-full px-4 py-3 border rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 transition-all duration-200 ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                    />
                    <button 
                      onClick={() => { setUseCustomDept(false); setCustomDepartment(''); }}
                      className={`mt-2 text-xs font-medium flex items-center gap-1 transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                    >
                      ← Select from list
                    </button>
                  </>
                )}
                
                {!getDepartmentValue() && (
                  <p className={`text-xs mt-2 flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`}></span>
                    Please {useCustomDept ? 'enter' : 'select'} a department to approve
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Employee ID <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g., ESME-001"
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 transition-all duration-200 ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    HR Remarks <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={hrRemarks}
                    onChange={(e) => setHrRemarks(e.target.value)}
                    placeholder="Any notes..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 transition-all duration-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => { setApproveModal(null); setSelectedDepartment(''); setCustomDepartment(''); setUseCustomDept(false); setEmployeeId(''); setHrRemarks(''); }} 
                  variant="secondary" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmApprove}
                  disabled={!getDepartmentValue()}
                  className={`flex-1 !bg-emerald-600 hover:!bg-emerald-700 ${!getDepartmentValue() ? '!opacity-50 !cursor-not-allowed' : ''}`}
                >
                  <CheckCircle2 size={16}/> Approve & Assign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Candidate?</h3>
              <p className="text-sm text-slate-500 mb-6">
                This action cannot be undone. All data including documents and profile information for <span className="font-semibold text-slate-700">{selectedCandidate?.name}</span> will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setDeleteConfirm(null)} 
                  variant="secondary" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => deleteCandidate(deleteConfirm)} 
                  className="flex-1 !bg-red-600 hover:!bg-red-700"
                >
                  <Trash2 size={16}/> Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Management Modal */}
      {showAdminPanel && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4 ${isDark ? 'bg-slate-900/70' : 'bg-slate-900/60'}`}>
          <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Admin Management</h2>
                    <p className="text-purple-100 text-sm">
                      {user.role === 'super_admin' ? 'Create and manage admin accounts' : 'View admin accounts'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowAdminPanel(false); setShowCreateAdmin(false); setAdminError(''); setAdminSuccess(''); }}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className={`p-6 max-h-[60vh] overflow-y-auto ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {adminError && (
                <div className={`mb-4 p-3 border rounded-lg text-sm ${isDark ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {adminError}
                </div>
              )}
              {adminSuccess && (
                <div className={`mb-4 p-3 border rounded-lg text-sm ${isDark ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                  {adminSuccess}
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Admin Accounts</h3>
                {user.role === 'super_admin' && (
                  <button
                    onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                  >
                    {showCreateAdmin ? <X size={16} /> : <Plus size={16} />}
                    {showCreateAdmin ? 'Cancel' : 'Create Admin'}
                  </button>
                )}
              </div>
              
              {/* Create Admin Form - Super Admin Only */}
              {showCreateAdmin && user.role === 'super_admin' && (
                <form onSubmit={handleCreateAdmin} className={`mb-6 p-4 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>New Admin Details</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                      <input
                        type="text"
                        value={newAdmin.name}
                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${isDark ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'}`}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mobile</label>
                      <input
                        type="tel"
                        value={newAdmin.mobile}
                        onChange={e => setNewAdmin({ ...newAdmin, mobile: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${isDark ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'}`}
                        placeholder="Enter mobile"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${isDark ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'}`}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newAdmin.password}
                          onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                          className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${isDark ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'}`}
                          placeholder="Min 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
                  >
                    Create Admin Account
                  </button>
                </form>
              )}
              
              {/* Admin List */}
              {loadingAdmins ? (
                <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading admins...</div>
              ) : (
                <div className="space-y-3">
                  {adminList.map((admin, idx) => (
                    <div 
                      key={admin._id} 
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${admin.role === 'super_admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                          {admin.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{admin.name}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{admin.email}</p>
                        </div>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${admin.role === 'super_admin' ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700')}`}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </div>
                      {admin.role !== 'super_admin' && user.role === 'super_admin' && (
                        <button
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className={`p-2 rounded-lg transition-all ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/30' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                          title="Delete Admin"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4 ${isDark ? 'bg-slate-900/70' : 'bg-slate-900/60'}`}>
          <div className={`rounded-2xl max-w-md w-full shadow-2xl animate-scale-in ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Key size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                    <p className="text-blue-100 text-sm">Change your password</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowProfileSettings(false); setPasswordError(''); setPasswordSuccess(''); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleChangePassword} className={`p-6 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {/* Admin Signature Section */}
              <div className={`mb-6 p-4 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>HR/Admin Signature</h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Used on generated employee forms</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowSignatureModal(true); setTimeout(initSignatureCanvas, 100); }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${isDark ? 'bg-teal-900/30 text-teal-400 hover:bg-teal-900/50' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
                  >
                    <Pen size={14} />
                    {adminSignature ? 'Update' : 'Add'}
                  </button>
                </div>
                {adminSignature ? (
                  <div className={`p-3 rounded-lg border-2 border-dashed ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}>
                    <img src={adminSignature} alt="Admin Signature" className="max-h-16 mx-auto" />
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg border-2 border-dashed text-center ${isDark ? 'border-slate-600 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                    <Pen size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No signature added yet</p>
                  </div>
                )}
              </div>
              
              {passwordError && (
                <div className={`mb-4 p-3 border rounded-lg text-sm ${isDark ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className={`mb-4 p-3 border rounded-lg text-sm ${isDark ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                  {passwordSuccess}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'border-slate-200 bg-white text-slate-900'}`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'border-slate-200 bg-white text-slate-900'}`}
                      placeholder="Enter new password (min 8 chars)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:bg-slate-600' : 'border-slate-200 bg-white text-slate-900'}`}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className={`w-full mt-6 py-3 rounded-lg transition-all font-semibold ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Signature Modal */}
      {showSignatureModal && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in p-4 ${isDark ? 'bg-slate-900/80' : 'bg-slate-900/60'}`}>
          <div className={`rounded-2xl max-w-lg w-full shadow-2xl animate-scale-in ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Pen size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">HR/Admin Signature</h2>
                    <p className="text-teal-100 text-sm">Draw or upload your signature</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSignatureModal(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Signature Canvas */}
              <div className={`border-2 border-dashed rounded-xl overflow-hidden mb-4 ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
                <canvas
                  ref={signatureCanvasRef}
                  className="w-full cursor-crosshair touch-none"
                  style={{ maxWidth: '400px', height: 'auto', aspectRatio: '400/150' }}
                  onMouseDown={startDrawingSignature}
                  onMouseMove={drawSignature}
                  onMouseUp={stopDrawingSignature}
                  onMouseLeave={stopDrawingSignature}
                  onTouchStart={startDrawingSignature}
                  onTouchMove={drawSignature}
                  onTouchEnd={stopDrawingSignature}
                />
              </div>
              
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={clearSignatureCanvas}
                  className={`flex-1 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <RotateCcw size={16} />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Upload size={16} />
                  Upload Image
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSignatureUpload}
              />
              
              <button
                onClick={saveSignatureFromCanvas}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all"
              >
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Forms Modal */}
      {showFormsModal && selectedCandidateForForms && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in p-4 ${isDark ? 'bg-slate-900/80' : 'bg-slate-900/60'}`}>
          <div className={`rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-scale-in ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Generated Forms</h2>
                    <p className="text-indigo-100 text-sm">{selectedCandidateForForms.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowFormsModal(false); setSelectedCandidateForForms(null); }}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {[
                  { id: 'joining', name: 'Employee Joining Form', icon: '📋', dataKey: 'joiningFormData' },
                  { id: 'form_f', name: 'Gratuity Form F', icon: '📝', dataKey: 'formFData' },
                  { id: 'form_11', name: 'PF Declaration Form 11', icon: '📄', dataKey: 'form11Data' },
                  { id: 'pf_nomination', name: 'PF Nomination Form', icon: '👥', dataKey: 'pfNominationData' },
                  { id: 'insurance', name: 'Medical Insurance Form', icon: '🏥', dataKey: 'insuranceData' },
                  { id: 'self_declaration', name: 'Self Declaration Form', icon: '✍️', dataKey: 'selfDeclarationData' },
                ].map((form) => {
                  const profileData = selectedCandidateForForms.profileData || {};
                  // Check if specific form data exists, OR if candidate has submitted (meaning they went through forms)
                  const hasSpecificFormData = !!profileData[form.dataKey];
                  const hasBasicData = selectedCandidateForForms.status === 'submitted' && profileData.fullName;
                  const hasFormData = hasSpecificFormData || hasBasicData;
                  
                  return (
                    <div 
                      key={form.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{form.icon}</span>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{form.name}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {hasSpecificFormData ? 'Form completed' : hasBasicData ? 'Can generate from profile' : 'Pending submission'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {hasFormData ? (
                          <>
                            <button
                              onClick={() => viewFormPDF(form.id, profileData, adminSignature)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${isDark ? 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                            >
                              <Eye size={14} />
                              View
                            </button>
                            <button
                              onClick={() => downloadFormPDF(form.id, profileData, selectedCandidateForForms.name, adminSignature)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${isDark ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            >
                              <Download size={14} />
                              PDF
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Not available
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Admin Signature Status */}
              <div className={`mt-6 p-4 rounded-xl border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pen size={20} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-amber-800'}`}>HR/Admin Signature</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-amber-600'}`}>
                        {adminSignature ? 'Signature will be applied to generated PDFs' : 'Add your signature in Profile Settings'}
                      </p>
                    </div>
                  </div>
                  {adminSignature ? (
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                      <img src={adminSignature} alt="Admin Signature" className="h-8" />
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowFormsModal(false); setShowProfileSettings(true); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}
                    >
                      Add Signature
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  const { isDark } = useTheme();
  return (
    <div>
       <p className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
       <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{value || 'Not provided'}</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, delay = 0 }) {
  const { isDark } = useTheme();
  
  const iconColors = {
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    amber: isDark ? 'text-amber-400' : 'text-amber-600',
    emerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
    indigo: isDark ? 'text-indigo-400' : 'text-indigo-600'
  };

  return (
    <div 
      className={`p-6 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer opacity-0 animate-fade-in-up ${
        isDark 
          ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' 
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
       <div className={`p-3 rounded-xl transition-transform duration-200 hover:scale-110 ${iconColors[color]} ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}><Icon size={20}/></div>
       <div className="flex justify-between items-start mb-4">
          <div/>
       </div>
       <h3 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
       <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}
