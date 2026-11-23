import type {
  FellowshipSettings,
  Member,
  RegistrationInput,
  Testimony,
  TestimonyColorPreset,
  TestimonyInput,
} from '../types/rcf';

export const INITIAL_ADMIN_EMAIL = 'rcflasuedepe12@gmail.com';

export const DEFAULT_UNITS: string[] = [
  'Choir',
  'Ushering',
  'Media',
  'Prayer',
  'Welfare',
  'Evangelism',
  'Protocol',
  'Technical',
];

export const DEFAULT_EXECUTIVE_PORTFOLIOS: string[] = [
  'President',
  'Vice President',
  'General Secretary',
  'Assistant Secretary',
  'Treasurer',
  'Financial Secretary',
  'Welfare',
  'Bible Study Coordinator',
  'Other',
];

export const DEFAULT_SETTINGS: FellowshipSettings = {
  fellowshipName: 'Redeemed Christian Fellowship (RCF)',
  lastWordUrl: '',
  lastWordDescription: '',
  units: DEFAULT_UNITS,
  executivePortfolios: DEFAULT_EXECUTIVE_PORTFOLIOS,
  aboutText:
    'Redeemed Christian Fellowship (RCF) is a campus Christian fellowship committed to spiritual growth, discipleship, prayer, and loving community. Leadership can update this overview anytime in Admin Settings.',
  visionText:
    'Fellowship vision statement can be updated by fellowship leadership in Admin Settings.',
  missionText:
    'Fellowship mission statement can be updated by fellowship leadership in Admin Settings.',
  activities: [],
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  updatedAt: null,
};

export const TESTIMONY_COLOR_PRESETS: TestimonyColorPreset[] = [
  {
    id: 'deep-navy',
    label: 'Deep Navy',
    backgroundColor: '#0B2545',
    gradient: 'linear-gradient(135deg, #0B2545 0%, #163E72 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#CBD5E1',
    borderColor: '#1E3A5F',
  },
  {
    id: 'charcoal',
    label: 'Midnight Charcoal',
    backgroundColor: '#111827',
    gradient: 'linear-gradient(135deg, #111827 0%, #334155 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#D1D5DB',
    borderColor: '#374151',
  },
  {
    id: 'sky-blue',
    label: 'Royal Blue',
    backgroundColor: '#0369A1',
    gradient: 'linear-gradient(135deg, #0369A1 0%, #2563EB 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  {
    id: 'ocean-teal',
    label: 'Ocean Teal',
    backgroundColor: '#0F766E',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #0891B2 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#CCFBF1',
    borderColor: '#0D9488',
  },
  {
    id: 'light-blue',
    label: 'Soft Sky',
    backgroundColor: '#E0F2FE',
    gradient: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)',
    textColor: '#0F172A',
    mutedTextColor: '#0369A1',
    borderColor: '#BAE6FD',
  },
  {
    id: 'rose-pink',
    label: 'Rose Pink',
    backgroundColor: '#BE185D',
    gradient: 'linear-gradient(135deg, #BE185D 0%, #E11D48 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#FCE7F3',
    borderColor: '#DB2777',
  },
  {
    id: 'magenta-bloom',
    label: 'Magenta Bloom',
    backgroundColor: '#A21CAF',
    gradient: 'linear-gradient(135deg, #A21CAF 0%, #EC4899 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#FAE8FF',
    borderColor: '#C026D3',
  },
  {
    id: 'crimson-grace',
    label: 'Crimson Grace',
    backgroundColor: '#991B1B',
    gradient: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#FEE2E2',
    borderColor: '#B91C1C',
  },
  {
    id: 'royal-purple',
    label: 'Royal Purple',
    backgroundColor: '#6D28D9',
    gradient: 'linear-gradient(135deg, #5B21B6 0%, #9333EA 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  {
    id: 'berry-plum',
    label: 'Berry Plum',
    backgroundColor: '#581C87',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #86198F 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#F3E8FF',
    borderColor: '#6B21A8',
  },
  {
    id: 'lavender-mist',
    label: 'Lavender Mist',
    backgroundColor: '#EDE9FE',
    gradient: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)',
    textColor: '#0F172A',
    mutedTextColor: '#5B21B6',
    borderColor: '#DDD6FE',
  },
  {
    id: 'emerald-green',
    label: 'Forest Green',
    backgroundColor: '#15803D',
    gradient: 'linear-gradient(135deg, #166534 0%, #059669 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  {
    id: 'mint-meadow',
    label: 'Mint Meadow',
    backgroundColor: '#DCFCE7',
    gradient: 'linear-gradient(135deg, #DCFCE7 0%, #CCFBF1 100%)',
    textColor: '#0F172A',
    mutedTextColor: '#166534',
    borderColor: '#BBF7D0',
  },
  {
    id: 'warm-gold',
    label: 'Warm Gold',
    backgroundColor: '#B45309',
    gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#FEF3C7',
    borderColor: '#B45309',
  },
  {
    id: 'sunburst-amber',
    label: 'Sunburst Gold',
    backgroundColor: '#FEF3C7',
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    textColor: '#0F172A',
    mutedTextColor: '#92400E',
    borderColor: '#FCD34D',
  },
  {
    id: 'sunset-orange',
    label: 'Sunset Orange',
    backgroundColor: '#C2410C',
    gradient: 'linear-gradient(135deg, #9A3412 0%, #EA580C 100%)',
    textColor: '#FFFFFF',
    mutedTextColor: '#FFEDD5',
    borderColor: '#EA580C',
  },
  {
    id: 'coral-peach',
    label: 'Coral Peach',
    backgroundColor: '#FFEDD5',
    gradient: 'linear-gradient(135deg, #FFEDD5 0%, #FFE4E6 100%)',
    textColor: '#0F172A',
    mutedTextColor: '#9A3412',
    borderColor: '#FED7AA',
  },
  {
    id: 'crisp-white',
    label: 'Clean White',
    backgroundColor: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
    textColor: '#0F172A',
    mutedTextColor: '#475569',
    borderColor: '#CBD5E1',
  },
];

