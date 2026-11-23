import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_EXECUTIVE_PORTFOLIOS,
  exportMembersToCsv,
  formatNigeriaDateTime,
  formatSundayListPlainText,
  generateMemberId,
  getContrastTextColor,
  getYearTapGrid,
  isValidHttpUrl,
  TESTIMONY_COLOR_PRESETS,
  validateRegistrationInput,
  validateTestimonyInput,
} from './rcf-utils';
import type { Member, Testimony } from '../types/rcf';

test('generateMemberId produces valid RCF-YYYY-XXXXXX format without collisions', () => {
  const id1 = generateMemberId(2026);
  const id2 = generateMemberId(2026);
  assert.match(id1, /^RCF-2026-[A-Z0-9]{6}$/);
  assert.match(id2, /^RCF-2026-[A-Z0-9]{6}$/);
  assert.notEqual(id1, id2);
});

test('getYearTapGrid returns 20 tappable years covering 2018 upward', () => {
  const grid = getYearTapGrid(2026, 20);
  assert.equal(grid.length, 20);
  assert.equal(grid[0], 2007);
  assert.equal(grid[grid.length - 1], 2026);
  assert.ok(grid.includes(2018));
});

test('getContrastTextColor enforces readable foregrounds across all presets', () => {
  assert.equal(getContrastTextColor('#0B2545'), '#FFFFFF');
  assert.equal(getContrastTextColor('#111827'), '#FFFFFF');
  assert.equal(getContrastTextColor('#FFFFFF'), '#0F172A');
  assert.equal(getContrastTextColor('#E0F2FE'), '#0F172A');
  for (const preset of TESTIMONY_COLOR_PRESETS) {
    assert.equal(
      preset.textColor,
      getContrastTextColor(preset.backgroundColor),
      `Preset ${preset.id} textColor should match contrast calculation`,
    );
  }
});

test('validateRegistrationInput requires all front details while month/date/time are optional', () => {
  const emptyRes = validateRegistrationInput({
    fullName: '',
    category: 'Member',
    yearJoined: 2026,
    email: '',
    phone: '',
    department: '',
    faculty: '',
    level: '',
  });
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.errors.fullName);
  assert.ok(emptyRes.errors.email);
  assert.ok(emptyRes.errors.phone);
  assert.ok(emptyRes.errors.department);
  assert.ok(emptyRes.errors.faculty);
  assert.ok(emptyRes.errors.level);

  const memberValid = validateRegistrationInput({
    fullName: 'Adeola Johnson',
    category: 'Member',
    yearJoined: 2025,
    email: 'adeola@gmail.com',
    phone: '08012345678',
    department: 'Computer Science',
    faculty: 'Science',
    level: '300L',
  });
  assert.equal(memberValid.valid, true);

  const workerMissingUnit = validateRegistrationInput({
    fullName: 'Chidi Okafor',
    category: 'Worker',
    yearJoined: 2024,
    email: 'chidi@gmail.com',
    phone: '08012345678',
    department: 'Economics',
    faculty: 'Social Sciences',
    level: '200L',
  });
  assert.equal(workerMissingUnit.valid, false);
  assert.ok(workerMissingUnit.errors.unit);

  const workerValid = validateRegistrationInput({
    fullName: 'Chidi Okafor',
    category: 'Worker',
    yearJoined: 2024,
    monthJoined: 'March',
    dateJoined: '12',
    timeJoined: '10:00',
    email: 'chidi@gmail.com',
    phone: '08012345678',
    department: 'Economics',
    faculty: 'Social Sciences',
    level: '200L',
    unit: 'Media',
  });
  assert.equal(workerValid.valid, true);

  const execMissingFields = validateRegistrationInput({
    fullName: 'Tolu Adebayo',
    category: 'Executive',
    yearJoined: 2023,
    email: 'tolu@gmail.com',
    phone: '08012345678',
    department: 'Law',
    faculty: 'Law',
    level: '400L',
  });
  assert.equal(execMissingFields.valid, false);
  assert.ok(execMissingFields.errors.executivePortfolio);
  assert.ok(execMissingFields.errors.executiveSession);

  const execValid = validateRegistrationInput({
    fullName: 'Tolu Adebayo',
    category: 'Executive',
    yearJoined: 2023,
    email: 'tolu@gmail.com',
    phone: '08012345678',
    department: 'Law',
    faculty: 'Law',
    level: '400L',
    executivePortfolio: 'General Secretary',
    executiveSession: '2025/2026',
  });
  assert.equal(execValid.valid, true);
});

