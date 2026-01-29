import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, 
  ChevronRight, Download, Clock, Info, LogOut, User, FileCheck, AlertCircle, Lock, Unlock, Edit3
} from 'lucide-react';
import { JOINING_FORMS, ONBOARDING_STEPS, REQUIRED_DOCUMENTS, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES } from '../../constants/onboarding';
import { Input, Button } from '../shared/UI';
import EsmeLogo from '../../assets/Esme-Logo-01.png';
import ThemeToggle from '../shared/ThemeToggle';
import FormF from '../forms/FormF';
import EmployeeJoiningForm from '../forms/EmployeeJoiningForm';
import Form11 from '../forms/Form11';
import PFNominationForm from '../forms/PFNominationForm';
import MedicalInsuranceForm from '../forms/MedicalInsuranceForm';
import SelfDeclarationForm from '../forms/SelfDeclarationForm';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// File validation helper
const validateFile = (file) => {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  
  // Check file type
  if (!ALLOWED_FILE_TYPES.documents.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload PDF, JPG, or PNG files only.' };
  }
  
  // Check file size
  const maxSize = isImage ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.pdf;
  const maxSizeMB = maxSize / (1024 * 1024);
  
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxSizeMB}MB for ${isImage ? 'images' : 'PDFs'}.` };
  }
  
  return { valid: true };
};

export default function CandidateDashboard({ user, onLogout }) {
  const [activeStep, setActiveStep] = useState('info');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [candidateStatus, setCandidateStatus] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [viewMode, setViewMode] = useState('onboarding');
  const [ageError, setAgeError] = useState('');
  const [aadhaarData, setAadhaarData] = useState(null);
  const [declarations, setDeclarations] = useState({
    infoConfirm: false,
    bgvConsent: false,
    policyAgree: false
  });
  
  const [formData, setFormData] = useState({
    fullName: user.name,
    email: user.email,
    phone: user.mobile,
    aadhaarNumber: '',
    mobileNumber: user.mobile,
    profession: '',
    currentCity: '',
    entity: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    fatherName: '',
    permanentAddress: '',
    currentAddress: '',
    pincode: '',
    dateOfJoining: '',
    alternateMobileNumber: '',
    bloodGroup: '',
    maritalStatus: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    panNumber: '',
    passportNumber: '',
    uanNumber: '',
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactNumber: '',
    // Family & Nominee Details
    spouseName: '',
    nomineeName: '',
    nomineeRelationship: '',
    nomineeDOB: ''
  });

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/candidate/${user.email}`);
        if (res.ok) {
          const data = await res.json();
          setCandidateData(data);
          setCandidateStatus(data.status);
          
          if ((data.status === 'submitted' || data.status === 'completed' || data.status === 'approved' || data.status === 'rejected') && data.isLocked) {
            setViewMode('status');
            setSubmitted(true);
          } else if (data.status === 'submitted' || data.status === 'completed' || data.status === 'approved' || data.status === 'rejected') {
            setViewMode('status');
            setSubmitted(false);
          }
          
          if (data.profileData) {
            setFormData(prev => ({ ...prev, ...data.profileData }));
          }
        }
      } catch (e) {
        console.log('No existing candidate data');
      }
    };
    checkStatus();
  }, [user.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      const dob = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        age: age.toString()
      }));
      
      if (age < 18) {
        setAgeError('❌ Age must be 18 or above');
      } else {
        setAgeError('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveAndNext = async () => {
    if (ageError) {
      alert('❌ You must be 18 years or older to proceed');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          mobile: formData.mobileNumber,
          profileData: formData
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Personal information saved successfully!');
        setActiveStep('form_joining'); // Go to Employee Joining Form step
      } else {
        alert(`Error: ${data.error || 'Failed to save'}`);
      }
    } catch (e) {
      console.error("Error saving profile:", e);
      alert('Error saving data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file, type) => {
    const data = new FormData();
    data.append('file', file);
    data.append('type', type);
    data.append('email', user.email);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: data
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Ensure email is in profileData
      const profileDataWithEmail = {
        ...formData,
        email: formData.email || user.email
      };
      
      const response = await fetch(`${API_URL}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: user.email,
          mobile: formData.mobileNumber,
          profileData: profileDataWithEmail,
          status: 'submitted'
        })
      });
      
      // Refetch candidate data to get updated info including documents
      const refreshRes = await fetch(`${API_URL}/candidate/${user.email}`);
      if (refreshRes.ok) {
        const freshData = await refreshRes.json();
        setCandidateData(freshData);
      }
      
      setSubmitted(true);
      setCandidateStatus('submitted');
      setViewMode('status');
    } catch (e) {
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  if (viewMode === 'profile') {
    return (
      <ProfileView 
        user={user}
        candidateData={candidateData}
        onLogout={onLogout}
        onBack={() => setViewMode('status')}
      />
    );
  }

  if (viewMode === 'status' || submitted) {
    return (
      <StatusDashboard 
        user={user} 
        candidateData={candidateData}
        status={candidateStatus}
        onLogout={onLogout}
        onViewProfile={() => setViewMode('profile')}
        onEditProfile={() => { setViewMode('onboarding'); setSubmitted(false); }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in-up">
      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-4">
          <img src={EsmeLogo} alt="ESME Logo" className="h-16 w-auto object-contain" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Complete your onboarding journey below.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock size={16} className="text-teal-600 dark:text-teal-400" /> Progress: {
                activeStep === 'info' ? '11%' : 
                activeStep === 'form_joining' ? '22%' : 
                activeStep === 'form_f' ? '33%' : 
                activeStep === 'form_11' ? '44%' : 
                activeStep === 'form_pf_nomination' ? '55%' : 
                activeStep === 'form_insurance' ? '66%' : 
                activeStep === 'form_self_declaration' ? '77%' : 
                activeStep === 'documents' ? '88%' : '100%'
              }
            </div>
            <div className="w-48 h-2 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700 ease-out" style={{ width: 
                activeStep === 'info' ? '11%' : 
                activeStep === 'form_joining' ? '22%' : 
                activeStep === 'form_f' ? '33%' : 
                activeStep === 'form_11' ? '44%' : 
                activeStep === 'form_pf_nomination' ? '55%' : 
                activeStep === 'form_insurance' ? '66%' : 
                activeStep === 'form_self_declaration' ? '77%' : 
                activeStep === 'documents' ? '88%' : '100%' 
              }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72 space-y-3 lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
             <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2">Onboarding Roadmap</p>
             {ONBOARDING_STEPS.map((step, idx) => (
               <button
                 key={step.id}
                 onClick={() => setActiveStep(step.id)}
                 className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-out flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98] ${activeStep === step.id ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-lg shadow-slate-900/10 dark:shadow-teal-900/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'}`}
               >
                 <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-200 ${activeStep === step.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400'}`}>
                       {idx + 1}
                    </div>
                    {step.label.split('. ')[1]}
                 </div>
                 {activeStep === step.id && <ChevronRight size={16} />}
               </button>
             ))}
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all duration-300 hover:-translate-y-1">
             <h3 className="font-bold text-lg mb-1">Need Help?</h3>
             <p className="text-teal-100 text-sm mb-4">Contact HR if you face issues with documents.</p>
             <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-all duration-200 w-full text-center hover:scale-[1.02] active:scale-[0.98]">Contact Support</button>
          </div>

          <div className="pt-2">
             <button onClick={onLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-sm flex items-center gap-3 active:scale-[0.98]">
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors duration-200">
                    <LogOut size={16} />
                </div>
                Sign Out
             </button>
          </div>
        </aside>

        <main className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm relative min-h-[600px] transition-all duration-300 hover:shadow-lg overflow-visible">
          {/* Main Form - Show directly without Aadhaar verification */}
          {activeStep === 'info' && (
            <div className="space-y-6 animate-fade-in-up">
              <SectionHeader title="Personal Information & BGV Details" subtitle="All information will be synced to BGV sheet and visible to admin" />
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your full name" required />
                <Input label="Email *" name="email" value={formData.email} onChange={handleChange} type="email" required />
                <Input label="Mobile Number *" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="10-digit mobile" maxLength="10" required />
                <Input label="Aadhaar Number *" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="12-digit Aadhaar number" maxLength="12" required />
                <Input label="Profession/Title *" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g., Software Engineer" required />
                <Input label="Current City *" name="currentCity" value={formData.currentCity} onChange={handleChange} placeholder="Your current city" required />
                <Input label="Entity *" name="entity" value={formData.entity} onChange={handleChange} placeholder="Organization/Entity name" required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Gender (M/F/T) * {aadhaarData?.gender && <span className="text-xs text-green-600 dark:text-green-400">(from Aadhaar)</span>}</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${aadhaarData?.gender ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500'} text-slate-900 dark:text-white`} 
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="T">Transgender</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${ageError ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white`} />
                  {ageError && <p className="mt-1 text-sm font-bold text-red-600">{ageError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Age (Auto-calculated)</label>
                  <input type="number" name="age" value={formData.age} readOnly disabled placeholder="Auto-calculated from DOB" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-800 cursor-not-allowed text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Father's Name {aadhaarData?.fatherName && <span className="text-xs text-green-600 dark:text-green-400">(from Aadhaar)</span>}</label>
                  <input 
                    type="text" 
                    name="fatherName" 
                    value={formData.fatherName} 
                    onChange={handleChange} 
                    placeholder="As per Aadhaar" 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${aadhaarData?.fatherName ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'} text-slate-900 dark:text-white`}
                  />
                </div>
                <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g. O+ve" />
                <Input label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} placeholder="Single/Married" />
                <Input label="Date of Joining" name="dateOfJoining" type="date" value={formData.dateOfJoining} onChange={handleChange} />
                <Input label="Alternate Mobile Number" name="alternateMobileNumber" value={formData.alternateMobileNumber} onChange={handleChange} placeholder="Family member's number" maxLength="10" />
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Permanent Address {aadhaarData?.address && <span className="text-xs text-green-600 dark:text-green-400">(from Aadhaar)</span>}</label>
                    <textarea 
                      name="permanentAddress" 
                      value={formData.permanentAddress} 
                      onChange={handleChange} 
                      placeholder="As per Aadhaar" 
                      rows="3" 
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${aadhaarData?.address ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'} text-slate-900 dark:text-white`} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Current/Local Address *</label>
                    <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Your current address" rows="3" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Pincode * {aadhaarData?.pincode && <span className="text-xs text-green-600 dark:text-green-400">(from Aadhaar)</span>}</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={formData.pincode} 
                    onChange={handleChange} 
                    placeholder="6-digit pincode" 
                    maxLength="6" 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${aadhaarData?.pincode ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'} text-slate-900 dark:text-white`}
                    required 
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <SectionHeader title="Financial & Statutory" subtitle="For salary and compliance processing" />
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <Input label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="ABCDE1234F" />
                  <Input label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Bank Name" />
                  <Input label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Account Number" />
                  <Input label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="IFSC Code" />
                  <Input label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="Account holder name" />
                  <Input label="UAN Number" name="uanNumber" value={formData.uanNumber} onChange={handleChange} placeholder="UAN Number" />
                  <Input label="Passport Number" name="passportNumber" value={formData.passportNumber} onChange={handleChange} placeholder="Passport Number" />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <SectionHeader title="Emergency Contact" subtitle="In case of emergency (optional)" />
                <div className="grid md:grid-cols-3 gap-6 mt-4">
                  <Input label="Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Emergency contact name" />
                  <Input label="Relationship" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} placeholder="e.g. Father, Mother, Spouse" />
                  <Input label="Contact Number" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} placeholder="10-digit mobile" maxLength="10" />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <SectionHeader title="Family & Nominee Details" subtitle="For insurance and statutory benefits (optional)" />
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <Input label="Spouse Name" name="spouseName" value={formData.spouseName} onChange={handleChange} placeholder="If married" />
                  <Input label="Nominee Name" name="nomineeName" value={formData.nomineeName} onChange={handleChange} placeholder="For PF/Gratuity" />
                  <Input label="Nominee Relationship" name="nomineeRelationship" value={formData.nomineeRelationship} onChange={handleChange} placeholder="e.g. Father, Mother, Spouse" />
                  <Input label="Nominee Date of Birth" name="nomineeDOB" type="date" value={formData.nomineeDOB} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end pt-4 gap-4">
                {ageError && <p className="text-red-600 font-bold text-sm self-center">{ageError}</p>}
                <Button onClick={() => handleSaveAndNext()} disabled={!!ageError} className={ageError ? '!opacity-50 !cursor-not-allowed' : ''}>Save & Next Step</Button>
              </div>
            </div>
          )}

          {/* Step 2: Employee Joining Form - Placeholder (to be implemented) */}
          {activeStep === 'form_joining' && (
            <EmployeeJoiningForm
              formData={formData}
              onFormDataChange={setFormData}
              onNext={() => setActiveStep('form_f')}
              onBack={() => setActiveStep('info')}
            />
          )}

          {/* Step 3: Form F - Gratuity Nomination Form */}
          {activeStep === 'form_f' && (
            <FormF 
              formData={formData}
              onFormDataChange={setFormData}
              onNext={() => setActiveStep('form_11')}
              onBack={() => setActiveStep('form_joining')}
            />
          )}

          {/* Step 4: Form 11 - PF Declaration - Placeholder */}
          {activeStep === 'form_11' && (
            <Form11
              formData={formData}
              onFormDataChange={setFormData}
              onNext={() => setActiveStep('form_pf_nomination')}
              onBack={() => setActiveStep('form_f')}
            />
          )}

          {/* Step 5: PF Nomination Form */}
          {activeStep === 'form_pf_nomination' && (
            <PFNominationForm
              formData={formData}
              onFormDataChange={setFormData}
              onNext={() => setActiveStep('form_insurance')}
              onBack={() => setActiveStep('form_11')}
            />
          )}

          {/* Step 6: Medical Insurance Form */}
          {activeStep === 'form_insurance' && (
            <MedicalInsuranceForm
              formData={formData}
              onFormDataChange={setFormData}
              onNext={() => setActiveStep('form_self_declaration')}
              onBack={() => setActiveStep('form_pf_nomination')}
            />
          )}

          {/* Step 7: Self Declaration Form */}
          {activeStep === 'form_self_declaration' && (
            <SelfDeclarationForm
              formData={formData}
              onFormDataChange={setFormData}
              onNext={() => setActiveStep('documents')}
              onBack={() => setActiveStep('form_insurance')}
            />
          )}

          {activeStep === 'downloads' && (
            <div className="space-y-8 animate-fade-in-up">
              <SectionHeader title="Document Downloads" subtitle="Download, fill, and sign these mandatory forms" />
              <div className="grid sm:grid-cols-2 gap-4">
                {JOINING_FORMS.map((form, idx) => (
                  <div key={form.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group bg-slate-50 dark:bg-slate-700/50" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-all duration-200">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1" title={form.name}>{form.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{form.required ? 'Mandatory' : 'Optional'}</p>
                      </div>
                    </div>
                    <a 
                      href={`/forms/${form.file}`} 
                      download 
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Download Form"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => setActiveStep('info')}>Back</Button>
                <Button onClick={() => setActiveStep('documents')}>Continue to Upload</Button>
              </div>
            </div>
          )}

          {activeStep === 'documents' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="pt-4">
                <SectionHeader title="Identity Documents" subtitle="Proof of identity (Aadhaar, PAN, Photo)" />
                <div className="mt-6 space-y-4">
                   {REQUIRED_DOCUMENTS.identity.map((doc, idx) => (
                      <UploadItem 
                        key={doc.id} 
                        label={doc.name} 
                        required={doc.required} 
                        onUpload={(file) => handleUpload(file, doc.id)}
                        delay={idx * 50}
                      />
                   ))}
                </div>
                
                <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
                   <SectionHeader title="Educational Certificates" subtitle="Mandatory academic documents" />
                   <div className="mt-6 space-y-4">
                      {REQUIRED_DOCUMENTS.education.map((doc, idx) => (
                        <UploadItem 
                          key={doc.id} 
                          label={doc.name} 
                          required={doc.required} 
                          onUpload={(file) => handleUpload(file, doc.id)}
                          delay={idx * 50}
                        />
                      ))}
                   </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
                   <SectionHeader title="Bank Documents" subtitle="Bank account details for salary credit" />
                   <div className="mt-6 space-y-4">
                      {REQUIRED_DOCUMENTS.bank.map((doc, idx) => (
                        <UploadItem 
                          key={doc.id} 
                          label={doc.name} 
                          required={doc.required} 
                          onUpload={(file) => handleUpload(file, doc.id)}
                          delay={idx * 50}
                        />
                      ))}
                   </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
                   <SectionHeader title="Experience Documents" subtitle="Previous employment proof (if applicable)" />
                   <div className="mt-6 space-y-4">
                      {REQUIRED_DOCUMENTS.experience.map((doc, idx) => (
                        <UploadItem 
                          key={doc.id} 
                          label={doc.name} 
                          required={doc.required} 
                          onUpload={(file) => handleUpload(file, doc.id)}
                          delay={idx * 50}
                        />
                      ))}
                   </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => setActiveStep('form_self_declaration')}>Back</Button>
                <Button onClick={() => setActiveStep('review')}>Continue to Review</Button>
              </div>
            </div>
          )}

          {activeStep === 'review' && (
             <div className="space-y-8 animate-fade-in-up">
                <div className="text-center py-8">
                   <div className="h-20 w-20 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                      <ShieldCheck size={40} />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to Submit?</h2>
                   <p className="text-slate-500 dark:text-slate-400 mt-2">Please verify that all the information provided is accurate.</p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                   <div className="space-y-4">
                      <DeclarationItem 
                        label="I confirm that all information provided is true to my knowledge." 
                        checked={declarations.infoConfirm}
                        onChange={(e) => setDeclarations(prev => ({ ...prev, infoConfirm: e.target.checked }))}
                      />
                      <DeclarationItem 
                        label="I understand that background verification will be conducted." 
                        checked={declarations.bgvConsent}
                        onChange={(e) => setDeclarations(prev => ({ ...prev, bgvConsent: e.target.checked }))}
                      />
                      <DeclarationItem 
                        label="I agree to the company policies and code of conduct." 
                        checked={declarations.policyAgree}
                        onChange={(e) => setDeclarations(prev => ({ ...prev, policyAgree: e.target.checked }))}
                      />
                   </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="secondary" onClick={() => setActiveStep('documents')}>Back</Button>
                  <Button 
                    variant="teal" 
                    onClick={handleSubmit} 
                    loading={loading}
                    disabled={!declarations.infoConfirm || !declarations.bgvConsent || !declarations.policyAgree}
                    className={(!declarations.infoConfirm || !declarations.bgvConsent || !declarations.policyAgree) ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Final Submit Application
                  </Button>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

function UploadItem({ label, required, onUpload, delay = 0 }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  
  return (
    <div 
      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-teal-400 dark:hover:border-teal-400 hover:bg-slate-100/50 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-300 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-300 flex-shrink-0 ${status === 'success' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 scale-110' : status === 'loading' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : status === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-white dark:bg-slate-600 text-slate-400 dark:text-slate-300'}`}>
          {status === 'success' ? <CheckCircle2 size={20} className="animate-scale-in" /> : status === 'loading' ? <Upload size={20} className="animate-pulse" /> : status === 'error' ? <AlertCircle size={20} /> : <Upload size={20} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {label} {required && <span className="text-red-500" title="Required">*</span>}
          </p>
          {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Max: 2MB (images) / 5MB (PDF)</p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-2">
        <input 
          type="file" 
          id={label} 
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden" 
          onChange={async (e) => {
            const file = e.target.files[0];
            if(!file) return;
            
            // Validate file
            const validation = validateFile(file);
            if (!validation.valid) {
              setError(validation.error);
              setStatus('error');
              setTimeout(() => { setStatus('idle'); setError(''); }, 3000);
              return;
            }
            
            setError('');
            setStatus('loading');
            const success = await onUpload(file, label);
            setStatus(success ? 'success' : 'error');
            if (!success) {
              setError('Upload failed. Please try again.');
              setTimeout(() => { setStatus('idle'); setError(''); }, 3000);
            }
          }} 
        />
        <label htmlFor={label} className="cursor-pointer bg-white dark:bg-slate-600 px-4 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-500 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-400 transition-all duration-200 active:scale-95 whitespace-nowrap text-slate-700 dark:text-slate-200">
          {status === 'loading' ? 'Uploading...' : status === 'success' ? 'Change File' : 'Choose File'}
        </label>
      </div>
    </div>
  );
}

function DeclarationItem({ label, checked, onChange }) {
  return (
    <label className="flex gap-3 cursor-pointer group p-3 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all duration-200">
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 rounded border-slate-300 dark:border-slate-600 accent-teal-600 transition-all duration-200" 
      />
      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200">{label}</span>
    </label>
  );
}

function StatusDashboard({ user, candidateData, status, onLogout, onViewProfile, onEditProfile }) {
  const isLocked = candidateData?.isLocked;
  
  const statusConfig = {
    pending: { label: 'Pending', color: 'amber', icon: Clock, message: 'Your documents are being processed.' },
    submitted: { label: 'Under Review', color: 'blue', icon: FileCheck, message: 'HR team is reviewing your application.' },
    completed: { label: 'Under Review', color: 'blue', icon: FileCheck, message: 'HR team is reviewing your application.' },
    approved: { label: 'Approved', color: 'green', icon: CheckCircle2, message: 'Congratulations! Your application has been approved.' },
    rejected: { label: 'Needs Attention', color: 'red', icon: AlertCircle, message: 'Some documents need to be re-submitted. Please contact HR.' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <img src={EsmeLogo} alt="ESME Logo" className="h-14 w-auto object-contain" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track your onboarding status below.</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 active:scale-95">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {isLocked ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in-down">
          <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
            <Lock size={20} className="text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-400">Your profile is locked</p>
            <p className="text-sm text-amber-600 dark:text-amber-500/80">Your data has been submitted and cannot be edited. Contact HR if you need to make changes.</p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <Unlock size={20} className="text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-400">Your profile is unlocked</p>
              <p className="text-sm text-green-600 dark:text-green-500/80">You can now update your information and documents.</p>
            </div>
          </div>
          <button 
            onClick={onEditProfile}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center gap-2 active:scale-95"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl mb-6 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-6 mb-6">
          <div className={`h-20 w-20 bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-600 dark:text-${config.color}-400 rounded-2xl flex items-center justify-center animate-scale-in`}>
            <StatusIcon size={40} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Application Status</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{config.label}</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">{config.message}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">Submitted On</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">Reference ID</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">ESME-{Math.floor(Date.now()/10000)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">Documents</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{candidateData?.documents?.length || 0} Uploaded</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={onViewProfile}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-left hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 group-hover:scale-110 transition-all duration-300">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">View My Profile</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">See your submitted information</p>
            </div>
          </div>
        </button>

        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-6 text-white hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 transition-all duration-300">
          <h3 className="font-bold text-lg mb-2">Need Help?</h3>
          <p className="text-teal-100 text-sm mb-4">Contact HR if you have questions about your application.</p>
          <button className="text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ user, candidateData, onLogout, onBack }) {
  const profileData = candidateData?.profileData || {};
  
  const sections = [
    { title: 'Personal Information', fields: [
      { label: 'Full Name', value: profileData.fullName || user.name },
      { label: 'Email', value: profileData.email || candidateData?.email || user.email },
      { label: 'Mobile', value: profileData.mobileNumber || candidateData?.mobile || user.mobile },
      { label: 'Gender', value: profileData.gender === 'M' ? 'Male' : profileData.gender === 'F' ? 'Female' : profileData.gender },
      { label: 'Date of Birth', value: profileData.dateOfBirth },
      { label: 'Age', value: profileData.age },
      { label: "Father's Name", value: profileData.fatherName },
      { label: 'Marital Status', value: profileData.maritalStatus },
      { label: 'Blood Group', value: profileData.bloodGroup },
    ]},
    { title: 'Address Details', fields: [
      { label: 'Current City', value: profileData.currentCity },
      { label: 'Current Address', value: profileData.currentAddress },
      { label: 'Permanent Address', value: profileData.permanentAddress },
      { label: 'Pincode', value: profileData.pincode },
    ]},
    { title: 'Employment Details', fields: [
      { label: 'Profession', value: profileData.profession },
      { label: 'Entity', value: profileData.entity },
      { label: 'Date of Joining', value: profileData.dateOfJoining },
    ]},
    { title: 'Identity & Bank Details', fields: [
      { label: 'Aadhaar Number', value: profileData.aadhaarNumber?.replace(/(\d{4})/g, '$1 ').trim() },
      { label: 'PAN Number', value: profileData.panNumber },
      { label: 'UAN Number', value: profileData.uanNumber },
      { label: 'Bank Name', value: profileData.bankName },
      { label: 'Account Number', value: profileData.accountNumber ? '****' + profileData.accountNumber.slice(-4) : '' },
      { label: 'IFSC Code', value: profileData.ifscCode },
    ]},
    { title: 'Emergency Contact', fields: [
      { label: 'Contact Name', value: profileData.emergencyContactName },
      { label: 'Relationship', value: profileData.emergencyContactRelation },
      { label: 'Contact Number', value: profileData.emergencyContactNumber },
    ]},
    { title: 'Family & Nominee Details', fields: [
      { label: 'Spouse Name', value: profileData.spouseName },
      { label: 'Nominee Name', value: profileData.nomineeName },
      { label: 'Nominee Relationship', value: profileData.nomineeRelationship },
      { label: 'Nominee Date of Birth', value: profileData.nomineeDOB },
    ]},
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-110 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95">
            <ChevronRight size={20} className="rotate-180 text-slate-600 dark:text-slate-300" />
          </button>
          <img src={EsmeLogo} alt="ESME Logo" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Your submitted information</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 active:scale-95">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
        <div className="h-16 w-16 bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold rounded-2xl flex items-center justify-center text-2xl animate-scale-in">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
          <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>

      {sections.map((section, idx) => (
        <div 
          key={idx} 
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-4 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}
        >
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">{section.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.fields.map((field, fidx) => (
              <div key={fidx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-all duration-200 -m-2">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{field.label}</p>
                <p className="text-slate-800 dark:text-slate-300 font-medium mt-1">{field.value || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {candidateData?.documents?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">Uploaded Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(
              candidateData.documents.reduce((acc, doc) => {
                acc[doc.type] = doc;
                return acc;
              }, {})
            ).map((doc, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
              >
                <FileText size={18} className="text-teal-600 dark:text-teal-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{doc.fileName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{doc.type.replace(/_/g, ' ')}</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full transition-all duration-200 ${doc.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : doc.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SuccessView({ user }) {
  return (
    <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in-50 duration-500">
      <div className="h-24 w-24 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <CheckCircle2 size={50} />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Application Submitted!</h1>
      <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 leading-relaxed">
        Thank you for completing your onboarding documents, <strong>{user.name}</strong>. Our HR team will review your application and get back to you shortly.
      </p>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-left shadow-xl">
         <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
            <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl flex items-center justify-center text-xl">{user.name.charAt(0)}</div>
            <div>
               <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider">ONBOARDING REF: {Math.floor(Date.now()/10000)}</p>
            </div>
         </div>
         <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Submission Status</span>
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold rounded-full text-[10px] uppercase tracking-widest">Under Review</span>
         </div>
      </div>
    </div>
  );
}
