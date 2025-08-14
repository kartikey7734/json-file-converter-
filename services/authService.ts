import { User, Settings, DebugReport } from '../types';

const USER_DB_KEY = 'workflowConverterUsers_v1';
const CURRENT_USER_KEY = 'workflowConverterCurrentUser_v1';
const FREE_CONVERSIONS = 5;
const ADMIN_EMAIL = 'your.email@example.com';
export const DEVELOPER_EMAIL = 'your.email@example.com';


// Helper to get the user database from local storage
const getUserDB = (): { [email: string]: User } => {
  try {
    const db = localStorage.getItem(USER_DB_KEY);
    return db ? JSON.parse(db) : {};
  } catch (e) {
    return {};
  }
};

// Helper to save the user database to local storage
const saveUserDB = (db: { [email: string]: User }): void => {
  localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
};

/**
 * Generates a deterministic, unique 7-letter Pro Code from a user's email.
 * @param email The user's email.
 * @returns A 7-character uppercase string.
 */
export const generateProCodeForEmail = (email: string): string => {
    const sanitizedEmail = email.toLowerCase().split('@')[0];
    const uniqueChars = Array.from(new Set(sanitizedEmail.replace(/[^a-z0-9]/gi, '')));
    
    if (uniqueChars.length === 0) return 'DEFAULT';

    // Simple deterministic seed from email
    const seed = sanitizedEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Simple seeded shuffle (not cryptographically secure, but fine for this purpose)
    for (let i = uniqueChars.length - 1; i > 0; i--) {
        const j = Math.floor((seed + i) * (seed + i+1) % (i + 1));
        [uniqueChars[i], uniqueChars[j]] = [uniqueChars[j], uniqueChars[i]];
    }

    let code = uniqueChars.join('').slice(0, 7).toUpperCase();
    
    // Pad if needed
    while (code.length < 7) {
        code += code;
    }
    
    return code.slice(0, 7);
};

/**
 * Checks if a user exists in the database.
 * @param email The user's email.
 * @returns True if the user exists, false otherwise.
 */
export const doesUserExist = (email: string): boolean => {
    const db = getUserDB();
    return !!db[email];
};


/**
 * Logs a user in. If the user doesn't exist, creates a new one.
 * @param email The user's email address.
 * @returns The user object.
 */
export const login = (email: string, isNewUser: boolean): User => {
  const db = getUserDB();
  let user = db[email];

  if (isNewUser && !user) {
    user = {
      email,
      isPro: false,
      conversionCount: FREE_CONVERSIONS,
    };
    db[email] = user;
    saveUserDB(db);
  }

  localStorage.setItem(CURRENT_USER_KEY, email);
  return user!;
};

/**
 * Logs the current user out.
 */
export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Retrieves the currently logged-in user's data.
 * @returns The user object or null if not logged in.
 */
export const getCurrentUser = (): User | null => {
  const email = localStorage.getItem(CURRENT_USER_KEY);
  if (!email) return null;

  const db = getUserDB();
  return db[email] || null;
};

/**
 * Gets the current conversion count for a user.
 * @param email The user's email.
 */
export const getConversionCount = (email: string): number => {
    const db = getUserDB();
    return db[email]?.conversionCount || 0;
};

/**
 * Decrements the conversion count for a user.
 * @param email The user's email.
 * @returns The updated user object.
 */
export const decrementConversionCount = (email: string): User | null => {
  const db = getUserDB();
  const user = db[email];

  if (user && !user.isPro) {
    user.conversionCount = Math.max(0, user.conversionCount - 1);
    db[email] = user;
    saveUserDB(db);
    return user;
  }
  return getCurrentUser();
};

/**
 * Unlocks the Pro plan for a user if the code is correct.
 * @param email The user's email.
 * @param code The unlock code entered by the user.
 * @returns The updated user object if successful, otherwise null.
 */
export const unlockPro = (email: string, code: string): User | null => {
  const expectedCode = generateProCodeForEmail(email);
  if (code.toUpperCase() !== expectedCode) {
    return null;
  }
  
  const db = getUserDB();
  const user = db[email];
  
  if (user) {
    user.isPro = true;
    db[email] = user;
    saveUserDB(db);
    return user;
  }
  return null;
};

/**
 * For admin use: Gathers all user data and settings for a debug report.
 * @returns A debug report object.
 */
export const getDebugReport = (currentSettings: Settings): DebugReport => {
    const users = getUserDB();
    const report: DebugReport = {
        generatedAt: new Date().toISOString(),
        users: users,
        settings: currentSettings,
        environment: {
            userAgent: navigator.userAgent
        }
    };
    return report;
};