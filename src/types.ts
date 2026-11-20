export type UserRole = 'tenant' | 'agency' | 'landlord';

export interface UserAccount {
  id: string;
  role: UserRole;
  name: string;
  initials: string;
  email: string;
  phone: string;
  memberSince: string;
  nricNo?: string;
  creatorId?: number;
  licenseNumber?: string;
  licenseVerified?: boolean;
  agencyName?: string;
}

export type TAStatus = 'Completed' | 'Expiring Soon' | 'Renewed';

export interface TALandlord {
  fullName: string;
  mobileNumber: string;
  nricNo: string;
  isMalaysian: boolean;
  address: string;
  bankName: string;
  bankAccountNo: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3?: string;
  postal: string;
  city: string;
  state: string;
  country: string;
}

export interface TATenant {
  fullName: string;
  mobileNumber: string;
  nricNo: string;
  isMalaysian: boolean;
  address: string;
  addressLine1: string;
  addressLine2: string;
  postal: string;
  city: string;
  state: string;
  country: string;
}

export interface TAProperty {
  id: number;
  address: string;
  monthlyRent: number;
  currency: string;
  duration: number;
  isSteppedRent: boolean;
  monthlyRentByYear: Record<string, number> | null;
  buildingType: string;
  furnishing: boolean;
  floor: number;
  area: number;
  postcode: string;
  city: string;
  state: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface TACreator {
  id: number;
  fullName: string;
  email: string | null;
  phoneNumber: string;
}

export interface TASigner {
  id: number;
  agreementId: number;
  name: string;
  phoneNumber: string;
  nricNo: string;
  isMalaysian: boolean;
  passportNo: string | null;
  countryOfOrigin: string | null;
  inviteToken: string;
  status: 'SIGNED' | 'PENDING';
  privacyConsentAt: string | null;
  otpCode: string | null;
  otpExpiresAt: string | null;
  signatureUrl: string | null;
  signedAt: string | null;
  stampedDownloadedAt: string | null;
  stampedDownloadDocumentId: number | null;
  userRole: 'Landlord' | 'Tenant';
  createdAt: string;
  updatedAt: string;
}

export interface TAAdditions {
  copiesOfDuplicateStampCertCount: number;
  isUploaded: boolean;
  isNonResidential: boolean;
  partiesSummary: {
    landlordName: string;
    tenantName: string;
  };
}

export interface TenancyAgreement {
  id: number;
  creatorId: number;
  coBrokeId: number | null;
  propertyId: number;
  agreementTemplateId: number | null;
  type: 'RESIDENTIAL' | 'COMMERCIAL';
  status: TAStatus;
  agreementDate: string;
  commencementDate: string;
  expirationDate: string;
  signByDate: string | null;
  adjudicationNo: string;
  securityDeposit: number;
  utilityDeposit: number;
  hash: string;
  editCount: number;
  landlords: TALandlord[];
  tenants: TATenant[];
  additions: TAAdditions;
  isFreeTrial: boolean;
  createdAt: string;
  updatedAt: string;
  property: TAProperty;
  creator: TACreator;
  coBroke: { fullName: string; phoneNumber: string } | null;
  signers: TASigner[];
}

export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue';

export interface RentInvoice {
  id: string;
  invoiceNumber: string;
  receiptNumber?: string;
  taId: number;
  adjudicationNo: string;
  propertyAddress: string;
  propertyCityState: string;
  tenantName: string;
  landlordNric: string;
  landlordName: string;
  billingMonth: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  paidAt?: string;
  paymentMethod?: 'FPX Online Banking' | 'DuitNow QR' | 'Credit / Debit Card';
  paymentRef?: string;
}

export type ExpenseCategory =
  | 'Aircond & M&E'
  | 'Plumbing & Sanitary'
  | 'LHDN Stamping Fee'
  | 'IWK & Quit Rent'
  | 'Management & Sinking Fund'
  | 'Agency Renewal Fee'
  | 'General Repairs';

export interface PropertyExpense {
  id: string;
  taId: number;
  propertyAddress: string;
  cityState: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  paidBy: 'Landlord' | 'Agency (Reimbursable)';
  vendorName: string;
  receiptRef: string;
}
