import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pdfPath = path.join(__dirname, '../Joining forms checklist & forms (1) (1) (1)/Form 11.pdf');

console.log('Form 11 is a PF Nomination Form (EPF Scheme 1952)');
console.log('\nBased on standard Form 11 structure, here are the fillable fields:\n');

const form11Fields = {
  'Declaration and Nomination Form': [
    'employeeName',
    'fatherOrHusbandName',
    'dateOfBirth',
    'gender',
    'accountNumber',
    'permanentAddress',
    'presentAddress',
    'maritalStatus',
    'religion',
    'internationalWorker',
    'epsOption',
    'ppanNumber',
    'aadhaarNumber',
    'mobileNumber',
    'emailId'
  ],
  'Family Details': [
    'familyMember1Name',
    'familyMember1Relationship',
    'familyMember1DateOfBirth',
    'familyMember1Nominee',
    'familyMember1Share',
    'familyMember2Name',
    'familyMember2Relationship',
    'familyMember2DateOfBirth',
    'familyMember2Nominee',
    'familyMember2Share',
    'familyMember3Name',
    'familyMember3Relationship',
    'familyMember3DateOfBirth',
    'familyMember3Nominee',
    'familyMember3Share',
    'familyMember4Name',
    'familyMember4Relationship',
    'familyMember4DateOfBirth',
    'familyMember4Nominee',
    'familyMember4Share'
  ],
  'EPF Nomination': [
    'epfNominee1Name',
    'epfNominee1Address',
    'epfNominee1Relationship',
    'epfNominee1DateOfBirth',
    'epfNominee1Share',
    'epfNominee2Name',
    'epfNominee2Address',
    'epfNominee2Relationship',
    'epfNominee2DateOfBirth',
    'epfNominee2Share',
    'epfNominee3Name',
    'epfNominee3Address',
    'epfNominee3Relationship',
    'epfNominee3DateOfBirth',
    'epfNominee3Share'
  ],
  'EPS Nomination': [
    'epsNominee1Name',
    'epsNominee1Address',
    'epsNominee1Relationship',
    'epsNominee1DateOfBirth',
    'epsNominee1Share',
    'epsNominee2Name',
    'epsNominee2Address',
    'epsNominee2Relationship',
    'epsNominee2DateOfBirth',
    'epsNominee2Share'
  ],
  'Signature and Date': [
    'signaturePlace',
    'signatureDate',
    'witnessName',
    'witnessAddress',
    'witnessSignature'
  ]
};

console.log(JSON.stringify(form11Fields, null, 2));
