
export type ServiceType = 'AUTOMOTIVE' | 'LEASING';

export interface ServicePackage {
  id: string;
  type: ServiceType;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

export type CaseStatus = 
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'FORM_PENDING'
  | 'FORM_COMPLETED'
  | 'DOCUMENTS_PENDING'
  | 'READY_FOR_ANALYSIS'
  | 'IN_ANALYSIS'
  | 'REPORT_READY'
  | 'DELIVERED'
  | 'CLOSED';

export interface CaseFile {
  name: string;
  size: string;
  type: string;
  status: 'pending' | 'uploaded' | 'verified';
}

export interface RiskCase {
  id: string;
  packageId: string;
  clientName: string;
  status: CaseStatus;
  lastUpdated: string;
  vehicleInfo?: {
    vin: string;
    make: string;
    model: string;
    year: string;
  };
  leasingInfo?: {
    applicantName: string;
    rentAmount: number;
  };
  files: CaseFile[];
  riskScore?: number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  section?: string;
  placeholder?: string;
}

export interface DocRequirement {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  section?: string;
}

export interface PackageRequirement {
  id: string;
  fields: FormField[];
  documents: DocRequirement[];
  skipUpload?: boolean;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface SupportTicket {
  ticket_id: string;
  case_id: string;
  name: string;
  email: string;
  message: string;
  status: TicketStatus;
  created_at: string;
}
