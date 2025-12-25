// Utility Functions
import { CONFIG } from './config.js';

/**
 * Formats a date string to a readable format
 * @param {string|Date} date - Date to format
 * @returns {string}
 */
export function formatDate(date) {
    const d = new Date(date);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    return d.toLocaleDateString('en-US', options);
}

/**
 * Formats a date to YYYY-MM-DD format
 * @param {Date} date - Date to format
 * @returns {string}
 */
export function formatDateISO(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns {string}
 */
export function getTodayISO() {
    return formatDateISO(new Date());
}

/**
 * Validates if a date is within the program range
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export function validateDate(date) {
    const selectedDate = new Date(date);
    const startDate = new Date(CONFIG.PROGRAM.START_DATE);

    // Date should be on or after start date
    return selectedDate >= startDate;
}

/**
 * Shows a loading indicator
 * @param {HTMLElement} element - Element to show loading in
 */
export function showLoading(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

/**
 * Hides a loading indicator
 * @param {HTMLElement} element - Element to hide loading from
 */
export function hideLoading(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Shows an error message
 * @param {string} message - Error message to display
 * @param {HTMLElement} container - Container element for the error
 */
export function showError(message, container) {
    if (container) {
        container.textContent = message;
        container.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            container.classList.add('hidden');
        }, 5000);
    }
}

/**
 * Hides an error message
 * @param {HTMLElement} container - Container element for the error
 */
export function hideError(container) {
    if (container) {
        container.classList.add('hidden');
        container.textContent = '';
    }
}

/**
 * Shows a success message (toast notification)
 * @param {string} message - Success message to display
 */
export function showSuccess(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
