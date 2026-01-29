import { getAuthToken, API_BASE_URL } from './api';

const feePaymentService = {
  // ===============================
  // 1️⃣ GET ALL STUDENTS
  // ===============================
  getAllStudents: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getTotalStudentsListBySchoolId`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch students');
      }

      return data;
    } catch (error) {
      console.error('Get all students error:', error);
      throw error;
    }
  },

  // ===============================
  // 2️⃣ GET STUDENT FEE DETAILS WITH INSTALLMENTS
  // ===============================
  getStudentFeeDetails: async (studentId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      // Added class_id and section_id as optional parameters
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getStudentFeesForManualPayment?student_id=${studentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // If 404, return empty data
        if (response.status === 404) {
          return {
            success: true,
            data: {
              student_info: null,
              data: [],
              summary: {
                total: 0,
                paid: 0,
                pending: 0,
                fine: 0
              }
            }
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Fee details API response:', responseData);
      
      if (responseData && (responseData.success === true || responseData.data)) {
        return {
          success: true,
          data: responseData
        };
      }
      
      return {
        success: true,
        data: {
          student_info: null,
          data: [],
          summary: {
            total: 0,
            paid: 0,
            pending: 0,
            fine: 0
          }
        }
      };
    } catch (error) {
      console.error('Get student fee details error:', error);
      return {
        success: true,
        data: {
          student_info: null,
          data: [],
          summary: {
            total: 0,
            paid: 0,
            pending: 0,
            fine: 0
          }
        }
      };
    }
  },

  // ===============================
  // 3️⃣ RECORD OFFLINE PAYMENT
  // ===============================
  recordOfflinePayment: async (paymentData) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      console.log('=== PAYMENT REQUEST ===');
      console.log('Sending payment data:', paymentData);

      // Prepare the data according to your API structure
      const requestData = {
        student_id: paymentData.student_id,
        student_fee_installment_id: paymentData.student_fee_installment_id,
        amount: paymentData.amount,
        fine_amount: paymentData.fine_amount || "",
        payment_mode: paymentData.payment_mode,
        remarks: paymentData.remarks || "",
        status: "success", // Always success for manual payment
        transaction_no: paymentData.transaction_no || ""
      };

      const response = await fetch(
        `${API_BASE_URL}/schooladmin/recordOfflinePayment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log('Payment response status:', response.status);
      
      const data = await response.json();
      console.log('Payment API Response:', data);

      // Handle specific error messages
      if (data.message) {
        const message = data.message.toLowerCase();
        
        if (message.includes('already paid')) {
          throw new Error('This installment is already paid. Please select a different installment.');
        }
        
        if (message.includes('does not belong')) {
          throw new Error('Invalid installment ID. This installment does not belong to this student.');
        }
        
        if (message.includes('not found')) {
          throw new Error('Installment not found. Please verify the installment ID.');
        }
        
        if (message.includes('insufficient')) {
          throw new Error('Insufficient payment amount. Please check the required amount.');
        }
      }

      if (!response.ok || !data || data.success !== true) {
        throw new Error(data?.message || `Payment failed with status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  },

  // ===============================
  // 4️⃣ GET ALL CLASSES
  // ===============================
  getAllClasses: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllClasses`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch classes');
      }

      return data;
    } catch (error) {
      console.error('Get all classes error:', error);
      throw error;
    }
  },

  // ===============================
  // 5️⃣ GET ALL SECTIONS BY CLASS ID
  // ===============================
  getAllSections: async (classId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch sections');
      }

      return data;
    } catch (error) {
      console.error('Get all sections error:', error);
      throw error;
    }
  },

  // ===============================
  // 6️⃣ GET STUDENT BY ID
  // ===============================
  getStudentById: async (studentId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getStudentById?student_id=${studentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.success !== true) {
        throw new Error(data?.message || 'Failed to fetch student');
      }

      return data;
    } catch (error) {
      console.error('Get student by ID error:', error);
      throw error;
    }
  }
};

export default feePaymentService;