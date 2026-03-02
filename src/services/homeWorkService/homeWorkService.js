import { API_BASE_URL, getAuthToken } from '../api'

export const homeWorkService = {

  // ── 1. GET ALL CLASSES ─────────────────────────────────────────────────────
  getAllClasses: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res = await fetch(`${API_BASE_URL}/schooladmin/getAllClassList`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch classes')
    return data
  },

  // ── 2. GET SECTIONS BY CLASS ────────────────────────────────────────────────
  getAllSections: async (classId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res = await fetch(`${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch sections')
    return data
  },

  // ── 3. GET ALL SUBJECTS ─────────────────────────────────────────────────────
  getAllSubjects: async () => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res = await fetch(`${API_BASE_URL}/schooladmin/getAllSubjects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch subjects')
    return data
  },

  // ── 4. GET ALL HOMEWORKS (list page) ────────────────────────────────────────
  getAllHomeworks: async (filters = {}) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const params = new URLSearchParams()
    if (filters.class_id)   params.append('class_id',   filters.class_id)
    if (filters.subject_id) params.append('subject_id', filters.subject_id)
    if (filters.status)     params.append('status',     filters.status)
    const url = `${API_BASE_URL}/schooladmin/getHomeworks${params.toString() ? '?' + params.toString() : ''}`
    const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch homeworks')
    return data
  },

  // ── 5. GET SINGLE HOMEWORK + SUBMISSIONS ────────────────────────────────────
  getHomeworkById: async (homeworkId) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res = await fetch(
      `${API_BASE_URL}/schooladmin/getTeacherHomeworkByTeacherId?homework_id=${homeworkId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch homework details')
    return data
  },

  // ── 6. CREATE HOMEWORK ──────────────────────────────────────────────────────
  createHomework: async (formData) => {
    const token = getAuthToken()
    if (!token) throw new Error('Token missing')
    const res = await fetch(`${API_BASE_URL}/schooladmin/createTeacherHomework`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    formData,
    })
    const rawText = await res.text()
    let data
    try { data = JSON.parse(rawText) } catch {
      throw new Error(`Server error (${res.status})`)
    }
    if (!res.ok || data?.success === false) {
      throw new Error(data?.message || data?.error || `Request failed (${res.status})`)
    }
    return data // data.data.homework_id is the created ID
  },
}