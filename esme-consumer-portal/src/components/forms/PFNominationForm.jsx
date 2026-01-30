import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, ChevronLeft, Info, User, Plus, Trash2 } from 'lucide-react';
import SignatureCapture from './SignatureCapture';


export default function PFNominationForm({ formData, onFormDataChange, onNext, onBack }) {
  const { isDark } = useTheme();
  

  const getValue = (key, ...fallbacks) => {

    if (formData[key]) return formData[key];

    if (formData.joiningFormData?.[key]) return formData.joiningFormData[key];

    if (formData.formFData?.[key]) return formData.formFData[key];

    if (formData.form11Data?.[key]) return formData.form11Data[key];

    for (const fb of fallbacks) {
      if (formData[fb]) return formData[fb];
      if (formData.joiningFormData?.[fb]) return formData.joiningFormData[fb];
      if (formData.formFData?.[fb]) return formData.formFData[fb];
      if (formData.form11Data?.[fb]) return formData.form11Data[fb];
    }
    return '';
  };
  

  const getPreviousNominees = () => {

    if (formData.form11Data?.nomineeName) {
      return [{
        name: formData.form11Data.nomineeName || '',
        relationship: formData.form11Data.nomineeRelationship || '',
        dateOfBirth: formData.form11Data.nomineeDateOfBirth || '',
        sharePercent: '100',
        address: formData.form11Data.nomineeAddress || '',
        guardianName: '',
        guardianRelation: '',
        guardianAddress: ''
      }];
    }

    if (formData.formFData?.nominees?.length > 0) {
      return formData.formFData.nominees.map(n => ({
        name: n.name || '',
        relationship: n.relationship || '',
        dateOfBirth: '',
        sharePercent: n.sharePercent || '',
        address: n.address || '',
        guardianName: '',
        guardianRelation: '',
        guardianAddress: ''
      }));
    }

    if (formData.formF_nominees?.length > 0) {
      return formData.formF_nominees.map(n => ({
        name: n.name || '',
        relationship: n.relationship || '',
        dateOfBirth: '',
        sharePercent: n.sharePercent || '',
        address: n.address || '',
        guardianName: '',
        guardianRelation: '',
        guardianAddress: ''
      }));
    }

    return [{
      name: getValue('nomineeName', 'emergencyContactName'),
      relationship: getValue('nomineeRelationship', 'emergencyContactRelation'),
      dateOfBirth: '',
      sharePercent: '100',
      address: getValue('nomineeAddress', 'emergencyContactAddress'),
      guardianName: '',
      guardianRelation: '',
      guardianAddress: ''
    }];
  };
  

  const [pfNominationData, setPfNominationData] = useState({

    employeeName: getValue('fullName'),
    fatherOrSpouseName: getValue('fatherName'),
    dateOfBirth: getValue('dateOfBirth'),
    gender: getValue('gender'),
    maritalStatus: getValue('maritalStatus'),
    accountNumber: getValue('pfAccountNumber'),
    dateOfJoining: getValue('dateOfJoining'),
    

    permanentAddress: getValue('permanentAddress'),
    permanentCity: getValue('permanentCity'),
    permanentState: getValue('permanentState'),
    permanentPincode: getValue('permanentPincode'),
    

    epfNominees: formData.epfNominees || getPreviousNominees(),
    

    epsFamilyNominees: formData.epsFamilyNominees || [
      {
        name: getValue('spouseName') || '',
        relationship: getValue('maritalStatus') === 'Married' ? 'Spouse' : '',
        dateOfBirth: '',
        address: getValue('permanentAddress')
      }
    ],
    

    declarationAccepted: getValue('pfNominationDeclarationAccepted') || false,
    declarationDate: new Date().toISOString().split('T')[0],
    declarationPlace: getValue('currentCity'),
    employeeSignature: getValue('pfNominationSignature', 'employeeSignature', 'form11Signature')
  });


  useEffect(() => {
    if (formData.pfNominationData) {
      setPfNominationData(prev => ({ ...prev, ...formData.pfNominationData }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setPfNominationData(prev => ({ ...prev, [name]: newValue }));
  };


  const handleEpfNomineeChange = (index, field, value) => {
    const updated = [...pfNominationData.epfNominees];
    updated[index] = { ...updated[index], [field]: value };
    setPfNominationData(prev => ({ ...prev, epfNominees: updated }));
  };

  const addEpfNominee = () => {
    if (pfNominationData.epfNominees.length < 4) {
      setPfNominationData(prev => ({
        ...prev,
        epfNominees: [...prev.epfNominees, {
          name: '',
          relationship: '',
          dateOfBirth: '',
          sharePercent: '',
          address: '',
          guardianName: '',
          guardianRelation: '',
          guardianAddress: ''
        }]
      }));
    }
  };

  const removeEpfNominee = (index) => {
    if (pfNominationData.epfNominees.length > 1) {
      const updated = pfNominationData.epfNominees.filter((_, i) => i !== index);
      setPfNominationData(prev => ({ ...prev, epfNominees: updated }));
    }
  };


  const handleEpsNomineeChange = (index, field, value) => {
    const updated = [...pfNominationData.epsFamilyNominees];
    updated[index] = { ...updated[index], [field]: value };
    setPfNominationData(prev => ({ ...prev, epsFamilyNominees: updated }));
  };

  const addEpsNominee = () => {
    if (pfNominationData.epsFamilyNominees.length < 4) {
      setPfNominationData(prev => ({
        ...prev,
        epsFamilyNominees: [...prev.epsFamilyNominees, {
          name: '',
          relationship: '',
          dateOfBirth: '',
          address: ''
        }]
      }));
    }
  };

  const removeEpsNominee = (index) => {
    if (pfNominationData.epsFamilyNominees.length > 1) {
      const updated = pfNominationData.epsFamilyNominees.filter((_, i) => i !== index);
      setPfNominationData(prev => ({ ...prev, epsFamilyNominees: updated }));
    }
  };

  const validateForm = () => {

    if (!pfNominationData.employeeName || !pfNominationData.dateOfBirth || !pfNominationData.dateOfJoining) {
      alert('Please fill in all required employee details');
      return false;
    }
    

    const validEpfNominees = pfNominationData.epfNominees.filter(n => n.name && n.relationship);
    if (validEpfNominees.length === 0) {
      alert('Please add at least one EPF nominee');
      return false;
    }
    

    const totalShare = pfNominationData.epfNominees.reduce((sum, n) => sum + (parseFloat(n.sharePercent) || 0), 0);
    if (Math.abs(totalShare - 100) > 0.01) {
      alert(`Total EPF share percentage must equal 100%. Current total: ${totalShare}%`);
      return false;
    }
    
    if (!pfNominationData.declarationAccepted) {
      alert('Please accept the declaration to proceed');
      return false;
    }
    
    if (!pfNominationData.employeeSignature) {
      alert('Please provide your signature to proceed');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onFormDataChange({
        ...formData,
        pfNominationData: pfNominationData,
        epfNominees: pfNominationData.epfNominees,
        epsFamilyNominees: pfNominationData.epsFamilyNominees,
        pfNominationDeclarationAccepted: pfNominationData.declarationAccepted,
        pfNominationSignature: pfNominationData.employeeSignature
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
      <Icon size={20} className={`mt-0.5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
      <div>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
        {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
  );

  const relationshipOptions = [
    'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister',
    'Father-in-law', 'Mother-in-law', 'Grandfather', 'Grandmother', 'Other'
  ];


  const isMinor = (dob) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
            <Info className={isDark ? 'text-teal-400' : 'text-teal-600'} size={18} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              PF Nomination Form
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Nomination under Para 61 of EPF Scheme, 1952 and Para 18 of EPS, 1995.
              This form allows you to nominate beneficiaries for your Provident Fund and Pension benefits.
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
              value={pfNominationData.employeeName}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Father's/Spouse Name *</label>
            <input
              type="text"
              name="fatherOrSpouseName"
              value={pfNominationData.fatherOrSpouseName}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={pfNominationData.dateOfBirth}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select
              name="gender"
              value={pfNominationData.gender}
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
            <label className={labelClass}>Marital Status</label>
            <select
              name="maritalStatus"
              value={pfNominationData.maritalStatus}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date of Joining *</label>
            <input
              type="date"
              name="dateOfJoining"
              value={pfNominationData.dateOfJoining}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
        </div>
        
        {}
        <div className="mt-4">
          <label className={labelClass}>Permanent Address</label>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-4">
              <textarea
                name="permanentAddress"
                value={pfNominationData.permanentAddress}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Enter complete address"
              />
            </div>
            <div>
              <input
                type="text"
                name="permanentCity"
                value={pfNominationData.permanentCity}
                onChange={handleChange}
                className={inputClass}
                placeholder="City"
              />
            </div>
            <div>
              <input
                type="text"
                name="permanentState"
                value={pfNominationData.permanentState}
                onChange={handleChange}
                className={inputClass}
                placeholder="State"
              />
            </div>
            <div>
              <input
                type="text"
                name="permanentPincode"
                value={pfNominationData.permanentPincode}
                onChange={handleChange}
                className={inputClass}
                placeholder="Pincode"
                maxLength={6}
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle 
          icon={User} 
          title="Part A - EPF Nomination" 
          subtitle="Nomination for Provident Fund accumulations (Para 61 of EPF Scheme, 1952)"
        />
        
        <div className={`mb-4 p-3 rounded-lg text-sm ${isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
          <p><strong>Note:</strong> You can nominate one or more persons to receive your EPF accumulations in case of your death. 
          Total share percentage must equal 100%. If nominee is a minor, guardian details are required.</p>
        </div>

        {pfNominationData.epfNominees.map((nominee, index) => (
          <div 
            key={index} 
            className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h5 className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                EPF Nominee {index + 1}
              </h5>
              {pfNominationData.epfNominees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEpfNominee(index)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  value={nominee.name}
                  onChange={(e) => handleEpfNomineeChange(index, 'name', e.target.value)}
                  className={inputClass}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Relationship *</label>
                <select
                  value={nominee.relationship}
                  onChange={(e) => handleEpfNomineeChange(index, 'relationship', e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select</option>
                  {relationshipOptions.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={nominee.dateOfBirth}
                  onChange={(e) => handleEpfNomineeChange(index, 'dateOfBirth', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Share (%) *</label>
                <input
                  type="number"
                  value={nominee.sharePercent}
                  onChange={(e) => handleEpfNomineeChange(index, 'sharePercent', e.target.value)}
                  className={inputClass}
                  placeholder="100"
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div className="md:col-span-4">
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  value={nominee.address}
                  onChange={(e) => handleEpfNomineeChange(index, 'address', e.target.value)}
                  className={inputClass}
                  placeholder="Complete address of nominee"
                />
              </div>
              
              {}
              {isMinor(nominee.dateOfBirth) && (
                <>
                  <div className={`md:col-span-4 mt-2 p-3 rounded-lg ${isDark ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                    <p className="text-sm">⚠️ This nominee is a minor. Please provide guardian details.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Guardian Name</label>
                    <input
                      type="text"
                      value={nominee.guardianName}
                      onChange={(e) => handleEpfNomineeChange(index, 'guardianName', e.target.value)}
                      className={inputClass}
                      placeholder="Guardian name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Guardian Relationship</label>
                    <select
                      value={nominee.guardianRelation}
                      onChange={(e) => handleEpfNomineeChange(index, 'guardianRelation', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      {relationshipOptions.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Guardian Address</label>
                    <input
                      type="text"
                      value={nominee.guardianAddress}
                      onChange={(e) => handleEpfNomineeChange(index, 'guardianAddress', e.target.value)}
                      className={inputClass}
                      placeholder="Guardian address"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {}
        <div className={`mb-4 p-3 rounded-lg ${
          Math.abs(pfNominationData.epfNominees.reduce((sum, n) => sum + (parseFloat(n.sharePercent) || 0), 0) - 100) < 0.01
            ? isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700'
            : isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
        }`}>
          <p className="text-sm font-medium">
            Total Share: {pfNominationData.epfNominees.reduce((sum, n) => sum + (parseFloat(n.sharePercent) || 0), 0)}%
            {Math.abs(pfNominationData.epfNominees.reduce((sum, n) => sum + (parseFloat(n.sharePercent) || 0), 0) - 100) < 0.01
              ? ' ✓'
              : ' (Must equal 100%)'
            }
          </p>
        </div>

        {pfNominationData.epfNominees.length < 4 && (
          <button
            type="button"
            onClick={addEpfNominee}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed transition-all duration-200 ${
              isDark 
                ? 'border-slate-600 text-slate-400 hover:border-teal-500 hover:text-teal-400' 
                : 'border-slate-300 text-slate-500 hover:border-teal-500 hover:text-teal-600'
            }`}
          >
            <Plus size={18} />
            Add Another EPF Nominee
          </button>
        )}
      </div>

      {}
      <div className={sectionClass}>
        <SectionTitle 
          icon={User} 
          title="Part B - Family Details for EPS" 
          subtitle="Details of family members for Employees' Pension Scheme, 1995 (Para 18)"
        />
        
        <div className={`mb-4 p-3 rounded-lg text-sm ${isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
          <p><strong>Note:</strong> List all your family members who are eligible for pension benefits under EPS, 1995. 
          This includes spouse, children (up to 25 years), and dependent parents.</p>
        </div>

        {pfNominationData.epsFamilyNominees.map((member, index) => (
          <div 
            key={index} 
            className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h5 className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Family Member {index + 1}
              </h5>
              {pfNominationData.epsFamilyNominees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEpsNominee(index)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleEpsNomineeChange(index, 'name', e.target.value)}
                  className={inputClass}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={labelClass}>Relationship</label>
                <select
                  value={member.relationship}
                  onChange={(e) => handleEpsNomineeChange(index, 'relationship', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father (Dependent)</option>
                  <option value="Mother">Mother (Dependent)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={member.dateOfBirth}
                  onChange={(e) => handleEpsNomineeChange(index, 'dateOfBirth', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  value={member.address}
                  onChange={(e) => handleEpsNomineeChange(index, 'address', e.target.value)}
                  className={inputClass}
                  placeholder="Address if different"
                />
              </div>
            </div>
          </div>
        ))}

        {pfNominationData.epsFamilyNominees.length < 4 && (
          <button
            type="button"
            onClick={addEpsNominee}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed transition-all duration-200 ${
              isDark 
                ? 'border-slate-600 text-slate-400 hover:border-teal-500 hover:text-teal-400' 
                : 'border-slate-300 text-slate-500 hover:border-teal-500 hover:text-teal-600'
            }`}
          >
            <Plus size={18} />
            Add Family Member
          </button>
        )}
      </div>

      {}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          Declaration
        </h4>
        <div className={`text-sm mb-4 space-y-2 ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
          <p>I hereby declare that:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>The above nomination supersedes all my previous nominations made under the EPF Scheme.</li>
            <li>The particulars furnished above are true to the best of my knowledge.</li>
            <li>In case of any false declaration, I shall be solely responsible for the consequences.</li>
          </ol>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Place</label>
            <input
              type="text"
              name="declarationPlace"
              value={pfNominationData.declarationPlace}
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
              value={pfNominationData.declarationDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
        <label className={`flex items-center gap-2 cursor-pointer mt-4 mb-6 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          <input
            type="checkbox"
            name="declarationAccepted"
            checked={pfNominationData.declarationAccepted}
            onChange={handleChange}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm font-medium">I accept the above declaration *</span>
        </label>
        
        {}
        <SignatureCapture
          label="Employee Signature"
          value={pfNominationData.employeeSignature}
          onChange={(signature) => setPfNominationData(prev => ({ ...prev, employeeSignature: signature }))}
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
