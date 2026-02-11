import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck, FileText, LogOut, CheckCircle2, Clock, ChevronDown, ChevronRight, Upload, Plus, Trash2, CreditCard, Building, BookOpen, Award, FileCheck, Heart, User, Key, Eye, EyeOff, Download, FileImage, Mail, ClipboardCheck, BookMarked } from 'lucide-react';
import EsmeLogo from '../../assets/Esme-Logo-01.png';
import { generatePolicyAcknowledgment } from '../../utils/generatePolicyAcknowledgment';
const API_URL = import.meta.env.VITE_API_URL || '/api';
const VERIFICATION_STEPS = [
  { id: 'aadhaar', label: 'Aadhaar', icon: ShieldCheck },
  { id: 'pan', label: 'PAN', icon: CreditCard },
  { id: 'bank', label: 'Bank', icon: Building },
  { id: 'esign', label: 'E-Sign', icon: FileText }
];
export default function CandidateDashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('verification');
  const [activeVerificationStep, setActiveVerificationStep] = useState('aadhaar');
  const [verificationExpanded, setVerificationExpanded] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    aadhaar: 'pending',
    pan: 'pending',
    bank: 'pending',
    esign: 'pending'
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);
  const [verificationData, setVerificationData] = useState({
    aadhaarNumber: '',
    aadhaarOtp: '',
    panNumber: '',
    panName: '',
    panDob: '',
    accountNumber: '',
    ifsc: '',
    accountHolderName: ''
  });
  const [joiningFormData, setJoiningFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    marriageDate: '',
    bloodGroup: '',
    religion: '',
    nationality: '',
    emailId: user?.email || '',
    phone: '',
    presentAddress: '',
    presentCity: '',
    presentState: '',
    presentPincode: '',
    sameAsPresent: false,
    permanentAddress: '',
    permanentCity: '',
    permanentState: '',
    permanentPincode: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    emergencyContactAddress: '',
    isFresher: false,
    totalExperience: '',
    preferredLocation: '',
    sourceOfHire: '',
    designation: '',
    offeredSalary: '',
    department: '',
    keySkills: '',
    highestQualification: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankBranch: '',
    pfNumber: '',
    uanNumber: '',
    esicNumber: '',
    panNumber: '',
    aadhaarNumber: ''
  });
  const [educationDetails, setEducationDetails] = useState([
    { level: '10th', institution: '', board: '', yearOfPassing: '', percentage: '', marksheet: null },
    { level: '12th', institution: '', board: '', yearOfPassing: '', percentage: '', marksheet: null },
    { level: 'Undergraduate', institution: '', board: '', yearOfPassing: '', percentage: '', marksheet: null }
  ]);
  const [experienceDetails, setExperienceDetails] = useState([]);
  const [form11Data, setForm11Data] = useState({
    employeeName: '',
    fatherOrHusbandName: '',
    dateOfBirth: '',
    gender: '',
    accountNumber: '',
    permanentAddress: '',
    presentAddress: '',
    maritalStatus: '',
    religion: '',
    internationalWorker: 'No',
    epsOption: 'Yes',
    ppanNumber: '',
    aadhaarNumber: '',
    mobileNumber: '',
    emailId: user?.email || '',
    signaturePlace: '',
    signatureDate: '',
    witnessName: '',
    witnessAddress: ''
  });
  const [familyMembers, setFamilyMembers] = useState([
    { name: '', relationship: '', dateOfBirth: '', nominee: false, share: '' }
  ]);
  const [epfNominees, setEpfNominees] = useState([
    { name: '', address: '', relationship: '', dateOfBirth: '', share: '' }
  ]);
  const [epsNominees, setEpsNominees] = useState([
    { name: '', address: '', relationship: '', dateOfBirth: '', share: '' }
  ]);
  const [formFData, setFormFData] = useState({
    establishmentName: '',
    establishmentAddress: '',
    employeeName: '',
    sex: '',
    religion: '',
    maritalStatus: '',
    department: '',
    postHeld: '',
    ticketNumber: '',
    dateOfAppointment: '',
    village: '',
    thana: '',
    subdivision: '',
    postOffice: '',
    district: '',
    state: '',
    hasFamily: 'yes',
    fatherMotherDependent: '',
    husbandFatherMotherDependent: '',
    exclusionNoticeDate: '',
    signaturePlace: '',
    signatureDate: ''
  });
  const [formFNominees, setFormFNominees] = useState([
    { name: '', address: '', relationship: '', age: '', proportion: '' }
  ]);
  const [formFWitnesses, setFormFWitnesses] = useState([
    { name: '', address: '' },
    { name: '', address: '' }
  ]);
  const [form2Data, setForm2Data] = useState({
    employeeName: '',
    fatherHusbandName: '',
    dateOfBirth: '',
    sex: '',
    maritalStatus: '',
    accountNumber: '',
    permanentAddress: '',
    temporaryAddress: '',
    dateOfJoiningEPF: '',
    dateOfJoiningEPS: '',
    hasNoFamily: false,
    parentDependent: false,
    hasNoFamilyEPS: false,
    signaturePlace: '',
    signatureDate: ''
  });
  const [form2EPFNominees, setForm2EPFNominees] = useState([
    { name: '', address: '', relationship: '', dateOfBirth: '', sharePercentage: '', guardianName: '', guardianRelationship: '', guardianAddress: '' }
  ]);
  const [form2FamilyMembers, setForm2FamilyMembers] = useState([
    { name: '', address: '', dateOfBirth: '', relationship: '' }
  ]);
  const [form2EPSNominee, setForm2EPSNominee] = useState({
    name: '',
    address: '',
    dateOfBirth: '',
    relationship: ''
  });
  const [form2EmployerCert, setForm2EmployerCert] = useState({
    employeeName: '',
    place: '',
    date: '',
    designation: '',
    establishmentName: '',
    establishmentAddress: ''
  });
  const [medicalInsuranceData, setMedicalInsuranceData] = useState({
    employeeName: '',
    employeeCode: '',
    department: '',
    dateOfJoining: '',
    emailId: '',
    contactNumber: '',
    maritalStatus: '',
    spouseName: '',
    spouseDOB: '',
    fatherName: '',
    fatherDOB: '',
    motherName: '',
    motherDOB: '',
    employeeSignature: '',
    date: ''
  });
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [selfDeclarationData, setSelfDeclarationData] = useState({
    employeeName: '',
    fatherName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    maritalStatus: '',
    presentAddress: '',
    permanentAddress: '',
    mobileNumber: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactNumber: '',
    panNumber: '',
    aadhaarNumber: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    noCriminalCase: false,
    noConviction: false,
    noDismissal: false,
    place: '',
    date: ''
  });
  const [passportFile, setPassportFile] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('info'); 
  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [formsSubmitted, setFormsSubmitted] = useState({
    verification: false,
    joiningForm: false,
    form11: false,
    formF: false,
    form2: false,
    medicalInsurance: false,
    selfDeclaration: false
  });
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  useEffect(() => {
    if (joiningFormData.firstName || joiningFormData.lastName || joiningFormData.dob) {
      setForm11Data(prev => ({
        ...prev,
        employeeName: `${joiningFormData.firstName} ${joiningFormData.middleName || ''} ${joiningFormData.lastName}`.trim(),
        fatherOrHusbandName: joiningFormData.maritalStatus === 'Married' ? joiningFormData.spouseName : joiningFormData.fatherName,
        dateOfBirth: joiningFormData.dob,
        gender: joiningFormData.gender,
        permanentAddress: joiningFormData.permanentAddress,
        presentAddress: joiningFormData.presentAddress,
        maritalStatus: joiningFormData.maritalStatus,
        religion: joiningFormData.religion,
        ppanNumber: joiningFormData.panNumber,
        aadhaarNumber: joiningFormData.aadhaarNumber,
        mobileNumber: joiningFormData.phone,
        emailId: joiningFormData.emailId
      }));
      setFormFData(prev => ({
        ...prev,
        employeeName: `${joiningFormData.firstName} ${joiningFormData.middleName || ''} ${joiningFormData.lastName}`.trim(),
        sex: joiningFormData.gender,
        religion: joiningFormData.religion,
        maritalStatus: joiningFormData.maritalStatus,
        department: joiningFormData.department,
        postHeld: joiningFormData.designation
      }));
      setForm2Data(prev => ({
        ...prev,
        employeeName: `${joiningFormData.firstName} ${joiningFormData.middleName || ''} ${joiningFormData.lastName}`.trim(),
        fatherHusbandName: joiningFormData.maritalStatus === 'Married' ? joiningFormData.spouseName : joiningFormData.fatherName,
        dateOfBirth: joiningFormData.dob,
        sex: joiningFormData.gender,
        maritalStatus: joiningFormData.maritalStatus,
        permanentAddress: joiningFormData.permanentAddress,
        temporaryAddress: joiningFormData.presentAddress
      }));
      setMedicalInsuranceData(prev => ({
        ...prev,
        employeeName: `${joiningFormData.firstName} ${joiningFormData.middleName || ''} ${joiningFormData.lastName}`.trim(),
        emailId: joiningFormData.emailId,
        contactNumber: joiningFormData.phone,
        maritalStatus: joiningFormData.maritalStatus,
        spouseName: joiningFormData.spouseName,
        fatherName: joiningFormData.fatherName,
        motherName: joiningFormData.motherName
      }));
      setSelfDeclarationData(prev => ({
        ...prev,
        employeeName: `${joiningFormData.firstName} ${joiningFormData.middleName || ''} ${joiningFormData.lastName}`.trim(),
        fatherName: joiningFormData.fatherName,
        dateOfBirth: joiningFormData.dob,
        gender: joiningFormData.gender,
        maritalStatus: joiningFormData.maritalStatus,
        presentAddress: joiningFormData.presentAddress,
        permanentAddress: joiningFormData.permanentAddress,
        mobileNumber: joiningFormData.phone,
        panNumber: joiningFormData.panNumber,
        aadhaarNumber: joiningFormData.aadhaarNumber,
        emergencyContactName: joiningFormData.emergencyContactName,
        emergencyContactRelation: joiningFormData.emergencyContactRelation,
        emergencyContactNumber: joiningFormData.emergencyContactPhone
      }));
      if (joiningFormData.dob) {
        const birthDate = new Date(joiningFormData.dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        setSelfDeclarationData(prev => ({ ...prev, age: age.toString() }));
      }
    }
    if (verificationData.aadhaarNumber || verificationData.panNumber) {
      setJoiningFormData(prev => ({
        ...prev,
        aadhaarNumber: verificationData.aadhaarNumber || prev.aadhaarNumber,
        panNumber: verificationData.panNumber || prev.panNumber,
        bankAccountNumber: verificationData.accountNumber || prev.bankAccountNumber,
        bankIfsc: verificationData.ifsc || prev.bankIfsc
      }));
      setForm11Data(prev => ({
        ...prev,
        aadhaarNumber: verificationData.aadhaarNumber || prev.aadhaarNumber,
        ppanNumber: verificationData.panNumber || prev.ppanNumber
      }));
      setSelfDeclarationData(prev => ({
        ...prev,
        aadhaarNumber: verificationData.aadhaarNumber || prev.aadhaarNumber,
        panNumber: verificationData.panNumber || prev.panNumber
      }));
    }
  }, [joiningFormData, verificationData]);
  const isAutoFilled = (value) => {
    return value && value.trim() !== '';
  };
  const allFormsSubmitted = Object.values(formsSubmitted).every(status => status === true);
  const allPoliciesAcknowledged = policyAcknowledged;
  const handleVerificationSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...verificationData })
      });
      if (res.ok) {
        setVerificationStatus(prev => ({ ...prev, [activeVerificationStep]: 'verified' }));
        const allStepsVerified = ['aadhaar', 'otp', 'pan', 'bgv'].every(step => 
          step === activeVerificationStep || verificationStatus[step] === 'verified'
        );
        if (allStepsVerified) {
          setFormsSubmitted(prev => ({ ...prev, verification: true }));
        }
        alert('Verification step completed!');
      }
    } catch (error) {
      alert('Error during verification');
    } finally {
      setLoading(false);
    }
  };
  const getStatusIcon = (status) => {
    if (status === 'verified') return <CheckCircle2 className="w-3 h-3 text-green-500" />;
    return <Clock className="w-3 h-3 text-gray-400" />;
  };
  const renderVerificationForm = () => {
    const renderStepForm = () => {
      switch (activeVerificationStep) {
        case 'aadhaar':
          return (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                <input
                  type="text"
                  maxLength="12"
                  value={verificationData.aadhaarNumber}
                  onChange={(e) => setVerificationData({ ...verificationData, aadhaarNumber: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs transition-all duration-300"
                  placeholder="12-digit Aadhaar"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Aadhaar OTP *</label>
                <input
                  type="text"
                  maxLength="6"
                  value={verificationData.aadhaarOtp}
                  onChange={(e) => setVerificationData({ ...verificationData, aadhaarOtp: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs transition-all duration-300"
                  placeholder="6-digit OTP"
                />
              </div>
            </div>
          );
        case 'pan':
          return (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number *</label>
                <input
                  type="text"
                  maxLength="10"
                  value={verificationData.panNumber}
                  onChange={(e) => setVerificationData({ ...verificationData, panNumber: e.target.value.toUpperCase() })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs transition-all duration-300"
                  placeholder="PAN"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name as per PAN *</label>
                <input
                  type="text"
                  value={verificationData.panName}
                  onChange={(e) => setVerificationData({ ...verificationData, panName: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs transition-all duration-300"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={verificationData.panDob}
                  onChange={(e) => setVerificationData({ ...verificationData, panDob: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs transition-all duration-300"
                />
              </div>
            </div>
          );
        case 'bank':
          return (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  value={verificationData.accountNumber}
                  onChange={(e) => setVerificationData({ ...verificationData, accountNumber: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs transition-all duration-300"
                  placeholder="Bank Account"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  maxLength="11"
                  value={verificationData.ifsc}
                  onChange={(e) => setVerificationData({ ...verificationData, ifsc: e.target.value.toUpperCase() })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs transition-all duration-300"
                  placeholder="IFSC"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  value={verificationData.accountHolderName}
                  onChange={(e) => setVerificationData({ ...verificationData, accountHolderName: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs transition-all duration-300"
                  placeholder="Full Name"
                />
              </div>
            </div>
          );
        case 'esign':
          return (
            <div className="text-center py-8 animate-fadeIn">
              <FileText className="w-16 h-16 mx-auto text-teal-600 mb-4 transition-transform duration-300 hover:scale-110" />
              <p className="text-gray-600 mb-2">E-Sign Verification</p>
              <p className="text-xs text-gray-500">Click verify to complete the e-signature process</p>
            </div>
          );
        default:
          return null;
      }
    };
    const currentStep = VERIFICATION_STEPS.find(s => s.id === activeVerificationStep);
    const StepIcon = currentStep?.icon || ShieldCheck;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <StepIcon className="w-7 h-7 text-teal-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{currentStep?.label} Verification</h2>
            <p className="text-xs text-gray-500 mt-1">Status: {verificationStatus[activeVerificationStep]}</p>
          </div>
        </div>
        {renderStepForm()}
        <button
          onClick={handleVerificationSubmit}
          disabled={loading}
          className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 hover:scale-105 disabled:bg-gray-300 transition-all duration-300 text-sm font-medium"
        >
          {loading ? 'Verifying...' : `Verify ${currentStep?.label}`}
        </button>
      </div>
    );
  };
  const renderJoiningForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Employee Joining Form</h2>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Personal Details</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={joiningFormData.firstName}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, firstName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Middle Name</label>
            <input
              type="text"
              value={joiningFormData.middleName}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, middleName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={joiningFormData.lastName}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, lastName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Father's Name *</label>
            <input
              type="text"
              value={joiningFormData.fatherName}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, fatherName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mother's Name *</label>
            <input
              type="text"
              value={joiningFormData.motherName}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, motherName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Spouse Name</label>
            <input
              type="text"
              value={joiningFormData.spouseName}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, spouseName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
            <input
              type="date"
              value={joiningFormData.dob}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, dob: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
            <select
              value={joiningFormData.gender}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, gender: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Marital Status *</label>
            <select
              value={joiningFormData.maritalStatus}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, maritalStatus: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Marriage Date</label>
            <input
              type="date"
              value={joiningFormData.marriageDate}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, marriageDate: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group</label>
            <select
              value={joiningFormData.bloodGroup}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, bloodGroup: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            >
              <option value="">Select</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Religion</label>
            <input
              type="text"
              value={joiningFormData.religion}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, religion: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nationality *</label>
            <input
              type="text"
              value={joiningFormData.nationality}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, nationality: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              placeholder="Indian"
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Contact Details</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email ID *</label>
            <input
              type="email"
              value={joiningFormData.emailId}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, emailId: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              value={joiningFormData.phone}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, phone: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Present Address</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={joiningFormData.presentAddress}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, presentAddress: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={joiningFormData.presentCity}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, presentCity: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              value={joiningFormData.presentState}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, presentState: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pincode *</label>
            <input
              type="text"
              maxLength="6"
              value={joiningFormData.presentPincode}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, presentPincode: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700 border-b pb-2 flex-1">Permanent Address</h3>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={joiningFormData.sameAsPresent}
              onChange={(e) => {
                const checked = e.target.checked;
                setJoiningFormData({
                  ...joiningFormData,
                  sameAsPresent: checked,
                  permanentAddress: checked ? joiningFormData.presentAddress : '',
                  permanentCity: checked ? joiningFormData.presentCity : '',
                  permanentState: checked ? joiningFormData.presentState : '',
                  permanentPincode: checked ? joiningFormData.presentPincode : ''
                });
              }}
              className="w-3 h-3"
            />
            Same as Present Address
          </label>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={joiningFormData.permanentAddress}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, permanentAddress: e.target.value })}
              disabled={joiningFormData.sameAsPresent}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={joiningFormData.permanentCity}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, permanentCity: e.target.value })}
              disabled={joiningFormData.sameAsPresent}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              value={joiningFormData.permanentState}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, permanentState: e.target.value })}
              disabled={joiningFormData.sameAsPresent}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pincode *</label>
            <input
              type="text"
              maxLength="6"
              value={joiningFormData.permanentPincode}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, permanentPincode: e.target.value })}
              disabled={joiningFormData.sameAsPresent}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Emergency Contact</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={joiningFormData.emergencyContactName}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, emergencyContactName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Relation *</label>
            <input
              type="text"
              value={joiningFormData.emergencyContactRelation}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, emergencyContactRelation: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              value={joiningFormData.emergencyContactPhone}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, emergencyContactPhone: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={joiningFormData.emergencyContactAddress}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, emergencyContactAddress: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={joiningFormData.isFresher}
              onChange={(e) => {
                setJoiningFormData({ ...joiningFormData, isFresher: e.target.checked });
                if (e.target.checked) {
                  setExperienceDetails([]);
                }
              }}
              className="w-4 h-4 text-teal-600 focus:ring-teal-500 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">I am a Fresher</span>
              <p className="text-xs text-gray-500">Check this if you have no prior work experience</p>
            </div>
          </label>
        </div>
      </div>
      {}
      {!joiningFormData.isFresher && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Professional Details</h3>
          <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Total Experience *</label>
            <input
              type="text"
              value={joiningFormData.totalExperience}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, totalExperience: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              placeholder="e.g., 3 years"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Location</label>
            <input
              type="text"
              value={joiningFormData.preferredLocation}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, preferredLocation: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Source of Hire</label>
            <input
              type="text"
              value={joiningFormData.sourceOfHire}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, sourceOfHire: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              placeholder="e.g., LinkedIn, Referral"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={joiningFormData.designation}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, designation: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Offered Salary (Annual)</label>
            <input
              type="text"
              value={joiningFormData.offeredSalary}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, offeredSalary: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Department *</label>
            <input
              type="text"
              value={joiningFormData.department}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, department: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Key Skills</label>
            <input
              type="text"
              value={joiningFormData.keySkills}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, keySkills: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              placeholder="e.g., React, Node.js, Python"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Highest Qualification *</label>
            <input
              type="text"
              value={joiningFormData.highestQualification}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, highestQualification: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
        {}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-700">Work Experience Details (Optional)</h4>
              <p className="text-xs text-gray-500 mt-1">Mention your details from Last Organization to First Organization</p>
            </div>
            <button
              onClick={() => setExperienceDetails([...experienceDetails, { 
                organization: '', 
                doj: '', 
                dol: '', 
                designationAtJoining: '', 
                designationAtLeaving: '', 
                salaryAtJoining: '', 
                salaryAtLeaving: '', 
                reportingTo: '', 
                jobResponsibility: '', 
                reasonOfLeaving: '',
                relievingLetter: null
              }])}
              className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>
          {experienceDetails.length > 0 && experienceDetails.map((exp, index) => (
            <div key={index} className="border border-gray-200 rounded p-3 mb-3 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-600">Experience {index + 1}</span>
                <button
                  onClick={() => setExperienceDetails(experienceDetails.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Organization</label>
                  <input
                    type="text"
                    value={exp.organization}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].organization = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">DOJ (Date of Joining)</label>
                  <input
                    type="date"
                    value={exp.doj}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].doj = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">DOL (Date of Leaving)</label>
                  <input
                    type="date"
                    value={exp.dol}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].dol = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Desig. at Joining</label>
                  <input
                    type="text"
                    value={exp.designationAtJoining}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].designationAtJoining = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Desig. at Leaving</label>
                  <input
                    type="text"
                    value={exp.designationAtLeaving}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].designationAtLeaving = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salary at Joining</label>
                  <input
                    type="text"
                    value={exp.salaryAtJoining}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].salaryAtJoining = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                    placeholder="₹"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salary at Leaving</label>
                  <input
                    type="text"
                    value={exp.salaryAtLeaving}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].salaryAtLeaving = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                    placeholder="₹"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reporting to (Name & Designation)</label>
                  <input
                    type="text"
                    value={exp.reportingTo}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].reportingTo = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Responsibility</label>
                  <textarea
                    value={exp.jobResponsibility}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].jobResponsibility = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reason of Leaving</label>
                  <textarea
                    value={exp.reasonOfLeaving}
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].reasonOfLeaving = e.target.value;
                      setExperienceDetails(updated);
                    }}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Relieving Letter</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id={`relievingLetter-${index}`}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const updated = [...experienceDetails];
                      updated[index].relievingLetter = e.target.files[0];
                      setExperienceDetails(updated);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById(`relievingLetter-${index}`).click()}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    {exp.relievingLetter ? exp.relievingLetter.name.substring(0, 20) + (exp.relievingLetter.name.length > 20 ? '...' : '') : 'Upload Letter'}
                  </button>
                  {exp.relievingLetter && (
                    <span className="text-xs text-gray-500">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700 border-b pb-2 flex-1">Education Details</h3>
          <button
            onClick={() => setEducationDetails([...educationDetails, { level: '', institution: '', board: '', yearOfPassing: '', percentage: '', marksheet: null }])}
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
          >
            <Plus className="w-3 h-3" /> Add More
          </button>
        </div>
        {educationDetails.map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                {edu.level || `Education ${index + 1}`} {index < 3 && '*'}
              </span>
              {index >= 3 && (
                <button
                  onClick={() => setEducationDetails(educationDetails.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {index >= 3 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                  <input
                    type="text"
                    value={edu.level}
                    onChange={(e) => {
                      const updated = [...educationDetails];
                      updated[index].level = e.target.value;
                      setEducationDetails(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                    placeholder="e.g., Masters"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => {
                    const updated = [...educationDetails];
                    updated[index].institution = e.target.value;
                    setEducationDetails(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Board/University</label>
                <input
                  type="text"
                  value={edu.board}
                  onChange={(e) => {
                    const updated = [...educationDetails];
                    updated[index].board = e.target.value;
                    setEducationDetails(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Year of Passing</label>
                <input
                  type="text"
                  maxLength="4"
                  value={edu.yearOfPassing}
                  onChange={(e) => {
                    const updated = [...educationDetails];
                    updated[index].yearOfPassing = e.target.value;
                    setEducationDetails(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Percentage/CGPA</label>
                <input
                  type="text"
                  value={edu.percentage}
                  onChange={(e) => {
                    const updated = [...educationDetails];
                    updated[index].percentage = e.target.value;
                    setEducationDetails(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Marksheet</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const updated = [...educationDetails];
                    updated[index].marksheet = e.target.files[0];
                    setEducationDetails(updated);
                  }}
                  className="w-full text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Bank Details</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name *</label>
            <input
              type="text"
              value={joiningFormData.bankName}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, bankName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Account Number *</label>
            <input
              type="text"
              value={joiningFormData.bankAccountNumber}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, bankAccountNumber: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">IFSC Code *</label>
            <input
              type="text"
              maxLength="11"
              value={joiningFormData.bankIfsc}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, bankIfsc: e.target.value.toUpperCase() })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
            <input
              type="text"
              value={joiningFormData.bankBranch}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, bankBranch: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Statutory Details</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">PF Number</label>
            <input
              type="text"
              value={joiningFormData.pfNumber}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, pfNumber: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">UAN Number</label>
            <input
              type="text"
              value={joiningFormData.uanNumber}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, uanNumber: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ESIC Number</label>
            <input
              type="text"
              value={joiningFormData.esicNumber}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, esicNumber: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number *</label>
            <input
              type="text"
              maxLength="10"
              value={joiningFormData.panNumber}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, panNumber: e.target.value.toUpperCase() })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Number *</label>
            <input
              type="text"
              maxLength="12"
              value={joiningFormData.aadhaarNumber}
              onChange={(e) => setJoiningFormData({ ...joiningFormData, aadhaarNumber: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          const submissionData = {
            ...joiningFormData,
            educationDetails,
            ...(joiningFormData.isFresher 
              ? {} 
              : { experienceDetails }
            )
          };
          console.log('Joining Form Data:', submissionData);
          setFormsSubmitted(prev => ({ ...prev, joiningForm: true }));
          alert('Form submission will be implemented');
        }}
        disabled={loading}
        className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-300 transition-all text-sm font-medium"
      >
        {loading ? 'Submitting...' : 'Submit Joining Form'}
      </button>
    </div>
  );
  const renderForm11 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Form 11 - PF Nomination Form</h2>
        <p className="text-sm text-gray-500 mt-1">Declaration and Nomination Form (EPF & EPS)</p>
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Personal Details</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Name of Member *</label>
            <input
              type="text"
              value={form11Data.employeeName}
              onChange={(e) => setForm11Data({ ...form11Data, employeeName: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.employeeName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Father's/Husband's Name *
              {isAutoFilled(form11Data.fatherOrHusbandName) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={form11Data.fatherOrHusbandName}
              onChange={(e) => setForm11Data({ ...form11Data, fatherOrHusbandName: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.fatherOrHusbandName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Date of Birth *
              {isAutoFilled(form11Data.dateOfBirth) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="date"
              value={form11Data.dateOfBirth}
              onChange={(e) => setForm11Data({ ...form11Data, dateOfBirth: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.dateOfBirth) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Gender *
              {isAutoFilled(form11Data.gender) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <select
              value={form11Data.gender}
              onChange={(e) => setForm11Data({ ...form11Data, gender: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.gender) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Marital Status *
              {isAutoFilled(form11Data.maritalStatus) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <select
              value={form11Data.maritalStatus}
              onChange={(e) => setForm11Data({ ...form11Data, maritalStatus: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.maritalStatus) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Religion
              {isAutoFilled(form11Data.religion) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={form11Data.religion}
              onChange={(e) => setForm11Data({ ...form11Data, religion: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.religion) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              PAN Number
              {isAutoFilled(form11Data.ppanNumber) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              maxLength="10"
              value={form11Data.ppanNumber}
              onChange={(e) => setForm11Data({ ...form11Data, ppanNumber: e.target.value.toUpperCase() })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.ppanNumber) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Aadhaar Number *
              {isAutoFilled(form11Data.aadhaarNumber) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              maxLength="12"
              value={form11Data.aadhaarNumber}
              onChange={(e) => setForm11Data({ ...form11Data, aadhaarNumber: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.aadhaarNumber) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Mobile Number *
              {isAutoFilled(form11Data.mobileNumber) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="tel"
              maxLength="10"
              value={form11Data.mobileNumber}
              onChange={(e) => setForm11Data({ ...form11Data, mobileNumber: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.mobileNumber) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Email ID *
              {isAutoFilled(form11Data.emailId) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="email"
              value={form11Data.emailId}
              onChange={(e) => setForm11Data({ ...form11Data, emailId: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.emailId) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Permanent Address *
              {isAutoFilled(form11Data.permanentAddress) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <textarea
              value={form11Data.permanentAddress}
              onChange={(e) => setForm11Data({ ...form11Data, permanentAddress: e.target.value })}
              rows="2"
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.permanentAddress) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Present Address *
              {isAutoFilled(form11Data.presentAddress) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <textarea
              value={form11Data.presentAddress}
              onChange={(e) => setForm11Data({ ...form11Data, presentAddress: e.target.value })}
              rows="2"
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(form11Data.presentAddress) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Family Details</h3>
            <p className="text-xs text-gray-500 mt-1">Spouse, Children, Dependent Parents</p>
          </div>
          <button
            onClick={() => setFamilyMembers([...familyMembers, { name: '', relationship: '', dateOfBirth: '', nominee: false, share: '' }])}
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
        {familyMembers.map((member, index) => (
          <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600">Member {index + 1}</span>
              {familyMembers.length > 1 && (
                <button
                  onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => {
                    const updated = [...familyMembers];
                    updated[index].name = e.target.value;
                    setFamilyMembers(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={member.relationship}
                  onChange={(e) => {
                    const updated = [...familyMembers];
                    updated[index].relationship = e.target.value;
                    setFamilyMembers(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                >
                  <option value="">Select</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={member.dateOfBirth}
                  onChange={(e) => {
                    const updated = [...familyMembers];
                    updated[index].dateOfBirth = e.target.value;
                    setFamilyMembers(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.nominee}
                    onChange={(e) => {
                      const updated = [...familyMembers];
                      updated[index].nominee = e.target.checked;
                      setFamilyMembers(updated);
                    }}
                  />
                  <span className="text-xs">Nominee</span>
                </label>
                {member.nominee && (
                  <input
                    type="text"
                    value={member.share}
                    onChange={(e) => {
                      const updated = [...familyMembers];
                      updated[index].share = e.target.value;
                      setFamilyMembers(updated);
                    }}
                    placeholder="Share %"
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700 border-b pb-2 flex-1">EPF Nomination</h3>
          <button
            onClick={() => setEpfNominees([...epfNominees, { name: '', address: '', relationship: '', dateOfBirth: '', share: '' }])}
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Nominee
          </button>
        </div>
        {epfNominees.map((nominee, index) => (
          <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600">Nominee {index + 1}</span>
              {epfNominees.length > 1 && (
                <button
                  onClick={() => setEpfNominees(epfNominees.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={nominee.name}
                  onChange={(e) => {
                    const updated = [...epfNominees];
                    updated[index].name = e.target.value;
                    setEpfNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  value={nominee.relationship}
                  onChange={(e) => {
                    const updated = [...epfNominees];
                    updated[index].relationship = e.target.value;
                    setEpfNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={nominee.dateOfBirth}
                  onChange={(e) => {
                    const updated = [...epfNominees];
                    updated[index].dateOfBirth = e.target.value;
                    setEpfNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Share (%)</label>
                <input
                  type="text"
                  value={nominee.share}
                  onChange={(e) => {
                    const updated = [...epfNominees];
                    updated[index].share = e.target.value;
                    setEpfNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={nominee.address}
                  onChange={(e) => {
                    const updated = [...epfNominees];
                    updated[index].address = e.target.value;
                    setEpfNominees(updated);
                  }}
                  rows="2"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700 border-b pb-2 flex-1">EPS Nomination (Pension)</h3>
          <button
            onClick={() => setEpsNominees([...epsNominees, { name: '', address: '', relationship: '', dateOfBirth: '', share: '' }])}
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Nominee
          </button>
        </div>
        {epsNominees.map((nominee, index) => (
          <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600">Nominee {index + 1}</span>
              {epsNominees.length > 1 && (
                <button
                  onClick={() => setEpsNominees(epsNominees.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={nominee.name}
                  onChange={(e) => {
                    const updated = [...epsNominees];
                    updated[index].name = e.target.value;
                    setEpsNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  value={nominee.relationship}
                  onChange={(e) => {
                    const updated = [...epsNominees];
                    updated[index].relationship = e.target.value;
                    setEpsNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={nominee.dateOfBirth}
                  onChange={(e) => {
                    const updated = [...epsNominees];
                    updated[index].dateOfBirth = e.target.value;
                    setEpsNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Share (%)</label>
                <input
                  type="text"
                  value={nominee.share}
                  onChange={(e) => {
                    const updated = [...epsNominees];
                    updated[index].share = e.target.value;
                    setEpsNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={nominee.address}
                  onChange={(e) => {
                    const updated = [...epsNominees];
                    updated[index].address = e.target.value;
                    setEpsNominees(updated);
                  }}
                  rows="2"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Declaration</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Place</label>
            <input
              type="text"
              value={form11Data.signaturePlace}
              onChange={(e) => setForm11Data({ ...form11Data, signaturePlace: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form11Data.signatureDate}
              onChange={(e) => setForm11Data({ ...form11Data, signatureDate: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Witness Name</label>
            <input
              type="text"
              value={form11Data.witnessName}
              onChange={(e) => setForm11Data({ ...form11Data, witnessName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Witness Address</label>
            <textarea
              value={form11Data.witnessAddress}
              onChange={(e) => setForm11Data({ ...form11Data, witnessAddress: e.target.value })}
              rows="2"
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          const completeFormData = {
            ...form11Data,
            familyMembers,
            epfNominees,
            epsNominees
          };
          console.log('Form 11 Data:', completeFormData);
          setFormsSubmitted(prev => ({ ...prev, form11: true }));
          alert('Form 11 data will be used to generate official PDF on admin side');
        }}
        disabled={loading}
        className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-300 transition-all text-sm font-medium"
      >
        {loading ? 'Submitting...' : 'Submit Form 11'}
      </button>
    </div>
  );
  const renderFormF = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Form F - Gratuity Nomination</h2>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Establishment Details</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Name of Establishment *</label>
            <input
              type="text"
              value={formFData.establishmentName}
              onChange={(e) => setFormFData({ ...formFData, establishmentName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              placeholder="Full name of establishment"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Address *</label>
            <input
              type="text"
              value={formFData.establishmentAddress}
              onChange={(e) => setFormFData({ ...formFData, establishmentAddress: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              placeholder="Complete address of establishment"
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Employee Statement</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Name of Employee (Full) *
              {isAutoFilled(formFData.employeeName) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={formFData.employeeName}
              onChange={(e) => setFormFData({ ...formFData, employeeName: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(formFData.employeeName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              placeholder="Shri/Shrimati/Kumari"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Gender *
              {isAutoFilled(formFData.sex) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <select
              value={formFData.sex}
              onChange={(e) => setFormFData({ ...formFData, sex: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(formFData.sex) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Religion *
              {isAutoFilled(formFData.religion) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={formFData.religion}
              onChange={(e) => setFormFData({ ...formFData, religion: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(formFData.religion) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              Marital Status *
              {isAutoFilled(formFData.maritalStatus) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <select
              value={formFData.maritalStatus}
              onChange={(e) => setFormFData({ ...formFData, maritalStatus: e.target.value })}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-teal-500 text-xs ${
                isAutoFilled(formFData.maritalStatus) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Married">Married</option>
              <option value="Widow">Widow</option>
              <option value="Widower">Widower</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Department/Branch/Section *</label>
            <input
              type="text"
              value={formFData.department}
              onChange={(e) => setFormFData({ ...formFData, department: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Post Held *</label>
            <input
              type="text"
              value={formFData.postHeld}
              onChange={(e) => setFormFData({ ...formFData, postHeld: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ticket/Serial No.</label>
            <input
              type="text"
              value={formFData.ticketNumber}
              onChange={(e) => setFormFData({ ...formFData, ticketNumber: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date of Appointment *</label>
            <input
              type="date"
              value={formFData.dateOfAppointment}
              onChange={(e) => setFormFData({ ...formFData, dateOfAppointment: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
        {}
        <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded">
          <h4 className="text-sm font-semibold text-gray-700">Permanent Address</h4>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Village *</label>
              <input
                type="text"
                value={formFData.village}
                onChange={(e) => setFormFData({ ...formFData, village: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Thana *</label>
              <input
                type="text"
                value={formFData.thana}
                onChange={(e) => setFormFData({ ...formFData, thana: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sub-division *</label>
              <input
                type="text"
                value={formFData.subdivision}
                onChange={(e) => setFormFData({ ...formFData, subdivision: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Post Office *</label>
              <input
                type="text"
                value={formFData.postOffice}
                onChange={(e) => setFormFData({ ...formFData, postOffice: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
              <input
                type="text"
                value={formFData.district}
                onChange={(e) => setFormFData({ ...formFData, district: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                value={formFData.state}
                onChange={(e) => setFormFData({ ...formFData, state: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700 border-b pb-2 flex-1">Nominee(s) Details</h3>
          <button
            type="button"
            onClick={() => setFormFNominees([...formFNominees, { name: '', address: '', relationship: '', age: '', proportion: '' }])}
            className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded hover:bg-teal-100 transition-colors text-xs"
          >
            <Plus className="w-3 h-3" />
            Add Nominee
          </button>
        </div>
        {formFNominees.map((nominee, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded space-y-3 relative">
            {formFNominees.length > 1 && (
              <button
                type="button"
                onClick={() => setFormFNominees(formFNominees.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <h4 className="text-sm font-semibold text-gray-700">Nominee {index + 1}</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Name in Full *</label>
                <input
                  type="text"
                  value={nominee.name}
                  onChange={(e) => {
                    const updated = [...formFNominees];
                    updated[index].name = e.target.value;
                    setFormFNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  placeholder="Full name of nominee"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Address *</label>
                <input
                  type="text"
                  value={nominee.address}
                  onChange={(e) => {
                    const updated = [...formFNominees];
                    updated[index].address = e.target.value;
                    setFormFNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  placeholder="Complete address"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Relationship *</label>
                <select
                  value={nominee.relationship}
                  onChange={(e) => {
                    const updated = [...formFNominees];
                    updated[index].relationship = e.target.value;
                    setFormFNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                >
                  <option value="">Select</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  value={nominee.age}
                  onChange={(e) => {
                    const updated = [...formFNominees];
                    updated[index].age = e.target.value;
                    setFormFNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Proportion (%) *</label>
                <input
                  type="number"
                  value={nominee.proportion}
                  onChange={(e) => {
                    const updated = [...formFNominees];
                    updated[index].proportion = e.target.value;
                    setFormFNominees(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                  placeholder="%"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Declarations</h3>
        <div className="space-y-3 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Do you have family members as per Cl. (h) of Sec.2? *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasFamily"
                  value="yes"
                  checked={formFData.hasFamily === 'yes'}
                  onChange={(e) => setFormFData({ ...formFData, hasFamily: e.target.value })}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs">Yes (I certify that nominee(s) are family members)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasFamily"
                  value="no"
                  checked={formFData.hasFamily === 'no'}
                  onChange={(e) => setFormFData({ ...formFData, hasFamily: e.target.value })}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs">No (I have no family)</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Father/Mother/Parents Dependency</label>
              <select
                value={formFData.fatherMotherDependent}
                onChange={(e) => setFormFData({ ...formFData, fatherMotherDependent: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              >
                <option value="">Select</option>
                <option value="Father not dependent">Father not dependent</option>
                <option value="Mother not dependent">Mother not dependent</option>
                <option value="Parents not dependent">Parents not dependent</option>
                <option value="Father dependent">Father dependent</option>
                <option value="Mother dependent">Mother dependent</option>
                <option value="Parents dependent">Parents dependent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Husband's Father/Mother/Parents Dependency</label>
              <select
                value={formFData.husbandFatherMotherDependent}
                onChange={(e) => setFormFData({ ...formFData, husbandFatherMotherDependent: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
              >
                <option value="">Select</option>
                <option value="Not applicable">Not applicable</option>
                <option value="Father not dependent">Father not dependent</option>
                <option value="Mother not dependent">Mother not dependent</option>
                <option value="Parents not dependent">Parents not dependent</option>
                <option value="Father dependent">Father dependent</option>
                <option value="Mother dependent">Mother dependent</option>
                <option value="Parents dependent">Parents dependent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Exclusion Notice Date (if applicable)</label>
            <input
              type="date"
              value={formFData.exclusionNoticeDate}
              onChange={(e) => setFormFData({ ...formFData, exclusionNoticeDate: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
            <p className="text-xs text-gray-500 mt-1">If husband excluded from family by notice to controlling authority</p>
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Employee Signature</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Place *</label>
            <input
              type="text"
              value={formFData.signaturePlace}
              onChange={(e) => setFormFData({ ...formFData, signaturePlace: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={formFData.signatureDate}
              onChange={(e) => setFormFData({ ...formFData, signatureDate: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>
      </div>
      {}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Declaration by Witnesses</h3>
        {formFWitnesses.map((witness, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Witness {index + 1}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name in Full *</label>
                <input
                  type="text"
                  value={witness.name}
                  onChange={(e) => {
                    const updated = [...formFWitnesses];
                    updated[index].name = e.target.value;
                    setFormFWitnesses(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Address *</label>
                <input
                  type="text"
                  value={witness.address}
                  onChange={(e) => {
                    const updated = [...formFWitnesses];
                    updated[index].address = e.target.value;
                    setFormFWitnesses(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          const completeFormData = { ...formFData, nominees: formFNominees, witnesses: formFWitnesses };
          console.log('Form F Data:', completeFormData);
          setFormsSubmitted(prev => ({ ...prev, formF: true }));
          alert('Form F data will be used to generate official PDF on admin side');
        }}
        disabled={loading}
        className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-300 transition-all text-sm font-medium"
      >
        {loading ? 'Submitting...' : 'Submit Form F'}
      </button>
    </div>
  );
  const renderForm2 = () => (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <FileCheck className="w-6 h-6 text-teal-600" />
        <h2 className="text-xl font-semibold text-gray-800">Form 2 - EPF & EPS Nomination and Declaration Form</h2>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
          Employee Details
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Name (in block letters) *
              {isAutoFilled(form2Data.employeeName) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={form2Data.employeeName}
              onChange={(e) => setForm2Data({ ...form2Data, employeeName: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(form2Data.employeeName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Father's/Husband's Name *
              {isAutoFilled(form2Data.fatherHusbandName) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={form2Data.fatherHusbandName}
              onChange={(e) => setForm2Data({ ...form2Data, fatherHusbandName: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(form2Data.fatherHusbandName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Date of Birth *
              {isAutoFilled(form2Data.dateOfBirth) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="date"
              value={form2Data.dateOfBirth}
              onChange={(e) => setForm2Data({ ...form2Data, dateOfBirth: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(form2Data.dateOfBirth) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Sex *
              {isAutoFilled(form2Data.sex) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <select
              value={form2Data.sex}
              onChange={(e) => setForm2Data({ ...form2Data, sex: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(form2Data.sex) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Marital Status *
              {isAutoFilled(form2Data.maritalStatus) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <select
              value={form2Data.maritalStatus}
              onChange={(e) => setForm2Data({ ...form2Data, maritalStatus: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(form2Data.maritalStatus) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select</option>
              <option value="Married">Married</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Account Number *</label>
            <input
              type="text"
              value={form2Data.accountNumber}
              onChange={(e) => setForm2Data({ ...form2Data, accountNumber: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Permanent Address *
              {isAutoFilled(form2Data.permanentAddress) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <textarea
              value={form2Data.permanentAddress}
              onChange={(e) => setForm2Data({ ...form2Data, permanentAddress: e.target.value })}
              rows={2}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(form2Data.permanentAddress) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Temporary Address
              {isAutoFilled(form2Data.temporaryAddress) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <textarea
              value={form2Data.temporaryAddress}
              onChange={(e) => setForm2Data({ ...form2Data, temporaryAddress: e.target.value })}
              rows={2}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(form2Data.temporaryAddress) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Joining EPF *</label>
            <input
              type="date"
              value={form2Data.dateOfJoiningEPF}
              onChange={(e) => setForm2Data({ ...form2Data, dateOfJoiningEPF: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Joining EPS</label>
            <input
              type="date"
              value={form2Data.dateOfJoiningEPS}
              onChange={(e) => setForm2Data({ ...form2Data, dateOfJoiningEPS: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
          Part A - EPF Nomination
        </h3>
        {}
        <div className="mb-4 space-y-2 bg-gray-100 p-4 rounded">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={form2Data.hasNoFamily}
              onChange={(e) => setForm2Data({ ...form2Data, hasNoFamily: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-gray-700">I have no family and I nominate the following person</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={form2Data.parentDependent}
              onChange={(e) => setForm2Data({ ...form2Data, parentDependent: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-gray-700">I have family but my parents are dependent on me</span>
          </label>
        </div>
        {form2EPFNominees.map((nominee, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-700">EPF Nominee {index + 1}</h4>
              {form2EPFNominees.length > 1 && (
                <button
                  onClick={() => setForm2EPFNominees(form2EPFNominees.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Name of Nominee *</label>
                <input
                  type="text"
                  value={nominee.name}
                  onChange={(e) => {
                    const updated = [...form2EPFNominees];
                    updated[index].name = e.target.value;
                    setForm2EPFNominees(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Address *</label>
                <input
                  type="text"
                  value={nominee.address}
                  onChange={(e) => {
                    const updated = [...form2EPFNominees];
                    updated[index].address = e.target.value;
                    setForm2EPFNominees(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Relationship *</label>
                <input
                  type="text"
                  value={nominee.relationship}
                  onChange={(e) => {
                    const updated = [...form2EPFNominees];
                    updated[index].relationship = e.target.value;
                    setForm2EPFNominees(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  value={nominee.dateOfBirth}
                  onChange={(e) => {
                    const updated = [...form2EPFNominees];
                    updated[index].dateOfBirth = e.target.value;
                    setForm2EPFNominees(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Share Percentage *</label>
                <input
                  type="number"
                  value={nominee.sharePercentage}
                  onChange={(e) => {
                    const updated = [...form2EPFNominees];
                    updated[index].sharePercentage = e.target.value;
                    setForm2EPFNominees(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">If nominee is minor, provide guardian details:</label>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Guardian Name</label>
                <input
                  type="text"
                  value={nominee.guardianName}
                  onChange={(e) => {
                    const updated = [...form2EPFNominees];
                    updated[index].guardianName = e.target.value;
                    setForm2EPFNominees(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Guardian Relationship</label>
                <input
                  type="text"
                  value={nominee.guardianRelationship}
                  onChange={(e) => {
                    const updated = [...form2EPFNominees];
                    updated[index].guardianRelationship = e.target.value;
                    setForm2EPFNominees(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Guardian Address</label>
                <input
                  type="text"
                  value={nominee.guardianAddress}
                  onChange={(e) => {
                    const updated = [...form2EPFNominees];
                    updated[index].guardianAddress = e.target.value;
                    setForm2EPFNominees(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => setForm2EPFNominees([...form2EPFNominees, {
            name: '', address: '', relationship: '', dateOfBirth: '', sharePercentage: '',
            guardianName: '', guardianRelationship: '', guardianAddress: ''
          }])}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 border border-teal-300 rounded transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Another EPF Nominee
        </button>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
          Part B - EPS Family Details
        </h3>
        {}
        <div className="mb-4 bg-gray-100 p-4 rounded">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={form2Data.hasNoFamilyEPS}
              onChange={(e) => setForm2Data({ ...form2Data, hasNoFamilyEPS: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-gray-700">I have no family (unmarried/no spouse/no children) and I nominate the following person for widow pension</span>
          </label>
        </div>
        {!form2Data.hasNoFamilyEPS ? (
          <>
            {form2FamilyMembers.map((member, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Family Member {index + 1}</h4>
                  {form2FamilyMembers.length > 1 && (
                    <button
                      onClick={() => setForm2FamilyMembers(form2FamilyMembers.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...form2FamilyMembers];
                        updated[index].name = e.target.value;
                        setForm2FamilyMembers(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Address *</label>
                    <input
                      type="text"
                      value={member.address}
                      onChange={(e) => {
                        const updated = [...form2FamilyMembers];
                        updated[index].address = e.target.value;
                        setForm2FamilyMembers(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Birth *</label>
                    <input
                      type="date"
                      value={member.dateOfBirth}
                      onChange={(e) => {
                        const updated = [...form2FamilyMembers];
                        updated[index].dateOfBirth = e.target.value;
                        setForm2FamilyMembers(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Relationship *</label>
                    <input
                      type="text"
                      value={member.relationship}
                      onChange={(e) => {
                        const updated = [...form2FamilyMembers];
                        updated[index].relationship = e.target.value;
                        setForm2FamilyMembers(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setForm2FamilyMembers([...form2FamilyMembers, {
                name: '', address: '', dateOfBirth: '', relationship: ''
              }])}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 border border-teal-300 rounded transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Another Family Member
            </button>
          </>
        ) : (
          <div className="p-4 border border-gray-200 rounded">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">EPS Nominee (For Unmarried/No Family)</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form2EPSNominee.name}
                  onChange={(e) => setForm2EPSNominee({ ...form2EPSNominee, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Address *</label>
                <input
                  type="text"
                  value={form2EPSNominee.address}
                  onChange={(e) => setForm2EPSNominee({ ...form2EPSNominee, address: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  value={form2EPSNominee.dateOfBirth}
                  onChange={(e) => setForm2EPSNominee({ ...form2EPSNominee, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Relationship *</label>
                <input
                  type="text"
                  value={form2EPSNominee.relationship}
                  onChange={(e) => setForm2EPSNominee({ ...form2EPSNominee, relationship: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
          Employer Certificate
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Employee Name *</label>
            <input
              type="text"
              value={form2EmployerCert.employeeName}
              onChange={(e) => setForm2EmployerCert({ ...form2EmployerCert, employeeName: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Place *</label>
            <input
              type="text"
              value={form2EmployerCert.place}
              onChange={(e) => setForm2EmployerCert({ ...form2EmployerCert, place: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
            <input
              type="date"
              value={form2EmployerCert.date}
              onChange={(e) => setForm2EmployerCert({ ...form2EmployerCert, date: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Employer Designation *</label>
            <input
              type="text"
              value={form2EmployerCert.designation}
              onChange={(e) => setForm2EmployerCert({ ...form2EmployerCert, designation: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Establishment Name *</label>
            <input
              type="text"
              value={form2EmployerCert.establishmentName}
              onChange={(e) => setForm2EmployerCert({ ...form2EmployerCert, establishmentName: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Establishment Address *</label>
            <textarea
              value={form2EmployerCert.establishmentAddress}
              onChange={(e) => setForm2EmployerCert({ ...form2EmployerCert, establishmentAddress: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
          Employee Signature
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Place *</label>
            <input
              type="text"
              value={form2Data.signaturePlace}
              onChange={(e) => setForm2Data({ ...form2Data, signaturePlace: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
            <input
              type="date"
              value={form2Data.signatureDate}
              onChange={(e) => setForm2Data({ ...form2Data, signatureDate: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>
      {}
      <button
        onClick={() => {
          const completeForm2Data = {
            ...form2Data,
            epfNominees: form2EPFNominees,
            familyMembers: form2FamilyMembers,
            epsNominee: form2EPSNominee,
            employerCert: form2EmployerCert
          };
          console.log('Form 2 Data:', completeForm2Data);
          setFormsSubmitted(prev => ({ ...prev, form2: true }));
          alert('Form 2 data will be used to generate official PDF on admin side');
        }}
        disabled={loading}
        className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-300 transition-all text-sm font-medium"
      >
        {loading ? 'Submitting...' : 'Submit Form 2'}
      </button>
    </div>
  );
  const renderMedicalInsurance = () => (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-teal-600" />
        <h2 className="text-xl font-semibold text-gray-800">Medical Insurance Enrollment Form</h2>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
          Employee Details
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Employee Name *
              {isAutoFilled(medicalInsuranceData.employeeName) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={medicalInsuranceData.employeeName}
              onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, employeeName: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(medicalInsuranceData.employeeName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Employee Number *</label>
            <input
              type="text"
              value={medicalInsuranceData.employeeNumber}
              onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, employeeNumber: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Joining *</label>
            <input
              type="date"
              value={medicalInsuranceData.dateOfJoining}
              onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, dateOfJoining: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Department *</label>
            <input
              type="text"
              value={medicalInsuranceData.department}
              onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, department: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Designation *</label>
            <input
              type="text"
              value={medicalInsuranceData.designation}
              onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, designation: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Contact Number *
              {isAutoFilled(medicalInsuranceData.contactNumber) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="tel"
              value={medicalInsuranceData.contactNumber}
              onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, contactNumber: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(medicalInsuranceData.contactNumber) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Email ID *
              {isAutoFilled(medicalInsuranceData.emailId) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="email"
              value={medicalInsuranceData.emailId}
              onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, emailId: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(medicalInsuranceData.emailId) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn transition-all hover:shadow-md">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
          Family Details
        </h3>
        <div className="space-y-4">
          {}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                Marital Status *
                {isAutoFilled(medicalInsuranceData.maritalStatus) && (
                  <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
                )}
              </label>
              <select
                value={medicalInsuranceData.maritalStatus}
                onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, maritalStatus: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
              >
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>
          </div>
          {}
          {medicalInsuranceData.maritalStatus === 'Married' && (
            <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded animate-fadeIn">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Spouse Name</label>
                <input
                  type="text"
                  value={medicalInsuranceData.spouseName}
                  onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, spouseName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Spouse Date of Birth</label>
                <input
                  type="date"
                  value={medicalInsuranceData.spouseDOB}
                  onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, spouseDOB: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
                />
              </div>
            </div>
          )}
          {}
          {medicalInsuranceData.maritalStatus === 'Married' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-700">Children Details (Optional)</h4>
                <button
                  type="button"
                  onClick={() => setChildrenDetails([...childrenDetails, { name: '', dob: '' }])}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Child
                </button>
              </div>
              {childrenDetails.length > 0 && childrenDetails.map((child, index) => (
                <div key={index} className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded animate-fadeIn border border-gray-200">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Child {index + 1} Name</label>
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => {
                        const updated = [...childrenDetails];
                        updated[index].name = e.target.value;
                        setChildrenDetails(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      value={child.dob}
                      onChange={(e) => {
                        const updated = [...childrenDetails];
                        updated[index].dob = e.target.value;
                        setChildrenDetails(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => setChildrenDetails(childrenDetails.filter((_, i) => i !== index))}
                      className="w-full px-2 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-300 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {}
          <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Father's Name</label>
              <input
                type="text"
                value={medicalInsuranceData.fatherName}
                onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, fatherName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Father's Date of Birth</label>
              <input
                type="date"
                value={medicalInsuranceData.fatherDOB}
                onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, fatherDOB: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Mother's Name</label>
              <input
                type="text"
                value={medicalInsuranceData.motherName}
                onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, motherName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Mother's Date of Birth</label>
              <input
                type="date"
                value={medicalInsuranceData.motherDOB}
                onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, motherDOB: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn transition-all hover:shadow-md">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
          Declaration
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
            <input
              type="date"
              value={medicalInsuranceData.date}
              onChange={(e) => setMedicalInsuranceData({ ...medicalInsuranceData, date: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>
      {}
      <button
        onClick={() => {
          console.log('Medical Insurance Data:', medicalInsuranceData);
          setFormsSubmitted(prev => ({ ...prev, medicalInsurance: true }));
          alert('Medical Insurance data will be used to generate official PDF on admin side');
        }}
        disabled={loading}
        className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 hover:scale-105 disabled:bg-gray-300 transition-all duration-300 text-sm font-medium"
      >
        {loading ? 'Submitting...' : 'Submit Medical Insurance Form'}
      </button>
    </div>
  );
  const renderSelfDeclaration = () => (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-teal-600" />
        <h2 className="text-xl font-semibold text-gray-800">Self Declaration Form</h2>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
          Personal Details
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Name of the Employee *
              {isAutoFilled(selfDeclarationData.employeeName) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={selfDeclarationData.employeeName}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, employeeName: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.employeeName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Father's Name *
              {isAutoFilled(selfDeclarationData.fatherName) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={selfDeclarationData.fatherName}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, fatherName: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.fatherName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Date of Birth *
              {isAutoFilled(selfDeclarationData.dateOfBirth) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="date"
              value={selfDeclarationData.dateOfBirth}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, dateOfBirth: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.dateOfBirth) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Age *</label>
            <input
              type="number"
              value={selfDeclarationData.age}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, age: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Gender *
              {isAutoFilled(selfDeclarationData.gender) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <select
              value={selfDeclarationData.gender}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, gender: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.gender) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Marital Status *
              {isAutoFilled(selfDeclarationData.maritalStatus) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <select
              value={selfDeclarationData.maritalStatus}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, maritalStatus: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.maritalStatus) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
          Address Details
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-4">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Present Address *
              {isAutoFilled(selfDeclarationData.presentAddress) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <textarea
              value={selfDeclarationData.presentAddress}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, presentAddress: e.target.value })}
              rows={2}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.presentAddress) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-4">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Permanent Address *
              {isAutoFilled(selfDeclarationData.permanentAddress) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <textarea
              value={selfDeclarationData.permanentAddress}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, permanentAddress: e.target.value })}
              rows={2}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.permanentAddress) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
          Contact Details
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Mobile Number *
              {isAutoFilled(selfDeclarationData.mobileNumber) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="tel"
              value={selfDeclarationData.mobileNumber}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, mobileNumber: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.mobileNumber) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
          Emergency Contact
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Name *
              {isAutoFilled(selfDeclarationData.emergencyContactName) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={selfDeclarationData.emergencyContactName}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, emergencyContactName: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.emergencyContactName) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Relation *
              {isAutoFilled(selfDeclarationData.emergencyContactRelation) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={selfDeclarationData.emergencyContactRelation}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, emergencyContactRelation: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.emergencyContactRelation) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Contact Number *
              {isAutoFilled(selfDeclarationData.emergencyContactNumber) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="tel"
              value={selfDeclarationData.emergencyContactNumber}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, emergencyContactNumber: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.emergencyContactNumber) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
          ID Proof Details
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              PAN Number *
              {isAutoFilled(selfDeclarationData.panNumber) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              maxLength="10"
              value={selfDeclarationData.panNumber}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, panNumber: e.target.value.toUpperCase() })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.panNumber) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Aadhaar Number *
              {isAutoFilled(selfDeclarationData.aadhaarNumber) && (
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              maxLength="12"
              value={selfDeclarationData.aadhaarNumber}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, aadhaarNumber: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                isAutoFilled(selfDeclarationData.aadhaarNumber) ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Passport Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selfDeclarationData.passportNumber}
                onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, passportNumber: e.target.value.toUpperCase() })}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter passport number"
              />
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setPassportFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-all text-xs whitespace-nowrap">
                  <Upload className="w-3 h-3" />
                  {passportFile ? passportFile.name.substring(0, 15) + '...' : 'Upload'}
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Issue Date</label>
            <input
              type="date"
              value={selfDeclarationData.passportIssueDate}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, passportIssueDate: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Expiry Date</label>
            <input
              type="date"
              value={selfDeclarationData.passportExpiryDate}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, passportExpiryDate: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
          Declaration
        </h3>
        <div className="space-y-3 bg-gray-50 p-4 rounded">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={selfDeclarationData.noCriminalCase}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, noCriminalCase: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-gray-700">
              I hereby declare that there is no criminal case pending against me in any court of law
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={selfDeclarationData.noConviction}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, noConviction: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-gray-700">
              I have not been convicted by any court of law
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={selfDeclarationData.noDismissal}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, noDismissal: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs text-gray-700">
              I have not been dismissed or removed from any previous employment on account of misconduct
            </span>
          </label>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Place *</label>
            <input
              type="text"
              value={selfDeclarationData.place}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, place: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
            <input
              type="date"
              value={selfDeclarationData.date}
              onChange={(e) => setSelfDeclarationData({ ...selfDeclarationData, date: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>
      {}
      <button
        onClick={() => {
          console.log('Self Declaration Data:', selfDeclarationData);
          setFormsSubmitted(prev => ({ ...prev, selfDeclaration: true }));
          alert('Self Declaration data will be used to generate official PDF on admin side');
        }}
        disabled={loading}
        className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-300 transition-all text-sm font-medium"
      >
        {loading ? 'Submitting...' : 'Submit Self Declaration'}
      </button>
    </div>
  );
  const renderPolicyAcknowledgment = () => (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <BookMarked className="w-6 h-6 text-teal-600" />
        <h2 className="text-xl font-semibold text-gray-800">Company Policies - Acknowledgment Required</h2>
      </div>
      {}
      <div className="bg-white rounded-lg shadow-md border-2 border-gray-300 overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b-2 border-gray-300">
          <h3 className="text-base font-bold text-gray-800">ESME Company Policies Document</h3>
          <p className="text-xs text-gray-600 mt-1">Please scroll through and read all company policies below</p>
        </div>
        {}
        <div className="bg-white" style={{ height: '800px', overflow: 'auto' }}>
          <iframe
            src="/Esme Policies.pdf#view=FitH&zoom=100&toolbar=0&navpanes=0"
            className="w-full border-0"
            style={{ 
              height: '100%',
              minHeight: '800px',
              backgroundColor: 'white',
              display: 'block'
            }}
            title="ESME Company Policies"
          />
        </div>
        {}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-t-2 border-gray-300">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Complete Company Policies Document</span>
          </div>
          <a
            href="/Esme Policies.pdf"
            download
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      </div>
      {}
      <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-sm">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={policyAcknowledged}
            onChange={(e) => setPolicyAcknowledged(e.target.checked)}
            className="mt-1 w-6 h-6 text-teal-600 focus:ring-2 focus:ring-teal-500 cursor-pointer flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-800 mb-2">
              I acknowledge that I have read and understood all company policies
            </p>
            <p className="text-sm text-gray-600">
              By checking this box, I confirm that I have carefully reviewed all the company policies presented in the document above and agree to abide by them during my employment with ESME Consumer (P) Ltd.
            </p>
          </div>
        </label>
      </div>
      {}
      <div className={`p-4 rounded-lg border-2 ${
        policyAcknowledged 
          ? 'border-green-500 bg-white' 
          : 'border-gray-300 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          {policyAcknowledged ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Policy Acknowledgment Complete</p>
                <p className="text-xs text-gray-600">You have acknowledged all company policies</p>
              </div>
            </>
          ) : (
            <>
              <Clock className="w-6 h-6 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Pending Acknowledgment</p>
                <p className="text-xs text-gray-600">Please read the policies and check the box above to proceed</p>
              </div>
            </>
          )}
        </div>
      </div>
      {}
      {policyAcknowledged && allFormsSubmitted && (
        <div className="bg-white border-2 border-green-500 rounded-lg p-6 animate-fadeIn shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-green-800">Ready to Complete Onboarding!</h3>
              <p className="text-sm text-gray-700">
                You have successfully completed all forms and acknowledged all company policies. Click the button below to submit your complete onboarding application.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch(`${API_URL}/candidate/submit-onboarding`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: user.email,
                    policyAcknowledged: true,
                    submissionDate: new Date().toISOString()
                  })
                });
                if (res.ok) {
                  alert('🎉 Congratulations! Your onboarding application has been submitted successfully. Our HR team will review your application and get back to you soon.');
                } else {
                  alert('Submission failed. Please try again.');
                }
              } catch (error) {
                alert('Error during submission. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-all text-base font-bold shadow-lg hover:shadow-xl"
          >
            {loading ? 'Submitting Application...' : '✓ Submit Complete Onboarding Application'}
          </button>
        </div>
      )}
    </div>
  );
  const handlePasswordChange = async () => {
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    if (!profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword) {
      setPasswordChangeError('All password fields are required');
      return;
    }
    if (profileData.newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters');
      return;
    }
    if (profileData.newPassword !== profileData.confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordChangeSuccess('Password changed successfully!');
        setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordChangeError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordChangeError('Error changing password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const renderProfileSettings = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
      {}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveProfileTab('info')}
          className={`px-4 py-2 font-medium text-sm transition-all ${
            activeProfileTab === 'info'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveProfileTab('password')}
          className={`px-4 py-2 font-medium text-sm transition-all ${
            activeProfileTab === 'password'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => setActiveProfileTab('forms')}
          className={`px-4 py-2 font-medium text-sm transition-all ${
            activeProfileTab === 'forms'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Generated Forms
        </button>
      </div>
      {}
      {activeProfileTab === 'info' && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            User Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-800 border border-gray-200">
                {user.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-800 border border-gray-200">
                {user.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mobile</label>
              <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-800 border border-gray-200">
                {user.mobile}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
              <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-800 border border-gray-200">
                Candidate
              </div>
            </div>
          </div>
        </div>
      )}
      {}
      {activeProfileTab === 'password' && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-600" />
            Change Password
          </h3>
          {passwordChangeError && (
            <div className="px-4 py-3 border border-gray-300 rounded text-sm text-gray-800 animate-fadeIn">
              ❌ {passwordChangeError}
            </div>
          )}
          {passwordChangeSuccess && (
            <div className="px-4 py-3 border border-gray-300 rounded text-sm text-gray-800 animate-fadeIn">
              ✓ {passwordChangeSuccess}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                  placeholder="Enter new password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={loading}
            className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-300 transition-all text-sm font-medium"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
        </div>
      )}
      {}
      {activeProfileTab === 'forms' && (
        <div className="bg-white rounded-lg shadow-sm p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-teal-600" />
            Generated Forms
          </h3>
          {!allFormsSubmitted ? (
            <div className="px-4 py-3 border border-gray-300 rounded text-sm text-gray-700">
              Complete all forms to view your generated documents
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">All forms have been submitted successfully. You can download your generated documents below.</p>
              <div className="grid gap-3">
                {[
                  { name: 'Joining Form', key: 'joining' },
                  { name: 'Form 11 (PF)', key: 'form11' },
                  { name: 'Form F (Gratuity)', key: 'formF' },
                  { name: 'Form 2 (EPF & EPS)', key: 'form2' },
                  { name: 'Medical Insurance Form', key: 'medicalInsurance' },
                  { name: 'Self Declaration', key: 'selfDeclaration' }
                ].map((form) => (
                  <div key={form.key} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:border-teal-300 transition-all">
                    <div className="flex items-center gap-3">
                      <FileImage className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium text-gray-800">{form.name}</span>
                    </div>
                    <button className="px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 transition-all text-xs font-medium flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200 hover:border-purple-400 transition-all">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-800">Policy Acknowledgment</span>
                  </div>
                  <button 
                    onClick={() => {
                      try {
                        const doc = generatePolicyAcknowledgment(user);
                        doc.save(`Policy_Acknowledgment_${user.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
                      } catch (error) {
                        console.error('Error generating policy acknowledgment:', error);
                        alert('Failed to generate policy acknowledgment');
                      }
                    }}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all text-xs font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <img src={EsmeLogo} alt="ESME" className="h-8 transition-opacity duration-300" />}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-sm"
          >
            {sidebarOpen ? <X className="w-5 h-5 transition-transform duration-300" /> : <Menu className="w-5 h-5 transition-transform duration-300" />}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div>
            <button
              onClick={() => {
                setVerificationExpanded(!verificationExpanded);
                setActiveSection('verification');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slideIn ${
                activeSection === 'verification' ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
              }`}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
              {sidebarOpen && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">Verification</span>
                  {verificationExpanded ? <ChevronDown className="w-4 h-4 transition-transform duration-300" /> : <ChevronRight className="w-4 h-4 transition-transform duration-300" />}
                </>
              )}
            </button>
            {}
            {verificationExpanded && sidebarOpen && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-3 animate-fadeIn">
                {VERIFICATION_STEPS.map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        setActiveVerificationStep(step.id);
                        setActiveSection('verification');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 text-xs ${
                        activeVerificationStep === step.id ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
                      }`}
                    >
                      <StepIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-300" />
                      <span className="font-medium flex-1 text-left">{step.label}</span>
                      {getStatusIcon(verificationStatus[step.id])}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => setActiveSection('joining')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slideIn ${
              activeSection === 'joining' ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
            }`}
          >
            <FileText className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Joining Form</span>}
          </button>
          <button
            onClick={() => setActiveSection('form11')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slideIn ${
              activeSection === 'form11' ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
            }`}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Form 11 (PF)</span>}
          </button>
          <button
            onClick={() => setActiveSection('formF')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slideIn ${
              activeSection === 'formF' ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
            }`}
          >
            <Award className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Form F (Gratuity)</span>}
          </button>
          <button
            onClick={() => setActiveSection('form2')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slideIn ${
              activeSection === 'form2' ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
            }`}
          >
            <FileCheck className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Form 2 (EPF & EPS)</span>}
          </button>
          <button
            onClick={() => setActiveSection('medicalInsurance')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slideIn ${
              activeSection === 'medicalInsurance' ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
            }`}
          >
            <Heart className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Medical Insurance</span>}
          </button>
          <button
            onClick={() => setActiveSection('selfDeclaration')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slideIn ${
              activeSection === 'selfDeclaration' ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
            }`}
          >
            <ClipboardCheck className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Self Declaration</span>}
          </button>
          {}
          <button
            onClick={() => setActiveSection('policyAcknowledgment')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slideIn ${
              activeSection === 'policyAcknowledgment' 
                ? 'bg-teal-50 text-teal-700 scale-105 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-sm'
            }`}
          >
            <BookMarked className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
            {sidebarOpen && (
              <div className="flex items-center justify-between flex-1">
                <span className="text-sm font-medium text-left">Policy Acknowledgment</span>
                {allPoliciesAcknowledged ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            )}
          </button>
        </nav>
        {}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
              <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Need Help?
              </h3>
              <p className="text-[10px] text-gray-600 mb-2 leading-tight">
                Contact HR if you face issues with documents.
              </p>
              <div className="space-y-1.5">
                <a 
                  href="mailto:mayur.dhikyan@esmeconsumer.in" 
                  className="flex items-start gap-1.5 group"
                >
                  <Mail className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] text-teal-600 hover:text-teal-700 hover:underline break-all">
                    mayur.dhikyan@esmeconsumer.in
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm"
          >
            <LogOut className="w-5 h-5 transition-transform duration-300" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto flex flex-col">
        {}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-800">ESME Onboarding Portal</h1>
            <p className="text-xs text-gray-500">Complete your onboarding process</p>
          </div>
          {}
          <div className="relative profile-dropdown-container">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md"
            >
              <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-teal-700" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl animate-fadeIn z-20">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-teal-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.mobile}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setActiveSection('profile');
                      setActiveProfileTab('info');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('profile');
                      setActiveProfileTab('password');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all text-sm"
                  >
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('profile');
                      setActiveProfileTab('forms');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all text-sm"
                  >
                    <FileImage className="w-4 h-4" />
                    <span>View Generated Forms</span>
                  </button>
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeSection === 'verification' && activeVerificationStep === 'aadhaar' && (
              <div className="mb-6 animate-fadeIn">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome, {user.name}</h1>
                <p className="text-sm text-gray-500">Complete verification to proceed with onboarding</p>
              </div>
            )}
            {activeSection === 'verification' && <div className="animate-fadeIn">{renderVerificationForm()}</div>}
            {activeSection === 'joining' && <div className="animate-fadeIn">{renderJoiningForm()}</div>}
            {activeSection === 'form11' && <div className="animate-fadeIn">{renderForm11()}</div>}
            {activeSection === 'formF' && <div className="animate-fadeIn">{renderFormF()}</div>}
            {activeSection === 'form2' && <div className="animate-fadeIn">{renderForm2()}</div>}
            {activeSection === 'medicalInsurance' && <div className="animate-fadeIn">{renderMedicalInsurance()}</div>}
            {activeSection === 'selfDeclaration' && <div className="animate-fadeIn">{renderSelfDeclaration()}</div>}
            {activeSection === 'policyAcknowledgment' && <div className="animate-fadeIn">{renderPolicyAcknowledgment()}</div>}
            {activeSection === 'profile' && <div className="animate-fadeIn">{renderProfileSettings()}</div>}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
