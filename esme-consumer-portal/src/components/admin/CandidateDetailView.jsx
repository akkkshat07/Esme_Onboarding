import React, { useState } from 'react';
import { ChevronRight, FileText, Download, Upload, X } from 'lucide-react';

export default function CandidateDetailView({ candidate, onBack, onApprove, onReject, onRefresh }) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

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
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-bold text-2xl">
                  {candidate.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{candidate.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{candidate.email}</p>
                <p className="text-sm text-gray-600">{candidate.mobile}</p>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
              candidate.status === 'approved' ? 'bg-green-100 text-green-700' :
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
                  <InfoField label="Date of Birth" value={candidate.dob} />
                  <InfoField label="Gender" value={candidate.gender} />
                  <InfoField label="Father's Name" value={candidate.fatherName} />
                  <InfoField label="Mother's Name" value={candidate.motherName} />
                  <InfoField label="Marital Status" value={candidate.maritalStatus} />
                  <InfoField label="Blood Group" value={candidate.bloodGroup} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Contact & Address</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Present Address" value={candidate.presentAddress} className="col-span-2" />
                  <InfoField label="Permanent Address" value={candidate.permanentAddress} className="col-span-2" />
                  <InfoField label="Emergency Contact" value={candidate.emergencyContact} />
                  <InfoField label="Emergency Name" value={candidate.emergencyContactName} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Identity & Financial</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="PAN Number" value={candidate.panNumber} />
                  <InfoField label="Aadhaar Number" value={candidate.aadhaarNumber} />
                  <InfoField label="UAN Number" value={candidate.uanNumber} />
                  <InfoField label="Bank Account" value={candidate.bankAccount} />
                  <InfoField label="IFSC Code" value={candidate.ifscCode} />
                  <InfoField label="Bank Name" value={candidate.bankName} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Employment Details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Department" value={candidate.department || 'Not Assigned'} />
                  <InfoField label="Employee ID" value={candidate.employeeId || 'Not Assigned'} />
                  <InfoField label="Designation" value={candidate.designation} />
                  <InfoField label="Joining Date" value={candidate.joiningDate ? new Date(candidate.joiningDate).toLocaleDateString() : 'N/A'} />
                  <InfoField label="Qualification" value={candidate.qualification} />
                  <InfoField label="Experience" value={candidate.experience} />
                </div>
              </section>

              {candidate.education && candidate.education.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Education</h3>
                  <div className="space-y-3">
                    {candidate.education.map((edu, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-gray-800">{edu.level}</p>
                        <p className="text-xs text-gray-600 mt-1">{edu.schoolName}</p>
                        <p className="text-xs text-gray-600">{edu.degree}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Generated Documents</h3>
                <div className="space-y-2">
                  {candidate.generatedForms?.joiningForm && (
                    <DocumentLink 
                      href={candidate.generatedForms.joiningForm}
                      label="Joining Form"
                      icon={FileText}
                    />
                  )}
                  {candidate.generatedForms?.medicalForm && (
                    <DocumentLink 
                      href={candidate.generatedForms.medicalForm}
                      label="Medical Form"
                      icon={FileText}
                    />
                  )}
                  {candidate.generatedForms?.selfDeclaration && (
                    <DocumentLink 
                      href={candidate.generatedForms.selfDeclaration}
                      label="Self Declaration"
                      icon={FileText}
                    />
                  )}
                  {candidate.generatedForms?.form11 && (
                    <DocumentLink 
                      href={candidate.generatedForms.form11}
                      label="Form 11"
                      icon={FileText}
                    />
                  )}
                  {candidate.generatedForms?.formF && (
                    <DocumentLink 
                      href={candidate.generatedForms.formF}
                      label="Form F"
                      icon={FileText}
                    />
                  )}
                  {candidate.generatedForms?.pfNomination && (
                    <DocumentLink 
                      href={candidate.generatedForms.pfNomination}
                      label="PF Nomination"
                      icon={FileText}
                    />
                  )}
                  {candidate.generatedForms?.checklist && (
                    <DocumentLink 
                      href={candidate.generatedForms.checklist}
                      label="Document Checklist"
                      icon={FileText}
                    />
                  )}
                  {(!candidate.generatedForms || Object.keys(candidate.generatedForms).length === 0) && (
                    <p className="text-xs text-gray-500 italic py-3 text-center">No documents generated yet</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">Uploaded Documents</h3>
                <div className="space-y-2">
                  {candidate.uploadedDocuments && candidate.uploadedDocuments.length > 0 ? (
                    candidate.uploadedDocuments.map((doc, idx) => (
                      <DocumentLink 
                        key={idx}
                        href={doc.url}
                        label={doc.name}
                        icon={Upload}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic py-3 text-center">No documents uploaded yet</p>
                  )}
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

function DocumentLink({ href, label, icon: Icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-teal-50 transition-colors group border border-transparent hover:border-teal-200"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-4 h-4 text-gray-600 group-hover:text-teal-600 flex-shrink-0" />
        <span className="text-sm text-gray-700 group-hover:text-teal-700 truncate">{label}</span>
      </div>
      <Download className="w-4 h-4 text-gray-400 group-hover:text-teal-600 flex-shrink-0" />
    </a>
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
