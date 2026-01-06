import axios from 'axios';

const API_URL = 'https://www.wynstarcreations.com/seyal/api/';

function toISODate(ddmmyyyy) {
  // Convert '06-01-2026' to '2026-01-06'
  if (!ddmmyyyy || typeof ddmmyyyy !== 'string') return '';
  const [dd, mm, yyyy] = ddmmyyyy.split('-');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

export const fetchCalendarEvents = async () => {
  // Adjust endpoint and mapping as needed
  const response = await axios.get(`${API_URL}plans`);
  // Map backend data to calendar event format
  return Array.isArray(response.data)
    ? response.data.filter(row => row && row[3] && row[4]) // row[3]=date, row[3]=machine
        .map((row, idx) => ({
          id: `${row[0]}-${idx}`, // Ensure unique id by appending index
          title: `${row[4] || ''} - (${row[0] || ''}) ${row[5] || ''} - ${row[10] || ''}`, // Machine (row[3]), Customer (row[5])
          start: toISODate(row[3]), // Convert to ISO format
          extendedProps: { row }
        }))
    : [];
};
