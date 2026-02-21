// src/pages/admin/RolePermissions.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ArrowLeft, Save, Loader2,
  CheckSquare, Square, Users, BookOpen, Wallet,
  GraduationCap, DollarSign, ClipboardCheck, FileText,
  BarChart3, Settings, AlertCircle, CheckCircle2, Lock,
  Layers, Calendar,
} from 'lucide-react'
import { rolePermissionService } from '../../services/rolePermissionService'

// ── Roles ─────────────────────────────────────────────────────
const ROLES = [
  { id: 'teacher',    label: 'Teacher',    icon: BookOpen      },
  { id: 'student',    label: 'Student',    icon: GraduationCap },
  { id: 'accountant', label: 'Accountant', icon: Wallet        },
]

const SECTION_META = {
  students:    { icon: Users,          color: 'blue'    },
  teachers:    { icon: BookOpen,       color: 'indigo'  },
  accountant:  { icon: Wallet,         color: 'violet'  },
  accountants: { icon: Wallet,         color: 'violet'  },
  fees:        { icon: DollarSign,     color: 'emerald' },
  attendance:  { icon: ClipboardCheck, color: 'orange'  },
  exams:       { icon: FileText,       color: 'pink'    },
  reports:     { icon: BarChart3,      color: 'cyan'    },
  settings:    { icon: Settings,       color: 'gray'    },
  classes:     { icon: Calendar,       color: 'yellow'  },
  sections:    { icon: Layers,         color: 'teal'    },
  timetable:   { icon: Calendar,       color: 'teal'    },
  subjects:    { icon: BookOpen,       color: 'purple'  },
  homework:    { icon: FileText,       color: 'pink'    },
  notices:     { icon: BookOpen,       color: 'blue'    },
}

const COLORS = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    badge: 'bg-blue-100 text-blue-700',     border: 'border-blue-200'    },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200'  },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  badge: 'bg-violet-100 text-violet-700', border: 'border-violet-200'  },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700',border:'border-emerald-200' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  badge: 'bg-orange-100 text-orange-700', border: 'border-orange-200'  },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    badge: 'bg-pink-100 text-pink-700',     border: 'border-pink-200'    },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    badge: 'bg-cyan-100 text-cyan-700',     border: 'border-cyan-200'    },
  gray:    { bg: 'bg-gray-50',    text: 'text-gray-600',    badge: 'bg-gray-100 text-gray-700',     border: 'border-gray-200'    },
  yellow:  { bg: 'bg-yellow-50',  text: 'text-yellow-600',  badge: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200'  },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-600',    badge: 'bg-teal-100 text-teal-700',     border: 'border-teal-200'    },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200'  },
}

const ROLE_GRADIENT = {
  teacher:    'from-blue-500 to-blue-600',
  student:    'from-emerald-500 to-emerald-600',
  accountant: 'from-violet-500 to-violet-600',
}
const ROLE_ACTIVE = {
  teacher:    'bg-blue-600 text-white ring-2 ring-blue-200 shadow-blue-200',
  student:    'bg-emerald-600 text-white ring-2 ring-emerald-200 shadow-emerald-200',
  accountant: 'bg-violet-600 text-white ring-2 ring-violet-200 shadow-violet-200',
}

