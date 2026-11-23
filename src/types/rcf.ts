export type MemberCategory = 'Member' | 'Worker' | 'Executive';

export interface Member {
  id: string;
  memberId: string;
  fullName: string;
  category: MemberCategory;
  yearJoined: number;
  monthJoined?: string;
  dateJoined?: string;
  timeJoined?: string;
  email?: string;
  phone?: string;
  department?: string;
  faculty?: string;
  level?: string;
  unit?: string;
  workerRole?: string;
  executivePortfolio?: string;
  executiveSession?: string;
  submissionNonce: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface RegistrationInput {
  fullName: string;
  category: MemberCategory;
  yearJoined: number;
  monthJoined?: string;
  dateJoined?: string;
  timeJoined?: string;
  email: string;
  phone: string;
  department: string;
  faculty: string;
  level: string;
  unit?: string;
  workerRole?: string;
  executivePortfolio?: string;
  executiveSession?: string;
}

export interface Testimony {
  id: string;
  authorMemberId?: string;
  authorName: string;
  membershipCategory?: string;
  unit?: string;
  testimonyContext?: string;
  testimonyTitle?: string;
  testimonyText: string;
  photoDataUrl?: string;
  backgroundColor: string;
  textColor: string;
  consentToSundaySharing: boolean;
  presentationCopy?: string;
  submissionNonce: string;
  createdAt: Date | null;
  updatedAt?: Date | null;
}

export interface TestimonyInput {
  authorMemberId?: string;
  authorName: string;
  membershipCategory?: string;
  unit?: string;
  testimonyContext: string;
  testimonyTitle?: string;
  testimonyText: string;
  photoDataUrl?: string;
  backgroundColor: string;
  textColor: string;
  consentToSundaySharing: boolean;
}

export interface TestimonyColorPreset {
  id: string;
  label: string;
  backgroundColor: string;
  gradient?: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  eventDate?: string;
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface FellowshipActivity {
  title: string;
  schedule: string;
  description: string;
}

export interface FellowshipSettings {
  fellowshipName: string;
  lastWordUrl: string;
  lastWordDescription: string;
  units: string[];
  executivePortfolios: string[];
  aboutText: string;
  visionText: string;
  missionText: string;
  activities: FellowshipActivity[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  updatedAt: Date | null;
}

export interface SundayList {
  id: string;
  serviceDate: string;
  title?: string;
  orderedTestimonyIds: string[];
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type AdminRole = 'superAdmin' | 'admin' | 'testimonyAdmin';

export interface AdminUser {
  uid: string;
  email: string;
  role: AdminRole;
  displayName?: string;
  createdAt: Date | null;
}

export interface MemberSession {
  memberId: string;
  fullName: string;
  category: MemberCategory;
  unit?: string;
  executivePortfolio?: string;
}
