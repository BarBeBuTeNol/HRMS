
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getLogs = async (params) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
      params: params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.warn("Token might be invalid, but ignoring per user request.");
        // We do NOT redirect to login anymore
    }
    throw error;
  }
};

const createLog = async (logData) => {
  try {
    const token = localStorage.getItem('token');
    // If no token, we might still want to try sending it if allowed public, 
    // but usually we need auth. For now, send headers if exists.
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    // Ensure severity has a default if missing, though backend handles it too
    if (!logData.severity) logData.severity = 'Info';

    const response = await axios.post(`${API_URL}/logs`, logData, { headers });
    return response.data;
  } catch (error) {
    // Silent fail for logs or warn? warning is better for dev
    console.warn('Error creating log:', error);
    // We don't throw here to avoid blocking main user flows if logging fails
    return null; 
  }
};

export default {
  getLogs,
  createLog
};
