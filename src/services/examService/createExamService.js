import { API_BASE_URL, getAuthToken } from '../api';

export const createExam = async (payload) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/createExam`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllExams = async () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getExams`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateExam = async (payload) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    console.log('📤 Sending update payload:', payload);

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateExam`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    console.log('📥 Update response:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Update error:', error);
    throw error;
  }
};

export const deleteExam = async (examId) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    console.log('📤 Sending delete request for exam ID:', examId);

    // ✅ BACK TO ORIGINAL URL - with body
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteExam`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exam_id: examId }),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    // ✅ FIX: Check if response is JSON or HTML
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // It's JSON - parse it
      const data = await response.json();
      console.log('📥 Delete response (JSON):', data);
      return data;
    } else {
      // It's HTML or something else - assume success if status is OK
      console.log('📥 Delete response (non-JSON):', await response.text());
      
      // If status is 200 OK, assume success
      if (response.ok) {
        return { success: true, message: 'Exam deleted successfully' };
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  }
};