export function getPresetForColor(backgroundColor: string): TestimonyColorPreset {
  const found = TESTIMONY_COLOR_PRESETS.find(
    (p) => p.backgroundColor.toLowerCase() === backgroundColor.toLowerCase(),
  );
  if (found) return found;
  const textColor = getContrastTextColor(backgroundColor);
  return {
    id: 'custom',
    label: 'Selected',
    backgroundColor,
    textColor,
    mutedTextColor: textColor === '#FFFFFF' ? '#CBD5E1' : '#475569',
    borderColor: textColor === '#FFFFFF' ? '#334155' : '#CBD5E1',
  };
}

/**
 * Computes WCAG relative luminance and returns high-contrast text color (#FFFFFF or #0F172A).
 */
export function getContrastTextColor(hexColor: string): '#FFFFFF' | '#0F172A' {
  const clean = hexColor.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return '#FFFFFF';
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.35 ? '#0F172A' : '#FFFFFF';
}

/**
 * Generates a collision-resistant member ID matching ^RCF-[0-9]{4}-[A-Z0-9]{4,10}$
 * without relying on a sequential public counter.
 */
export function generateMemberId(yearJoined: number, randomBytes?: Uint8Array): string {
  const safeYear =
    Number.isInteger(yearJoined) && yearJoined >= 1980 && yearJoined <= 2100
      ? yearJoined
      : new Date().getFullYear();

  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = randomBytes ?? new Uint8Array(6);
  if (!randomBytes) {
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
  }

  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return `RCF-${safeYear}-${code}`;
}