test('validateTestimonyInput enforces context, author, length, hex color, and photo format', () => {
  const invalid = validateTestimonyInput({
    authorName: 'A',
    testimonyContext: '',
    testimonyText: 'Hi',
    backgroundColor: 'red',
    textColor: '#FFFFFF',
    consentToSundaySharing: false,
    photoDataUrl: 'javascript:alert(1)',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.authorName);
  assert.ok(invalid.errors.testimonyContext);
  assert.ok(invalid.errors.testimonyText);
  assert.ok(invalid.errors.backgroundColor);
  assert.ok(invalid.errors.photoDataUrl);

  const valid = validateTestimonyInput({
    authorName: 'Grace Balogun',
    testimonyContext: 'Healing',
    testimonyTitle: 'Academic Breakthrough',
    testimonyText: 'God saw me through my final examinations with peace and distinction.',
    photoDataUrl: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4',
    backgroundColor: '#0B2545',
    textColor: '#FFFFFF',
    consentToSundaySharing: true,
  });
  assert.equal(valid.valid, true);
});

test('formatNigeriaDateTime formats UTC date in Africa/Lagos timezone', () => {
  // 2026-11-23T15:18:00Z is 4:18 PM WAT (UTC+1)
  const sample = new Date('2026-11-23T15:18:00.000Z');
  const formatted = formatNigeriaDateTime(sample);
  assert.equal(formatted, '23 November 2026, 4:18 PM');
});

test('formatSundayListPlainText prefers presentationCopy while preserving structure', () => {
  const testimonies: Testimony[] = [
    {
      id: 't1',
      authorName: 'Samuel Adeyemi',
      testimonyTitle: 'Healing',
      testimonyText: 'Original long text here.',
      presentationCopy: 'Edited presentation text.',
      backgroundColor: '#0B2545',
      textColor: '#FFFFFF',
      consentToSundaySharing: true,
      submissionNonce: 'nonce1234',
      createdAt: new Date('2026-11-23T15:18:00.000Z'),
    },
    {
      id: 't2',
      authorName: 'Esther Musa',
      testimonyText: 'Provision for school fees.',
      backgroundColor: '#15803D',
      textColor: '#FFFFFF',
      consentToSundaySharing: true,
      submissionNonce: 'nonce5678',
      createdAt: new Date('2026-11-23T16:00:00.000Z'),
    },
  ];
  const output = formatSundayListPlainText('29 November 2026', 'Thanksgiving Sunday', testimonies);
  assert.match(output, /RCF — REDEEMED CHRISTIAN FELLOWSHIP/);
  assert.match(output, /1\. Samuel Adeyemi — Healing/);
  assert.match(output, /Edited presentation text\./);
  assert.match(output, /2\. Esther Musa/);
  assert.match(output, /Provision for school fees\./);
});

test('exportMembersToCsv escapes commas and quotes properly', () => {
  const members: Member[] = [
    {
      id: 'RCF-2026-AB12CD',
      memberId: 'RCF-2026-AB12CD',
      fullName: 'Oluwatobi, "Tobi" Bello',
      category: 'Worker',
      yearJoined: 2024,
      unit: 'Choir',
      submissionNonce: 'n12345678',
      createdAt: new Date('2026-11-23T15:18:00.000Z'),
      updatedAt: new Date('2026-11-23T15:18:00.000Z'),
    },
  ];
  const csv = exportMembersToCsv(members);
  assert.match(csv, /"Oluwatobi, ""Tobi"" Bello"/);
});

test('isValidHttpUrl validates http/https only', () => {
  assert.equal(isValidHttpUrl('https://lastword.example.org/rcf'), true);
  assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
  assert.equal(isValidHttpUrl(''), false);
});

test('DEFAULT_EXECUTIVE_PORTFOLIOS contains all 21 requested portfolios', () => {
  const expected = [
    'President',
    'Vice President',
    'General Secretary',
    'Assistant General Secretary',
    'Evangelism Secretary',
    'Financial Secretary',
    'Treasurer',
    'Chief Protocol Officer',
    'Media',
    'Technical',
    'Beautification',
    'Music Director',
    'Prayer Secretary',
    'Follow Up Secretary',
    'Bible Study Secretary',
    'Drama Coordinator',
    'Welfare Secretary',
    "Brother's Coordinator",
    "Sister's Coordinator",
    'Ushering Secretary',
    'Academic Secretary',
  ];
  assert.deepEqual(DEFAULT_EXECUTIVE_PORTFOLIOS, expected);
});
