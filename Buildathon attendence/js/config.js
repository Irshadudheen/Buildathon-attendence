// Configuration for Buildathon Attendance System
// Update these values with your Airtable credentials

export const CONFIG = {
    // Airtable Configuration
    AIRTABLE: {
        API_KEY: 'YOUR_AIRTABLE_API_KEY', // Replace with your Personal Access Token
        BASE_ID: 'YOUR_BASE_ID', // Replace with your Airtable Base ID
        TABLES: {
            PARTICIPANTS: 'Participants', // Name of your participants table
            ATTENDANCE: 'Attendance' // Name of your attendance table
        },
        API_URL: 'https://api.airtable.com/v0'
    },
    
    // Program Configuration
    PROGRAM: {
        START_DATE: '2025-12-26',
        NAME: 'Buildathon 2025'
    },
    
    // Authentication Configuration
    // WARNING: This is a simple hardcoded authentication for demonstration
    // For production, implement proper backend authentication
    AUTH: {
        CREDENTIALS: [
            { username: 'admin', password: 'buildathon2025' },
            { username: 'coordinator', password: 'coordinator123' }
        ],
        SESSION_KEY: 'buildathon_session'
    }
};

// Helper to get Airtable headers
export function getAirtableHeaders() {
    return {
        'Authorization': `Bearer ${CONFIG.AIRTABLE.API_KEY}`,
        'Content-Type': 'application/json'
    };
}

// Helper to get table URL
export function getTableUrl(tableName) {
    return `${CONFIG.AIRTABLE.API_URL}/${CONFIG.AIRTABLE.BASE_ID}/${encodeURIComponent(tableName)}`;
}
