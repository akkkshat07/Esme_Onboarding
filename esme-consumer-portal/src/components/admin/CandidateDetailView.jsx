import React, { useState } from 'react';
import { ChevronRight, FileText, Download, Upload, X, Package, Trash2, Eye, AlertCircle } from 'lucide-react';
import { generatePolicyAcknowledgment } from '../../utils/generatePolicyAcknowledgment';
import { generateJoiningFormPDF } from '../../utils/generateJoiningForm';
import { generateMedicalInsuranceFormPDF } from '../../utils/generateMedicalForm';
import { generateSelfDeclarationFormPDF } from '../../utils/generateSelfDeclaration';
import { generateChecklistPDF } from '../../utils/generateChecklist';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : '';

export default function CandidateDetailView({ candidate, onBack, onApprove, onReject, onRefresh }) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!candidate) return null;

  const handleApprove = () => {
    onApprove(candidate._id, department, employeeId);
    setShowApproveModal(false);
    onRefresh();
  };

  const handleReject = () => {
    onReject(candidate._id, rejectionReason);
    setShowRejectModal(false);
    onRefresh();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/candidates/${candidate._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }

      alert('Candidate deleted successfully');
      setShowDeleteModal(false);
      onBack();
      onRefresh();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('Failed to delete candidate');
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const response = await fetch(`${API_URL}/candidates/${candidate._id}/download-zip`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download ZIP');
      }

      const blob = await response.blob();

      // Check if blob is empty
      if (blob.size === 0) {
        throw new Error('ZIP file is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const candidateName = (candidate.profileData?.fullName || candidate.name).replace(/[^a-zA-Z0-9]/g, '_');
      const submissionDate = candidate.createdAt ? new Date(candidate.createdAt).toISOString().split('T')[0] : 'unknown';
      a.download = `${candidateName}_${submissionDate}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      alert(`Failed to download ZIP file: ${error.message}`);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadPolicyAcknowledgment = async () => {
    try {
      // Handle signature being either a direct string or an object with signatureImage
      const signature = (candidate.signature && typeof candidate.signature === 'object')
        ? candidate.signature.signatureImage
        : candidate.signature;

      const doc = await generatePolicyAcknowledgment({
        ...candidate,
        signature: signature
      });
      const fileName = `Policy_Acknowledgment_${(candidate.profileData?.fullName || candidate.name).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating policy acknowledgment:', error);
      alert('Failed to generate policy acknowledgment');
    }
  };

  const handlePreviewPolicyAcknowledgment = async () => {
    try {
      // Handle signature being either a direct string or an object with signatureImage
      const signature = (candidate.signature && typeof candidate.signature === 'object')
        ? candidate.signature.signatureImage
        : candidate.signature;

      const doc = await generatePolicyAcknowledgment({
        ...candidate,
        signature: signature
      });
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error previewing policy acknowledgment:', error);
      alert('Failed to preview policy acknowledgment');
    }
  };

  const handlePreviewJoiningForm = async () => {
    try {
      const doc = await generateJoiningFormPDF({
        name: candidate.name,
        email: candidate.email,
        mobile: candidate.mobile,
        signature: candidate.signature?.signatureImage,
        profileImage: jf.employeePhoto,
        profileData: {
          ...jf,
          fullName: jf.fullName || `${jf.firstName || ''} ${jf.middleName || ''} ${jf.lastName || ''}`.trim() || candidate.name,
          dateOfBirth: jf.dateOfBirth || jf.dob,
          mobileNumber: jf.mobileNumber || jf.phone,
          currentAddress: jf.currentAddress || jf.presentAddress,
          currentCity: jf.currentCity || jf.presentCity,
          pincode: jf.currentPincode || jf.presentPincode,
          permanentAddress: jf.permanentAddress,
          aadhaarNumber: jf.aadhaarNumber || candidate.aadhaarVerification?.maskedAadhaar,
          panNumber: jf.panNumber || candidate.panVerification?.panNumber,
          bankName: jf.bankName || candidate.bankVerification?.bankName,
          accountNumber: jf.bankAccountNumber || candidate.bankVerification?.accountNumber,
          ifscCode: jf.bankIfsc || jf.ifscCode || candidate.bankVerification?.ifsc,
          accountHolderName: jf.accountHolderName || `${jf.firstName || ''} ${jf.lastName || ''}`.trim() || candidate.name,
          uanNumber: jf.uanNumber,
          emergencyContactName: jf.emergencyContactName,
          emergencyContactRelation: jf.emergencyContactRelation,
          emergencyContactNumber: jf.emergencyContactPhone || jf.emergencyContactMobile,
          department: pd.department || jf.department,
          profession: jf.designation,
          dateOfJoining: jf.dateOfJoining,
          fatherName: jf.fatherName,
          motherName: jf.motherName,
          gender: jf.gender,
          bloodGroup: jf.bloodGroup,
          maritalStatus: jf.maritalStatus,
          nationality: jf.nationality,
          religion: jf.religion,
        },
        educationDetails: pd.educationDetails,
        experienceDetails: pd.experienceDetails
      });
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error previewing joining form:', error);
      alert('Failed to preview joining form');
    }
  };

  const handlePreviewMedicalForm = async () => {
    try {
      const mi = pd.medicalInsuranceData || {};
      const doc = await generateMedicalInsuranceFormPDF({
        name: mi.employeeName || candidate.name,
        email: mi.emailId || candidate.email,
        mobile: mi.contactNumber || candidate.mobile,
        signature: candidate.signature?.signatureImage,
        profileData: {
          ...mi,
          address: jf.presentAddress || jf.currentAddress,
          emergencyContact: mi.spouseName || jf.emergencyContactName,
          emergencyRelation: 'Spouse',
          childrenDetails: pd.childrenDetails
        }
      });
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error previewing medical form:', error);
      alert('Failed to preview medical form');
    }
  };

  const handlePreviewSelfDeclaration = async () => {
    try {
      // Ensure we pass DOB from joining form if not directly in profileData
      const dob = pd.dob || pd.joiningFormData?.dob || pd.dateOfBirth;
      const mobile = candidate.mobile || pd.mobile || pd.joiningFormData?.phone || pd.joiningFormData?.mobile;
      
      const doc = await generateSelfDeclarationFormPDF({
        ...candidate,
        mobile: mobile,
        profileData: {
            ...candidate.profileData,
            ...pd,
            dob: dob,
            dateOfBirth: dob
        },
        selfDeclarationData: pd.selfDeclarationData,
        signature: candidate.signature?.signatureImage
      });
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error previewing self declaration:', error);
      alert('Failed to preview self declaration');
    }
  };

  const handlePreviewChecklist = async () => {
    try {
      const doc = await generateChecklistPDF({
        ...candidate,
        profileData: pd
      });
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error previewing checklist:', error);
      alert('Failed to preview checklist');
    }
  };

  const handlePreviewFillableForm = async (formType) => {
    try {
      let formData = {};
      const f11 = pd.form11Data || {};
      const ff = pd.formFData || {};
      const f2 = pd.form2Data || {};

      if (formType === 'form11') {
        formData = {
          name: f11.employeeName || `${jf.firstName} ${jf.lastName}`,
          fatherName: f11.fatherOrHusbandName || jf.fatherName,
          dob: f11.dateOfBirth || jf.dob,
          gender: f11.gender || jf.gender,
          maritalStatus: f11.maritalStatus || jf.maritalStatus,
          mobileNumber: f11.mobileNumber || jf.phone,
          emailId: f11.emailId || candidate.email,
          aadhaarNumber: f11.aadhaarNumber || jf.aadhaarNumber,
          panNumber: f11.ppanNumber || jf.panNumber,
          uanNumber: jf.uanNumber,
          accountNumber: f11.accountNumber || jf.bankAccountNumber,
          ifscCode: jf.bankIfsc,
          highestQualification: jf.highestQualification,
          date: new Date().toLocaleDateString('en-IN'),
          place: jf.presentCity || 'India'
        };
      } else if (formType === 'formF') {
        formData = {
          employeeName: ff.employeeName || `${jf.firstName} ${jf.lastName}`,
          gender: ff.sex || jf.gender,
          religion: ff.religion || jf.religion,
          maritalStatus: ff.maritalStatus || jf.maritalStatus,
          department: ff.department || jf.department,
          dateOfJoining: ff.dateOfAppointment || new Date().toLocaleDateString('en-IN'),
          establishmentName: ff.establishmentName || 'ESME Consumer (P) Ltd.',
          establishmentAddress: ff.establishmentAddress || jf.presentAddress,
          village: ff.village,
          thana: ff.thana,
          subdivision: ff.subdivision,
          postOffice: ff.postOffice,
          district: ff.district,
          state: ff.state || jf.presentState,
          nominees: (pd.formFNominees || []).map(n => ({
            name: n.name,
            address: n.address,
            relationship: n.relationship,
            age: n.age,
            share: n.proportion
          })),
          witnesses: pd.formFWitnesses || [],
          date: ff.signatureDate || new Date().toLocaleDateString('en-IN'),
          place: ff.signaturePlace || jf.presentCity || 'India'
        };
      } else if (formType === 'form2') {
        formData = {
          name: f2.employeeName || `${jf.firstName} ${jf.lastName}`,
          fatherName: f2.fatherHusbandName || jf.fatherName,
          dob: f2.dateOfBirth || jf.dob,
          gender: f2.sex || jf.gender,
          maritalStatus: f2.maritalStatus || jf.maritalStatus,
          address: f2.permanentAddress || jf.permanentAddress,
          epfNominees: (pd.form2EPFNominees || []).map(n => ({
            name: n.name,
            address: n.address,
            relationship: n.relationship,
            dob: n.dateOfBirth,
            share: n.sharePercentage,
            guardianName: n.guardianName
          })),
          familyMembers: (pd.form2FamilyMembers || []).map(m => ({
            name: m.name,
            address: m.address,
            relationship: m.relationship,
            dob: m.dateOfBirth
          })),
          epsNominee: pd.form2EPSNominee || {},
          date: f2.signatureDate || new Date().toLocaleDateString('en-IN'),
          place: f2.signaturePlace || jf.presentCity || 'India'
        };
      }

      const response = await fetch(`${API_URL}/forms/generate-fillable/${formType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: candidate.email,
          formData: formData
        })
      });

      if (!response.ok) throw new Error('Failed to generate fillable form');

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error(`Error previewing ${formType}:`, error);
      alert(`Failed to preview ${formType}`);
    }
  };

  const pd = candidate.profileData || {};
  const jf = pd.joiningFormData || {};
  const sd = pd.selfDeclarationData || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Candidates
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            {downloadingZip ? 'Downloading...' : 'Download All (ZIP)'}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          {candidate.status !== 'approved' && candidate.status !== 'rejected' && (
            <>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Reject
              </button>
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center overflow-hidden">
                {jf.employeePhoto ? (
                  <img
                    src={jf.employeePhoto}
                    alt="Candidate Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-teal-600 font-bold text-2xl">
                    {candidate.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{candidate.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{candidate.email}</p>
                <p className="text-sm text-gray-600">{candidate.mobile || jf.phone}</p>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${candidate.status === 'approved' ? 'bg-green-100 text-green-700' :
              candidate.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
              {(candidate.status || 'pending').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Personal Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Date of Birth" value={jf.dob || candidate.aadhaarVerification?.dob} />
                  <InfoField label="Gender" value={jf.gender || candidate.aadhaarVerification?.gender} />
                  <InfoField label="Father's Name" value={jf.fatherName || candidate.aadhaarVerification?.fatherName} />
                  <InfoField label="Mother's Name" value={jf.motherName} />
                  <InfoField label="Marital Status" value={jf.maritalStatus} />
                  <InfoField label="Blood Group" value={jf.bloodGroup} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Contact & Address</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Present Address" value={jf.presentAddress || candidate.aadhaarVerification?.fullAddress} className="col-span-2" />
                  <InfoField label="Permanent Address" value={jf.permanentAddress} className="col-span-2" />
                  <InfoField label="Emergency Contact" value={jf.emergencyContactPhone || sd.emergencyContactNumber} />
                  <InfoField label="Emergency Name" value={jf.emergencyContactName || sd.emergencyContactName} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Identity & Financial</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="PAN Number" value={jf.panNumber || candidate.panVerification?.panNumber} />
                  <InfoField label="Aadhaar Number" value={jf.aadhaarNumber || candidate.aadhaarVerification?.maskedAadhaar} />
                  <InfoField label="UAN Number" value={jf.uanNumber} />
                  <InfoField label="Bank Account" value={jf.bankAccountNumber || candidate.bankVerification?.accountNumber} />
                  <InfoField label="IFSC Code" value={jf.bankIfsc || candidate.bankVerification?.ifsc} />
                  <InfoField label="Bank Name" value={jf.bankName || candidate.bankVerification?.bankName} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Employment Details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Department" value={pd.department || jf.department || 'Not Assigned'} />
                  <InfoField label="Employee ID" value={pd.employeeCode || jf.employeeCode || 'Not Assigned'} />
                  <InfoField label="Designation" value={jf.designation || pd.designation} />
                  <InfoField label="Joining Date" value={jf.dateOfJoining || pd.dateOfJoining ? new Date(jf.dateOfJoining || pd.dateOfJoining).toLocaleDateString() : 'N/A'} />
                  <InfoField label="Qualification" value={jf.highestQualification || pd.highestQualification} />
                  <InfoField label="Experience" value={jf.totalExperience || pd.totalExperience} />
                </div>
              </section>

              {pd.educationDetails && pd.educationDetails.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Education</h3>
                  <div className="space-y-3">
                    {pd.educationDetails.map((edu, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{edu.level}</p>
                            <p className="text-xs text-gray-600 mt-1">{edu.institution || edu.schoolName}</p>
                            <p className="text-xs text-gray-600">{edu.percentage || edu.degree} {edu.yearOfPassing ? `(${edu.yearOfPassing})` : ''}</p>
                          </div>
                          {edu.marksheet && (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={typeof edu.marksheet === 'string' ? (edu.marksheet.startsWith('http') ? edu.marksheet : `${BASE_URL}${edu.marksheet}`) : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200"
                                title="View Marksheet"
                              >
                                <Eye className="w-3 h-3" /> View
                              </a>
                              <a
                                href={typeof edu.marksheet === 'string' ? (edu.marksheet.startsWith('http') ? edu.marksheet : `${BASE_URL}${edu.marksheet}`) : '#'}
                                download
                                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                                title="Download Marksheet"
                              >
                                <Download className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              {jf.employeePhoto && (
                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Employee Photo</h3>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-4">
                    <img
                      src={jf.employeePhoto}
                      alt="Employee Photo"
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                </section>
              )}
              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Generated Documents</h3>
                <div className="space-y-3">
                  {/* Joining Form */}
                  {candidate.generatedDocuments?.joiningForm ? (
                    <DocumentLink
                      href={candidate.generatedDocuments.joiningForm.viewLink}
                      label="Joining Form"
                      icon={FileText}
                    />
                  ) : (
                    <button
                      onClick={handlePreviewJoiningForm}
                      className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Joining Form (Preview)</span>
                      </div>
                      <Eye className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  {/* Medical Form */}
                  {candidate.generatedDocuments?.medicalForm ? (
                    <DocumentLink
                      href={candidate.generatedDocuments.medicalForm.viewLink}
                      label="Medical Form"
                      icon={FileText}
                    />
                  ) : (
                    <button
                      onClick={handlePreviewMedicalForm}
                      className="w-full flex items-center justify-between px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Medical Form (Preview)</span>
                      </div>
                      <Eye className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  {/* Self Declaration */}
                  {candidate.generatedDocuments?.selfDeclaration ? (
                    <DocumentLink
                      href={candidate.generatedDocuments.selfDeclaration.viewLink}
                      label="Self Declaration"
                      icon={FileText}
                    />
                  ) : (
                    <button
                      onClick={handlePreviewSelfDeclaration}
                      className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Self Declaration (Preview)</span>
                      </div>
                      <Eye className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  {/* Form 11 */}
                  {candidate.generatedDocuments?.form11 ? (
                    <DocumentLink
                      href={candidate.generatedDocuments.form11.viewLink}
                      label="Form 11"
                      icon={FileText}
                    />
                  ) : (
                    <button
                      onClick={() => handlePreviewFillableForm('form11')}
                      className="w-full flex items-center justify-between px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Form 11 (Preview)</span>
                      </div>
                      <Eye className="w-4 h-4 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  {/* Form F */}
                  {candidate.generatedDocuments?.formF ? (
                    <DocumentLink
                      href={candidate.generatedDocuments.formF.viewLink}
                      label="Form F"
                      icon={FileText}
                    />
                  ) : (
                    <button
                      onClick={() => handlePreviewFillableForm('formF')}
                      className="w-full flex items-center justify-between px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Form F (Preview)</span>
                      </div>
                      <Eye className="w-4 h-4 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  {/* PF Nomination / Form 2 */}
                  {candidate.generatedDocuments?.pfNomination ? (
                    <DocumentLink
                      href={candidate.generatedDocuments.pfNomination.viewLink}
                      label="Form 2 (PF Nomination)"
                      icon={FileText}
                    />
                  ) : (
                    <button
                      onClick={() => handlePreviewFillableForm('form2')}
                      className="w-full flex items-center justify-between px-3 py-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Form 2 (Preview)</span>
                      </div>
                      <Eye className="w-4 h-4 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  {/* Checklist */}
                  {candidate.generatedDocuments?.checklist ? (
                    <DocumentLink
                      href={candidate.generatedDocuments.checklist.viewLink}
                      label="Document Checklist"
                      icon={FileText}
                    />
                  ) : (
                    <button
                      onClick={handlePreviewChecklist}
                      className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Document Checklist (Preview)</span>
                      </div>
                      <Eye className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  {/* Policy Acknowledgment */}
                  {/* Policy Acknowledgment */}
                  {candidate.generatedDocuments?.policyAcknowledgment ? (
                    <DocumentLink
                      href={candidate.generatedDocuments.policyAcknowledgment.viewLink}
                      label="Policy Acknowledgment"
                      icon={FileText}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handlePreviewPolicyAcknowledgment}
                        className="flex-1 flex items-center justify-between px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Policy Ack. (Preview)</span>
                        </div>
                        <Eye className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <button
                        onClick={handleDownloadPolicyAcknowledgment}
                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
                        title="Download Policy Acknowledgment"
                      >
                        <Download className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Uploaded Documents</h3>
                <div className="space-y-4">
                  {(() => {
                    const allPossibleDocs = [];

                    const deepScan = (obj) => {
                      if (!obj || typeof obj !== 'object') return;

                      if (obj.driveViewLink || obj.localUrl || obj.driveFileId || (obj.type && obj.fileName)) {
                        allPossibleDocs.push(obj);
                      }

                      Object.entries(obj).forEach(([key, value]) => {
                        // Skip folderLink or other technical links we don't want to show as documents
                        if (key === 'folderLink' || key === 'viewLink' || key === 'downloadLink') return;

                        if (typeof value === 'string' && (value.includes('/uploads/') || value.includes('drive.google.com'))) {
                          const isLocal = value.includes('/uploads/');
                          allPossibleDocs.push({
                            type: key,
                            localUrl: isLocal ? (value.startsWith('http') ? value : `${BASE_URL}${value}`) : null,
                            driveViewLink: !isLocal ? value : null
                          });
                        }
                      });

                      if (Array.isArray(obj)) {
                        obj.forEach((item) => deepScan(item));
                      } else {
                        Object.entries(obj).forEach(([key, value]) => {
                          // Skip internal technical objects
                          if (['driveFolder', 'panVerification', 'aadhaarVerification', 'bankVerification', '_id', '__v'].includes(key)) return;

                          if (value && typeof value === 'object') {
                            deepScan(value);
                          }
                        });
                      }
                    };

                    deepScan(candidate);

                    if (allPossibleDocs.length === 0) {
                      return (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-xs text-gray-500 italic">No documents uploaded yet</p>
                        </div>
                      );
                    }

                    const seenUrls = new Set();
                    const uniqueDocs = allPossibleDocs.filter(doc => {
                      const url = doc.driveViewLink || doc.localUrl || doc.url || doc.viewLink;
                      if (!url) return true;
                      if (seenUrls.has(url)) return false;
                      seenUrls.add(url);
                      return true;
                    });

                    return (
                      <div className="space-y-2">
                        {uniqueDocs.map((doc, idx) => {
                          const viewUrl = doc.driveViewLink || doc.localUrl || doc.url || doc.viewLink;
                          const downloadUrl = doc.driveDownloadLink || viewUrl;

                          return (
                            <DocumentLink
                              key={idx}
                              href={viewUrl || '#'}
                              downloadHref={downloadUrl}
                              label={doc.type ? doc.type.replace(/_/g, ' ').toUpperCase() : (doc.fileName || doc.name || 'DOCUMENT')}
                              icon={Upload}
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </section>

              {candidate.status === 'approved' && (
                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500">Approval Details</h3>
                  <div className="bg-green-50 rounded-lg p-3 space-y-2">
                    <InfoField label="Approved By" value={candidate.approvedBy} />
                    <InfoField label="Approved At" value={candidate.approvedAt ? new Date(candidate.approvedAt).toLocaleString() : 'N/A'} />
                  </div>
                </section>
              )}

              {candidate.status === 'rejected' && (
                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-red-500">Rejection Details</h3>
                  <div className="bg-red-50 rounded-lg p-3 space-y-2">
                    <InfoField label="Rejected By" value={candidate.rejectedBy} />
                    <InfoField label="Rejected At" value={candidate.rejectedAt ? new Date(candidate.rejectedAt).toLocaleString() : 'N/A'} />
                    <InfoField label="Reason" value={candidate.rejectionReason} />
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApproveModal && (
        <Modal onClose={() => setShowApproveModal(false)}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Approve Candidate</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department *</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="Enter department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID *</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="Enter employee ID"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!department || !employeeId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Approve
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showRejectModal && (
        <Modal onClose={() => setShowRejectModal(false)}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Reject Candidate</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Rejection *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                rows="4"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <h3 className="text-lg font-bold text-red-600 mb-4">Delete Candidate</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to permanently delete <span className="font-semibold">{candidate.name}</span>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              ⚠️ This action cannot be undone. All candidate data, documents, and records will be permanently removed from the database.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoField({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || 'N/A'}</p>
    </div>
  );
}

function DocumentLink({ href, downloadHref, label, icon: Icon }) {
  if (!href || href === '#') return null;

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 group hover:border-teal-300 transition-all shadow-sm">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1.5 bg-gray-50 rounded text-gray-600 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-all"
          title="View Document"
        >
          <Eye className="w-4 h-4" />
        </a>
        <a
          href={downloadHref || href}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
          title="Download Document"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        {children}
      </div>
    </div>
  );
}
