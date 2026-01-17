import api from './api';

const getLogs = async (params) => {
  try {
    const response = await api.get('/logs', {
      params: params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    // Token handling is now done in api.ts interceptors
    throw error;
  }
};

const createLog = async (logData) => {
  try {
    // Ensure severity has a default if missing
    if (!logData.severity) logData.severity = 'Info';

    const response = await api.post('/logs', logData);
    return response.data;
  } catch (error) {
    console.warn('Error creating log:', error);
    return null; 
  }
};

export default {
  getLogs,
  createLog
};
