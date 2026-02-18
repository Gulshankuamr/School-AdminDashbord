import { getAuthToken, API_BASE_URL } from '../api';

const feePaymentService = {

  // ===============================
  // 1️⃣ GET ALL STUDENTS
  // ===============================
  getAllStudents: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalStudentsListBySchoolId`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch students');
    return data;
  },

  // ===============================
  // 2️⃣ GET STUDENT FEES (Fee Breakdown + Installments + Summary)
  //    GET /api/schooladmin/getStudentFees?academic_year=2024-25&student_id=122
  // ===============================
  getStudentFees: async (studentId, academicYear = '2024-25') => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getStudentFees?academic_year=${academicYear}&student_id=${studentId}`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, data: { student_info: null, fee_breakdown: [], summary: {}, payment_history: [] } };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('getStudentFees response:', data);
      return data;
    } catch (error) {
      console.error('getStudentFees error:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // ===============================
  // 3️⃣ COLLECT FEE PAYMENT (Offline/Manual)
  //    POST /api/schooladmin/collectFeePayment
  // ===============================
  collectFeePayment: async (paymentData) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const requestData = {
      student_id: paymentData.student_id,
      installment_ids: paymentData.installment_ids,
      payment_mode: paymentData.payment_mode,
      transaction_ref: paymentData.transaction_ref || null,
      payment_gateway: 'offline',
      remarks: paymentData.remarks || '',
    };

    console.log('collectFeePayment payload:', requestData);

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/collectFeePayment`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      }
    );

    const data = await response.json();
    console.log('collectFeePayment response:', data);

    if (!response.ok || !data || data.success !== true) {
      throw new Error(data?.message || `Payment failed with status: ${response.status}`);
    }

    return data;
  },

  // ===============================
  // 4️⃣ GET ALL CLASSES
  // ===============================
  getAllClasses: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllClasses`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch classes');
    return data;
  },

  // ===============================
  // 5️⃣ GET ALL SECTIONS BY CLASS ID
  // ===============================
  getAllSections: async (classId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch sections');
    return data;
  },
};

export default feePaymentService;