# Security Specification — Redeemed Christian Fellowship (RCF)

## 1. Data Invariants
1. **Default Deny**: All unmatched Firestore paths deny read and write (`allow read, write: if false;`).
2. **PII & Testimony Privacy**: Ordinary visitors and anonymous/non-admin users can NEVER read `members`, `testimonies`, `sundayLists`, or list `admins`.
3. **No Self-Assigned Privileges**: Public registration (`members`) and testimony submission (`testimonies`) strictly whitelist fields via `keys().hasOnly(...)` so no `role`, `isAdmin`, or privilege field can be injected. Non-admins cannot write to `admins`, `settings`, `announcements`, or `sundayLists`.
4. **Verified Admin Identity**: Admin access requires BOTH `request.auth != null`, `request.auth.token.email_verified == true`, AND either an existing document at `/admins/$(request.auth.uid)` or the bootstrapped super-admin email `rcflasuedepe12@gmail.com`.
5. **Server Timestamp Integrity**: All `createdAt` and `updatedAt` fields MUST equal `request.time`. On updates, `createdAt` and original testimony body (`testimonyText`) are immutable.
6. **Path ID & Payload Bounds**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), and every string/list field enforces explicit type and length limits.

## 2. The "Dirty Dozen" Attack Payloads (All Must Result in PERMISSION_DENIED)
1. **Unauthenticated Member Directory Scrape**: `list /members` without admin auth -> DENIED.
2. **Unauthenticated Testimony Scrape**: `list /testimonies` without admin auth -> DENIED.
3. **Privilege Escalation in Member Registration**: `create /members/RCF-2026-111111` with `{ ..., role: "superAdmin" }` -> DENIED (extra key rejected by `hasOnly`).
4. **Unverified Email Admin Spoof**: `get /members/any` with `auth.token.email = "rcflasuedepe12@gmail.com"` and `auth.token.email_verified = false` -> DENIED.
5. **Non-Admin Creating Admin Record**: `create /admins/attackerUid` by `user@gmail.com` -> DENIED.
6. **Client Clock Forgery on Testimony**: `create /testimonies/t1` with `createdAt = timestamp(2020-01-01)` instead of `request.time` -> DENIED.
7. **Shadow Field Injection on Testimony**: `create /testimonies/t2` with `{ ..., approved: true, presentationCopy: "hacked" }` -> DENIED.
8. **Missing Required Conditional Field on Executive**: `create /members/RCF-2026-222222` with `category: "Executive"` and missing `executivePortfolio` -> DENIED.
9. **Resource Exhaustion (1MB String Poisoning)**: `create /testimonies/t3` with `testimonyText` > 3000 chars or `authorName` > 120 chars -> DENIED.
10. **Path ID Poisoning**: `create /members/invalid$id!with*bad@chars` -> DENIED by `isValidId`.
11. **Public Query Scraping Inactive Announcements**: `list /announcements` without `where('active', '==', true)` by non-admin -> DENIED by Pillar 8 query enforcer.
12. **Mutating Original Testimony Text**: Admin `update /testimonies/t1` attempting to alter `testimonyText` or `createdAt` -> DENIED (only `presentationCopy` & `updatedAt` mutable).
