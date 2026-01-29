export const JOINING_FORMS = [
  { id: 'joining_form', name: 'Employee Joining Form', file: 'EMPLOYEE JOINING FORM -ESME.pdf', required: true, fillable: true },
  { id: 'form_f', name: 'Gratuity Form F', file: 'FORM_F.PDF', required: true, fillable: true },
  { id: 'form_11', name: 'PF Form 11', file: 'Form 11.pdf', required: true, fillable: true },
  { id: 'pf_nomination', name: 'PF Nomination Form', file: 'PF_Nomination_Form.pdf', required: true, fillable: true },
  { id: 'insurance', name: 'Medical Insurance Form', file: 'Medical Insurance Form new.pdf', required: true, fillable: false },
  { id: 'self_declaration', name: 'Self Declaration Form', file: 'SELF DECLARATION FORM - ESME.PDF', required: true, fillable: false }
];

export const ONBOARDING_STEPS = [
  { id: 'info', label: '1. Personal Information' },
  { id: 'form_joining', label: '2. Employee Joining Form' },
  { id: 'form_f', label: '3. Gratuity Form F' },
  { id: 'form_11', label: '4. PF Form 11' },
  { id: 'form_pf_nomination', label: '5. PF Nomination Form' },
  { id: 'form_insurance', label: '6. Medical Insurance Form' },
  { id: 'form_self_declaration', label: '7. Self Declaration Form' },
  { id: 'documents', label: '8. Upload Documents' },
  { id: 'review', label: '9. Final Review' }
];

export const ALLOWED_FILE_TYPES = {
  documents: ['application/pdf', 'image/jpeg', 'image/png']
};

export const FILE_SIZE_LIMITS = {
  pdf: 10 * 1024 * 1024,
  image: 5 * 1024 * 1024 
};


export const AUTO_GENERATED_FORMS = [
  { id: 'joining_form', name: 'Employee Joining Form', required: true },
  { id: 'form_f', name: 'Gratuity Form F', required: true },
  { id: 'form_11', name: 'PF Form 11', required: true },
  { id: 'pf_nomination', name: 'PF Nomination Form', required: true },
  { id: 'insurance', name: 'Medical Insurance Form', required: true },
  { id: 'self_declaration', name: 'Self Declaration Form', required: true }
];


export const REQUIRED_DOCUMENTS = {
  identity: [
    { id: 'aadhaar_card', name: 'Aadhaar Card (Front & Back)', required: true },
    { id: 'pan_card', name: 'PAN Card', required: true },
    { id: 'passport_photo', name: 'Passport Size Photo', required: true },
    { id: 'passport', name: 'Passport (if available)', required: false }
  ],
  education: [
    { id: '10th_marksheet', name: '10th Marksheet', required: true },
    { id: '12th_marksheet', name: '12th Marksheet', required: true },
    { id: 'graduation_degree', name: 'Graduation Degree/Certificate', required: false },
    { id: 'pg_degree', name: 'Post-Graduation Degree (if any)', required: false }
  ],
  bank: [
    { id: 'bank_passbook', name: 'Bank Passbook/Statement (First Page)', required: true },
    { id: 'cancelled_cheque', name: 'Cancelled Cheque', required: true }
  ],
  experience: [
    { id: 'experience_letter', name: 'Experience/Relieving Letter', required: false },
    { id: 'last_3_payslips', name: 'Last 3 Months Payslips', required: false },
    { id: 'offer_letter', name: 'Offer Letter (Previous Employer)', required: false }
  ]
};
