import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, ChevronLeft, Plus, Trash2, Info } from 'lucide-react';

/**
 * Form F - Gratuity Nomination Form
 * Based on THE PAYMENT OF GRATUITY (CENTRAL) RULES, 1972
 * FORM 'F' - Nomination under Rule 6(1)
 */
export default function FormF({ formData, onFormDataChange, onNext, onBack }) {
  const { isDark } = useTheme();
  
  // Helper to get value from any previous form
  const getValue = (key, ...fallbacks) => {
    // Check direct formData first
    if (formData[key]) return formData[key];
    // Check joiningFormData
    if (formData.joiningFormData?.[key]) return formData.joiningFormData[key];
    // Check fallback keys
    for (const fb of fallbacks) {
      if (formData[fb]) return formData[fb];
      if (formData.joiningFormData?.[fb]) return formData.joiningFormData[fb];
    }
    return '';
  };
  
  // Form F specific state
  const [formFData, setFormFData] = useState({
    // Employee Details (pre-filled from formData and joiningFormData)
    employeeName: getValue('fullName'),
    sex: getValue('gender') === 'M' ? 'Male' : getValue('gender') === 'F' ? 'Female' : getValue('gender') === 'T' ? 'Transgender' : getValue('gender'),
    religion: getValue('religion'),
    maritalStatus: getValue('maritalStatus'),
    department: getValue('department'),
    designation: getValue('profession', 'designation'),
    dateOfJoining: getValue('dateOfJoining'),
    permanentAddress: getValue('permanentAddress'),
    
    // Address fields for PDF form (Village, Thana, etc.)
    village: getValue('village'),
    thana: getValue('thana'),
    subdivision: getValue('subdivision'),
    postOffice: getValue('postOffice'),
    district: getValue('district', 'currentDistrict', 'permanentCity'),
    state: getValue('state', 'currentState', 'permanentState'),
    
    // Nominees array - for gratuity nomination
    nominees: formData.formF_nominees || formData.joiningFormData?.formF_nominees || [
      {
        name: getValue('nomineeName', 'emergencyContactName'),
        relationship: getValue('nomineeRelationship', 'emergencyContactRelation'),
        age: '',
        sharePercent: '100',
        address: getValue('nomineeAddress', 'emergencyContactAddress')
      }
    ],
    
    // If employee has family
    hasFamily: getValue('maritalStatus') === 'Married' ? 'yes' : '',
    
    // Date and place
    nominationDate: new Date().toISOString().split('T')[0],
    place: getValue('currentCity')
  });

  // Sync with parent formData on mount
  useEffect(() => {
    if (formData.formFData) {
      setFormFData(prev => ({ ...prev, ...formData.formFData }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFData(prev => ({ ...prev, [name]: value }));
  };

  const handleNomineeChange = (index, field, value) => {
    const updatedNominees = [...formFData.nominees];
    updatedNominees[index] = { ...updatedNominees[index], [field]: value };
    setFormFData(prev => ({ ...prev, nominees: updatedNominees }));
  };

  const addNominee = () => {
    if (formFData.nominees.length < 4) {
      setFormFData(prev => ({
        ...prev,
        nominees: [...prev.nominees, { name: '', relationship: '', age: '', sharePercent: '', address: '' }]
      }));
    }
  };

  const removeNominee = (index) => {
    if (formFData.nominees.length > 1) {
      const updatedNominees = formFData.nominees.filter((_, i) => i !== index);
      setFormFData(prev => ({ ...prev, nominees: updatedNominees }));
    }
  };

  const validateForm = () => {
    // Check required fields
    if (!formFData.employeeName || !formFData.sex || !formFData.maritalStatus) {
      alert('Please fill in all required employee details');
      return false;
    }
    
    // Check if nominees are filled
    const validNominees = formFData.nominees.filter(n => n.name && n.relationship);
    if (validNominees.length === 0) {
      alert('Please add at least one nominee');
      return false;
    }
    
    // Check total share percentage
    const totalShare = formFData.nominees.reduce((sum, n) => sum + (parseFloat(n.sharePercent) || 0), 0);
    if (totalShare !== 100) {
      alert(`Total share percentage must equal 100%. Current total: ${totalShare}%`);
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Save Form F data to parent formData
      onFormDataChange({
        ...formData,
        formFData: formFData,
        formF_nominees: formFData.nominees,
        // Also update common fields that might be used in other forms
        religion: formFData.religion,
        department: formFData.department
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-indigo-900/20 border border-indigo-800' : 'bg-indigo-50 border border-indigo-200'}`}>
        <div className="flex items-start gap-3">
          <Info className={`mt-0.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} size={20} />
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
              Form F - Gratuity Nomination Form
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Nomination under Rule 6(1) of The Payment of Gratuity (Central) Rules, 1972.
              This form allows you to nominate beneficiaries who will receive your gratuity in case of your death.
            </p>
          </div>
        </div>
      </div>

      {/* Employee Details Section */}
      <div className={sectionClass}>
        <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Employee Details
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              name="employeeName"
              value={formFData.employeeName}
              onChange={handleChange}
              className={inputClass}
              placeholder="As per official records"
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Sex *</label>
            <select
              name="sex"
              value={formFData.sex}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Religion</label>
            <input
              type="text"
              name="religion"
              value={formFData.religion}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., Hindu, Muslim, Christian"
            />
          </div>
          
          <div>
            <label className={labelClass}>Marital Status *</label>
            <select
              name="maritalStatus"
              value={formFData.maritalStatus}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select</option>
              <option value="Single">Single/Unmarried</option>
              <option value="Married">Married</option>
              <option value="Widow">Widow</option>
              <option value="Widower">Widower</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Department/Branch/Section</label>
            <input
              type="text"
              name="department"
              value={formFData.department}
              onChange={handleChange}
              className={inputClass}
              placeholder="Your department"
            />
          </div>
          
          <div>
            <label className={labelClass}>Post/Designation *</label>
            <input
              type="text"
              name="designation"
              value={formFData.designation}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>
          
          <div>
            <label className={labelClass}>Date of Joining Service *</label>
            <input
              type="date"
              name="dateOfJoining"
              value={formFData.dateOfJoining}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Do you have family members? *</label>
            <select
              name="hasFamily"
              value={formFData.hasFamily}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className={labelClass}>Permanent Address *</label>
            <textarea
              name="permanentAddress"
              value={formFData.permanentAddress}
              onChange={handleChange}
              className={`${inputClass} min-h-[80px]`}
              placeholder="Complete permanent address"
              required
            />
          </div>
          
          {/* Address Details for PDF Form */}
          <div>
            <label className={labelClass}>Village/Town</label>
            <input
              type="text"
              name="village"
              value={formFData.village}
              onChange={handleChange}
              className={inputClass}
              placeholder="Village or Town name"
            />
          </div>
          
          <div>
            <label className={labelClass}>Thana (Police Station)</label>
            <input
              type="text"
              name="thana"
              value={formFData.thana}
              onChange={handleChange}
              className={inputClass}
              placeholder="Police Station/Thana"
            />
          </div>
          
          <div>
            <label className={labelClass}>Sub-Division</label>
            <input
              type="text"
              name="subdivision"
              value={formFData.subdivision}
              onChange={handleChange}
              className={inputClass}
              placeholder="Sub-Division"
            />
          </div>
          
          <div>
            <label className={labelClass}>Post Office</label>
            <input
              type="text"
              name="postOffice"
              value={formFData.postOffice}
              onChange={handleChange}
              className={inputClass}
              placeholder="Post Office name"
            />
          </div>
          
          <div>
            <label className={labelClass}>District</label>
            <input
              type="text"
              name="district"
              value={formFData.district}
              onChange={handleChange}
              className={inputClass}
              placeholder="District"
            />
          </div>
          
          <div>
            <label className={labelClass}>State</label>
            <input
              type="text"
              name="state"
              value={formFData.state}
              onChange={handleChange}
              className={inputClass}
              placeholder="State"
            />
          </div>
        </div>
      </div>

      {/* Nominees Section */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Nominee Details
          </h4>
          {formFData.nominees.length < 4 && (
            <button
              type="button"
              onClick={addNominee}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isDark 
                  ? 'bg-teal-900/30 text-teal-400 hover:bg-teal-900/50' 
                  : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
              }`}
            >
              <Plus size={16} /> Add Nominee
            </button>
          )}
        </div>
        
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {formFData.hasFamily === 'yes' 
            ? 'If you have family, nominees should be from your family members only (spouse, children, parents, etc.).'
            : 'If you do not have family, you can nominate any person of your choice.'
          }
        </p>

        {formFData.nominees.map((nominee, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border mb-4 ${
              isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Nominee {index + 1}
              </span>
              {formFData.nominees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeNominee(index)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nominee Name *</label>
                <input
                  type="text"
                  value={nominee.name}
                  onChange={(e) => handleNomineeChange(index, 'name', e.target.value)}
                  className={inputClass}
                  placeholder="Full name of nominee"
                  required
                />
              </div>
              
              <div>
                <label className={labelClass}>Relationship with Employee *</label>
                <select
                  value={nominee.relationship}
                  onChange={(e) => handleNomineeChange(index, 'relationship', e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select Relationship</option>
                  <option value="Spouse">Spouse (Husband/Wife)</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Father-in-law">Father-in-law</option>
                  <option value="Mother-in-law">Mother-in-law</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className={labelClass}>Age of Nominee</label>
                <input
                  type="number"
                  value={nominee.age}
                  onChange={(e) => handleNomineeChange(index, 'age', e.target.value)}
                  className={inputClass}
                  placeholder="Age in years"
                  min="0"
                  max="120"
                />
              </div>
              
              <div>
                <label className={labelClass}>Share Percentage (%) *</label>
                <input
                  type="number"
                  value={nominee.sharePercent}
                  onChange={(e) => handleNomineeChange(index, 'sharePercent', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 50"
                  min="0"
                  max="100"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className={labelClass}>Nominee's Address</label>
                <input
                  type="text"
                  value={nominee.address}
                  onChange={(e) => handleNomineeChange(index, 'address', e.target.value)}
                  className={inputClass}
                  placeholder="Complete address of nominee"
                />
              </div>
            </div>
          </div>
        ))}
        
        {/* Share percentage indicator */}
        <div className={`p-3 rounded-lg ${
          formFData.nominees.reduce((sum, n) => sum + (parseFloat(n.sharePercent) || 0), 0) === 100
            ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'
            : isDark ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-700'
        }`}>
          Total Share: {formFData.nominees.reduce((sum, n) => sum + (parseFloat(n.sharePercent) || 0), 0)}% 
          {formFData.nominees.reduce((sum, n) => sum + (parseFloat(n.sharePercent) || 0), 0) !== 100 && ' (Must equal 100%)'}
        </div>
      </div>

      {/* Place and Date */}
      <div className={sectionClass}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Place</label>
            <input
              type="text"
              name="place"
              value={formFData.place}
              onChange={handleChange}
              className={inputClass}
              placeholder="City/Town"
            />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              name="nominationDate"
              value={formFData.nominationDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            isDark 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ChevronLeft size={20} /> Previous
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-teal-600 text-white hover:bg-teal-700 transition-all"
        >
          Save & Continue <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
