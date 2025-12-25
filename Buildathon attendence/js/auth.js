// Authentication Module
import { CONFIG } from './config.js';

/**
 * Validates user credentials and creates a session
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function login(username, password) {
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check credentials
    const user = CONFIG.AUTH.CREDENTIALS.find(
        cred => cred.username === username && cred.password === password
    );

    if (user) {
        // Create session
        const session = {
            username: user.username,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        localStorage.setItem(CONFIG.AUTH.SESSION_KEY, JSON.stringify(session));

        return {
            success: true
        };
    } else {
        return {
            success: false,
            message: 'Invalid username or password'
        };
    }
}

/**
 * Logs out the current user by clearing the session
 */
export function logout() {
    localStorage.removeItem(CONFIG.AUTH.SESSION_KEY);
    window.location.href = 'index.html';
}

/**
 * Checks if a user is currently authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    const sessionData = localStorage.getItem(CONFIG.AUTH.SESSION_KEY);

    if (!sessionData) {
        return false;
    }

    try {
        const session = JSON.parse(sessionData);
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();

        // Check if session has expired
        if (now > expiresAt) {
            localStorage.removeItem(CONFIG.AUTH.SESSION_KEY);
            return false;
        }

        return true;
    } catch (error) {
        // Invalid session data
        localStorage.removeItem(CONFIG.AUTH.SESSION_KEY);
        return false;
    }
}

/**
 * Requires authentication - redirects to login if not authenticated
 * Call this at the start of protected pages
 */
export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

/**
 * Gets the current session data
 * @returns {object|null}
 */
export function getSession() {
    const sessionData = localStorage.getItem(CONFIG.AUTH.SESSION_KEY);

    if (!sessionData) {
        return null;
    }

    try {
        return JSON.parse(sessionData);
    } catch (error) {
        return null;
    }
}
