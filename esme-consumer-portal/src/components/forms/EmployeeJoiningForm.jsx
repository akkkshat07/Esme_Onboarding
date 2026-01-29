import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, ChevronLeft, Info, User, Briefcase, Home, Users, GraduationCap, Heart } from 'lucide-react';
import SignatureCapture from './SignatureCapture';


export default function EmployeeJoiningForm({ formData, onFormDataChange, onNext, onBack }) {
  const { isDark } = useTheme();
  


  const [joiningData, setJoiningData] = useState({

    fullName: formData.fullName || '',
    fatherName: formData.fatherName || '',
    motherName: formData.motherName || '',
    dateOfBirth: formData.dateOfBirth || '',
    gender: formData.gender || '',
    bloodGroup: formData.bloodGroup || '',
    maritalStatus: formData.maritalStatus || '',
    spouseName: formData.spouseName || '',
    religion: formData.religion || '',
    nationality: formData.nationality || 'Indian',
    

    mobileNumber: formData.mobileNumber || formData.phone || '',
    alternateMobile: formData.alternateMobile || formData.alternateMobileNumber || '',
    personalEmail: formData.email || '',
    officialEmail: formData.officialEmail || '',
    

    currentAddress: formData.currentAddress || '',
    currentCity: formData.currentCity || '',
    currentState: formData.currentState || '',
    currentPincode: formData.currentPincode || formData.pincode || '',
    permanentAddress: formData.permanentAddress || '',
    permanentCity: formData.permanentCity || '',
    permanentState: formData.permanentState || '',
    permanentPincode: formData.permanentPincode || '',
    sameAsCurrentAddress: formData.sameAsCurrentAddress || false,
    

    employeeCode: formData.employeeCode || '',
    dateOfJoining: formData.dateOfJoining || '',
    department: formData.department || formData.entity || '',
    designation: formData.designation || formData.profession || '',
    reportingManager: formData.reportingManager || '',
    workLocation: formData.workLocation || formData.currentCity || '',
    employmentType: formData.employmentType || 'Permanent',
    

    panNumber: formData.panNumber || '',
    aadhaarNumber: formData.aadhaarNumber || (formData.aadhaarLast4 ? `XXXXXXXX${formData.aadhaarLast4}` : ''),
    passportNumber: formData.passportNumber || '',
    passportValidity: formData.passportValidity || '',
    drivingLicense: formData.drivingLicense || '',
    

    bankName: formData.bankName || '',
    bankBranch: formData.bankBranch || '',
    bankAccountNumber: formData.bankAccountNumber || formData.accountNumber || '',
    ifscCode: formData.ifscCode || '',
    

    highestQualification: formData.highestQualification || formData.education || '',
    university: formData.university || '',
    yearOfPassing: formData.yearOfPassing || '',
    specialization: formData.specialization || '',
    

    hasPreviousEmployment: formData.hasPreviousEmployment || false,
    previousEmployer: formData.previousEmployer || '',
    previousDesignation: formData.previousDesignation || '',
    previousEmploymentFrom: formData.previousEmploymentFrom || '',
    previousEmploymentTo: formData.previousEmploymentTo || '',
    reasonForLeaving: formData.reasonForLeaving || '',
    

    emergencyContactName: formData.emergencyContactName || formData.nomineeName || '',
    emergencyContactRelation: formData.emergencyContactRelation || formData.nomineeRelationship || '',
    emergencyContactMobile: formData.emergencyContactMobile || formData.emergencyContactNumber || '',
    emergencyContactAddress: formData.emergencyContactAddress || '',
    

    declarationAccepted: formData.declarationAccepted || false,
    employeeSignature: formData.employeeSignature || ''
  });


  useEffect(() => {
    if (formData.joiningFormData) {
      setJoiningData(prev => ({ ...prev, ...formData.joiningFormData }));
    }
  }, []);

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

  const validateForm = () => {

    const requiredFields = [
      'fullName', 'fatherName', 'dateOfBirth', 'gender', 'maritalStatus',
      'mobileNumber', 'currentAddress', 'currentCity', 'currentState', 'currentPincode',
      'permanentAddress', 'permanentCity', 'permanentState', 'permanentPincode',
      'dateOfJoining', 'department', 'designation',
      'panNumber', 'bankName', 'bankAccountNumber', 'ifscCode',
      'emergencyContactName', 'emergencyContactMobile'
    ];
    
    for (const field of requiredFields) {
      if (!joiningData[field]) {
        alert(`Please fill in the required field: ${field.replace(/([A-Z])/g, ' $1').trim()}`);
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

      onFormDataChange({
        ...formData,
        joiningFormData: joiningData,

        fatherName: joiningData.fatherName,
        motherName: joiningData.motherName,
        bloodGroup: joiningData.bloodGroup,
        spouseName: joiningData.spouseName,
        religion: joiningData.religion,
        department: joiningData.department,
        designation: joiningData.designation,
        bankName: joiningData.bankName,
        bankAccountNumber: joiningData.bankAccountNumber,
        ifscCode: joiningData.ifscCode,
        emergencyContactName: joiningData.emergencyContactName,
        emergencyContactRelation: joiningData.emergencyContactRelation,
        emergencyContactMobile: joiningData.emergencyContactMobile
      });
      onNext();
    }
  };

  const inputClass = `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  const sectionClass = `p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`;

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
      <Icon size={20} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
      <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
        <div className="flex items-start gap-3">
          <Info className={`mt-0.5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} size={20} />
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
              Employee Joining Form - ESME Consumer Pvt Ltd
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
              Please fill in all the required details accurately. This information will be used for official records 
              and HR purposes. Fields marked with * are mandatory.
            </p>
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Personal Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Full Name (as per Aadhaar) *</label>
            <input
              type="text"
              name="fullName"
              value={joiningData.fullName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Father's Name *</label>
            <input
              type="text"
              name="fatherName"
              value={joiningData.fatherName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter father's name"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Mother's Name</label>
            <input
              type="text"
              name="motherName"
              value={joiningData.motherName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter mother's name"
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={joiningData.dateOfBirth}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Gender *</label>
            <select
              name="gender"
              value={joiningData.gender}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="T">Transgender</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Blood Group</label>
            <select
              name="bloodGroup"
              value={joiningData.bloodGroup}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Marital Status *</label>
            <select
              name="maritalStatus"
              value={joiningData.maritalStatus}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          {joiningData.maritalStatus === 'Married' && (
            <div>
              <label className={labelClass}>Spouse Name</label>
              <input
                type="text"
                name="spouseName"
                value={joiningData.spouseName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter spouse name"
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Religion</label>
            <input
              type="text"
              name="religion"
              value={joiningData.religion}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter religion"
            />
          </div>
          <div>
            <label className={labelClass}>Nationality *</label>
            <input
              type="text"
              name="nationality"
              value={joiningData.nationality}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter nationality"
              required
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Contact Information" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Mobile Number *</label>
            <input
              type="tel"
              name="mobileNumber"
              value={joiningData.mobileNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Alternate Mobile</label>
            <input
              type="tel"
              name="alternateMobile"
              value={joiningData.alternateMobile}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter alternate number"
              maxLength={10}
            />
          </div>
          <div>
            <label className={labelClass}>Personal Email *</label>
            <input
              type="email"
              name="personalEmail"
              value={joiningData.personalEmail}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter personal email"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Official Email (if assigned)</label>
            <input
              type="email"
              name="officialEmail"
              value={joiningData.officialEmail}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter official email"
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Home} title="Address Details" />
        
        {}
        <div className="mb-6">
          <h5 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Current Address</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Address *</label>
              <textarea
                name="currentAddress"
                value={joiningData.currentAddress}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Enter complete address"
                required
              />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input
                type="text"
                name="currentCity"
                value={joiningData.currentCity}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input
                type="text"
                name="currentState"
                value={joiningData.currentState}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter state"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Pincode *</label>
              <input
                type="text"
                name="currentPincode"
                value={joiningData.currentPincode}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter pincode"
                maxLength={6}
                required
              />
            </div>
          </div>
        </div>
        
        {}
        <div className="mb-4">
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              name="sameAsCurrentAddress"
              checked={joiningData.sameAsCurrentAddress}
              onChange={handleChange}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span className="text-sm">Permanent address same as current address</span>
          </label>
        </div>
        
        {}
        <div>
          <h5 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Permanent Address</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Address *</label>
              <textarea
                name="permanentAddress"
                value={joiningData.permanentAddress}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Enter complete address"
                disabled={joiningData.sameAsCurrentAddress}
                required
              />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input
                type="text"
                name="permanentCity"
                value={joiningData.permanentCity}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter city"
                disabled={joiningData.sameAsCurrentAddress}
                required
              />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input
                type="text"
                name="permanentState"
                value={joiningData.permanentState}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter state"
                disabled={joiningData.sameAsCurrentAddress}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Pincode *</label>
              <input
                type="text"
                name="permanentPincode"
                value={joiningData.permanentPincode}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter pincode"
                maxLength={6}
                disabled={joiningData.sameAsCurrentAddress}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Briefcase} title="Employment Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Employee Code</label>
            <input
              type="text"
              name="employeeCode"
              value={joiningData.employeeCode}
              onChange={handleChange}
              className={inputClass}
              placeholder="Will be assigned by HR"
              disabled
            />
          </div>
          <div>
            <label className={labelClass}>Date of Joining *</label>
            <input
              type="date"
              name="dateOfJoining"
              value={joiningData.dateOfJoining}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Department *</label>
            <input
              type="text"
              name="department"
              value={joiningData.department}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter department"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Designation *</label>
            <input
              type="text"
              name="designation"
              value={joiningData.designation}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter designation"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Reporting Manager</label>
            <input
              type="text"
              name="reportingManager"
              value={joiningData.reportingManager}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter reporting manager name"
            />
          </div>
          <div>
            <label className={labelClass}>Work Location</label>
            <input
              type="text"
              name="workLocation"
              value={joiningData.workLocation}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter work location"
            />
          </div>
          <div>
            <label className={labelClass}>Employment Type *</label>
            <select
              name="employmentType"
              value={joiningData.employmentType}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
              <option value="Probation">Probation</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Identity Documents" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>PAN Number *</label>
            <input
              type="text"
              name="panNumber"
              value={joiningData.panNumber}
              onChange={handleChange}
              className={`${inputClass} uppercase`}
              placeholder="ABCDE1234F"
              maxLength={10}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Aadhaar Number</label>
            <input
              type="text"
              name="aadhaarNumber"
              value={joiningData.aadhaarNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="XXXX-XXXX-XXXX"
              maxLength={14}
            />
          </div>
          <div>
            <label className={labelClass}>Passport Number</label>
            <input
              type="text"
              name="passportNumber"
              value={joiningData.passportNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter passport number"
            />
          </div>
          {joiningData.passportNumber && (
            <div>
              <label className={labelClass}>Passport Validity</label>
              <input
                type="date"
                name="passportValidity"
                value={joiningData.passportValidity}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Driving License</label>
            <input
              type="text"
              name="drivingLicense"
              value={joiningData.drivingLicense}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter DL number"
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Briefcase} title="Bank Account Details" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Bank Name *</label>
            <input
              type="text"
              name="bankName"
              value={joiningData.bankName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter bank name"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Branch</label>
            <input
              type="text"
              name="bankBranch"
              value={joiningData.bankBranch}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter branch name"
            />
          </div>
          <div>
            <label className={labelClass}>Account Number *</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={joiningData.bankAccountNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter account number"
              required
            />
          </div>
          <div>
            <label className={labelClass}>IFSC Code *</label>
            <input
              type="text"
              name="ifscCode"
              value={joiningData.ifscCode}
              onChange={handleChange}
              className={`${inputClass} uppercase`}
              placeholder="SBIN0001234"
              maxLength={11}
              required
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={GraduationCap} title="Educational Qualification" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Highest Qualification</label>
            <select
              name="highestQualification"
              value={joiningData.highestQualification}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Qualification</option>
              <option value="10th">10th / SSC</option>
              <option value="12th">12th / HSC</option>
              <option value="Diploma">Diploma</option>
              <option value="Graduate">Graduate (B.A/B.Com/B.Sc etc.)</option>
              <option value="B.Tech/B.E">B.Tech / B.E</option>
              <option value="MBA">MBA</option>
              <option value="M.Tech/M.E">M.Tech / M.E</option>
              <option value="Post Graduate">Post Graduate</option>
              <option value="PhD">PhD / Doctorate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>University / Board</label>
            <input
              type="text"
              name="university"
              value={joiningData.university}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter university/board name"
            />
          </div>
          <div>
            <label className={labelClass}>Year of Passing</label>
            <input
              type="text"
              name="yearOfPassing"
              value={joiningData.yearOfPassing}
              onChange={handleChange}
              className={inputClass}
              placeholder="YYYY"
              maxLength={4}
            />
          </div>
          <div>
            <label className={labelClass}>Specialization</label>
            <input
              type="text"
              name="specialization"
              value={joiningData.specialization}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter specialization"
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Briefcase} title="Previous Employment" />
        <div className="mb-4">
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              name="hasPreviousEmployment"
              checked={joiningData.hasPreviousEmployment}
              onChange={handleChange}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span className="text-sm">I have previous employment experience</span>
          </label>
        </div>
        
        {joiningData.hasPreviousEmployment && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Previous Employer</label>
              <input
                type="text"
                name="previousEmployer"
                value={joiningData.previousEmployer}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className={labelClass}>Designation</label>
              <input
                type="text"
                name="previousDesignation"
                value={joiningData.previousDesignation}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter designation"
              />
            </div>
            <div>
              <label className={labelClass}>From Date</label>
              <input
                type="date"
                name="previousEmploymentFrom"
                value={joiningData.previousEmploymentFrom}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>To Date</label>
              <input
                type="date"
                name="previousEmploymentTo"
                value={joiningData.previousEmploymentTo}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Reason for Leaving</label>
              <input
                type="text"
                name="reasonForLeaving"
                value={joiningData.reasonForLeaving}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter reason"
              />
            </div>
          </div>
        )}
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Heart} title="Emergency Contact" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Contact Person Name *</label>
            <input
              type="text"
              name="emergencyContactName"
              value={joiningData.emergencyContactName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter contact person name"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Relationship *</label>
            <select
              name="emergencyContactRelation"
              value={joiningData.emergencyContactRelation}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Relationship</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Spouse">Spouse</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Mobile Number *</label>
            <input
              type="tel"
              name="emergencyContactMobile"
              value={joiningData.emergencyContactMobile}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter mobile number"
              maxLength={10}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input
              type="text"
              name="emergencyContactAddress"
              value={joiningData.emergencyContactAddress}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter address"
            />
          </div>
        </div>
      </div>

      {}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          Declaration
        </h4>
        <div className={`text-sm mb-4 ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
          <p className="mb-2">
            I hereby declare that all the information furnished above is true, complete and correct to the best of my knowledge and belief.
          </p>
          <p>
            I understand that in the event of any information being found false or incorrect at any stage, my services are liable to be terminated 
            without any notice or compensation.
          </p>
        </div>
        <label className={`flex items-center gap-2 cursor-pointer mb-6 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          <input
            type="checkbox"
            name="declarationAccepted"
            checked={joiningData.declarationAccepted}
            onChange={handleChange}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm font-medium">I accept the above declaration *</span>
        </label>
        
        {}
        <SignatureCapture
          label="Employee Signature"
          value={joiningData.employeeSignature}
          onChange={(signature) => setJoiningData(prev => ({ ...prev, employeeSignature: signature }))}
          required={true}
        />
      </div>

      {}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            isDark 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all duration-200"
        >
          Save & Continue
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
