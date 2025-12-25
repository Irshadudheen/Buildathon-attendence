// Dashboard Module
import { requireAuth, logout } from './auth.js';
import { fetchParticipants, fetchAttendanceByDate, saveAttendance } from './airtable.js';
import { formatDate, getTodayISO, validateDate, showLoading, hideLoading, showError, hideError, showSuccess } from './utils.js';

// State management
let participants = [];
let attendanceMap = new Map(); // Map of participantId -> status
let currentDate = getTodayISO();

// DOM elements
let dateInput;
let participantsList;
let loadingIndicator;
let errorContainer;
let submitBtn;
let totalCountEl;
let presentCountEl;
let absentCountEl;

/**
 * Initialize the dashboard
 */
async function init() {
    // Check authentication
    requireAuth();

    // Get DOM elements
    dateInput = document.getElementById('attendanceDate');
    participantsList = document.getElementById('participantsList');
    loadingIndicator = document.getElementById('loadingIndicator');
    errorContainer = document.getElementById('errorContainer');
    submitBtn = document.getElementById('submitAttendance');
    totalCountEl = document.getElementById('totalCount');
    presentCountEl = document.getElementById('presentCount');
    absentCountEl = document.getElementById('absentCount');

    // Set up event listeners
    setupEventListeners();

    // Set today's date as default
    dateInput.value = currentDate;
    dateInput.setAttribute('min', '2025-12-26');

    // Load initial data
    await loadParticipants();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Date change
    dateInput.addEventListener('change', handleDateChange);

    // Submit attendance
    submitBtn.addEventListener('click', handleSubmitAttendance);

    // Bulk actions
    document.getElementById('markAllPresent').addEventListener('click', () => markAll('Present'));
    document.getElementById('markAllAbsent').addEventListener('click', () => markAll('Absent'));
}

/**
 * Load participants from Airtable
 */
async function loadParticipants() {
    try {
        showLoading(loadingIndicator);
        hideError(errorContainer);

        participants = await fetchParticipants();

        if (participants.length === 0) {
            showError('No participants found. Please add participants to your Airtable.', errorContainer);
            return;
        }

        // Load existing attendance for current date
        await loadAttendanceForDate(currentDate);

        // Render participants
        renderParticipants();

        // Update stats
        updateStats();

        // Enable submit button
        submitBtn.disabled = false;

    } catch (error) {
        console.error('Error loading participants:', error);
        showError(error.message, errorContainer);
    } finally {
        hideLoading(loadingIndicator);
    }
}

/**
 * Load attendance records for a specific date
 */
async function loadAttendanceForDate(date) {
    try {
        const attendanceRecords = await fetchAttendanceByDate(date);

        // Clear existing attendance map
        attendanceMap.clear();

        // Populate attendance map
        attendanceRecords.forEach(record => {
            const participantId = record.fields['Participant ID'] || record.fields['ParticipantID'];
            const status = record.fields['Status'];

            if (participantId && status) {
                attendanceMap.set(participantId, status);
            }
        });
    } catch (error) {
        console.error('Error loading attendance:', error);
        // Don't show error to user, just log it
        // This allows marking attendance even if no previous records exist
    }
}

/**
 * Render participants list
 */
function renderParticipants() {
    participantsList.innerHTML = '';

    participants.forEach(participant => {
        const fields = participant.fields;
        const participantId = participant.id;
        const name = fields.Name || fields.name || 'Unknown';
        const email = fields.Email || fields.email || '';
        const phone = fields.Phone || fields.phone || '';

        // Get current attendance status
        const currentStatus = attendanceMap.get(participantId) || null;

        // Create participant item
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.dataset.participantId = participantId;

        item.innerHTML = `
            <div class="participant-info">
                <div class="participant-name">${name}</div>
                <div class="participant-details">
                    ${email ? `📧 ${email}` : ''} 
                    ${phone ? `📱 ${phone}` : ''}
                </div>
            </div>
            <div class="attendance-toggle">
                <button 
                    class="toggle-btn ${currentStatus === 'Present' ? 'active-present' : ''}" 
                    data-status="Present"
                    data-participant-id="${participantId}"
                >
                    Present
                </button>
                <button 
                    class="toggle-btn ${currentStatus === 'Absent' ? 'active-absent' : ''}" 
                    data-status="Absent"
                    data-participant-id="${participantId}"
                >
                    Absent
                </button>
            </div>
        `;

        // Add event listeners to toggle buttons
        const toggleButtons = item.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', handleToggleAttendance);
        });

        participantsList.appendChild(item);
    });

    // Update total count
    totalCountEl.textContent = participants.length;
}