// ── Component ─────────────────────────────────────────────────
const RolePermissions = () => {
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState('teacher')
  const [allGrouped, setAllGrouped]     = useState({})
  const [checkedIds, setCheckedIds]     = useState(new Set())
  const [loadingAll, setLoadingAll]     = useState(true)
  const [loadingRole, setLoadingRole]   = useState(false)
  const [saving, setSaving]             = useState(false)
  const [toast, setToast]               = useState(null)
  const [error, setError]               = useState(null)

  // Store original assigned IDs to compute diff on save
  const originalIdsRef = useRef(new Set())

  // ── Step 1: Load all permissions (sections) ──
  useEffect(() => {
    ;(async () => {
      try {
        setLoadingAll(true)
        const res     = await rolePermissionService.getAllPermissions()
        const grouped = res?.data || {}
        setAllGrouped(grouped)
      } catch (err) {
        setError('Failed to load permissions list.')
      } finally {
        setLoadingAll(false)
      }
    })()
  }, [])

  // ── Step 2: Load role's current permissions ──
  const loadRolePerms = useCallback(async (role) => {
    try {
      setLoadingRole(true)
      setError(null)
      const res   = await rolePermissionService.getRolePermissions(role)
      const perms = res?.data?.permissions || []
      const ids   = new Set(perms.map((p) => p.permission_id))
      setCheckedIds(ids)
      originalIdsRef.current = new Set(ids) // save original for diff
    } catch (err) {
      setError('Failed to load permissions for this role.')
      setCheckedIds(new Set())
      originalIdsRef.current = new Set()
    } finally {
      setLoadingRole(false)
    }
  }, [])

  useEffect(() => {
    if (!loadingAll) loadRolePerms(selectedRole)
  }, [selectedRole, loadingAll, loadRolePerms])

  // ── Toggle single ──
  const togglePermission = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Toggle section ──
  const toggleSection = (sectionPerms) => {
    const ids   = sectionPerms.map((p) => p.permission_id)
    const allOn = ids.every((id) => checkedIds.has(id))
    setCheckedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (allOn ? next.delete(id) : next.add(id)))
      return next
    })
  }

  // ── Save: assign newly checked + remove newly unchecked ──
  const handleSave = async () => {
    try {
      setSaving(true)

      const original = originalIdsRef.current
      const current  = checkedIds

      // IDs to ASSIGN = checked now but were NOT checked before
      const toAssign = [...current].filter((id) => !original.has(id))

      // IDs to REMOVE = were checked before but NOT checked now
      const toRemove = [...original].filter((id) => !current.has(id))

      console.log('➕ To assign:', toAssign)
      console.log('➖ To remove:', toRemove)

      // Run both in parallel if needed
      const promises = []

      if (toAssign.length > 0) {
        promises.push(
          rolePermissionService.assignRolePermissions({
            role: selectedRole,
            permission_ids: toAssign,
          })
        )
      }

      if (toRemove.length > 0) {
        promises.push(
          rolePermissionService.removeRolePermission({
            role: selectedRole,
            permission_ids: toRemove,
          })
        )
      }

      if (promises.length === 0) {
        showToast('success', 'No changes to save.')
        return
      }

      await Promise.all(promises)

      // Update original ref to current state after successful save
      originalIdsRef.current = new Set(current)

      showToast('success', 'Permissions updated successfully!')
    } catch (err) {
      console.error(err)
      showToast('error', err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const sections = Object.entries(allGrouped)
  const totalAll = sections.reduce((sum, [, perms]) => sum + perms.length, 0)
  const totalSel = checkedIds.size

  // Count pending changes
  const original  = originalIdsRef.current
  const toAssign  = [...checkedIds].filter((id) => !original.has(id)).length
  const toRemove  = [...original].filter((id) => !checkedIds.has(id)).length
  const hasChanges = toAssign > 0 || toRemove > 0

  if (loadingAll) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/60">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium border ${
            toast.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-700'
              : 'bg-white border-red-200 text-red-600'
          }`}
          style={{ animation: 'toastIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            : <AlertCircle  className="w-4 h-4 text-red-400 flex-shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto py-6 px-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              Role Permissions
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Control what each role can access in your school system
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
            <Lock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-gray-800">{totalSel}</span>
            <span className="text-xs text-gray-400">/ {totalAll} selected</span>
          </div>
        </div>

        {/* Role Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Select Role
          </p>
          <div className="flex flex-wrap gap-2.5">
            {ROLES.map((role) => {
              const Icon     = role.icon
              const isActive = selectedRole === role.id
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  disabled={loadingRole || saving}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-60 ${
                    isActive
                      ? `${ROLE_ACTIVE[role.id]} shadow-md`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {role.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Permissions */}
        {loadingRole ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-400">Loading permissions...</p>
            </div>
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No permissions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map(([section, perms]) => {
              const meta       = SECTION_META[section] || { icon: Settings, color: 'gray' }
              const c          = COLORS[meta.color]    || COLORS.gray
              const Icon       = meta.icon
              const ids        = perms.map((p) => p.permission_id)
              const allOn      = ids.every((id) => checkedIds.has(id))
              const checkedCnt = ids.filter((id) => checkedIds.has(id)).length

              return (
                <div key={section} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Section Header */}
                  <div className={`flex items-center justify-between px-5 py-3.5 ${c.bg} border-b border-gray-100`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Icon className={`w-4 h-4 ${c.text}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm capitalize">
                          {section.replace(/_/g, ' ')} Management
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {checkedCnt} / {perms.length} permissions selected
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection(perms)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        allOn
                          ? c.badge
                          : `bg-white border ${c.border} text-gray-500 hover:bg-gray-50`
                      }`}
                    >
                      {allOn ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      {allOn ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {/* Checkboxes */}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {perms.map((perm) => {
                      const checked  = checkedIds.has(perm.permission_id)
                      const wasOrig  = originalIdsRef.current.has(perm.permission_id)
                      // Show green if newly added, red if newly removed
                      const isNew    = checked && !wasOrig
                      const isRemoved = !checked && wasOrig

                      return (
                        <label
                          key={perm.permission_id}
                          className={`flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                            isNew
                              ? 'bg-emerald-50 border-emerald-200'
                              : isRemoved
                              ? 'bg-red-50 border-red-200'
                              : checked
                              ? `${c.bg} ${c.border}`
                              : 'hover:bg-gray-50 border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(perm.permission_id)}
                            className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${
                              isNew ? 'text-emerald-700' : isRemoved ? 'text-red-500 line-through' : checked ? 'text-gray-800' : 'text-gray-600'
                            }`}>
                              {perm.key}
                            </p>
                            {perm.description && (
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                {perm.description}
                              </p>
                            )}
                          </div>
                          {/* Change indicator */}
                          {isNew && (
                            <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                              +ADD
                            </span>
                          )}
                          {isRemoved && (
                            <span className="ml-auto text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                              -REM
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Save Bar */}
        {!loadingRole && sections.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <div>
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-800">{totalSel}</span> permissions for{' '}
                <span className="font-bold capitalize text-gray-800">{selectedRole}</span>
              </p>
              {hasChanges && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {toAssign > 0 && <span className="text-emerald-600 font-medium">+{toAssign} to add </span>}
                  {toRemove > 0 && <span className="text-red-500 font-medium">−{toRemove} to remove</span>}
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${
                ROLE_GRADIENT[selectedRole]
              } hover:shadow-lg hover:scale-[1.02] active:scale-100`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default RolePermissions