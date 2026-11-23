import test from 'node:test';
import assert from 'node:assert/strict';
import {
  exportMembersToCsv,
  formatNigeriaDateTime,
  formatSundayListPlainText,
  generateMemberId,
  getContrastTextColor,
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

test('validateRegistrationInput validates Member, Worker, and Executive conditional fields', () => {
  const emptyRes = validateRegistrationInput({
    fullName: '',
    category: 'Member',
    yearJoined: 2026,
  });
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.errors.fullName);

  const memberValid = validateRegistrationInput({
    fullName: 'Adeola Johnson',
    category: 'Member',
    yearJoined: 2025,
    email: 'adeola@gmail.com',
  });
  assert.equal(memberValid.valid, true);

  const workerMissingUnit = validateRegistrationInput({
    fullName: 'Chidi Okafor',
    category: 'Worker',
    yearJoined: 2024,
  });
  assert.equal(workerMissingUnit.valid, false);
  assert.ok(workerMissingUnit.errors.unit);

  const workerValid = validateRegistrationInput({
    fullName: 'Chidi Okafor',
    category: 'Worker',
    yearJoined: 2024,
    unit: 'Media',
    workerRole: 'Livestream Lead',
  });
  assert.equal(workerValid.valid, true);

  const execMissingFields = validateRegistrationInput({
    fullName: 'Tolu Adebayo',
    category: 'Executive',
    yearJoined: 2023,
  });
  assert.equal(execMissingFields.valid, false);
  assert.ok(execMissingFields.errors.executivePortfolio);
  assert.ok(execMissingFields.errors.executiveSession);

  const execValid = validateRegistrationInput({
    fullName: 'Tolu Adebayo',
    category: 'Executive',
    yearJoined: 2023,
    executivePortfolio: 'General Secretary',
    executiveSession: '2025/2026',
  });
  assert.equal(execValid.valid, true);
});

test('validateTestimonyInput enforces author, length, and hex color', () => {
  const invalid = validateTestimonyInput({
    authorName: 'A',
    testimonyText: 'Hi',
    backgroundColor: 'red',
    textColor: '#FFFFFF',
    consentToSundaySharing: false,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.authorName);
  assert.ok(invalid.errors.testimonyText);
  assert.ok(invalid.errors.backgroundColor);

  const valid = validateTestimonyInput({
    authorName: 'Grace Balogun',
    testimonyTitle: 'Academic Breakthrough',
    testimonyText: 'God saw me through my final examinations with peace and distinction.',
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