export function generateSafeId(prefix = 'rcf'): string {
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 12) || 'rcf';
  const bytes = new Uint8Array(8);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${cleanPrefix}_${Date.now()}_${hex}`;
}

export const JOINED_MONTHS: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const TESTIMONY_CONTEXTS: string[] = [
  'Thanksgiving',
  'Answered Prayer',
  'Healing',
  'Financial Provision',
  'Academic Breakthrough',
  'Journey Mercies',
  'Deliverance',
  'Salvation & Peace',
];

/**
 * Returns a 20-year window of selectable years up to endYear (inclusive).
 * Default window includes 2018 upward alongside prior years for 20-year tap preview.
 */
export function getYearTapGrid(endYear: number, count = 20): number[] {
  const clampedEnd = Math.min(2100, Math.max(1980 + count - 1, endYear));
  const start = Math.max(1980, clampedEnd - count + 1);
  const years: number[] = [];
  for (let y = start; y <= clampedEnd; y++) {
    years.push(y);
  }
  return years;
}

export interface ValidationResult<T extends Record<string, string>> {
  valid: boolean;
  errors: Partial<T>;
}

export function validateRegistrationInput(
  input: RegistrationInput,
  options?: { allowOptionalContact?: boolean },
): ValidationResult<{
  fullName: string;
  category: string;
  yearJoined: string;
  monthJoined: string;
  dateJoined: string;
  timeJoined: string;
  email: string;
  phone: string;
  department: string;
  faculty: string;
  level: string;
  unit: string;
  workerRole: string;
  executivePortfolio: string;
  executiveSession: string;
}> {
  const errors: Record<string, string> = {};
  const allowOptional = Boolean(options?.allowOptionalContact);

  const fullName = input.fullName.trim();
  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  } else if (fullName.length > 120) {
    errors.fullName = 'Full name must be 120 characters or fewer.';
  }

  if (!['Member', 'Worker', 'Executive'].includes(input.category)) {
    errors.category = 'Please choose a membership category.';
  }

  const currentYear = new Date().getFullYear();
  if (
    !Number.isInteger(input.yearJoined) ||
    input.yearJoined < 1980 ||
    input.yearJoined > currentYear + 1
  ) {
    errors.yearJoined = `Please tap a valid year joined between 1980 and ${currentYear + 1}.`;
  }

  if ((input.monthJoined?.trim().length ?? 0) > 20) {
    errors.monthJoined = 'Month must be 20 characters or fewer.';
  }
  if ((input.dateJoined?.trim().length ?? 0) > 20) {
    errors.dateJoined = 'Date must be 20 characters or fewer.';
  }
  if ((input.timeJoined?.trim().length ?? 0) > 20) {
    errors.timeJoined = 'Time must be 20 characters or fewer.';
  }

  const email = input.email?.trim() ?? '';
  if (!allowOptional && email.length === 0) {
    errors.email = 'Email address is required.';
  } else if (email.length > 0) {
    if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
  }

  const phone = input.phone?.trim() ?? '';
  if (!allowOptional && phone.length < 7) {
    errors.phone = 'Please enter a valid phone number (at least 7 digits).';
  } else if (phone.length > 32) {
    errors.phone = 'Phone number must be 32 characters or fewer.';
  }

  const department = input.department?.trim() ?? '';
  if (!allowOptional && department.length < 2) {
    errors.department = 'Please enter your academic department.';
  } else if (department.length > 120) {
    errors.department = 'Department must be 120 characters or fewer.';
  }

  const faculty = input.faculty?.trim() ?? '';
  if (!allowOptional && faculty.length < 2) {
    errors.faculty = 'Please enter your faculty or college.';
  } else if (faculty.length > 120) {
    errors.faculty = 'Faculty must be 120 characters or fewer.';
  }

  const level = input.level?.trim() ?? '';
  if (!allowOptional && level.length < 2) {
    errors.level = 'Please select your academic level.';
  } else if (level.length > 32) {
    errors.level = 'Level must be 32 characters or fewer.';
  }

  if (input.category === 'Worker') {
    const unit = input.unit?.trim() ?? '';
    if (unit.length < 1) {
      errors.unit = 'Please select your fellowship unit.';
    } else if (unit.length > 80) {
      errors.unit = 'Unit name must be 80 characters or fewer.';
    }
  }

  if (input.category === 'Executive') {
    const portfolio = input.executivePortfolio?.trim() ?? '';
    const session = input.executiveSession?.trim() ?? '';
    if (portfolio.length < 1) {
      errors.executivePortfolio = 'Please select your executive portfolio.';
    } else if (portfolio.length > 80) {
      errors.executivePortfolio = 'Executive portfolio must be 80 characters or fewer.';
    }
    if (session.length < 2) {
      errors.executiveSession = 'Please choose or enter your executive session.';
    } else if (session.length > 40) {
      errors.executiveSession = 'Executive session must be 40 characters or fewer.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTestimonyInput(
  input: TestimonyInput,
): ValidationResult<{
  authorName: string;
  testimonyContext: string;
  testimonyTitle: string;
  testimonyText: string;
  photoDataUrl: string;
  backgroundColor: string;
}> {
  const errors: Record<string, string> = {};
  const authorName = input.authorName.trim();
  const testimonyContext = input.testimonyContext.trim();
  const testimonyText = input.testimonyText.trim();
  const title = input.testimonyTitle?.trim() ?? '';

  if (authorName.length < 2) {
    errors.authorName = 'Missing member name. Please complete registration first.';
  } else if (authorName.length > 120) {
    errors.authorName = 'Name must be 120 characters or fewer.';
  }

  if (testimonyContext.length < 2) {
    errors.testimonyContext = 'Please select the type or context of your testimony.';
  } else if (testimonyContext.length > 60) {
    errors.testimonyContext = 'Testimony context must be 60 characters or fewer.';
  }

  if (title.length > 140) {
    errors.testimonyTitle = 'Testimony title must be 140 characters or fewer.';
  }

  if (testimonyText.length < 5) {
    errors.testimonyText = 'Please write your testimony (at least 5 characters).';
  } else if (testimonyText.length > 3000) {
    errors.testimonyText = 'Testimony must be 3,000 characters or fewer.';
  }

  if (input.photoDataUrl) {
    if (
      input.photoDataUrl.length > 100000 ||
      !/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(input.photoDataUrl)
    ) {
      errors.photoDataUrl = 'Please upload a valid lightweight image (WebP, JPEG, or PNG).';
    }
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(input.backgroundColor)) {
    errors.backgroundColor = 'Please choose a valid card background color.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Formats a Date in Nigeria timezone (Africa/Lagos) like "23 November 2026, 4:18 PM".
 */
export function formatNigeriaDateTime(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) {
    return 'Pending timestamp';
  }
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Lagos',
  }).format(date);

  return `${datePart}, ${timePart}`;
}

export function formatNigeriaDateOnly(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  }).format(date);
}

export function formatSundayListPlainText(
  serviceDate: string,
  title: string | undefined,
  testimonies: Testimony[],
): string {
  const lines: string[] = [
    'RCF — REDEEMED CHRISTIAN FELLOWSHIP',
    '',
    title && title.trim().length > 0 ? title.trim() : 'Sunday Testimony List',
    serviceDate.trim() || 'Service Date Not Set',
    '',
  ];

  testimonies.forEach((t, idx) => {
    const heading = t.testimonyTitle?.trim()
      ? `${idx + 1}. ${t.authorName} — ${t.testimonyTitle.trim()}`
      : `${idx + 1}. ${t.authorName}`;
    const body = (t.presentationCopy?.trim() || t.testimonyText).trim();
    lines.push(heading);
    lines.push(`   ${body}`);
    lines.push('');
  });

  return lines.join('\n').trim();
}

export function exportMembersToCsv(members: Member[]): string {
  const headers = [
    'Member ID',
    'Full Name',
    'Category',
    'Year Joined',
    'Unit',
    'Worker Role',
    'Executive Portfolio',
    'Executive Session',
    'Email',
    'Phone',
    'Department',
    'Faculty',
    'Level',
    'Registered At (WAT)',
  ];

  const escapeCell = (val: string | number | undefined | null): string => {
    const str = val === undefined || val === null ? '' : String(val);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = members.map((m) =>
    [
      m.memberId,
      m.fullName,
      m.category,
      m.yearJoined,
      m.unit ?? '',
      m.workerRole ?? '',
      m.executivePortfolio ?? '',
      m.executiveSession ?? '',
      m.email ?? '',
      m.phone ?? '',
      m.department ?? '',
      m.faculty ?? '',
      m.level ?? '',
      formatNigeriaDateTime(m.createdAt),
    ]
      .map(escapeCell)
      .join(','),
  );

  return [headers.map(escapeCell).join(','), ...rows].join('\n');
}

export function isValidHttpUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
