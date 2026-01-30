import { API_BASE_URL, getAuthToken } from '../api.js'

export const accountantService = {

  // ===============================
  // 1️⃣ GET ALL ACCOUNTANTS
  // ===============================
  getAllAccountants: async (page = 1) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalAccountantsListBySchoolId?page=${page}&limit=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error('Could not fetch accountants')

    return data
  },

  // ===============================
  // 2️⃣ GET ACCOUNTANT BY ID
  // ===============================
  getAccountById: async (accountantId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAccountantById/${accountantId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    console.log('ACCOUNTANT API RESPONSE:', data)

    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Failed to load accountant data')
    }

    return data.data
  },

  // ===============================
  // 3️⃣ ADD ACCOUNTANT - FIXED
  // ===============================
  // addAccountant: async (accountantData) => {
  //   const token = getAuthToken()
  //   if (!token) throw new Error('Token missing')

  //   const formData = new FormData()
    
  //   // REQUIRED FIELDS
  //   formData.append('name', accountantData.name)
  //   formData.append('user_email', accountantData.user_email)
  //   formData.append('password', accountantData.password)
  //   formData.append('qualification', accountantData.qualification)
    
  //   // OPTIONAL FILES
  //   if (accountantData.accountant_photo instanceof File) {
  //     formData.append('accountant_photo', accountantData.accountant_photo)
  //   }
    
  //   if (accountantData.aadhar_card instanceof File) {
  //     formData.append('aadhar_card', accountantData.aadhar_card)
  //   }

  //   console.log('📤 ADD ACCOUNTANT PAYLOAD:', {
  //     name: accountantData.name,
  //     user_email: accountantData.user_email,
  //     qualification: accountantData.qualification,
  //     has_photo: accountantData.accountant_photo instanceof File,
  //     has_aadhar: accountantData.aadhar_card instanceof File,
  //   })

  //   const response = await fetch(
  //     `${API_BASE_URL}/schooladmin/createAccountant`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         // ❌ DON'T set Content-Type - browser sets it automatically
  //       },
  //       body: formData,
  //     }
  //   )

  //   const data = await response.json()
  //   console.log('✅ ADD RESPONSE:', data)
    
  //   if (!response.ok || data.success !== true) {
  //     throw new Error(data.message || 'Accountant not added')
  //   }

  //   return data
  // },


    addAccountant: async (accountantData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')

    const formData = new FormData()

    // EXACT SAME FIELDS AS POSTMAN
    formData.append('name', accountantData.name)
    formData.append('user_email', accountantData.user_email)
    formData.append('password', accountantData.password)
    formData.append('qualification', accountantData.qualification)

    if (accountantData.accountant_photo) {
      formData.append('accountant_photo', accountantData.accountant_photo)
    }

    if (accountantData.aadhar_card) {
      formData.append('aadhar_card', accountantData.aadhar_card)
    }

    console.log('📤 REGISTER ACCOUNTANT PAYLOAD')
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1])
    }

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/registerAccountant`, // ✅ CORRECT API
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ Content-Type mat lagana (FormData)
        },
        body: formData,
      }
    )

    const data = await response.json()
    console.log('✅ API RESPONSE:', data)

    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Accountant not added')
    }

    return data
  },

  // ===============================
  // 4️⃣ UPDATE ACCOUNTANT - FIXED TO SEND ALL FIELDS
  // ===============================
  
  updateAccountant: async (accountantId, formData) => {
  const token = getAuthToken()
  if (!token) throw new Error('Token missing')

  console.log('📤 FINAL UPDATE PAYLOAD:', [...formData.entries()])

  const response = await fetch(
    `${API_BASE_URL}/schooladmin/updateAccountant`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // 👈 DIRECT SEND
    }
  )

  const data = await response.json()

  if (!response.ok || data.success !== true) {
    throw new Error(data.message || 'Accountant not updated')
  }

  return data
},


 
  // ===============================
// 5️⃣ DELETE ACCOUNTANT
// ===============================
deleteAccountant: async (accountantId) => {
  const token = getAuthToken()
  if (!token) throw new Error('Token missing')

  const response = await fetch(
    `${API_BASE_URL}/schooladmin/deleteAccountantById`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountant_id: accountantId }),
    }
  )

  const data = await response.json()

  if (!response.ok || data.success !== true) {
    throw new Error(data.message || 'Accountant not deleted')
  }

  return data
},

}