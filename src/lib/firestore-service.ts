import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  DEFAULT_SETTINGS,
  generateMemberId,
  generateSafeId,
  INITIAL_ADMIN_EMAIL,
  validateRegistrationInput,
  validateTestimonyInput,
} from './rcf-utils';
import type {
  AdminRole,
  AdminUser,
  Announcement,
  FellowshipSettings,
  Member,
  RegistrationInput,
  SundayList,
  Testimony,
  TestimonyInput,
} from '../types/rcf';

function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  if (typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate();
  }
  return null;
}

function stripEmptyStrings<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    result[key] = typeof value === 'string' ? value.trim() : value;
  }
  return result;
}

function isPermissionDeniedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = (err as { code?: unknown }).code;
  if (code === 'permission-denied') return true;
  const message = err instanceof Error ? err.message : String(err);
  return /permission[_ -]?denied|missing or insufficient permissions/i.test(message);
}

// --- Public Reads ---

export async function fetchPublicSettings(): Promise<FellowshipSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (!snap.exists()) {
      return DEFAULT_SETTINGS;
    }
    const data = snap.data();
    return {
      fellowshipName:
        typeof data.fellowshipName === 'string' && data.fellowshipName.trim()
          ? data.fellowshipName
          : DEFAULT_SETTINGS.fellowshipName,
      lastWordUrl: typeof data.lastWordUrl === 'string' ? data.lastWordUrl : '',
      lastWordDescription:
        typeof data.lastWordDescription === 'string' && data.lastWordDescription.trim()
          ? data.lastWordDescription
          : DEFAULT_SETTINGS.lastWordDescription,
      units:
        Array.isArray(data.units) && data.units.length > 0
          ? data.units.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
          : DEFAULT_SETTINGS.units,
      executivePortfolios:
        Array.isArray(data.executivePortfolios) && data.executivePortfolios.length > 0
          ? data.executivePortfolios.filter(
              (p): p is string => typeof p === 'string' && p.trim().length > 0,
            )
          : DEFAULT_SETTINGS.executivePortfolios,
      aboutText:
        typeof data.aboutText === 'string' && data.aboutText.trim()
          ? data.aboutText
          : DEFAULT_SETTINGS.aboutText,
      visionText:
        typeof data.visionText === 'string' && data.visionText.trim()
          ? data.visionText
          : DEFAULT_SETTINGS.visionText,
      missionText:
        typeof data.missionText === 'string' && data.missionText.trim()
          ? data.missionText
          : DEFAULT_SETTINGS.missionText,
      activities: Array.isArray(data.activities)
        ? data.activities.filter(
            (a): a is { title: string; schedule: string; description: string } =>
              Boolean(a && typeof a.title === 'string'),
          )
        : [],
      contactEmail: typeof data.contactEmail === 'string' ? data.contactEmail : '',
      contactPhone: typeof data.contactPhone === 'string' ? data.contactPhone : '',
      contactAddress: typeof data.contactAddress === 'string' ? data.contactAddress : '',
      updatedAt: toDate(data.updatedAt),
    };
  } catch (err) {
    // Public fallback if rules haven't been initialized or offline
    console.warn('Could not load settings/general, using defaults:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function fetchActiveAnnouncements(): Promise<Announcement[]> {
  const path = 'announcements';
  try {
    const q = query(
      collection(db, 'announcements'),
      where('active', '==', true),
      limit(20),
    );
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: String(data.title ?? ''),
        content: String(data.content ?? ''),
        eventDate: typeof data.eventDate === 'string' ? data.eventDate : undefined,
        active: Boolean(data.active),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } satisfies Announcement;
    });
    return items.sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// --- Public Writes (Validated) ---

