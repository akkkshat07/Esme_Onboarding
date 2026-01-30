import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, ChevronLeft, Info, User, Shield, AlertTriangle } from 'lucide-react';
import SignatureCapture from './SignatureCapture';


export default function SelfDeclarationForm({ formData, onFormDataChange, onNext, onBack }) {
  const { isDark } = useTheme();
  

  const getValue = (key, ...fallbacks) => {

    if (formData[key]) return formData[key];

    if (formData.joiningFormData?.[key]) return formData.joiningFormData[key];

    if (formData.formFData?.[key]) return formData.formFData[key];

    if (formData.form11Data?.[key]) return formData.form11Data[key];

    if (formData.pfNominationData?.[key]) return formData.pfNominationData[key];

    if (formData.insuranceData?.[key]) return formData.insuranceData[key];

    for (const fb of fallbacks) {
      if (formData[fb]) return formData[fb];
      if (formData.joiningFormData?.[fb]) return formData.joiningFormData[fb];
      if (formData.formFData?.[fb]) return formData.formFData[fb];
      if (formData.form11Data?.[fb]) return formData.form11Data[fb];
      if (formData.pfNominationData?.[fb]) return formData.pfNominationData[fb];
      if (formData.insuranceData?.[fb]) return formData.insuranceData[fb];
    }
    return '';
  };
  

  const [declarationData, setDeclarationData] = useState({

    employeeName: getValue('fullName'),
    fatherName: getValue('fatherName'),
    dateOfBirth: getValue('dateOfBirth'),
    dateOfJoining: getValue('dateOfJoining'),
    department: getValue('department'),
    designation: getValue('designation', 'profession'),
    

    permanentAddress: getValue('permanentAddress'),
    permanentCity: getValue('permanentCity'),
    permanentState: getValue('permanentState'),
    permanentPincode: getValue('permanentPincode'),
    

    hasCriminalRecord: getValue('hasCriminalRecord') || false,
    criminalRecordDetails: getValue('criminalRecordDetails'),
    hasPendingCase: getValue('hasPendingCase') || false,
    pendingCaseDetails: getValue('pendingCaseDetails'),
    hasArrestedBefore: getValue('hasArrestedBefore') || false,
    arrestDetails: getValue('arrestDetails'),
    

    hasTerminatedBefore: getValue('hasTerminatedBefore') || false,
    terminationDetails: getValue('terminationDetails'),
    hasResignedUnderInquiry: getValue('hasResignedUnderInquiry') || false,
    resignationInquiryDetails: getValue('resignationInquiryDetails'),
    hasBlacklistedBefore: getValue('hasBlacklistedBefore') || false,
    blacklistDetails: getValue('blacklistDetails'),
    

    hasValidDocuments: formData.hasValidDocuments !== false,
    hasNoFalseCertificates: formData.hasNoFalseCertificates !== false,
    hasDeclaredAllEmployments: formData.hasDeclaredAllEmployments !== false,
    

    hasEmploymentGap: getValue('hasEmploymentGap') || false,
    employmentGapDetails: getValue('employmentGapDetails'),
    employmentGapFrom: getValue('employmentGapFrom'),
    employmentGapTo: getValue('employmentGapTo'),
    employmentGapReason: getValue('employmentGapReason'),
    

    hasRelativeInCompany: getValue('hasRelativeInCompany') || false,
    relativeDetails: getValue('relativeDetails'),
    relativeName: getValue('relativeName'),
    relativeRelationship: getValue('relativeRelationship'),
    relativeDepartment: getValue('relativeDepartment'),
    

    hasHealthIssue: getValue('hasHealthIssue') || false,
    healthIssueDetails: getValue('healthIssueDetails'),
    isFitToWork: formData.isFitToWork !== false,
    

    declarationAccepted: getValue('selfDeclarationAccepted') || false,
    declarationDate: new Date().toISOString().split('T')[0],
    declarationPlace: getValue('currentCity'),
    employeeSignature: getValue('selfDeclarationSignature', 'employeeSignature', 'insuranceSignature', 'pfNominationSignature', 'form11Signature')
  });


  useEffect(() => {
    if (formData.selfDeclarationData) {
      setDeclarationData(prev => ({ ...prev, ...formData.selfDeclarationData }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setDeclarationData(prev => ({ ...prev, [name]: newValue }));
  };

  const validateForm = () => {
    if (!declarationData.employeeName || !declarationData.dateOfBirth) {
      alert('Please fill in all required employee details');
      return false;
    }
    
    if (!declarationData.declarationAccepted) {
      alert('Please accept the declaration to proceed');
      return false;
    }
    
    if (!declarationData.employeeSignature) {
      alert('Please provide your signature to proceed');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onFormDataChange({
        ...formData,
        selfDeclarationData: declarationData,
        hasCriminalRecord: declarationData.hasCriminalRecord,
        hasTerminatedBefore: declarationData.hasTerminatedBefore,
        hasRelativeInCompany: declarationData.hasRelativeInCompany,
        selfDeclarationAccepted: declarationData.declarationAccepted,
        selfDeclarationSignature: declarationData.employeeSignature
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

  const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <div className={`flex items-start gap-2 mb-4 pb-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
      <Icon size={20} className={`mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
      <div>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
        {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
  );

  const DeclarationQuestion = ({ question, name, checked, onChange, children }) => (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
      <label className={`flex items-start gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 mt-0.5 text-teal-600 rounded focus:ring-teal-500"
        />
        <span className="text-sm">{question}</span>
      </label>
      {checked && children && (
        <div className="mt-3 pl-7">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
            <Info className={isDark ? 'text-amber-400' : 'text-amber-600'} size={18} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Self Declaration Form - ESME Consumer Pvt Ltd
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              This declaration form is mandatory for all new employees. Please answer all questions honestly.
              Any false declaration may result in termination of employment.
            </p>
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Employee Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              name="employeeName"
              value={declarationData.employeeName}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={declarationData.fatherName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={declarationData.dateOfBirth}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Date of Joining</label>
            <input
              type="date"
              name="dateOfJoining"
              value={declarationData.dateOfJoining}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <input
              type="text"
              name="department"
              value={declarationData.department}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input
              type="text"
              name="designation"
              value={declarationData.designation}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className={labelClass}>Permanent Address</label>
          <textarea
            name="permanentAddress"
            value={declarationData.permanentAddress}
            onChange={handleChange}
            className={`${inputClass} resize-none`}
            rows={2}
          />
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            <input
              type="text"
              name="permanentCity"
              value={declarationData.permanentCity}
              onChange={handleChange}
              className={inputClass}
              placeholder="City"
            />
            <input
              type="text"
              name="permanentState"
              value={declarationData.permanentState}
              onChange={handleChange}
              className={inputClass}
              placeholder="State"
            />
            <input
              type="text"
              name="permanentPincode"
              value={declarationData.permanentPincode}
              onChange={handleChange}
              className={inputClass}
              placeholder="Pincode"
              maxLength={6}
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle 
          icon={AlertTriangle} 
          title="Criminal Record Declaration" 
          subtitle="Please answer the following questions truthfully"
        />
        
        <div className="space-y-4">
          <DeclarationQuestion
            question="Have you ever been convicted by any court of law for any criminal offense?"
            name="hasCriminalRecord"
            checked={declarationData.hasCriminalRecord}
            onChange={handleChange}
          >
            <div>
              <label className={labelClass}>Please provide details</label>
              <textarea
                name="criminalRecordDetails"
                value={declarationData.criminalRecordDetails}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Case details, court name, verdict, etc."
              />
            </div>
          </DeclarationQuestion>

          <DeclarationQuestion
            question="Do you have any pending criminal case against you in any court of law?"
            name="hasPendingCase"
            checked={declarationData.hasPendingCase}
            onChange={handleChange}
          >
            <div>
              <label className={labelClass}>Please provide details</label>
              <textarea
                name="pendingCaseDetails"
                value={declarationData.pendingCaseDetails}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Case details, court name, current status, etc."
              />
            </div>
          </DeclarationQuestion>

          <DeclarationQuestion
            question="Have you ever been arrested by police or any law enforcement agency?"
            name="hasArrestedBefore"
            checked={declarationData.hasArrestedBefore}
            onChange={handleChange}
          >
            <div>
              <label className={labelClass}>Please provide details</label>
              <textarea
                name="arrestDetails"
                value={declarationData.arrestDetails}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Date, reason, outcome, etc."
              />
            </div>
          </DeclarationQuestion>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle 
          icon={Shield} 
          title="Employment History Declaration" 
        />
        
        <div className="space-y-4">
          <DeclarationQuestion
            question="Have you ever been terminated/dismissed from any previous employment?"
            name="hasTerminatedBefore"
            checked={declarationData.hasTerminatedBefore}
            onChange={handleChange}
          >
            <div>
              <label className={labelClass}>Please provide details</label>
              <textarea
                name="terminationDetails"
                value={declarationData.terminationDetails}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Company name, reason for termination, date, etc."
              />
            </div>
          </DeclarationQuestion>

          <DeclarationQuestion
            question="Have you ever resigned while under investigation or inquiry by any employer?"
            name="hasResignedUnderInquiry"
            checked={declarationData.hasResignedUnderInquiry}
            onChange={handleChange}
          >
            <div>
              <label className={labelClass}>Please provide details</label>
              <textarea
                name="resignationInquiryDetails"
                value={declarationData.resignationInquiryDetails}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Company name, nature of inquiry, outcome, etc."
              />
            </div>
          </DeclarationQuestion>

          <DeclarationQuestion
            question="Have you ever been blacklisted by any organization or industry body?"
            name="hasBlacklistedBefore"
            checked={declarationData.hasBlacklistedBefore}
            onChange={handleChange}
          >
            <div>
              <label className={labelClass}>Please provide details</label>
              <textarea
                name="blacklistDetails"
                value={declarationData.blacklistDetails}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Organization name, reason, current status, etc."
              />
            </div>
          </DeclarationQuestion>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Gap in Employment" />
        
        <DeclarationQuestion
          question="Is there any gap of more than 3 months in your employment history?"
          name="hasEmploymentGap"
          checked={declarationData.hasEmploymentGap}
          onChange={handleChange}
        >
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gap From</label>
                <input
                  type="date"
                  name="employmentGapFrom"
                  value={declarationData.employmentGapFrom}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gap To</label>
                <input
                  type="date"
                  name="employmentGapTo"
                  value={declarationData.employmentGapTo}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Reason for Gap</label>
              <select
                name="employmentGapReason"
                value={declarationData.employmentGapReason}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Reason</option>
                <option value="Higher Education">Higher Education</option>
                <option value="Health Issues">Health Issues</option>
                <option value="Personal Reasons">Personal Reasons</option>
                <option value="Career Break">Career Break</option>
                <option value="Family Responsibilities">Family Responsibilities</option>
                <option value="Job Search">Job Search</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Additional Details</label>
              <textarea
                name="employmentGapDetails"
                value={declarationData.employmentGapDetails}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Please provide any additional details"
              />
            </div>
          </div>
        </DeclarationQuestion>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Relative in Company" />
        
        <DeclarationQuestion
          question="Do you have any relative currently employed at ESME Consumer Pvt Ltd?"
          name="hasRelativeInCompany"
          checked={declarationData.hasRelativeInCompany}
          onChange={handleChange}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Relative Name</label>
              <input
                type="text"
                name="relativeName"
                value={declarationData.relativeName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className={labelClass}>Relationship</label>
              <select
                name="relativeRelationship"
                value={declarationData.relativeRelationship}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Uncle">Uncle</option>
                <option value="Aunt">Aunt</option>
                <option value="Cousin">Cousin</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input
                type="text"
                name="relativeDepartment"
                value={declarationData.relativeDepartment}
                onChange={handleChange}
                className={inputClass}
                placeholder="Their department"
              />
            </div>
          </div>
        </DeclarationQuestion>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Shield} title="Health & Fitness Declaration" />
        
        <div className="space-y-4">
          <DeclarationQuestion
            question="Do you have any physical or mental health condition that may affect your work?"
            name="hasHealthIssue"
            checked={declarationData.hasHealthIssue}
            onChange={handleChange}
          >
            <div>
              <label className={labelClass}>Please provide details</label>
              <textarea
                name="healthIssueDetails"
                value={declarationData.healthIssueDetails}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Nature of condition, current status, any accommodations needed, etc."
              />
            </div>
          </DeclarationQuestion>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
            <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-green-300' : 'text-green-700'}`}>
              <input
                type="checkbox"
                name="isFitToWork"
                checked={declarationData.isFitToWork}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm font-medium">I confirm that I am physically and mentally fit to perform the duties of my role</span>
            </label>
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Shield} title="Professional Affirmations" />
        
        <div className="space-y-3">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
            <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                name="hasValidDocuments"
                checked={declarationData.hasValidDocuments}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm">All educational and professional documents submitted by me are genuine and valid</span>
            </label>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
            <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                name="hasNoFalseCertificates"
                checked={declarationData.hasNoFalseCertificates}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm">I have not submitted any false or forged documents/certificates</span>
            </label>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
            <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                name="hasDeclaredAllEmployments"
                checked={declarationData.hasDeclaredAllEmployments}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm">I have declared all my previous employments without hiding any information</span>
            </label>
          </div>
        </div>
      </div>

      {}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-red-300' : 'text-red-800'}`}>
          Final Declaration
        </h4>
        <div className={`text-sm mb-4 space-y-2 ${isDark ? 'text-red-300/80' : 'text-red-700'}`}>
          <p className="font-medium">I, {declarationData.employeeName || '[Employee Name]'}, hereby solemnly declare and affirm that:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>All information provided in this declaration and throughout the onboarding process is true, complete, and correct to the best of my knowledge and belief.</li>
            <li>I have not withheld any material information that could affect my employment.</li>
            <li>I understand that any false statement, misrepresentation, or concealment of facts in this declaration may result in:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Immediate termination of employment</li>
                <li>Legal action as deemed appropriate by the company</li>
                <li>Forfeiture of any benefits or dues</li>
              </ul>
            </li>
            <li>I authorize ESME Consumer Pvt Ltd to verify all information provided and conduct background verification.</li>
          </ol>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Place</label>
            <input
              type="text"
              name="declarationPlace"
              value={declarationData.declarationPlace}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter place"
            />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              name="declarationDate"
              value={declarationData.declarationDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
        <label className={`flex items-center gap-2 cursor-pointer mt-4 mb-6 ${isDark ? 'text-red-300' : 'text-red-800'}`}>
          <input
            type="checkbox"
            name="declarationAccepted"
            checked={declarationData.declarationAccepted}
            onChange={handleChange}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm font-medium">I have read, understood, and accept the above declaration *</span>
        </label>
        
        {}
        <SignatureCapture
          label="Employee Signature"
          value={declarationData.employeeSignature}
          onChange={(signature) => setDeclarationData(prev => ({ ...prev, employeeSignature: signature }))}
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
          Save & Continue to Documents
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
