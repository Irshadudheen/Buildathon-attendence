# Buildathon Attendance Website

A secure, lightweight attendance tracking system for the Buildathon program with Airtable integration.

## 📋 Features

- ✅ Secure login system with session management
- ✅ Daily attendance marking for participants
- ✅ Date-wise attendance tracking (Dec 26, 2025 onwards)
- ✅ Airtable integration for data storage
- ✅ Responsive design for all devices
- ✅ Bulk actions (Mark All Present/Absent)
- ✅ Real-time statistics

## 🚀 Quick Start

### Prerequisites

1. An Airtable account with a base set up
2. A modern web browser
3. Basic understanding of Airtable API

### Airtable Setup

#### 1. Create Your Airtable Base

Create two tables in your Airtable base:

**Participants Table:**
- `Name` (Single line text) - Required
- `Email` (Email)
- `Phone` (Phone number)
- Any other fields you need

**Attendance Table:**
- `Participant ID` (Single line text) - Required
- `Participant Name` (Single line text)
- `Date` (Date) - Required
- `Status` (Single select: Present, Absent) - Required
- `Timestamp` (Date with time)

#### 2. Get Your API Credentials

1. Go to [Airtable Account](https://airtable.com/account)
2. Generate a Personal Access Token with the following scopes:
   - `data.records:read`
   - `data.records:write`
3. Copy your Base ID from the URL: `https://airtable.com/YOUR_BASE_ID/...`

### Installation

1. **Clone or download this project** to your computer

2. **Configure Airtable credentials:**
   - Open `js/config.js`
   - Replace `YOUR_AIRTABLE_API_KEY` with your Personal Access Token
   - Replace `YOUR_BASE_ID` with your Airtable Base ID
   - Update table names if different from defaults

```javascript
AIRTABLE: {
    API_KEY: 'patXXXXXXXXXXXXXX', // Your token
    BASE_ID: 'appXXXXXXXXXXXXXX', // Your base ID
    TABLES: {
        PARTICIPANTS: 'Participants',
        ATTENDANCE: 'Attendance'
    }
}
```

3. **Update login credentials (optional):**
   - In `js/config.js`, modify the `AUTH.CREDENTIALS` array
   - Default credentials:
     - Username: `admin`, Password: `buildathon2025`
     - Username: `coordinator`, Password: `coordinator123`

4. **Open the application:**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     ```

## 📖 Usage

### Login
1. Open `index.html` in your browser
2. Enter your credentials (default: admin / buildathon2025)
3. Click "Login"

### Mark Attendance
1. Select the date from the date picker
2. Mark each participant as Present or Absent
3. Use "Mark All Present" or "Mark All Absent" for bulk actions
4. Click "Submit Attendance"
5. View confirmation page with summary

### View/Edit Previous Attendance
1. Select a previous date from the date picker
2. The system will load existing attendance
3. Make changes as needed
4. Submit to update records

## 🔧 Configuration

### Extending Program Dates

The system automatically supports any future date. No code changes needed!

The minimum date is set to December 26, 2025 in:
- `dashboard.html` (line with `min="2025-12-26"`)
- `js/config.js` (PROGRAM.START_DATE)

To change the start date, update both locations.

### Adding More Users

Edit `js/config.js`:

```javascript
AUTH: {
    CREDENTIALS: [
        { username: 'admin', password: 'buildathon2025' },
        { username: 'coordinator', password: 'coordinator123' },
        { username: 'newuser', password: 'newpassword' } // Add here
    ]
}
```

### Customizing Participant Fields

The system displays Name, Email, and Phone by default. To add more fields:

1. Add fields to your Airtable Participants table
2. Update `js/dashboard.js` in the `renderParticipants()` function
3. Access fields using `fields.YourFieldName`

## 🛡️ Security Notes

⚠️ **Important:** This implementation uses client-side authentication with hardcoded credentials. This is suitable for:
- Internal use within trusted networks
- Short-term events like Buildathons
- Scenarios where Airtable is the primary security layer

**For production use**, consider:
- Implementing proper backend authentication
- Using environment variables for API keys
- Adding JWT tokens or OAuth
- Implementing rate limiting

## 🎨 Customization

### Changing Colors

Edit `styles.css` and modify the CSS variables:

```css
:root {
    --primary-color: #6366f1; /* Change this */
    --primary-hover: #4f46e5;
    /* ... other colors */
}
```

### Modifying Layout

All pages use a card-based layout. Modify the respective HTML files:
- `index.html` - Login page
- `dashboard.html` - Main attendance page
- `confirmation.html` - Success page

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### "Failed to fetch participants"
- Check your Airtable API key and Base ID
- Verify your Personal Access Token has correct scopes
- Ensure table names match exactly (case-sensitive)

### "Invalid credentials"
- Check username and password in `js/config.js`
- Clear browser cache and try again

### Attendance not saving
- Check browser console for errors
- Verify Attendance table structure matches requirements
- Ensure API token has write permissions

### CORS errors
- Airtable API supports CORS, but if you see errors:
- Use a local server instead of opening HTML directly
- Check that your API key is valid

## 📄 File Structure

```
Buildathon attendence/
├── index.html              # Login page
├── dashboard.html          # Attendance dashboard
├── confirmation.html       # Success confirmation
├── styles.css             # All styling
├── js/
│   ├── config.js          # Configuration & credentials
│   ├── auth.js            # Authentication logic
│   ├── airtable.js        # Airtable API integration
│   ├── dashboard.js       # Dashboard functionality
│   └── utils.js           # Utility functions
└── README.md              # This file
```

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Airtable API documentation
3. Check browser console for error messages

## 📝 License

This project is provided as-is for the Buildathon program.

---

**Built for Buildathon 2025** 🚀
