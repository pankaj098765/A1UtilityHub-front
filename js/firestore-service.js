// Firestore Data Service
import { db, isFirebaseConfigured } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js';

// Collection names
const COLLECTIONS = {
  USER_INTERACTIONS: 'user_interactions',
  GENERATED_CONTENT: 'generated_content',
  ANALYTICS: 'analytics',
  USER_PREFERENCES: 'user_preferences'
};

// Fallback storage for when Firebase is not configured
let fallbackStorage = {
  interactions: [],
  content: [],
  analytics: [],
  preferences: {}
};

// User interaction tracking
export async function trackUserInteraction(toolName, inputData, outputData, userAgent = null) {
  if (!isFirebaseConfigured()) {
    // Store in fallback storage
    fallbackStorage.interactions.push({
      toolName,
      inputData,
      outputData,
      timestamp: new Date(),
      userAgent: userAgent || navigator.userAgent,
      sessionId: getSessionId()
    });
    console.log('Interaction tracked (fallback mode)');
    return `fallback_${Date.now()}`;
  }

  try {
    const interaction = {
      toolName,
      inputData,
      outputData,
      timestamp: serverTimestamp(),
      userAgent: userAgent || navigator.userAgent,
      sessionId: getSessionId(),
      ip: await getUserIP() // Optional - for analytics
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.USER_INTERACTIONS), interaction);
    console.log('Interaction tracked with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    throw error;
  }
}

// Store generated content
export async function storeGeneratedContent(toolName, content, metadata = {}) {
  if (!isFirebaseConfigured()) {
    // Store in fallback storage
    fallbackStorage.content.push({
      toolName,
      content,
      metadata,
      timestamp: new Date(),
      sessionId: getSessionId()
    });
    console.log('Content stored (fallback mode)');
    return `fallback_${Date.now()}`;
  }

  try {
    const contentDoc = {
      toolName,
      content,
      metadata,
      timestamp: serverTimestamp(),
      sessionId: getSessionId()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.GENERATED_CONTENT), contentDoc);
    console.log('Content stored with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error storing generated content:', error);
    throw error;
  }
}

// Track analytics data
export async function trackAnalytics(eventName, eventData = {}) {
  if (!isFirebaseConfigured()) {
    // Store in fallback storage
    fallbackStorage.analytics.push({
      eventName,
      eventData,
      timestamp: new Date(),
      sessionId: getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    console.log('Analytics tracked (fallback mode)');
    return `fallback_${Date.now()}`;
  }

  try {
    const analyticsDoc = {
      eventName,
      eventData,
      timestamp: serverTimestamp(),
      sessionId: getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.ANALYTICS), analyticsDoc);
    console.log('Analytics tracked with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error tracking analytics:', error);
    throw error;
  }
}

// Get user preferences
export async function getUserPreferences(userId) {
  if (!isFirebaseConfigured()) {
    return fallbackStorage.preferences[userId] || null;
  }

  try {
    const docRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw error;
  }
}

// Save user preferences
export async function saveUserPreferences(userId, preferences) {
  if (!isFirebaseConfigured()) {
    fallbackStorage.preferences[userId] = {
      ...preferences,
      updatedAt: new Date()
    };
    console.log('User preferences saved (fallback mode)');
    return;
  }

  try {
    const docRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
    await updateDoc(docRef, {
      ...preferences,
      updatedAt: serverTimestamp()
    });
    console.log('User preferences saved');
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
}

// Get analytics data (for admin/analytics dashboard)
export async function getAnalyticsData(toolName = null, limitCount = 100) {
  if (!isFirebaseConfigured()) {
    let data = fallbackStorage.analytics;
    if (toolName) {
      data = data.filter(item => item.eventData.toolName === toolName);
    }
    return data.slice(0, limitCount);
  }

  try {
    let q = collection(db, COLLECTIONS.ANALYTICS);
    
    if (toolName) {
      q = query(q, where('eventData.toolName', '==', toolName));
    }
    
    q = query(q, orderBy('timestamp', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const analytics = [];
    
    querySnapshot.forEach((doc) => {
      analytics.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return analytics;
  } catch (error) {
    console.error('Error getting analytics data:', error);
    throw error;
  }
}

// Get popular content
export async function getPopularContent(toolName = null, limitCount = 10) {
  if (!isFirebaseConfigured()) {
    let data = fallbackStorage.content;
    if (toolName) {
      data = data.filter(item => item.toolName === toolName);
    }
    return data.slice(0, limitCount);
  }

  try {
    let q = collection(db, COLLECTIONS.GENERATED_CONTENT);
    
    if (toolName) {
      q = query(q, where('toolName', '==', toolName));
    }
    
    q = query(q, orderBy('timestamp', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const content = [];
    
    querySnapshot.forEach((doc) => {
      content.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return content;
  } catch (error) {
    console.error('Error getting popular content:', error);
    throw error;
  }
}

// Utility functions
function getSessionId() {
  let sessionId = sessionStorage.getItem('a1utility_session_id');
  if (!sessionId) {
    sessionId = generateUniqueId();
    sessionStorage.setItem('a1utility_session_id', sessionId);
  }
  return sessionId;
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not fetch user IP:', error);
    return null;
  }
}

// Error handling wrapper
export function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Firestore operation failed:', error);
      // Continue execution even if Firestore fails
      return null;
    }
  };
}