/**
 * Handle attendance toggle
 */
function handleToggleAttendance(e) {
    const btn = e.currentTarget;
    const participantId = btn.dataset.participantId;
    const status = btn.dataset.status;

    // Get the participant item
    const item = btn.closest('.participant-item');
    const toggleButtons = item.querySelectorAll('.toggle-btn');

    // Check if already selected
    if (btn.classList.contains(`active-${status.toLowerCase()}`)) {
        // Deselect
        btn.classList.remove(`active-${status.toLowerCase()}`);
        attendanceMap.delete(participantId);
    } else {
        // Remove active class from all buttons in this item
        toggleButtons.forEach(b => {
            b.classList.remove('active-present', 'active-absent');
        });

        // Add active class to clicked button
        btn.classList.add(`active-${status.toLowerCase()}`);

        // Update attendance map
        attendanceMap.set(participantId, status);
    }

    // Update stats
    updateStats();
}

/**
 * Mark all participants with a status
 */
function markAll(status) {
    participants.forEach(participant => {
        attendanceMap.set(participant.id, status);
    });

    // Re-render to update UI
    renderParticipants();
    updateStats();
}

/**
 * Update statistics
 */
function updateStats() {
    let presentCount = 0;
    let absentCount = 0;

    attendanceMap.forEach(status => {
        if (status === 'Present') {
            presentCount++;
        } else if (status === 'Absent') {
            absentCount++;
        }
    });

    presentCountEl.textContent = presentCount;
    absentCountEl.textContent = absentCount;
}

/**
 * Handle date change
 */
async function handleDateChange(e) {
    const newDate = e.target.value;

    if (!validateDate(newDate)) {
        showError('Please select a date on or after December 26, 2025', errorContainer);
        dateInput.value = currentDate;
        return;
    }

    currentDate = newDate;

    // Load attendance for new date
    showLoading(loadingIndicator);
    hideError(errorContainer);

    try {
        await loadAttendanceForDate(currentDate);
        renderParticipants();
        updateStats();
    } catch (error) {
        console.error('Error loading attendance for date:', error);
        showError(error.message, errorContainer);
    } finally {
        hideLoading(loadingIndicator);
    }
}

/**
 * Handle submit attendance
 */
async function handleSubmitAttendance() {
    if (attendanceMap.size === 0) {
        showError('Please mark attendance for at least one participant', errorContainer);
        return;
    }

    // Prepare attendance data
    const attendanceData = [];
    attendanceMap.forEach((status, participantId) => {
        const participant = participants.find(p => p.id === participantId);
        if (participant) {
            attendanceData.push({
                participantId: participantId,
                participantName: participant.fields.Name || participant.fields.name || 'Unknown',
                date: currentDate,
                status: status
            });
        }
    });

    // Show loading state
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    hideError(errorContainer);

    try {
        const result = await saveAttendance(attendanceData);

        // Store submission data for confirmation page
        const presentCount = attendanceData.filter(a => a.status === 'Present').length;
        const absentCount = attendanceData.filter(a => a.status === 'Absent').length;

        sessionStorage.setItem('lastSubmission', JSON.stringify({
            date: currentDate,
            total: attendanceData.length,
            present: presentCount,
            absent: absentCount
        }));

        // Redirect to confirmation page
        window.location.href = 'confirmation.html';

    } catch (error) {
        console.error('Error submitting attendance:', error);
        showError(error.message, errorContainer);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
