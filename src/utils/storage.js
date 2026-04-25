export const STORAGE_KEYS = {
  SESSIONS: 'equilibrium_sessions',
  STREAK: 'equilibrium_streak',
  LAST_SESSION_DATE: 'equilibrium_last_session_date',
  XP: 'equilibrium_xp'
};

export const getSessions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading sessions from localStorage', e);
    return [];
  }
};

export const saveSession = (session) => {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  return sessions;
};

export const getStreak = () => {
  const streak = localStorage.getItem(STORAGE_KEYS.STREAK);
  return streak ? parseInt(streak, 10) : 0;
};

export const getLastSessionDate = () => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SESSION_DATE);
};

export const checkAndUpdateStreak = (dateString) => {
  const lastDate = getLastSessionDate();
  let currentStreak = getStreak();

  if (!lastDate) {
    // First session ever
    currentStreak = 1;
  } else {
    // Compare dates
    const current = new Date(dateString);
    const previous = new Date(lastDate);
    
    // Normalize to midnight local time for safe days difference calculation
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diffTime = current.getTime() - previous.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      // Missed a day
      currentStreak = 1;
    } 
    // If diffDays === 0, it's the same day, so streak remains unchanged
  }

  localStorage.setItem(STORAGE_KEYS.STREAK, currentStreak.toString());
  localStorage.setItem(STORAGE_KEYS.LAST_SESSION_DATE, dateString);
  
  return currentStreak;
};

export const getXP = () => {
  const xp = localStorage.getItem(STORAGE_KEYS.XP);
  return xp ? parseInt(xp, 10) : 0;
};

export const addXP = (amount) => {
  const currentXP = getXP();
  const newXP = currentXP + amount;
  localStorage.setItem(STORAGE_KEYS.XP, newXP.toString());
  return newXP;
};

export const getLevel = () => {
  const xp = getXP();
  return Math.floor(xp / 50) + 1;
};
