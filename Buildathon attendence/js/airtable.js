// Airtable Integration Module
import { getAirtableHeaders, getTableUrl, CONFIG } from './config.js';

/**
 * Fetches all participants from Airtable
 * @returns {Promise<Array>} Array of participant records
 */
export async function fetchParticipants() {
    try {
        const url = getTableUrl(CONFIG.AIRTABLE.TABLES.PARTICIPANTS);
        const response = await fetch(url, {
            method: 'GET',
            headers: getAirtableHeaders()
        });

        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.records || [];
    } catch (error) {
        console.error('Error fetching participants:', error);
        throw new Error('Failed to fetch participants. Please check your Airtable configuration.');
    }
}

/**
 * Fetches attendance records for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of attendance records for the date
 */
export async function fetchAttendanceByDate(date) {
    try {
        // Use Airtable's filterByFormula to get records for specific date
        const formula = `{Date} = '${date}'`;
        const url = `${getTableUrl(CONFIG.AIRTABLE.TABLES.ATTENDANCE)}?filterByFormula=${encodeURIComponent(formula)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getAirtableHeaders()
        });

        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.records || [];
    } catch (error) {
        console.error('Error fetching attendance:', error);
        throw new Error('Failed to fetch attendance records.');
    }
}

/**
 * Saves or updates attendance records for multiple participants
 * @param {Array} attendanceData - Array of attendance objects {participantId, participantName, date, status}
 * @returns {Promise<object>} Result of the operation
 */
export async function saveAttendance(attendanceData) {
    try {
        // First, fetch existing attendance for this date
        const date = attendanceData[0]?.date;
        if (!date) {
            throw new Error('Date is required for attendance');
        }

        const existingRecords = await fetchAttendanceByDate(date);

        // Create a map of existing records by participant ID
        const existingMap = new Map();
        existingRecords.forEach(record => {
            const participantId = record.fields['Participant ID'] || record.fields['ParticipantID'];
            if (participantId) {
                existingMap.set(participantId, record);
            }
        });

        // Separate into updates and creates
        const recordsToUpdate = [];
        const recordsToCreate = [];

        attendanceData.forEach(item => {
            const existingRecord = existingMap.get(item.participantId);

            if (existingRecord) {
                // Update existing record
                recordsToUpdate.push({
                    id: existingRecord.id,
                    fields: {
                        'Status': item.status,
                        'Timestamp': new Date().toISOString()
                    }
                });
            } else {
                // Create new record
                recordsToCreate.push({
                    fields: {
                        'Participant ID': item.participantId,
                        'Participant Name': item.participantName,
                        'Date': item.date,
                        'Status': item.status,
                        'Timestamp': new Date().toISOString()
                    }
                });
            }
        });

        // Execute updates and creates
        const promises = [];

        // Update records (batch of 10)
        if (recordsToUpdate.length > 0) {
            for (let i = 0; i < recordsToUpdate.length; i += 10) {
                const batch = recordsToUpdate.slice(i, i + 10);
                promises.push(updateRecordsBatch(batch));
            }
        }

        // Create records (batch of 10)
        if (recordsToCreate.length > 0) {
            for (let i = 0; i < recordsToCreate.length; i += 10) {
                const batch = recordsToCreate.slice(i, i + 10);
                promises.push(createRecordsBatch(batch));
            }
        }

        await Promise.all(promises);

        return {
            success: true,
            updated: recordsToUpdate.length,
            created: recordsToCreate.length
        };
    } catch (error) {
        console.error('Error saving attendance:', error);
        throw new Error('Failed to save attendance. Please try again.');
    }
}

/**
 * Updates a batch of records in Airtable
 * @param {Array} records - Array of records to update
 * @returns {Promise}
 */
async function updateRecordsBatch(records) {
    const url = getTableUrl(CONFIG.AIRTABLE.TABLES.ATTENDANCE);
    const response = await fetch(url, {
        method: 'PATCH',
        headers: getAirtableHeaders(),
        body: JSON.stringify({ records })
    });

    if (!response.ok) {
        throw new Error(`Failed to update records: ${response.status}`);
    }

    return response.json();
}

/**
 * Creates a batch of records in Airtable
 * @param {Array} records - Array of records to create
 * @returns {Promise}
 */
async function createRecordsBatch(records) {
    const url = getTableUrl(CONFIG.AIRTABLE.TABLES.ATTENDANCE);
    const response = await fetch(url, {
        method: 'POST',
        headers: getAirtableHeaders(),
        body: JSON.stringify({ records })
    });

    if (!response.ok) {
        throw new Error(`Failed to create records: ${response.status}`);
    }

    return response.json();
}

/**
 * Deletes an attendance record
 * @param {string} recordId - Airtable record ID to delete
 * @returns {Promise}
 */
export async function deleteAttendanceRecord(recordId) {
    try {
        const url = `${getTableUrl(CONFIG.AIRTABLE.TABLES.ATTENDANCE)}/${recordId}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getAirtableHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to delete record: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error deleting attendance record:', error);
        throw error;
    }
}
