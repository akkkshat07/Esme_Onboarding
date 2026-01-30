import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, ChevronLeft, Info, User, Briefcase, FileText } from 'lucide-react';
import SignatureCapture from './SignatureCapture';


export default function Form11({ formData, onFormDataChange, onNext, onBack }) {
  const { isDark } = useTheme();
  

  const getValue = (key, ...fallbacks) => {

    if (formData[key]) return formData[key];

    if (formData.joiningFormData?.[key]) return formData.joiningFormData[key];

    if (formData.formFData?.[key]) return formData.formFData[key];

    for (const fb of fallbacks) {
      if (formData[fb]) return formData[fb];
      if (formData.joiningFormData?.[fb]) return formData.joiningFormData[fb];
      if (formData.formFData?.[fb]) return formData.formFData[fb];
    }
    return '';
  };
  

  const [form11Data, setForm11Data] = useState({

    fullName: getValue('fullName'),
    fatherName: getValue('fatherName'),
    dateOfBirth: getValue('dateOfBirth'),
    gender: getValue('gender'),
    maritalStatus: getValue('maritalStatus'),
    mobileNumber: getValue('mobileNumber'),
    email: getValue('email', 'personalEmail'),
    

    education: getValue('education', 'highestQualification', 'qualification'),
    

    speciallyAbled: getValue('speciallyAbled') || 'no',
    disabilityType: getValue('disabilityType'),
    

    currentEmployerName: getValue('currentEmployerName', 'employerName') || 'ESME Consumer Pvt Ltd',
    dateOfJoining: getValue('dateOfJoining'),
    

    permanentAddress: getValue('permanentAddress'),
    permanentCity: getValue('permanentCity'),
    permanentState: getValue('permanentState'),
    permanentPincode: getValue('permanentPincode'),
    

    aadhaarNumber: getValue('aadhaarNumber'),
    panNumber: getValue('panNumber'),
    uanNumber: getValue('uanNumber'),
    

    bankAccountNumber: getValue('bankAccountNumber', 'accountNumber'),
    ifscCode: getValue('ifscCode'),
    bankName: getValue('bankName'),
    

    hasPreviousEmployment: getValue('hasPreviousEmployment') || false,
    previousPFMember: getValue('previousPFMember') || false,
    previousPensionMember: getValue('previousPensionMember') || false,
    previousUAN: getValue('previousUAN'),
    previousPFNumber: getValue('previousPFNumber'),
    previousEmploymentExitDate: getValue('previousEmploymentExitDate'),
    schemeClaimSettled: getValue('schemeClaimSettled'),
    pfClaimSettled: getValue('pfClaimSettled'),
    

    pensionClaimReceived: getValue('pensionClaimReceived') || false,
    internationalWorker: getValue('internationalWorker') || false,
    passportNumber: getValue('passportNumber'),
    passportValidityFrom: getValue('passportValidityFrom'),
    passportValidityTo: getValue('passportValidity', 'passportValidityTo'),
    countryOfOrigin: getValue('countryOfOrigin') || 'India',
    

    optForEPS: formData.optForEPS !== undefined ? formData.optForEPS : true,
    optForHigherPension: getValue('optForHigherPension') || false,
    

    nomineeName: getValue('nomineeName') || formData.formFData?.nominees?.[0]?.name || formData.formF_nominees?.[0]?.name || '',
    nomineeRelationship: getValue('nomineeRelationship') || formData.formFData?.nominees?.[0]?.relationship || formData.formF_nominees?.[0]?.relationship || '',
    nomineeAddress: getValue('nomineeAddress') || formData.formFData?.nominees?.[0]?.address || formData.formF_nominees?.[0]?.address || '',
    nomineeDateOfBirth: getValue('nomineeDateOfBirth'),
    nomineeAadhaar: getValue('nomineeAadhaar'),
    

    declarationAccepted: getValue('form11DeclarationAccepted') || false,
    declarationDate: new Date().toISOString().split('T')[0],
    declarationPlace: getValue('currentCity'),
    employeeSignature: getValue('form11Signature', 'employeeSignature')
  });


  useEffect(() => {
    if (formData.form11Data) {
      setForm11Data(prev => ({ ...prev, ...formData.form11Data }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm11Data(prev => ({ ...prev, [name]: newValue }));
  };

  const validateForm = () => {
    const requiredFields = [
      'fullName', 'fatherName', 'dateOfBirth', 'gender', 'mobileNumber',
      'permanentAddress', 'permanentCity', 'permanentState', 'permanentPincode',
      'dateOfJoining', 'bankAccountNumber', 'ifscCode'
    ];
    
    for (const field of requiredFields) {
      if (!form11Data[field]) {
        alert(`Please fill in the required field: ${field.replace(/([A-Z])/g, ' $1').trim()}`);
        return false;
      }
    }
    
    if (!form11Data.declarationAccepted) {
      alert('Please accept the declaration to proceed');
      return false;
    }
    
    if (!form11Data.employeeSignature) {
      alert('Please provide your signature to proceed');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onFormDataChange({
        ...formData,
        form11Data: form11Data,
        uanNumber: form11Data.uanNumber,
        previousUAN: form11Data.previousUAN,
        previousPFNumber: form11Data.previousPFNumber,
        optForEPS: form11Data.optForEPS,
        education: form11Data.education,
        speciallyAbled: form11Data.speciallyAbled,
        disabilityType: form11Data.disabilityType,
        form11DeclarationAccepted: form11Data.declarationAccepted,
        form11Signature: form11Data.employeeSignature
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
      <Icon size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
      <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
            <Info className={isDark ? 'text-purple-400' : 'text-purple-600'} size={18} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Form 11 - EPF/EPS Declaration Form
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Declaration by a person taking up employment under EPF Scheme, 1952 and EPS, 1995.
              This form is mandatory for PF registration with your new employer.
            </p>
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Personal Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Name (As per Aadhaar) *</label>
            <input
              type="text"
              name="fullName"
              value={form11Data.fullName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Father's/Spouse Name *</label>
            <input
              type="text"
              name="fatherName"
              value={form11Data.fatherName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter father's/spouse name"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form11Data.dateOfBirth}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Gender *</label>
            <select
              name="gender"
              value={form11Data.gender}
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
            <label className={labelClass}>Marital Status</label>
            <select
              name="maritalStatus"
              value={form11Data.maritalStatus}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Mobile Number *</label>
            <input
              type="tel"
              name="mobileNumber"
              value={form11Data.mobileNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="10-digit mobile number"
              maxLength={10}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form11Data.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter email"
            />
          </div>
          
          {}
          <div>
            <label className={labelClass}>Educational Qualification *</label>
            <select
              name="education"
              value={form11Data.education}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Qualification</option>
              <option value="Illiterate">Illiterate</option>
              <option value="Non-Matric">Non-Matric (Below 10th)</option>
              <option value="10th">10th / Matric</option>
              <option value="12th">12th / Senior Secondary</option>
              <option value="Diploma">Diploma / ITI</option>
              <option value="Graduate">Graduate (B.Tech/B.Sc/B.Com/BA etc.)</option>
              <option value="Post Graduate">Post Graduate (M.Tech/MBA/MCA/M.Sc etc.)</option>
              <option value="PhD">PhD / Doctorate</option>
            </select>
          </div>
          
          {}
          <div>
            <label className={labelClass}>Are you Specially Abled?</label>
            <select
              name="speciallyAbled"
              value={form11Data.speciallyAbled}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          
          {form11Data.speciallyAbled === 'yes' && (
            <div>
              <label className={labelClass}>Type of Disability</label>
              <select
                name="disabilityType"
                value={form11Data.disabilityType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Type</option>
                <option value="Locomotive">Locomotive (Physical)</option>
                <option value="Visual">Visual (Blind/Low Vision)</option>
                <option value="Hearing">Hearing (Deaf/Hard of Hearing)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="Permanent Address (As per Aadhaar)" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Address *</label>
            <textarea
              name="permanentAddress"
              value={form11Data.permanentAddress}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
              rows={2}
              placeholder="Enter complete address"
              required
            />
          </div>
          <div>
            <label className={labelClass}>City/District *</label>
            <input
              type="text"
              name="permanentCity"
              value={form11Data.permanentCity}
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
              name="permanentState"
              value={form11Data.permanentState}
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
              name="permanentPincode"
              value={form11Data.permanentPincode}
              onChange={handleChange}
              className={inputClass}
              placeholder="6-digit pincode"
              maxLength={6}
              required
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Briefcase} title="Present Employment Details" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Employer Name *</label>
            <input
              type="text"
              name="currentEmployerName"
              value={form11Data.currentEmployerName}
              onChange={handleChange}
              className={inputClass}
              required
              placeholder="Enter employer name"
            />
          </div>
          <div>
            <label className={labelClass}>Date of Joining *</label>
            <input
              type="date"
              name="dateOfJoining"
              value={form11Data.dateOfJoining}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={FileText} title="KYC Details" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Aadhaar Number</label>
            <input
              type="text"
              name="aadhaarNumber"
              value={form11Data.aadhaarNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="XXXX-XXXX-XXXX"
              maxLength={14}
            />
          </div>
          <div>
            <label className={labelClass}>PAN Number</label>
            <input
              type="text"
              name="panNumber"
              value={form11Data.panNumber}
              onChange={handleChange}
              className={`${inputClass} uppercase`}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </div>
          <div>
            <label className={labelClass}>UAN (if allotted earlier)</label>
            <input
              type="text"
              name="uanNumber"
              value={form11Data.uanNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="12-digit UAN"
              maxLength={12}
            />
          </div>
          <div>
            <label className={labelClass}>Bank Account Number *</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={form11Data.bankAccountNumber}
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
              value={form11Data.ifscCode}
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
        <SectionTitle icon={Briefcase} title="Previous Employment Details (EPF/EPS)" />
        
        <div className="space-y-4">
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              name="hasPreviousEmployment"
              checked={form11Data.hasPreviousEmployment}
              onChange={handleChange}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span className="text-sm">I have previous employment</span>
          </label>

          {form11Data.hasPreviousEmployment && (
            <>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input
                    type="checkbox"
                    name="previousPFMember"
                    checked={form11Data.previousPFMember}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm">Were you a member of EPF Scheme earlier?</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input
                    type="checkbox"
                    name="previousPensionMember"
                    checked={form11Data.previousPensionMember}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm">Were you a member of EPS, 1995 earlier?</span>
                </label>
              </div>

              {(form11Data.previousPFMember || form11Data.previousPensionMember) && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Previous UAN</label>
                    <input
                      type="text"
                      name="previousUAN"
                      value={form11Data.previousUAN}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="12-digit UAN from previous employment"
                      maxLength={12}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Previous PF Account Number</label>
                    <input
                      type="text"
                      name="previousPFNumber"
                      value={form11Data.previousPFNumber}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g., MH/BAN/12345/123"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Date of Exit from Previous Employment</label>
                    <input
                      type="date"
                      name="previousEmploymentExitDate"
                      value={form11Data.previousEmploymentExitDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>EPF Scheme Claim Settled?</label>
                    <select
                      name="schemeClaimSettled"
                      value={form11Data.schemeClaimSettled}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="NA">Not Applicable</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Pension Claim Received/Applied?</label>
                    <select
                      name="pfClaimSettled"
                      value={form11Data.pfClaimSettled}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="NA">Not Applicable</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={User} title="International Worker Details" />
        <div className="space-y-4">
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              name="internationalWorker"
              checked={form11Data.internationalWorker}
              onChange={handleChange}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span className="text-sm">Are you an International Worker?</span>
          </label>

          {form11Data.internationalWorker && (
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className={labelClass}>Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={form11Data.passportNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter passport number"
                />
              </div>
              <div>
                <label className={labelClass}>Passport Valid From</label>
                <input
                  type="date"
                  name="passportValidityFrom"
                  value={form11Data.passportValidityFrom}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Passport Valid To</label>
                <input
                  type="date"
                  name="passportValidityTo"
                  value={form11Data.passportValidityTo}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Country of Origin</label>
                <input
                  type="text"
                  name="countryOfOrigin"
                  value={form11Data.countryOfOrigin}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter country"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={FileText} title="EPF/EPS Scheme Options" />
        <div className="space-y-4">
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              name="optForEPS"
              checked={form11Data.optForEPS}
              onChange={handleChange}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span className="text-sm">I opt for Employee Pension Scheme (EPS), 1995</span>
          </label>
          
          <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
            <p><strong>Note:</strong> If you opt for EPS, 8.33% of your basic salary (up to ₹15,000) will be diverted to the pension fund. 
            If you don't opt, the entire 12% employer contribution will go to your EPF account.</p>
          </div>
        </div>
      </div>

      {}
      {form11Data.optForEPS && (
        <div className={sectionClass}>
          <SectionTitle icon={User} title="Nominee Details (For EPS)" />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nominee Name</label>
              <input
                type="text"
                name="nomineeName"
                value={form11Data.nomineeName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter nominee name"
              />
            </div>
            <div>
              <label className={labelClass}>Relationship with Member</label>
              <select
                name="nomineeRelationship"
                value={form11Data.nomineeRelationship}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Nominee Date of Birth</label>
              <input
                type="date"
                name="nomineeDateOfBirth"
                value={form11Data.nomineeDateOfBirth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nominee Aadhaar Number</label>
              <input
                type="text"
                name="nomineeAadhaar"
                value={form11Data.nomineeAadhaar}
                onChange={handleChange}
                className={inputClass}
                placeholder="XXXX-XXXX-XXXX"
                maxLength={14}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Nominee Address</label>
              <textarea
                name="nomineeAddress"
                value={form11Data.nomineeAddress}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Enter nominee address"
              />
            </div>
          </div>
        </div>
      )}

      {}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          Declaration
        </h4>
        <div className={`text-sm mb-4 space-y-2 ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
          <p>I hereby declare that:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>The above particulars furnished by me are true to the best of my knowledge.</li>
            <li>I shall be solely responsible for any wrong declaration made above.</li>
            <li>I authorize EPFO to use my Aadhaar for validation with UIDAI.</li>
            <li>I consent to receive SMS/Email on my registered mobile number and email.</li>
          </ol>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Place</label>
            <input
              type="text"
              name="declarationPlace"
              value={form11Data.declarationPlace}
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
              value={form11Data.declarationDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
        <label className={`flex items-center gap-2 cursor-pointer mt-4 mb-6 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          <input
            type="checkbox"
            name="declarationAccepted"
            checked={form11Data.declarationAccepted}
            onChange={handleChange}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm font-medium">I accept the above declaration *</span>
        </label>
        
        {}
        <SignatureCapture
          label="Employee Signature"
          value={form11Data.employeeSignature}
          onChange={(signature) => setForm11Data(prev => ({ ...prev, employeeSignature: signature }))}
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
