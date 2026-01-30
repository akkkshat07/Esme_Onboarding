import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, ChevronLeft, Info, User, Briefcase, Home, Users, GraduationCap, Heart, Plus, Trash2, Building, Phone, FileText } from 'lucide-react';
import SignatureCapture from './SignatureCapture';


export default function EmployeeJoiningForm({ formData, onFormDataChange, onNext, onBack }) {
  const { isDark } = useTheme();
  
  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age.toString() : '';
  };

  const [joiningData, setJoiningData] = useState({
    // Employment Details (at top as per form)
    dateOfJoining: formData.dateOfJoining || '',
    designation: formData.designation || formData.profession || '',
    interviewedBy: formData.interviewedBy || '',
    headQuarter: formData.headQuarter || '',
    division: formData.division || formData.department || formData.entity || '',
    department: formData.department || formData.entity || '',
    reportingManager: formData.reportingManager || '',
    reportingManagerDesignation: formData.reportingManagerDesignation || '',
    employeeCode: formData.employeeCode || '',
    workLocation: formData.workLocation || formData.currentCity || '',
    employmentType: formData.employmentType || 'Permanent',

    // Personal Details
    fullName: formData.fullName || '',
    fatherName: formData.fatherName || '',
    motherName: formData.motherName || '',
    dateOfBirth: formData.dateOfBirth || '',
    age: formData.age || '',
    gender: formData.gender || '',
    bloodGroup: formData.bloodGroup || '',
    maritalStatus: formData.maritalStatus || '',
    spouseName: formData.spouseName || '',
    religion: formData.religion || '',
    nationality: formData.nationality || 'Indian',

    // Contact Details
    mobileNumber: formData.mobileNumber || formData.phone || '',
    alternateMobile: formData.alternateMobile || formData.alternateMobileNumber || '',
    officeContactNo: formData.officeContactNo || '',
    personalEmail: formData.email || '',
    officialEmail: formData.officialEmail || '',

    // Address Details
    currentAddress: formData.currentAddress || '',
    currentCity: formData.currentCity || '',
    currentState: formData.currentState || '',
    currentPincode: formData.currentPincode || formData.pincode || '',
    permanentAddress: formData.permanentAddress || '',
    permanentCity: formData.permanentCity || '',
    permanentState: formData.permanentState || '',
    permanentPincode: formData.permanentPincode || '',
    sameAsCurrentAddress: formData.sameAsCurrentAddress || false,

    // Identity Documents
    panNumber: formData.panNumber || '',
    aadhaarNumber: formData.aadhaarNumber || (formData.aadhaarLast4 ? 'XXXXXXXX' + formData.aadhaarLast4 : ''),
    hasPassport: formData.hasPassport || false,
    passportNumber: formData.passportNumber || '',
    passportValidity: formData.passportValidity || '',
    passportIssuePlace: formData.passportIssuePlace || '',
    drivingLicense: formData.drivingLicense || '',

    // Bank Account Details
    bankName: formData.bankName || '',
    bankBranch: formData.bankBranch || '',
    bankAccountNumber: formData.bankAccountNumber || formData.accountNumber || '',
    ifscCode: formData.ifscCode || '',
    micrCode: formData.micrCode || '',
    accountHolderName: formData.accountHolderName || formData.fullName || '',

    // PF/ESIC Details
    hasPreviousPF: formData.hasPreviousPF || false,
    uanNumber: formData.uanNumber || '',
    previousPFNumber: formData.previousPFNumber || '',
    esicNumber: formData.esicNumber || '',

    // Related Employee
    isRelatedToEmployee: formData.isRelatedToEmployee || false,
    relatedEmployeeName: formData.relatedEmployeeName || '',
    relatedEmployeeDesignation: formData.relatedEmployeeDesignation || '',
    relatedEmployeeLocation: formData.relatedEmployeeLocation || '',
    relatedEmployeeHQ: formData.relatedEmployeeHQ || '',
    relationWithEmployee: formData.relationWithEmployee || '',

    // Emergency Contact
    emergencyContactName: formData.emergencyContactName || formData.nomineeName || '',
    emergencyContactRelation: formData.emergencyContactRelation || formData.nomineeRelationship || '',
    emergencyContactMobile: formData.emergencyContactMobile || formData.emergencyContactNumber || '',
    emergencyContactAddress: formData.emergencyContactAddress || '',

    // Declaration
    declarationAccepted: formData.declarationAccepted || false,
    declarationDate: formData.declarationDate || new Date().toISOString().split('T')[0],
    declarationPlace: formData.declarationPlace || formData.currentCity || '',
    employeeSignature: formData.employeeSignature || ''
  });

  // Multiple Education Entries
  const [educationList, setEducationList] = useState(
    formData.joiningFormData?.educationList || formData.educationList || [
      { qualification: formData.highestQualification || '', university: formData.university || '', yearOfPassing: formData.yearOfPassing || '', percentage: '', subjects: '', certifications: '' }
    ]
  );

  // Multiple Work Experience Entries
  const [experienceList, setExperienceList] = useState(
    formData.joiningFormData?.experienceList || formData.experienceList || []
  );

  // Family Details
  const [familyDetails, setFamilyDetails] = useState(
    formData.joiningFormData?.familyDetails || formData.familyDetails || {
      fatherName: formData.fatherName || '',
      fatherDOB: '',
      fatherOccupation: '',
      motherName: formData.motherName || '',
      motherDOB: '',
      motherOccupation: '',
      spouseName: formData.spouseName || '',
      spouseDOB: '',
      spouseOccupation: '',
      marriageDate: '',
      marriagePlace: '',
      marriageAnniversary: '',
      children: [],
      siblings: []
    }
  );

  // Reference Details
  const [references, setReferences] = useState(
    formData.joiningFormData?.references || formData.references || [
      { name: '', contactNo: '', designation: '', organization: '' }
    ]
  );

  useEffect(() => {
    if (formData.joiningFormData) {
      setJoiningData(prev => ({ ...prev, ...formData.joiningFormData }));
      if (formData.joiningFormData.educationList) {
        setEducationList(formData.joiningFormData.educationList);
      }
      if (formData.joiningFormData.experienceList) {
        setExperienceList(formData.joiningFormData.experienceList);
      }
      if (formData.joiningFormData.familyDetails) {
        setFamilyDetails(formData.joiningFormData.familyDetails);
      }
      if (formData.joiningFormData.references) {
        setReferences(formData.joiningFormData.references);
      }
    }
  }, []);

  // Auto-calculate age when DOB changes
  useEffect(() => {
    if (joiningData.dateOfBirth) {
      const age = calculateAge(joiningData.dateOfBirth);
      setJoiningData(prev => ({ ...prev, age }));
    }
  }, [joiningData.dateOfBirth]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setJoiningData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      if (name === 'sameAsCurrentAddress' && checked) {
        updated.permanentAddress = prev.currentAddress;
        updated.permanentCity = prev.currentCity;
        updated.permanentState = prev.currentState;
        updated.permanentPincode = prev.currentPincode;
      }
      
      return updated;
    });
  };

  // Education handlers
  const addEducation = () => {
    setEducationList([...educationList, { qualification: '', university: '', yearOfPassing: '', percentage: '', subjects: '', certifications: '' }]);
  };

  const removeEducation = (index) => {
    if (educationList.length > 1) {
      setEducationList(educationList.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  // Experience handlers
  const addExperience = () => {
    setExperienceList([...experienceList, {
      organization: '', designation: '', designationAtLeaving: '',
      salaryAtJoining: '', salaryAtLeaving: '', doj: '', dol: '',
      reportingTo: '', jobResponsibility: '', reasonForLeaving: '', contactNo: ''
    }]);
  };

  const removeExperience = (index) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experienceList];
    updated[index][field] = value;
    setExperienceList(updated);
  };

  // Family handlers
  const addChild = () => {
    setFamilyDetails(prev => ({
      ...prev,
      children: [...prev.children, { name: '', dob: '', occupation: '' }]
    }));
  };

  const removeChild = (index) => {
    setFamilyDetails(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const updateChild = (index, field, value) => {
    setFamilyDetails(prev => {
      const updated = [...prev.children];
      updated[index][field] = value;
      return { ...prev, children: updated };
    });
  };

  const addSibling = () => {
    setFamilyDetails(prev => ({
      ...prev,
      siblings: [...prev.siblings, { name: '', dob: '', occupation: '' }]
    }));
  };

  const removeSibling = (index) => {
    setFamilyDetails(prev => ({
      ...prev,
      siblings: prev.siblings.filter((_, i) => i !== index)
    }));
  };

  const updateSibling = (index, field, value) => {
    setFamilyDetails(prev => {
      const updated = [...prev.siblings];
      updated[index][field] = value;
      return { ...prev, siblings: updated };
    });
  };

  // Reference handlers
  const addReference = () => {
    setReferences([...references, { name: '', contactNo: '', designation: '', organization: '' }]);
  };

  const removeReference = (index) => {
    if (references.length > 1) {
      setReferences(references.filter((_, i) => i !== index));
    }
  };

  const updateReference = (index, field, value) => {
    const updated = [...references];
    updated[index][field] = value;
    setReferences(updated);
  };

  const validateForm = () => {
    // Core required fields - dateOfJoining is optional (can be set by HR later)
    const requiredFields = [
      'fullName', 'fatherName', 'dateOfBirth', 'gender', 'maritalStatus',
      'mobileNumber', 'currentAddress', 'currentCity', 'currentState', 'currentPincode',
      'permanentAddress', 'permanentCity', 'permanentState', 'permanentPincode',
      'designation',
      'panNumber', 'bankName', 'bankAccountNumber', 'ifscCode',
      'emergencyContactName', 'emergencyContactMobile'
    ];
    
    for (const field of requiredFields) {
      if (!joiningData[field]) {
        alert('Please fill in the required field: ' + field.replace(/([A-Z])/g, ' $1').trim());
        return false;
      }
    }
    
    if (!joiningData.declarationAccepted) {
      alert('Please accept the declaration to proceed');
      return false;
    }
    
    if (!joiningData.employeeSignature) {
      alert('Please provide your signature to proceed');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      const completeData = {
        ...joiningData,
        educationList,
        experienceList,
        familyDetails,
        references,
        highestQualification: educationList[0]?.qualification || '',
        university: educationList[0]?.university || '',
        yearOfPassing: educationList[0]?.yearOfPassing || '',
      };

      onFormDataChange({
        ...formData,
        joiningFormData: completeData,
        fatherName: joiningData.fatherName,
        motherName: joiningData.motherName,
        bloodGroup: joiningData.bloodGroup,
        spouseName: joiningData.spouseName,
        religion: joiningData.religion,
        department: joiningData.department || joiningData.division,
        designation: joiningData.designation,
        bankName: joiningData.bankName,
        bankAccountNumber: joiningData.bankAccountNumber,
        ifscCode: joiningData.ifscCode,
        emergencyContactName: joiningData.emergencyContactName,
        emergencyContactRelation: joiningData.emergencyContactRelation,
        emergencyContactMobile: joiningData.emergencyContactMobile,
        uanNumber: joiningData.uanNumber,
        educationList,
        experienceList,
      });
      onNext();
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 ' +
    (isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400');

  const labelClass = 'block text-sm font-medium mb-1.5 ' + (isDark ? 'text-slate-300' : 'text-slate-700');

  const sectionClass = 'p-6 rounded-xl border ' + (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200');

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className={'flex items-center gap-2 mb-4 pb-2 border-b ' + (isDark ? 'border-slate-700' : 'border-slate-200')}>
      <Icon size={20} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
      <h4 className={'text-lg font-semibold ' + (isDark ? 'text-white' : 'text-slate-900')}>{title}</h4>
    </div>
  );

  const AddButton = ({ onClick, label }) => (
    <button
      type="button"
      onClick={onClick}
      className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' +
        (isDark 
          ? 'bg-teal-900/50 text-teal-400 hover:bg-teal-900/70' 
          : 'bg-teal-50 text-teal-600 hover:bg-teal-100')}
    >
      <Plus size={16} />
      {label}
    </button>
  );

  const RemoveButton = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={'p-2 rounded-lg transition-all ' +
        (isDark 
          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
          : 'bg-red-50 text-red-500 hover:bg-red-100')}
    >
      <Trash2 size={16} />
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Card */}
      <div className={'p-4 rounded-xl border ' + (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
        <div className="flex items-start gap-3">
          <div className={'p-2 rounded-lg ' + (isDark ? 'bg-teal-900/50' : 'bg-teal-100')}>
            <Info className={isDark ? 'text-teal-400' : 'text-teal-600'} size={18} />
          </div>
          <div>
            <h3 className={'font-semibold ' + (isDark ? 'text-white' : 'text-slate-900')}>
              Employee Joining Form - ESME Consumer Pvt Ltd
            </h3>
            <p className={'text-sm mt-1 ' + (isDark ? 'text-slate-400' : 'text-slate-600')}>
              Please fill in all the required details accurately. This information will be used for official records 
              and HR purposes. Fields marked with * are mandatory.
            </p>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className={sectionClass}>
        <SectionTitle icon={Building} title="Employment Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Date of Joining (DOJ) *</label>
            <input type="date" name="dateOfJoining" value={joiningData.dateOfJoining} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Designation *</label>
            <input type="text" name="designation" value={joiningData.designation} onChange={handleChange} className={inputClass} placeholder="Enter designation" required />
          </div>
          <div>
            <label className={labelClass}>Interviewed By</label>
            <input type="text" name="interviewedBy" value={joiningData.interviewedBy} onChange={handleChange} className={inputClass} placeholder="Enter interviewer name" />
          </div>
          <div>
            <label className={labelClass}>Head Quarter (HQ)</label>
            <input type="text" name="headQuarter" value={joiningData.headQuarter} onChange={handleChange} className={inputClass} placeholder="Enter head quarter" />
          </div>
          <div>
            <label className={labelClass}>Division</label>
            <input type="text" name="division" value={joiningData.division} onChange={handleChange} className={inputClass} placeholder="Enter division" />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <input type="text" name="department" value={joiningData.department} onChange={handleChange} className={inputClass} placeholder="Enter department" />
          </div>
          <div>
            <label className={labelClass}>Reporting Manager</label>
            <input type="text" name="reportingManager" value={joiningData.reportingManager} onChange={handleChange} className={inputClass} placeholder="Enter RM name" />
          </div>
          <div>
            <label className={labelClass}>RM Designation</label>
            <input type="text" name="reportingManagerDesignation" value={joiningData.reportingManagerDesignation} onChange={handleChange} className={inputClass} placeholder="Enter RM designation" />
          </div>
          <div>
            <label className={labelClass}>Work Location</label>
            <input type="text" name="workLocation" value={joiningData.workLocation} onChange={handleChange} className={inputClass} placeholder="Enter work location" />
          </div>
          <div>
            <label className={labelClass}>Employment Type</label>
            <select name="employmentType" value={joiningData.employmentType} onChange={handleChange} className={inputClass}>
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
              <option value="Probation">Probation</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Personal Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Full Name (as per Aadhaar) *</label>
            <input type="text" name="fullName" value={joiningData.fullName} onChange={handleChange} className={inputClass} placeholder="Enter full name" required />
          </div>
          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input type="date" name="dateOfBirth" value={joiningData.dateOfBirth} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Age</label>
            <input type="text" name="age" value={joiningData.age} className={inputClass} placeholder="Auto-calculated" disabled />
          </div>
          <div>
            <label className={labelClass}>Gender *</label>
            <select name="gender" value={joiningData.gender} onChange={handleChange} className={inputClass} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Blood Group</label>
            <select name="bloodGroup" value={joiningData.bloodGroup} onChange={handleChange} className={inputClass}>
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Marital Status *</label>
            <select name="maritalStatus" value={joiningData.maritalStatus} onChange={handleChange} className={inputClass} required>
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Nationality</label>
            <input type="text" name="nationality" value={joiningData.nationality} onChange={handleChange} className={inputClass} placeholder="Enter nationality" />
          </div>
          <div>
            <label className={labelClass}>Religion</label>
            <input type="text" name="religion" value={joiningData.religion} onChange={handleChange} className={inputClass} placeholder="Enter religion" />
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className={sectionClass}>
        <SectionTitle icon={Phone} title="Contact Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Contact No. (Personal) *</label>
            <input type="tel" name="mobileNumber" value={joiningData.mobileNumber} onChange={handleChange} className={inputClass} placeholder="10-digit mobile" maxLength={10} required />
          </div>
          <div>
            <label className={labelClass}>Contact No. (Office)</label>
            <input type="tel" name="officeContactNo" value={joiningData.officeContactNo} onChange={handleChange} className={inputClass} placeholder="Office number" />
          </div>
          <div>
            <label className={labelClass}>Alternate Mobile</label>
            <input type="tel" name="alternateMobile" value={joiningData.alternateMobile} onChange={handleChange} className={inputClass} placeholder="Alternate number" maxLength={10} />
          </div>
          <div>
            <label className={labelClass}>E-Mail ID (Personal)</label>
            <input type="email" name="personalEmail" value={joiningData.personalEmail} onChange={handleChange} className={inputClass} placeholder="Personal email" />
          </div>
          <div>
            <label className={labelClass}>E-Mail ID (Official)</label>
            <input type="email" name="officialEmail" value={joiningData.officialEmail} onChange={handleChange} className={inputClass} placeholder="Official email" />
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className={sectionClass}>
        <SectionTitle icon={Home} title="Address Details" />
        <div className="mb-6">
          <h5 className={'text-sm font-medium mb-3 ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>Current Address</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Address *</label>
              <textarea name="currentAddress" value={joiningData.currentAddress} onChange={handleChange} className={inputClass + ' resize-none'} rows={2} placeholder="Enter complete address" required />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input type="text" name="currentCity" value={joiningData.currentCity} onChange={handleChange} className={inputClass} placeholder="Enter city" required />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input type="text" name="currentState" value={joiningData.currentState} onChange={handleChange} className={inputClass} placeholder="Enter state" required />
            </div>
            <div>
              <label className={labelClass}>Pincode *</label>
              <input type="text" name="currentPincode" value={joiningData.currentPincode} onChange={handleChange} className={inputClass} placeholder="Enter pincode" maxLength={6} required />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className={'flex items-center gap-2 cursor-pointer ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>
            <input type="checkbox" name="sameAsCurrentAddress" checked={joiningData.sameAsCurrentAddress} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
            <span className="text-sm">Permanent address same as current address</span>
          </label>
        </div>
        <div>
          <h5 className={'text-sm font-medium mb-3 ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>Permanent Address</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Address *</label>
              <textarea name="permanentAddress" value={joiningData.permanentAddress} onChange={handleChange} className={inputClass + ' resize-none'} rows={2} placeholder="Enter complete address" disabled={joiningData.sameAsCurrentAddress} required />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input type="text" name="permanentCity" value={joiningData.permanentCity} onChange={handleChange} className={inputClass} placeholder="Enter city" disabled={joiningData.sameAsCurrentAddress} required />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input type="text" name="permanentState" value={joiningData.permanentState} onChange={handleChange} className={inputClass} placeholder="Enter state" disabled={joiningData.sameAsCurrentAddress} required />
            </div>
            <div>
              <label className={labelClass}>Pincode *</label>
              <input type="text" name="permanentPincode" value={joiningData.permanentPincode} onChange={handleChange} className={inputClass} placeholder="Enter pincode" maxLength={6} disabled={joiningData.sameAsCurrentAddress} required />
            </div>
          </div>
        </div>
      </div>

      {/* Identity Documents */}
      <div className={sectionClass}>
        <SectionTitle icon={FileText} title="Identity Documents" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>PAN Number *</label>
            <input type="text" name="panNumber" value={joiningData.panNumber} onChange={handleChange} className={inputClass + ' uppercase'} placeholder="ABCDE1234F" maxLength={10} required />
          </div>
          <div>
            <label className={labelClass}>Aadhaar Number</label>
            <input type="text" name="aadhaarNumber" value={joiningData.aadhaarNumber} onChange={handleChange} className={inputClass} placeholder="XXXX-XXXX-XXXX" maxLength={14} />
          </div>
          <div>
            <label className={labelClass}>Driving License</label>
            <input type="text" name="drivingLicense" value={joiningData.drivingLicense} onChange={handleChange} className={inputClass} placeholder="Enter DL number" />
          </div>
        </div>
        <div className="mt-4">
          <label className={'flex items-center gap-2 cursor-pointer mb-3 ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>
            <input type="checkbox" name="hasPassport" checked={joiningData.hasPassport} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
            <span className="text-sm">I have a valid passport</span>
          </label>
          {joiningData.hasPassport && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Passport Number</label>
                <input type="text" name="passportNumber" value={joiningData.passportNumber} onChange={handleChange} className={inputClass} placeholder="Enter passport number" />
              </div>
              <div>
                <label className={labelClass}>Passport Validity</label>
                <input type="date" name="passportValidity" value={joiningData.passportValidity} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Issue Place</label>
                <input type="text" name="passportIssuePlace" value={joiningData.passportIssuePlace} onChange={handleChange} className={inputClass} placeholder="Enter issue place" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational Background */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
            <h4 className={'text-lg font-semibold ' + (isDark ? 'text-white' : 'text-slate-900')}>Educational Background</h4>
          </div>
          <AddButton onClick={addEducation} label="Add Education" />
        </div>
        <p className={'text-xs mb-4 ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>* Mention your details from Highest Education to High School</p>
        {educationList.map((edu, index) => (
          <div key={index} className={'p-4 rounded-lg mb-4 ' + (isDark ? 'bg-slate-700/50' : 'bg-white border border-slate-200')}>
            <div className="flex justify-between items-center mb-3">
              <span className={'text-sm font-medium ' + (isDark ? 'text-slate-300' : 'text-slate-600')}>Education #{index + 1}</span>
              {educationList.length > 1 && <RemoveButton onClick={() => removeEducation(index)} />}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Qualification</label>
                <select value={edu.qualification} onChange={(e) => updateEducation(index, 'qualification', e.target.value)} className={inputClass}>
                  <option value="">Select Qualification</option>
                  <option value="PhD">PhD / Doctorate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="MBA">MBA</option>
                  <option value="M.Tech/M.E">M.Tech / M.E</option>
                  <option value="Graduate">Graduate</option>
                  <option value="B.Tech/B.E">B.Tech / B.E</option>
                  <option value="Diploma">Diploma</option>
                  <option value="12th/HSC">12th / HSC</option>
                  <option value="10th/SSC">10th / SSC</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>University / Institute / Board</label>
                <input type="text" value={edu.university} onChange={(e) => updateEducation(index, 'university', e.target.value)} className={inputClass} placeholder="Enter university/board" />
              </div>
              <div>
                <label className={labelClass}>Year of Passing</label>
                <input type="text" value={edu.yearOfPassing} onChange={(e) => updateEducation(index, 'yearOfPassing', e.target.value)} className={inputClass} placeholder="YYYY" maxLength={4} />
              </div>
              <div>
                <label className={labelClass}>% Marks / CGPA</label>
                <input type="text" value={edu.percentage} onChange={(e) => updateEducation(index, 'percentage', e.target.value)} className={inputClass} placeholder="e.g., 85% or 8.5 CGPA" />
              </div>
              <div>
                <label className={labelClass}>Subjects / Specialization</label>
                <input type="text" value={edu.subjects} onChange={(e) => updateEducation(index, 'subjects', e.target.value)} className={inputClass} placeholder="Enter subjects" />
              </div>
              <div>
                <label className={labelClass}>Certifications (if any)</label>
                <input type="text" value={edu.certifications} onChange={(e) => updateEducation(index, 'certifications', e.target.value)} className={inputClass} placeholder="Enter certifications" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Work Experience */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Briefcase size={20} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
            <h4 className={'text-lg font-semibold ' + (isDark ? 'text-white' : 'text-slate-900')}>Work Experience Details</h4>
          </div>
          <AddButton onClick={addExperience} label="Add Experience" />
        </div>
        <p className={'text-xs mb-4 ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>** Mention your details from Last Organization to First Organization</p>
        {experienceList.length === 0 ? (
          <p className={'text-sm italic ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>No previous work experience added. Click "Add Experience" if you have prior work experience.</p>
        ) : (
          experienceList.map((exp, index) => (
            <div key={index} className={'p-4 rounded-lg mb-4 ' + (isDark ? 'bg-slate-700/50' : 'bg-white border border-slate-200')}>
              <div className="flex justify-between items-center mb-3">
                <span className={'text-sm font-medium ' + (isDark ? 'text-slate-300' : 'text-slate-600')}>Experience #{index + 1}</span>
                <RemoveButton onClick={() => removeExperience(index)} />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Organization</label>
                  <input type="text" value={exp.organization} onChange={(e) => updateExperience(index, 'organization', e.target.value)} className={inputClass} placeholder="Company name" />
                </div>
                <div>
                  <label className={labelClass}>Designation at Joining</label>
                  <input type="text" value={exp.designation} onChange={(e) => updateExperience(index, 'designation', e.target.value)} className={inputClass} placeholder="Starting designation" />
                </div>
                <div>
                  <label className={labelClass}>Designation at Leaving</label>
                  <input type="text" value={exp.designationAtLeaving} onChange={(e) => updateExperience(index, 'designationAtLeaving', e.target.value)} className={inputClass} placeholder="Final designation" />
                </div>
                <div>
                  <label className={labelClass}>Salary at Joining (₹)</label>
                  <input type="text" value={exp.salaryAtJoining} onChange={(e) => updateExperience(index, 'salaryAtJoining', e.target.value)} className={inputClass} placeholder="Starting salary" />
                </div>
                <div>
                  <label className={labelClass}>Salary at Leaving (₹)</label>
                  <input type="text" value={exp.salaryAtLeaving} onChange={(e) => updateExperience(index, 'salaryAtLeaving', e.target.value)} className={inputClass} placeholder="Final salary" />
                </div>
                <div>
                  <label className={labelClass}>Contact No.</label>
                  <input type="tel" value={exp.contactNo} onChange={(e) => updateExperience(index, 'contactNo', e.target.value)} className={inputClass} placeholder="HR contact" />
                </div>
                <div>
                  <label className={labelClass}>Date of Joining (DOJ)</label>
                  <input type="date" value={exp.doj} onChange={(e) => updateExperience(index, 'doj', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Leaving (DOL)</label>
                  <input type="date" value={exp.dol} onChange={(e) => updateExperience(index, 'dol', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Reporting To</label>
                  <input type="text" value={exp.reportingTo} onChange={(e) => updateExperience(index, 'reportingTo', e.target.value)} className={inputClass} placeholder="Manager name & designation" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Job Responsibility</label>
                  <input type="text" value={exp.jobResponsibility} onChange={(e) => updateExperience(index, 'jobResponsibility', e.target.value)} className={inputClass} placeholder="Brief description" />
                </div>
                <div>
                  <label className={labelClass}>Reason for Leaving</label>
                  <input type="text" value={exp.reasonForLeaving} onChange={(e) => updateExperience(index, 'reasonForLeaving', e.target.value)} className={inputClass} placeholder="Enter reason" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Family Details */}
      <div className={sectionClass}>
        <SectionTitle icon={Users} title="Family Details" />
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className={labelClass}>Father's Name *</label>
            <input type="text" name="fatherName" value={joiningData.fatherName} onChange={handleChange} className={inputClass} placeholder="Enter father's name" required />
          </div>
          <div>
            <label className={labelClass}>Father's DOB</label>
            <input type="date" value={familyDetails.fatherDOB} onChange={(e) => setFamilyDetails(prev => ({ ...prev, fatherDOB: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Father's Occupation</label>
            <input type="text" value={familyDetails.fatherOccupation} onChange={(e) => setFamilyDetails(prev => ({ ...prev, fatherOccupation: e.target.value }))} className={inputClass} placeholder="Enter occupation" />
          </div>
          <div>
            <label className={labelClass}>Mother's Name</label>
            <input type="text" name="motherName" value={joiningData.motherName} onChange={handleChange} className={inputClass} placeholder="Enter mother's name" />
          </div>
          <div>
            <label className={labelClass}>Mother's DOB</label>
            <input type="date" value={familyDetails.motherDOB} onChange={(e) => setFamilyDetails(prev => ({ ...prev, motherDOB: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mother's Occupation</label>
            <input type="text" value={familyDetails.motherOccupation} onChange={(e) => setFamilyDetails(prev => ({ ...prev, motherOccupation: e.target.value }))} className={inputClass} placeholder="Enter occupation" />
          </div>
        </div>
        {joiningData.maritalStatus === 'Married' && (
          <>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelClass}>Spouse Name</label>
              <input type="text" name="spouseName" value={joiningData.spouseName} onChange={handleChange} className={inputClass} placeholder="Enter spouse name" />
            </div>
            <div>
              <label className={labelClass}>Spouse DOB</label>
              <input type="date" value={familyDetails.spouseDOB} onChange={(e) => setFamilyDetails(prev => ({ ...prev, spouseDOB: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Spouse Occupation</label>
              <input type="text" value={familyDetails.spouseOccupation} onChange={(e) => setFamilyDetails(prev => ({ ...prev, spouseOccupation: e.target.value }))} className={inputClass} placeholder="Enter occupation" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className={labelClass}>Marriage Date</label>
              <input type="date" value={familyDetails.marriageDate} onChange={(e) => setFamilyDetails(prev => ({ ...prev, marriageDate: e.target.value, marriageAnniversary: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Marriage Place</label>
              <input type="text" value={familyDetails.marriagePlace} onChange={(e) => setFamilyDetails(prev => ({ ...prev, marriagePlace: e.target.value }))} className={inputClass} placeholder="City where married" />
            </div>
            <div>
              <label className={labelClass}>Marriage Anniversary</label>
              <input type="date" value={familyDetails.marriageAnniversary} onChange={(e) => setFamilyDetails(prev => ({ ...prev, marriageAnniversary: e.target.value }))} className={inputClass} />
            </div>
          </div>
          </>
        )}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h5 className={'text-sm font-medium ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>Children (if any)</h5>
            <button type="button" onClick={addChild} className={'text-xs px-3 py-1 rounded-lg ' + (isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>+ Add Child</button>
          </div>
          {familyDetails.children.map((child, index) => (
            <div key={index} className="grid md:grid-cols-4 gap-4 mb-2">
              <input type="text" value={child.name} onChange={(e) => updateChild(index, 'name', e.target.value)} className={inputClass} placeholder="Child name" />
              <input type="date" value={child.dob} onChange={(e) => updateChild(index, 'dob', e.target.value)} className={inputClass} />
              <input type="text" value={child.occupation} onChange={(e) => updateChild(index, 'occupation', e.target.value)} className={inputClass} placeholder="School/Occupation" />
              <RemoveButton onClick={() => removeChild(index)} />
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className={'text-sm font-medium ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>Siblings (if any)</h5>
            <button type="button" onClick={addSibling} className={'text-xs px-3 py-1 rounded-lg ' + (isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>+ Add Sibling</button>
          </div>
          {familyDetails.siblings.map((sibling, index) => (
            <div key={index} className="grid md:grid-cols-4 gap-4 mb-2">
              <input type="text" value={sibling.name} onChange={(e) => updateSibling(index, 'name', e.target.value)} className={inputClass} placeholder="Sibling name" />
              <input type="date" value={sibling.dob} onChange={(e) => updateSibling(index, 'dob', e.target.value)} className={inputClass} />
              <input type="text" value={sibling.occupation} onChange={(e) => updateSibling(index, 'occupation', e.target.value)} className={inputClass} placeholder="Occupation" />
              <RemoveButton onClick={() => removeSibling(index)} />
            </div>
          ))}
        </div>
      </div>

      {/* Reference Details */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Users size={20} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
            <h4 className={'text-lg font-semibold ' + (isDark ? 'text-white' : 'text-slate-900')}>Professional References</h4>
          </div>
          <AddButton onClick={addReference} label="Add Reference" />
        </div>
        <p className={'text-xs mb-4 ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>*** Please give professional references from your last organization</p>
        {references.map((ref, index) => (
          <div key={index} className={'p-4 rounded-lg mb-4 ' + (isDark ? 'bg-slate-700/50' : 'bg-white border border-slate-200')}>
            <div className="flex justify-between items-center mb-3">
              <span className={'text-sm font-medium ' + (isDark ? 'text-slate-300' : 'text-slate-600')}>Reference #{index + 1}</span>
              {references.length > 1 && <RemoveButton onClick={() => removeReference(index)} />}
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={ref.name} onChange={(e) => updateReference(index, 'name', e.target.value)} className={inputClass} placeholder="Reference name" />
              </div>
              <div>
                <label className={labelClass}>Contact No.</label>
                <input type="tel" value={ref.contactNo} onChange={(e) => updateReference(index, 'contactNo', e.target.value)} className={inputClass} placeholder="Contact number" />
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <input type="text" value={ref.designation} onChange={(e) => updateReference(index, 'designation', e.target.value)} className={inputClass} placeholder="Designation" />
              </div>
              <div>
                <label className={labelClass}>Organization</label>
                <input type="text" value={ref.organization} onChange={(e) => updateReference(index, 'organization', e.target.value)} className={inputClass} placeholder="Organization" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Contact */}
      <div className={sectionClass}>
        <SectionTitle icon={Heart} title="In Case of Emergency" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Contact Person Name *</label>
            <input type="text" name="emergencyContactName" value={joiningData.emergencyContactName} onChange={handleChange} className={inputClass} placeholder="Enter contact person name" required />
          </div>
          <div>
            <label className={labelClass}>Relation</label>
            <input type="text" name="emergencyContactRelation" value={joiningData.emergencyContactRelation} onChange={handleChange} className={inputClass} placeholder="e.g., Father, Spouse" />
          </div>
          <div>
            <label className={labelClass}>Contact Number *</label>
            <input type="tel" name="emergencyContactMobile" value={joiningData.emergencyContactMobile} onChange={handleChange} className={inputClass} placeholder="10-digit mobile" maxLength={10} required />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input type="text" name="emergencyContactAddress" value={joiningData.emergencyContactAddress} onChange={handleChange} className={inputClass} placeholder="Enter address" />
          </div>
        </div>
      </div>

      {/* Related Employee */}
      <div className={sectionClass}>
        <SectionTitle icon={Users} title="Other Details" />
        <div className="mb-4">
          <label className={'flex items-center gap-2 cursor-pointer ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>
            <input type="checkbox" name="isRelatedToEmployee" checked={joiningData.isRelatedToEmployee} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
            <span className="text-sm">Are you related to any of our employees?</span>
          </label>
        </div>
        {joiningData.isRelatedToEmployee && (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Employee Name</label>
              <input type="text" name="relatedEmployeeName" value={joiningData.relatedEmployeeName} onChange={handleChange} className={inputClass} placeholder="Enter employee name" />
            </div>
            <div>
              <label className={labelClass}>Designation</label>
              <input type="text" name="relatedEmployeeDesignation" value={joiningData.relatedEmployeeDesignation} onChange={handleChange} className={inputClass} placeholder="Enter designation" />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" name="relatedEmployeeLocation" value={joiningData.relatedEmployeeLocation} onChange={handleChange} className={inputClass} placeholder="Enter location" />
            </div>
            <div>
              <label className={labelClass}>Head Quarter</label>
              <input type="text" name="relatedEmployeeHQ" value={joiningData.relatedEmployeeHQ} onChange={handleChange} className={inputClass} placeholder="Enter HQ" />
            </div>
            <div>
              <label className={labelClass}>Your Relation</label>
              <input type="text" name="relationWithEmployee" value={joiningData.relationWithEmployee} onChange={handleChange} className={inputClass} placeholder="e.g., Brother, Cousin" />
            </div>
          </div>
        )}
      </div>

      {/* PF/ESIC Details */}
      <div className={sectionClass}>
        <SectionTitle icon={FileText} title="PF / ESIC Details" />
        <div className="mb-4">
          <label className={'flex items-center gap-2 cursor-pointer ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>
            <input type="checkbox" name="hasPreviousPF" checked={joiningData.hasPreviousPF} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
            <span className="text-sm">Do you have any PF/ESIC account in your last organization?</span>
          </label>
        </div>
        {joiningData.hasPreviousPF && (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Universal Account Number (UAN)</label>
              <input type="text" name="uanNumber" value={joiningData.uanNumber} onChange={handleChange} className={inputClass} placeholder="12-digit UAN" maxLength={12} />
            </div>
            <div>
              <label className={labelClass}>Previous PF Number</label>
              <input type="text" name="previousPFNumber" value={joiningData.previousPFNumber} onChange={handleChange} className={inputClass} placeholder="Enter PF number" />
            </div>
            <div>
              <label className={labelClass}>ESIC Number</label>
              <input type="text" name="esicNumber" value={joiningData.esicNumber} onChange={handleChange} className={inputClass} placeholder="Enter ESIC number" />
            </div>
          </div>
        )}
      </div>

      {/* Bank Details */}
      <div className={sectionClass}>
        <SectionTitle icon={Building} title="Bank Account Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Bank Name *</label>
            <input type="text" name="bankName" value={joiningData.bankName} onChange={handleChange} className={inputClass} placeholder="Enter bank name" required />
          </div>
          <div>
            <label className={labelClass}>Branch Name</label>
            <input type="text" name="bankBranch" value={joiningData.bankBranch} onChange={handleChange} className={inputClass} placeholder="Enter branch name" />
          </div>
          <div>
            <label className={labelClass}>Account Holder Name (as per Bank)</label>
            <input type="text" name="accountHolderName" value={joiningData.accountHolderName} onChange={handleChange} className={inputClass} placeholder="Name as per bank records" />
          </div>
          <div>
            <label className={labelClass}>Account Number *</label>
            <input type="text" name="bankAccountNumber" value={joiningData.bankAccountNumber} onChange={handleChange} className={inputClass} placeholder="Enter account number" required />
          </div>
          <div>
            <label className={labelClass}>IFSC Code *</label>
            <input type="text" name="ifscCode" value={joiningData.ifscCode} onChange={handleChange} className={inputClass + ' uppercase'} placeholder="SBIN0001234" maxLength={11} required />
          </div>
          <div>
            <label className={labelClass}>MICR Code</label>
            <input type="text" name="micrCode" value={joiningData.micrCode} onChange={handleChange} className={inputClass} placeholder="9-digit MICR code" maxLength={9} />
          </div>
        </div>
      </div>

      {/* Declaration */}
      <div className={sectionClass}>
        <SectionTitle icon={FileText} title="Declaration" />
        <div className={'p-4 rounded-lg mb-4 ' + (isDark ? 'bg-slate-700/30' : 'bg-amber-50')}>
          <p className={'text-sm ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>
            I declare that the information given, herein above, is true & correct to the best of my knowledge & belief.
            I understand that if the above information is found false or incorrect, at any time during the course of my
            employment, my services will be terminated forthwith without any notice.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" name="declarationDate" value={joiningData.declarationDate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Place</label>
            <input type="text" name="declarationPlace" value={joiningData.declarationPlace} onChange={handleChange} className={inputClass} placeholder="Enter place" />
          </div>
        </div>
        <div className="mb-6">
          <label className={'flex items-center gap-2 cursor-pointer ' + (isDark ? 'text-slate-300' : 'text-slate-700')}>
            <input type="checkbox" name="declarationAccepted" checked={joiningData.declarationAccepted} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
            <span className="text-sm">I accept the above declaration *</span>
          </label>
        </div>
        <div>
          <label className={labelClass}>Employee Signature *</label>
          <SignatureCapture value={joiningData.employeeSignature} onChange={(signature) => setJoiningData(prev => ({ ...prev, employeeSignature: signature }))} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className={'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ' + (isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
          <ChevronLeft size={20} />
          Back
        </button>
        <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25">
          Continue
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