export async function registerMember(
  input: RegistrationInput,
  submissionNonce: string,
): Promise<Member> {
  const check = validateRegistrationInput(input);
  if (!check.valid) {
    const firstError = Object.values(check.errors)[0] || 'Invalid registration fields.';
    throw new Error(firstError);
  }

  const memberId = generateMemberId(input.yearJoined);
  const path = `members/${memberId}`;

  const rawPayload: Record<string, unknown> = {
    memberId,
    fullName: input.fullName.trim(),
    category: input.category,
    yearJoined: Number(input.yearJoined),
    monthJoined: input.monthJoined,
    dateJoined: input.dateJoined,
    timeJoined: input.timeJoined,
    email: input.email,
    phone: input.phone,
    department: input.department,
    faculty: input.faculty,
    level: input.level,
    unit: input.category === 'Worker' ? input.unit : undefined,
    workerRole: undefined,
    executivePortfolio: input.category === 'Executive' ? input.executivePortfolio : undefined,
    executiveSession: input.category === 'Executive' ? input.executiveSession : undefined,
    submissionNonce,
  };

  const cleaned = stripEmptyStrings(rawPayload);

  try {
    try {
      await setDoc(doc(db, 'members', memberId), {
        ...cleaned,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (firstErr) {
      if (!isPermissionDeniedError(firstErr)) throw firstErr;
      // Compatibility fallback if the Firebase project still has pre-update firestore.rules deployed
      const legacyPayload = stripEmptyStrings({
        memberId,
        fullName: input.fullName.trim(),
        category: input.category,
        yearJoined: Number(input.yearJoined),
        email: input.email,
        phone: input.phone,
        department: input.department,
        faculty: input.faculty,
        level: input.level,
        unit: input.category === 'Worker' ? input.unit : undefined,
        executivePortfolio: input.category === 'Executive' ? input.executivePortfolio : undefined,
        executiveSession: input.category === 'Executive' ? input.executiveSession : undefined,
        submissionNonce,
      });
      await setDoc(doc(db, 'members', memberId), {
        ...legacyPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return {
      id: memberId,
      memberId,
      fullName: input.fullName.trim(),
      category: input.category,
      yearJoined: Number(input.yearJoined),
      monthJoined: input.monthJoined?.trim() || undefined,
      dateJoined: input.dateJoined?.trim() || undefined,
      timeJoined: input.timeJoined?.trim() || undefined,
      email: input.email.trim(),
      phone: input.phone.trim(),
      department: input.department.trim(),
      faculty: input.faculty.trim(),
      level: input.level.trim(),
      unit: input.category === 'Worker' ? input.unit?.trim() || undefined : undefined,
      executivePortfolio:
        input.category === 'Executive' ? input.executivePortfolio?.trim() || undefined : undefined,
      executiveSession:
        input.category === 'Executive' ? input.executiveSession?.trim() || undefined : undefined,
      submissionNonce,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function submitTestimony(
  input: TestimonyInput,
  submissionNonce: string,
): Promise<string> {
  const check = validateTestimonyInput(input);
  if (!check.valid) {
    const firstError = Object.values(check.errors)[0] || 'Invalid testimony fields.';
    throw new Error(firstError);
  }

  const testimonyId = generateSafeId('testimony');
  const path = `testimonies/${testimonyId}`;

  const cleaned = stripEmptyStrings({
    authorMemberId: input.authorMemberId,
    authorName: input.authorName,
    membershipCategory: input.membershipCategory,
    unit: input.unit,
    testimonyContext: input.testimonyContext,
    testimonyTitle: input.testimonyTitle,
    testimonyText: input.testimonyText,
    photoDataUrl: input.photoDataUrl,
    backgroundColor: input.backgroundColor,
    textColor: input.textColor,
    submissionNonce,
  });

  try {
    try {
      await setDoc(doc(db, 'testimonies', testimonyId), {
        ...cleaned,
        consentToSundaySharing: Boolean(input.consentToSundaySharing),
        createdAt: serverTimestamp(),
      });
    } catch (firstErr) {
      if (!isPermissionDeniedError(firstErr)) throw firstErr;
      // Compatibility fallback if the Firebase project still has pre-update firestore.rules deployed
      const legacyPayload = stripEmptyStrings({
        authorMemberId: input.authorMemberId,
        authorName: input.authorName,
        membershipCategory: input.membershipCategory,
        unit: input.unit,
        testimonyTitle: input.testimonyTitle || input.testimonyContext,
        testimonyText: input.testimonyText,
        backgroundColor: input.backgroundColor,
        textColor: input.textColor,
        submissionNonce,
      });
      await setDoc(doc(db, 'testimonies', testimonyId), {
        ...legacyPayload,
        consentToSundaySharing: Boolean(input.consentToSundaySharing),
        createdAt: serverTimestamp(),
      });
    }
    return testimonyId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// --- Admin Authentication & Verification ---

export async function verifyAndBootstrapAdmin(user: User): Promise<AdminUser | null> {
  if (!user.email || !user.emailVerified) {
    return null;
  }

  const adminRef = doc(db, 'admins', user.uid);

  try {
    const snap = await getDoc(adminRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: snap.id,
        email: String(data.email ?? user.email),
        role: (data.role as AdminRole) || 'admin',
        displayName: typeof data.displayName === 'string' ? data.displayName : user.displayName ?? undefined,
        createdAt: toDate(data.createdAt),
      };
    }

    // Bootstrapped initial administrator check (enforced identically in firestore.rules!)
    if (user.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase()) {
      const displayName = user.displayName?.trim() || 'RCF Administrator';
      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email.toLowerCase(),
        role: 'superAdmin',
        displayName,
        createdAt: serverTimestamp(),
      });
      return {
        uid: user.uid,
        email: user.email.toLowerCase(),
        role: 'superAdmin',
        displayName,
        createdAt: new Date(),
      };
    }

    return null;
  } catch (err) {
    // Permission denied means user is not an authorized admin
    console.warn('Admin verification check failed or unauthorized:', err);
    return null;
  }
}

// --- Admin-Protected Operations ---

export async function fetchAllMembers(maxResults = 300): Promise<Member[]> {
  const path = 'members';
  try {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        memberId: String(data.memberId ?? d.id),
        fullName: String(data.fullName ?? ''),
        category: (data.category as Member['category']) || 'Member',
        yearJoined: Number(data.yearJoined ?? new Date().getFullYear()),
        monthJoined: typeof data.monthJoined === 'string' ? data.monthJoined : undefined,
        dateJoined: typeof data.dateJoined === 'string' ? data.dateJoined : undefined,
        timeJoined: typeof data.timeJoined === 'string' ? data.timeJoined : undefined,
        email: typeof data.email === 'string' ? data.email : undefined,
        phone: typeof data.phone === 'string' ? data.phone : undefined,
        department: typeof data.department === 'string' ? data.department : undefined,
        faculty: typeof data.faculty === 'string' ? data.faculty : undefined,
        level: typeof data.level === 'string' ? data.level : undefined,
        unit: typeof data.unit === 'string' ? data.unit : undefined,
        workerRole: typeof data.workerRole === 'string' ? data.workerRole : undefined,
        executivePortfolio:
          typeof data.executivePortfolio === 'string' ? data.executivePortfolio : undefined,
        executiveSession:
          typeof data.executiveSession === 'string' ? data.executiveSession : undefined,
        submissionNonce: String(data.submissionNonce ?? ''),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateMemberRecord(
  memberId: string,
  input: RegistrationInput,
  existingMember: Member,
): Promise<void> {
  const check = validateRegistrationInput(input, { allowOptionalContact: true });
  if (!check.valid) {
    const firstError = Object.values(check.errors)[0] || 'Invalid member fields.';
    throw new Error(firstError);
  }
  const path = `members/${memberId}`;
  const fullPayload = stripEmptyStrings({
    memberId: existingMember.memberId,
    fullName: input.fullName,
    category: input.category,
    yearJoined: Number(input.yearJoined),
    monthJoined: input.monthJoined,
    dateJoined: input.dateJoined,
    timeJoined: input.timeJoined,
    email: input.email,
    phone: input.phone,
    department: input.department,
    faculty: input.faculty,
    level: input.level,
    unit: input.category === 'Member' ? undefined : input.unit,
    workerRole: input.category === 'Worker' ? input.workerRole : undefined,
    executivePortfolio: input.category === 'Executive' ? input.executivePortfolio : undefined,
    executiveSession: input.category === 'Executive' ? input.executiveSession : undefined,
    submissionNonce: existingMember.submissionNonce || 'admin_edited',
  });

  try {
    try {
      await setDoc(doc(db, 'members', memberId), {
        ...fullPayload,
        createdAt: existingMember.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (firstErr) {
      if (!isPermissionDeniedError(firstErr)) throw firstErr;
      const legacyPayload = stripEmptyStrings({
        memberId: existingMember.memberId,
        fullName: input.fullName,
        category: input.category,
        yearJoined: Number(input.yearJoined),
        email: input.email,
        phone: input.phone,
        department: input.department,
        faculty: input.faculty,
        level: input.level,
        unit: input.category === 'Member' ? undefined : input.unit,
        workerRole: input.category === 'Worker' ? input.workerRole : undefined,
        executivePortfolio: input.category === 'Executive' ? input.executivePortfolio : undefined,
        executiveSession: input.category === 'Executive' ? input.executiveSession : undefined,
        submissionNonce: existingMember.submissionNonce || 'admin_edited',
      });
      await setDoc(doc(db, 'members', memberId), {
        ...legacyPayload,
        createdAt: existingMember.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteMemberRecord(memberId: string): Promise<void> {
  const path = `members/${memberId}`;
  try {
    await deleteDoc(doc(db, 'members', memberId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchAllTestimonies(maxResults = 300): Promise<Testimony[]> {
  const path = 'testimonies';
  try {
    const q = query(collection(db, 'testimonies'), orderBy('createdAt', 'desc'), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        authorMemberId: typeof data.authorMemberId === 'string' ? data.authorMemberId : undefined,
        authorName: String(data.authorName ?? 'Anonymous'),
        membershipCategory:
          typeof data.membershipCategory === 'string' ? data.membershipCategory : undefined,
        unit: typeof data.unit === 'string' ? data.unit : undefined,
        testimonyContext:
          typeof data.testimonyContext === 'string' ? data.testimonyContext : undefined,
        testimonyTitle: typeof data.testimonyTitle === 'string' ? data.testimonyTitle : undefined,
        testimonyText: String(data.testimonyText ?? ''),
        photoDataUrl: typeof data.photoDataUrl === 'string' ? data.photoDataUrl : undefined,
        backgroundColor: String(data.backgroundColor ?? '#0B2545'),
        textColor: String(data.textColor ?? '#FFFFFF'),
        consentToSundaySharing: Boolean(data.consentToSundaySharing),
        presentationCopy:
          typeof data.presentationCopy === 'string' ? data.presentationCopy : undefined,
        submissionNonce: String(data.submissionNonce ?? ''),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateTestimonyPresentationCopy(
  testimonyId: string,
  presentationCopy: string,
): Promise<void> {
  const path = `testimonies/${testimonyId}`;
  try {
    await updateDoc(doc(db, 'testimonies', testimonyId), {
      presentationCopy: presentationCopy.trim().slice(0, 3000),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteTestimonyRecord(testimonyId: string): Promise<void> {
  const path = `testimonies/${testimonyId}`;
  try {
    await deleteDoc(doc(db, 'testimonies', testimonyId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchAllAnnouncements(): Promise<Announcement[]> {
  const path = 'announcements';
  try {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: String(data.title ?? ''),
        content: String(data.content ?? ''),
        eventDate: typeof data.eventDate === 'string' ? data.eventDate : undefined,
        active: Boolean(data.active),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveAnnouncement(
  payload: { id?: string; title: string; content: string; eventDate?: string; active: boolean },
): Promise<string> {
  const id = payload.id || generateSafeId('ann');
  const path = `announcements/${id}`;
  const cleaned = stripEmptyStrings({
    title: payload.title,
    content: payload.content,
    eventDate: payload.eventDate,
  });
  try {
    if (payload.id) {
      await updateDoc(doc(db, 'announcements', id), {
        ...cleaned,
        active: Boolean(payload.active),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'announcements', id), {
        ...cleaned,
        active: Boolean(payload.active),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteAnnouncementRecord(announcementId: string): Promise<void> {
  const path = `announcements/${announcementId}`;
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveSettings(settings: FellowshipSettings): Promise<void> {
  const path = 'settings/general';
  const units = settings.units.map((u) => u.trim()).filter(Boolean);
  const executivePortfolios = settings.executivePortfolios.map((p) => p.trim()).filter(Boolean);
  if (units.length === 0) throw new Error('At least one fellowship unit is required.');
  if (executivePortfolios.length === 0) {
    throw new Error('At least one executive portfolio is required.');
  }

  const cleaned = stripEmptyStrings({
    fellowshipName: settings.fellowshipName || DEFAULT_SETTINGS.fellowshipName,
    lastWordUrl: settings.lastWordUrl,
    lastWordDescription: settings.lastWordDescription,
    aboutText: settings.aboutText,
    visionText: settings.visionText,
    missionText: settings.missionText,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    contactAddress: settings.contactAddress,
  });

  try {
    await setDoc(doc(db, 'settings', 'general'), {
      ...cleaned,
      units,
      executivePortfolios,
      activities: settings.activities.slice(0, 20),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchSundayLists(): Promise<SundayList[]> {
  const path = 'sundayLists';
  try {
    const q = query(collection(db, 'sundayLists'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        serviceDate: String(data.serviceDate ?? ''),
        title: typeof data.title === 'string' ? data.title : undefined,
        orderedTestimonyIds: Array.isArray(data.orderedTestimonyIds)
          ? data.orderedTestimonyIds.filter((x): x is string => typeof x === 'string')
          : [],
        createdBy: String(data.createdBy ?? ''),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveSundayList(
  payload: { id?: string; serviceDate: string; title?: string; orderedTestimonyIds: string[] },
  adminUid: string,
): Promise<string> {
  const id = payload.id || generateSafeId('sunday');
  const path = `sundayLists/${id}`;
  const cleaned = stripEmptyStrings({
    serviceDate: payload.serviceDate,
    title: payload.title,
  });

  try {
    if (payload.id) {
      await updateDoc(doc(db, 'sundayLists', id), {
        ...cleaned,
        orderedTestimonyIds: payload.orderedTestimonyIds,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'sundayLists', id), {
        ...cleaned,
        orderedTestimonyIds: payload.orderedTestimonyIds,
        createdBy: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSundayListRecord(listId: string): Promise<void> {
  const path = `sundayLists/${listId}`;
  try {
    await deleteDoc(doc(db, 'sundayLists', listId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchAdmins(): Promise<AdminUser[]> {
  const path = 'admins';
  try {
    const snap = await getDocs(collection(db, 'admins'));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        email: String(data.email ?? ''),
        role: (data.role as AdminRole) || 'admin',
        displayName: typeof data.displayName === 'string' ? data.displayName : undefined,
        createdAt: toDate(data.createdAt),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function addAdminAccount(payload: {
  uid: string;
  email: string;
  role: AdminRole;
  displayName?: string;
}): Promise<void> {
  const uid = payload.uid.trim();
  const path = `admins/${uid}`;
  const cleaned = stripEmptyStrings({
    uid,
    email: payload.email.toLowerCase(),
    role: payload.role,
    displayName: payload.displayName,
  });
  try {
    await setDoc(doc(db, 'admins', uid), {
      ...cleaned,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function removeAdminAccount(uid: string): Promise<void> {
  const path = `admins/${uid}`;
  try {
    await deleteDoc(doc(db, 'admins', uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
