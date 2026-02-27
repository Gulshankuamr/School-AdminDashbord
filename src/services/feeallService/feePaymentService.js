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
  // 2️⃣ GET STUDENT FEES
  //    GET /api/schooladmin/getStudentFees?academic_year=2025-26&student_id=194
  //
  //    Response shape:
  //    {
  //      success: true,
  //      data: {
  //        student_info: { student_id, name, admission_no, class_name, section_name, class_id, section_id },
  //        current_academic_year: "2025-26",
  //        fee_breakdown: [
  //          {
  //            student_fee_id, fee_id, fee_head_name, academic_year, class_name,
  //            base_amount, fee_frequency, total_amount, paid_amount,
  //            pending_amount, fine_amount, status, assigned_on,
  //            installments: [
  //              { id, student_fee_id, installment_no, amount, start_due_date,
  //                end_due_date, status, paid_on, created_at,
  //                calculated_status, fine_amount, total_amount }
  //            ]
  //          }
  //        ],
  //        payment_history: [],
  //        summary: {
  //          current_year: { total, paid, pending, fine },
  //          previous_pending, previous_fine,
  //          grand_total_pending, grand_total_fine
  //        }
  //      }
  //    }
  // ===============================
  getStudentFees: async (studentId, academicYear = '2025-26') => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getStudentFees?academic_year=${academicYear}&student_id=${studentId}`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            data: {
              student_info: null,
              current_academic_year: academicYear,
              fee_breakdown: [],
              payment_history: [],
              summary: {
                current_year: { total: 0, paid: 0, pending: 0, fine: 0 },
                previous_pending: 0,
                previous_fine: 0,
                grand_total_pending: 0,
                grand_total_fine: 0,
              },
            },
          };
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
  //    Body: { student_id, installment_ids, payment_mode,
  //            transaction_ref, payment_gateway, remarks }
  // ===============================
  collectFeePayment: async (paymentData) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const requestData = {
      student_id:      paymentData.student_id,
      installment_ids: paymentData.installment_ids,
      payment_mode:    paymentData.payment_mode,
      transaction_ref: paymentData.transaction_ref || null,
      payment_gateway: 'offline',
      remarks:         paymentData.remarks || '',
    };

    console.log('collectFeePayment payload:', requestData);

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/collectFeePayment`,
      {
        method: 'POST',
        headers: {
          'Authorization':  `Bearer ${token}`,
          'Content-Type':   'application/json',
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
  //    GET /api/schooladmin/getAllClasses
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
  //    GET /api/schooladmin/getAllSections?class_id=110
  //
  //    Response shape:
  //    {
  //      success: true,
  //      data: [
  //        { section_id, class_id, section_name, capacity,
  //          current_students, display_name, full }
  //      ]
  //    }
  //    ⚠️  We only use `section_name` from each item.
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

    // Return only section_name list for simplicity
    const sectionNames = (data.data || []).map((s) => s.section_name).filter(Boolean);
    return { ...data, sectionNames };
  },
};

export default feePaymentService;