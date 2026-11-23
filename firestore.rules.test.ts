import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  generateMemberId,
  INITIAL_ADMIN_EMAIL,
  validateRegistrationInput,
  validateTestimonyInput,
} from './src/lib/rcf-utils';

const rulesSource = fs.readFileSync('firestore.rules', 'utf8');

test('firestore.rules contains default-deny catch-all and zero open read/write', () => {
  assert.match(rulesSource, /match \/\{document=\*\*\} \{\s*allow read, write: if false;/);
  assert.doesNotMatch(rulesSource, /allow\s+read\s*,\s*write\s*:\s*if\s+true/i);
  assert.doesNotMatch(rulesSource, /allow\s+read\s*:\s*if\s+true/i);
});

test('firestore.rules enforces verified email and bootstrapped super-admin email', () => {
  assert.match(rulesSource, /request\.auth\.token\.email_verified == true/);
  assert.ok(rulesSource.includes(INITIAL_ADMIN_EMAIL));
});

test('firestore.rules protects members and testimonies from public reads', () => {
  assert.match(
    rulesSource,
    /match \/members\/\{memberDocId\} \{[\s\S]*isAdmin\(\) \|\|[\s\S]*request\.auth\.uid[\s\S]*request\.auth\.token\.email[\s\S]*incoming\(\)\.uid == request\.auth\.uid/,
  );
  assert.match(
    rulesSource,
    /match \/testimonies\/\{testimonyId\} \{[\s\S]*allow get: if isValidId\(testimonyId\) && isAdmin\(\);[\s\S]*allow list: if isAdmin\(\);/,
  );
});

test('firestore.rules enforces server timestamps and immutable original testimony text', () => {
  assert.match(rulesSource, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rulesSource, /incoming\(\)\.updatedAt == request\.time/);
  assert.match(rulesSource, /incoming\(\)\.testimonyText == existing\(\)\.testimonyText/);
});

test('firestore.rules enforces strict allowlisted keys on members and testimonies', () => {
  assert.match(rulesSource, /data\.keys\(\)\.hasOnly\(\[/);
  assert.match(rulesSource, /affectedKeys\(\)\.hasOnly\(\[/);
});

test('Dirty Dozen client guard rejects malformed member IDs and oversized testimonies', () => {
  const generated = generateMemberId(2026);
  assert.match(generated, /^RCF-2026-[A-Z0-9]{6}$/);

  const longText = 'A'.repeat(3005);
  const res = validateTestimonyInput({
    authorName: 'Test User',
    testimonyContext: 'Thanksgiving',
    testimonyText: longText,
    backgroundColor: '#0B2545',
    textColor: '#FFFFFF',
    consentToSundaySharing: false,
  });
  assert.equal(res.valid, false);

  const execNoPortfolio = validateRegistrationInput({
    fullName: 'Test Exec',
    category: 'Executive',
    yearJoined: 2026,
    email: 'exec@gmail.com',
    phone: '08012345678',
    department: 'Law',
    faculty: 'Law',
    level: '400L',
  });
  assert.equal(execNoPortfolio.valid, false);
});
