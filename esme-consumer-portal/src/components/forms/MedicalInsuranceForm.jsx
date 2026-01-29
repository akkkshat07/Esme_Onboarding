import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, ChevronLeft, Info, User, Heart, Plus, Trash2 } from 'lucide-react';
import SignatureCapture from './SignatureCapture';


export default function MedicalInsuranceForm({ formData, onFormDataChange, onNext, onBack }) {
  const { isDark } = useTheme();
  

  const getValue = (key, ...fallbacks) => {

    if (formData[key]) return formData[key];

    if (formData.joiningFormData?.[key]) return formData.joiningFormData[key];

    if (formData.formFData?.[key]) return formData.formFData[key];

    if (formData.form11Data?.[key]) return formData.form11Data[key];

    if (formData.pfNominationData?.[key]) return formData.pfNominationData[key];

    for (const fb of fallbacks) {
      if (formData[fb]) return formData[fb];
      if (formData.joiningFormData?.[fb]) return formData.joiningFormData[fb];
      if (formData.formFData?.[fb]) return formData.formFData[fb];
      if (formData.form11Data?.[fb]) return formData.form11Data[fb];
      if (formData.pfNominationData?.[fb]) return formData.pfNominationData[fb];
    }
    return '';
  };
  

  const [insuranceData, setInsuranceData] = useState({

    employeeName: getValue('fullName'),
    employeeCode: getValue('employeeCode'),
    dateOfBirth: getValue('dateOfBirth'),
    gender: getValue('gender'),
    mobileNumber: getValue('mobileNumber'),
    email: getValue('email', 'personalEmail'),
    dateOfJoining: getValue('dateOfJoining'),
    department: getValue('department'),
    designation: getValue('designation', 'profession'),
    

    permanentAddress: getValue('permanentAddress'),
    permanentCity: getValue('permanentCity'),
    permanentState: getValue('permanentState'),
    permanentPincode: getValue('permanentPincode'),
    

    emergencyContactName: getValue('emergencyContactName'),
    emergencyContactRelation: getValue('emergencyContactRelation'),
    emergencyContactMobile: getValue('emergencyContactMobile', 'emergencyContactNumber'),
    

    coverageType: getValue('coverageType') || 'self',
    

    includeSpouse: getValue('includeSpouse') || false,
    spouseName: getValue('spouseName'),
    spouseDateOfBirth: getValue('spouseDateOfBirth'),
    spouseGender: getValue('spouseGender'),
    

    includeChildren: getValue('includeChildren') || false,
    children: formData.insuranceChildren || [
      { name: '', dateOfBirth: '', gender: '' }
    ],
    

    includeParents: getValue('includeParents') || false,
    parents: formData.insuranceParents || [
      { name: getValue('fatherName'), relationship: 'Father', dateOfBirth: '', gender: 'M' },
      { name: getValue('motherName'), relationship: 'Mother', dateOfBirth: '', gender: 'F' }
    ],
    

    hasPreExistingCondition: getValue('hasPreExistingCondition') || false,
    preExistingConditionDetails: getValue('preExistingConditionDetails'),
    hasOngoingTreatment: getValue('hasOngoingTreatment') || false,
    ongoingTreatmentDetails: getValue('ongoingTreatmentDetails'),
    

    declarationAccepted: getValue('insuranceDeclarationAccepted') || false,
    declarationDate: new Date().toISOString().split('T')[0],
    declarationPlace: getValue('currentCity'),
    employeeSignature: getValue('insuranceSignature', 'employeeSignature', 'pfNominationSignature', 'form11Signature')
  });


  useEffect(() => {
    if (formData.insuranceData) {
      setInsuranceData(prev => ({ ...prev, ...formData.insuranceData }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setInsuranceData(prev => ({ ...prev, [name]: newValue }));
  };


  const handleChildChange = (index, field, value) => {
    const updated = [...insuranceData.children];
    updated[index] = { ...updated[index], [field]: value };
    setInsuranceData(prev => ({ ...prev, children: updated }));
  };

  const addChild = () => {
    if (insuranceData.children.length < 4) {
      setInsuranceData(prev => ({
        ...prev,
        children: [...prev.children, { name: '', dateOfBirth: '', gender: '' }]
      }));
    }
  };

  const removeChild = (index) => {
    if (insuranceData.children.length > 1) {
      const updated = insuranceData.children.filter((_, i) => i !== index);
      setInsuranceData(prev => ({ ...prev, children: updated }));
    }
  };


  const handleParentChange = (index, field, value) => {
    const updated = [...insuranceData.parents];
    updated[index] = { ...updated[index], [field]: value };
    setInsuranceData(prev => ({ ...prev, parents: updated }));
  };

  const validateForm = () => {

    if (!insuranceData.employeeName || !insuranceData.dateOfBirth) {
      alert('Please fill in all required employee details');
      return false;
    }
    

    if (insuranceData.includeSpouse) {
      if (!insuranceData.spouseName || !insuranceData.spouseDateOfBirth) {
        alert('Please fill in spouse details');
        return false;
      }
    }
    
    if (!insuranceData.declarationAccepted) {
      alert('Please accept the declaration to proceed');
      return false;
    }
    
    if (!insuranceData.employeeSignature) {
      alert('Please provide your signature to proceed');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onFormDataChange({
        ...formData,
        insuranceData: insuranceData,
        coverageType: insuranceData.coverageType,
        includeSpouse: insuranceData.includeSpouse,
        includeChildren: insuranceData.includeChildren,
        includeParents: insuranceData.includeParents,
        insuranceChildren: insuranceData.children,
        insuranceParents: insuranceData.parents,
        insuranceDeclarationAccepted: insuranceData.declarationAccepted,
        insuranceSignature: insuranceData.employeeSignature
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
      <Icon size={20} className={`mt-0.5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
      <div>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
        {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-rose-900/20 border border-rose-800' : 'bg-rose-50 border border-rose-200'}`}>
        <div className="flex items-start gap-3">
          <Info className={`mt-0.5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} size={20} />
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-rose-300' : 'text-rose-800'}`}>
              Medical Insurance Enrollment Form
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              Group Health Insurance coverage provided by ESME Consumer Pvt Ltd.
              Please provide accurate details for yourself and family members you wish to include in the coverage.
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
              value={insuranceData.employeeName}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Employee Code</label>
            <input
              type="text"
              name="employeeCode"
              value={insuranceData.employeeCode}
              onChange={handleChange}
              className={inputClass}
              placeholder="Will be assigned by HR"
              disabled
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={insuranceData.dateOfBirth}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select
              name="gender"
              value={insuranceData.gender}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="T">Transgender</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Mobile Number *</label>
            <input
              type="tel"
              name="mobileNumber"
              value={insuranceData.mobileNumber}
              onChange={handleChange}
              className={inputClass}
              maxLength={10}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              value={insuranceData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Date of Joining</label>
            <input
              type="date"
              name="dateOfJoining"
              value={insuranceData.dateOfJoining}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <input
              type="text"
              name="department"
              value={insuranceData.department}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input
              type="text"
              name="designation"
              value={insuranceData.designation}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
        
        {}
        <div className="mt-4">
          <label className={labelClass}>Permanent Address</label>
          <textarea
            name="permanentAddress"
            value={insuranceData.permanentAddress}
            onChange={handleChange}
            className={`${inputClass} resize-none`}
            rows={2}
            placeholder="Enter complete address"
          />
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            <input
              type="text"
              name="permanentCity"
              value={insuranceData.permanentCity}
              onChange={handleChange}
              className={inputClass}
              placeholder="City"
            />
            <input
              type="text"
              name="permanentState"
              value={insuranceData.permanentState}
              onChange={handleChange}
              className={inputClass}
              placeholder="State"
            />
            <input
              type="text"
              name="permanentPincode"
              value={insuranceData.permanentPincode}
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
        <SectionTitle icon={Heart} title="Emergency Contact" />
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Contact Name</label>
            <input
              type="text"
              name="emergencyContactName"
              value={insuranceData.emergencyContactName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Emergency contact person"
            />
          </div>
          <div>
            <label className={labelClass}>Relationship</label>
            <select
              name="emergencyContactRelation"
              value={insuranceData.emergencyContactRelation}
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
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Mobile Number</label>
            <input
              type="tel"
              name="emergencyContactMobile"
              value={insuranceData.emergencyContactMobile}
              onChange={handleChange}
              className={inputClass}
              placeholder="10-digit mobile"
              maxLength={10}
            />
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Heart} title="Coverage Selection" subtitle="Select family members to include in the health insurance coverage" />
        
        <div className="space-y-4">
          {}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                name="includeSpouse"
                checked={insuranceData.includeSpouse}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="font-medium">Include Spouse</span>
            </label>
            
            {insuranceData.includeSpouse && (
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Spouse Name *</label>
                  <input
                    type="text"
                    name="spouseName"
                    value={insuranceData.spouseName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input
                    type="date"
                    name="spouseDateOfBirth"
                    value={insuranceData.spouseDateOfBirth}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select
                    name="spouseGender"
                    value={insuranceData.spouseGender}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                name="includeChildren"
                checked={insuranceData.includeChildren}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="font-medium">Include Children (up to 25 years)</span>
            </label>
            
            {insuranceData.includeChildren && (
              <div className="mt-4 space-y-4">
                {insuranceData.children.map((child, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Child {index + 1}
                      </span>
                      {insuranceData.children.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChild(index)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Child Name</label>
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                          className={inputClass}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input
                          type="date"
                          value={child.dateOfBirth}
                          onChange={(e) => handleChildChange(index, 'dateOfBirth', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Gender</label>
                        <select
                          value={child.gender}
                          onChange={(e) => handleChildChange(index, 'gender', e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                
                {insuranceData.children.length < 4 && (
                  <button
                    type="button"
                    onClick={addChild}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed transition-all duration-200 ${
                      isDark 
                        ? 'border-slate-600 text-slate-400 hover:border-teal-500 hover:text-teal-400' 
                        : 'border-slate-300 text-slate-500 hover:border-teal-500 hover:text-teal-600'
                    }`}
                  >
                    <Plus size={18} />
                    Add Another Child
                  </button>
                )}
              </div>
            )}
          </div>

          {}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                name="includeParents"
                checked={insuranceData.includeParents}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="font-medium">Include Parents (if covered under policy)</span>
            </label>
            
            {insuranceData.includeParents && (
              <div className="mt-4 space-y-4">
                {insuranceData.parents.map((parent, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {parent.relationship}
                    </span>
                    <div className="grid md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <label className={labelClass}>{parent.relationship} Name</label>
                        <input
                          type="text"
                          value={parent.name}
                          onChange={(e) => handleParentChange(index, 'name', e.target.value)}
                          className={inputClass}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input
                          type="date"
                          value={parent.dateOfBirth}
                          onChange={(e) => handleParentChange(index, 'dateOfBirth', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Gender</label>
                        <select
                          value={parent.gender}
                          onChange={(e) => handleParentChange(index, 'gender', e.target.value)}
                          className={inputClass}
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle icon={Heart} title="Medical History Declaration" />
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                name="hasPreExistingCondition"
                checked={insuranceData.hasPreExistingCondition}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm">Do you or any family member have any pre-existing medical conditions?</span>
            </label>
            
            {insuranceData.hasPreExistingCondition && (
              <div className="mt-3">
                <label className={labelClass}>Please provide details</label>
                <textarea
                  name="preExistingConditionDetails"
                  value={insuranceData.preExistingConditionDetails}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Describe the condition(s), when diagnosed, current treatment, etc."
                />
              </div>
            )}
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}>
            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                name="hasOngoingTreatment"
                checked={insuranceData.hasOngoingTreatment}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm">Is any family member currently undergoing any medical treatment?</span>
            </label>
            
            {insuranceData.hasOngoingTreatment && (
              <div className="mt-3">
                <label className={labelClass}>Please provide details</label>
                <textarea
                  name="ongoingTreatmentDetails"
                  value={insuranceData.ongoingTreatmentDetails}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Describe the treatment, hospital/doctor, expected duration, etc."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          Declaration
        </h4>
        <div className={`text-sm mb-4 space-y-2 ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
          <p>I hereby declare that:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>The information provided above is true, complete, and correct to the best of my knowledge.</li>
            <li>I have disclosed all pre-existing medical conditions for myself and family members.</li>
            <li>I understand that non-disclosure or misrepresentation may result in claim rejection.</li>
            <li>I authorize the company and insurance provider to verify the information provided.</li>
            <li>I agree to abide by the terms and conditions of the Group Health Insurance Policy.</li>
          </ol>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Place</label>
            <input
              type="text"
              name="declarationPlace"
              value={insuranceData.declarationPlace}
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
              value={insuranceData.declarationDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
        <label className={`flex items-center gap-2 cursor-pointer mt-4 mb-6 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          <input
            type="checkbox"
            name="declarationAccepted"
            checked={insuranceData.declarationAccepted}
            onChange={handleChange}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm font-medium">I accept the above declaration *</span>
        </label>
        
        {}
        <SignatureCapture
          label="Employee Signature"
          value={insuranceData.employeeSignature}
          onChange={(signature) => setInsuranceData(prev => ({ ...prev, employeeSignature: signature }))}
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
