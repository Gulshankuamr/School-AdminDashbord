import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { rolePermissionService } from '../../services/rolePermissionService/rolePermissionService';
import { userPermissionService } from '../../services/rolePermissionService/userPermissionService';

// ─── Static Config ────────────────────────────────────────────────────────────
const ROLES = [
  { id: 'teacher',    label: 'Teacher',    icon: '🎓' },
  { id: 'student',    label: 'Student',    icon: '📚' },
  { id: 'accountant', label: 'Accountant', icon: '💼' },
];

const PERMISSION_MODULES = [
  {
    id: 'student_management',
    label: 'Student Management',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    permissions: [
      { id: 'view_students',  label: 'View Students',        desc: 'Access to directory and profiles' },
      { id: 'edit_student',   label: 'Edit Student Details', desc: 'Modify personal and academic records' },
      { id: 'add_student',    label: 'Add Student',          desc: 'Create new student records' },
      { id: 'delete_student', label: 'Delete Student',       desc: 'Remove student records permanently' },
    ],
  },
  {
    id: 'fee_management',
    label: 'Fee Management',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    permissions: [
      { id: 'collect_payments',  label: 'Process Payments',    desc: 'Initiate and confirm fee transactions' },
      { id: 'generate_invoices', label: 'Generate Fee Reports', desc: 'Export financial summaries' },
      { id: 'fee_discounts',     label: 'Fee Discounts',       desc: 'Apply and manage student discounts' },
    ],
  },
  {
    id: 'attendance_management',
    label: 'Attendance Management',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    permissions: [
      { id: 'daily_attendance_mark', label: 'Mark Attendance',    desc: 'Daily entry for student logs' },
      { id: 'leave_requests',        label: 'Leave Requests',     desc: 'Approve or reject leave applications' },
      { id: 'attendance_reports',    label: 'Attendance Reports', desc: 'View and export attendance summaries' },
    ],
  },
  {
    id: 'teacher_management',
    label: 'Teacher Management',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    permissions: [
      { id: 'assign_classes',        label: 'Assign Classes',        desc: 'Assign subjects and classes to teachers' },
      { id: 'view_teacher_profiles', label: 'View Teacher Profiles', desc: 'Access teacher profile information' },
      { id: 'manage_payroll',        label: 'Manage Payroll',        desc: 'Oversee teacher salary and payroll' },
    ],
  },
];

// ─── Permission State Logic ───────────────────────────────────────────────────
function computeState(permId, userAllowed, userDenied, rolePermIds) {
  if (userAllowed.has(permId)) return 'allowed';
  if (userDenied.has(permId))  return 'denied';
  if (rolePermIds.has(permId)) return 'default';
  return 'denied';
}

// ─── Pill Toggle: Allowed | Denied | Default ──────────────────────────────────
function PillToggle({ state, onChange }) {
  return (
    <div
      className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onChange('allowed')}
        className={`px-3 py-1.5 text-xs font-semibold transition-all duration-150 border-r border-gray-200
          ${state === 'allowed'
            ? 'bg-green-500 text-white'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
          }`}
      >
        Allowed
      </button>
      <button
        onClick={() => onChange('denied')}
        className={`px-3 py-1.5 text-xs font-semibold transition-all duration-150 border-r border-gray-200
          ${state === 'denied'
            ? 'bg-red-500 text-white'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
          }`}
      >
        Denied
      </button>
      <button
        onClick={() => onChange('default')}
        className={`px-3 py-1.5 text-xs font-semibold transition-all duration-150
          ${state === 'default'
            ? 'bg-gray-200 text-gray-700'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
      >
        Default
      </button>
    </div>
  );
}

// ─── Permission Row ───────────────────────────────────────────────────────────
function PermRow({ perm, state, onStateChange }) {
  const hasChange = state === 'allowed' || state === 'denied';

  return (
    <div className={`flex items-center justify-between px-5 py-3.5 gap-4 transition-colors duration-100
      ${state === 'allowed' ? 'bg-green-50/40' : state === 'denied' ? 'bg-red-50/40' : 'bg-white'}
      hover:bg-gray-50/70`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* state dot */}
        <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5
          ${state === 'allowed' ? 'bg-green-500' : state === 'denied' ? 'bg-red-500' : 'bg-gray-300'}`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800 leading-snug">{perm.label}</p>
            {/* unsaved change dot */}
            {hasChange && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" title="Modified" />
            )}
          </div>
          {perm.desc && (
            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{perm.desc}</p>
          )}
        </div>
      </div>
      <PillToggle state={state} onChange={(s) => onStateChange(perm.id, s)} />
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({ module, userAllowed, userDenied, rolePermIds, onStateChange, collapsed, onToggle }) {
  const overrideCount = module.permissions.filter(
    (p) => userAllowed.has(p.id) || userDenied.has(p.id)
  ).length;

  const allAllowed = module.permissions.every((p) =>
    computeState(p.id, userAllowed, userDenied, rolePermIds) === 'allowed'
  );

  const handleSelectAll = (e) => {
    e.stopPropagation();
    module.permissions.forEach((p) => {
      onStateChange(p.id, allAllowed ? 'default' : 'allowed');
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Module Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-gray-500">{module.icon}</span>
          <h3 className="text-sm font-semibold text-gray-900">{module.label}</h3>
          {overrideCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {overrideCount} override{overrideCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={allAllowed}
              onChange={handleSelectAll}
              className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-medium">Select All</span>
          </label>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Permissions List */}
      {!collapsed && (
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {module.permissions.map((perm) => (
            <PermRow
              key={perm.id}
              perm={perm}
              state={computeState(perm.id, userAllowed, userDenied, rolePermIds)}
              onStateChange={onStateChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Permissions Summary Sidebar ──────────────────────────────────────────────
function SummaryPanel({ userAllowed, userDenied, rolePermIds, selectedUser, hasChanges, onSave, onReset, saving, lastSaved }) {
  const allPerms = PERMISSION_MODULES.flatMap((m) => m.permissions);
  const total    = allPerms.length;
  const allowed  = allPerms.filter((p) => computeState(p.id, userAllowed, userDenied, rolePermIds) === 'allowed').length;
  const denied   = allPerms.filter((p) => computeState(p.id, userAllowed, userDenied, rolePermIds) === 'denied').length;
  const def      = allPerms.filter((p) => computeState(p.id, userAllowed, userDenied, rolePermIds) === 'default').length;

  const unsaved = userAllowed.size + userDenied.size;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Permissions Summary</h3>

        {/* Total */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Total Permissions
          </div>
          <span className="text-sm font-bold text-gray-900">{total}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
        </div>

        {/* Allowed */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Allowed
          </div>
          <span className="text-sm font-bold text-gray-900">{allowed}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
          <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${total ? (allowed / total) * 100 : 0}%` }} />
        </div>

        {/* Denied */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            Denied
          </div>
          <span className="text-sm font-bold text-gray-900">{denied}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
          <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${total ? (denied / total) * 100 : 0}%` }} />
        </div>

        {/* Default Inherited */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
            Default (Inherited)
          </div>
          <span className="text-sm font-bold text-gray-900">{def}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-5">
          <div className="h-full bg-gray-300 rounded-full transition-all duration-300" style={{ width: `${total ? (def / total) * 100 : 0}%` }} />
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={!selectedUser}
          className="w-full py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600
            hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed mb-2"
        >
          Reset to Role Default
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={saving || !selectedUser || !hasChanges}
          className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold
            hover:bg-blue-700 transition-colors duration-150
            disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Changes
            </>
          )}
        </button>

        {lastSaved && (
          <p className="text-[10px] text-gray-400 text-center mt-2">Last saved {lastSaved}</p>
        )}
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && selectedUser && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-700 font-medium leading-snug">
            You have {unsaved} unsaved change{unsaved !== 1 ? 's' : ''} to{' '}
            <span className="font-bold">permissions</span>.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserPermissions() {
  const navigate = useNavigate();

  const [selectedRole,   setSelectedRole]   = useState(ROLES[0].id);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users,          setUsers]          = useState([]);
  const [loadingUsers,   setLoadingUsers]   = useState(false);

  const [rolePermIds, setRolePermIds] = useState(new Set());
  const [userAllowed, setUserAllowed] = useState(new Set());
  const [userDenied,  setUserDenied]  = useState(new Set());
  const [origAllowed, setOrigAllowed] = useState(new Set());
  const [origDenied,  setOrigDenied]  = useState(new Set());

  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [lastSaved,  setLastSaved]  = useState(null);

  // collapsed state per module
  const [collapsed, setCollapsed] = useState({});

  const selectedUser = users.find((u) => u.id === selectedUserId) || null;

  // Load users when role changes
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      setError(null);
      setSelectedUserId('');
      setUsers([]);
      setRolePermIds(new Set());
      setUserAllowed(new Set());
      setUserDenied(new Set());
      try {
        const res = await userPermissionService.getUsersByRole(selectedRole);
        const mapped = (res?.data || []).map((u) => ({
          id:   String(u.user_id),
          name: u.name,
        }));
        setUsers(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, [selectedRole]);

  // Fetch role perms + user overrides
  const fetchAll = useCallback(async (userId, roleId) => {
    setLoading(true);
    setError(null);
    try {
      const [roleData, userData] = await Promise.all([
        rolePermissionService.getRolePermissions(roleId),
        userPermissionService.getUserPermissions(userId),
      ]);
      setRolePermIds(new Set((roleData.permissionIds || []).map(String)));
      const a = new Set((userData.allowedPermissionIds || []).map(String));
      const d = new Set((userData.deniedPermissionIds  || []).map(String));
      setUserAllowed(a);
      setUserDenied(d);
      setOrigAllowed(new Set(a));
      setOrigDenied(new Set(d));
      if (userData.lastSaved) setLastSaved(userData.lastSaved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) fetchAll(selectedUserId, selectedRole);
  }, [selectedUserId, selectedRole, fetchAll]);

  const handleStateChange = (permId, newState) => {
    setUserAllowed((prev) => {
      const next = new Set(prev);
      newState === 'allowed' ? next.add(permId) : next.delete(permId);
      return next;
    });
    setUserDenied((prev) => {
      const next = new Set(prev);
      newState === 'denied' ? next.add(permId) : next.delete(permId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setError(null);
    try {
      await userPermissionService.saveUserPermissions({
        userId: selectedUserId,
        allowedPermissionIds: [...userAllowed],
        deniedPermissionIds:  [...userDenied],
      });
      setOrigAllowed(new Set(userAllowed));
      setOrigDenied(new Set(userDenied));
      const now = new Date().toLocaleString();
      setLastSaved(now);
      setSuccessMsg('Permissions saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setUserAllowed(new Set());
    setUserDenied(new Set());
  };

  const hasChanges = (() => {
    if (userAllowed.size !== origAllowed.size || userDenied.size !== origDenied.size) return true;
    for (const id of userAllowed) if (!origAllowed.has(id)) return true;
    for (const id of userDenied)  if (!origDenied.has(id))  return true;
    return false;
  })();

  const toggleModule = (id) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-gray-50/70" style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>

      {/* ── Top Breadcrumb Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600 transition-colors">Admin</button>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <button onClick={() => navigate('/settings/role-permissions')} className="text-gray-400 hover:text-gray-600 transition-colors">Permissions</button>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-semibold">User Permissions</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAll(selectedUserId, selectedRole)}
            disabled={!selectedUserId || saving}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600
              hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedUserId || !hasChanges}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold
              hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Page Title ── */}
      <div className="px-6 pt-6 pb-2 max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
      </div>

      {/* ── Alerts ── */}
      <div className="px-6 max-w-[1200px] mx-auto">
        {error && (
          <div className="mb-4 mt-2 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 mt-2 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}
      </div>

      {/* ── Role + User Selector Card ── */}
      <div className="px-6 pb-5 max-w-[1200px] mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5">
          <div className="flex items-end gap-6 flex-wrap">

            {/* Select Role */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Select Role
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6a4 4 0 11-8 0 4 4 0 018 0zM12 10v6" />
                  </svg>
                </span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-lg
                    pl-9 pr-9 py-2.5 text-sm text-gray-800 font-medium cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                    transition-all duration-150 shadow-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Select User */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Select User
              </label>
              <div className="relative">
                {/* avatar circle */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
                  {selectedUser ? selectedUser.name.charAt(0).toUpperCase() : '?'}
                </span>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={loadingUsers}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-lg
                    pl-10 pr-9 py-2.5 text-sm text-gray-800 font-medium cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                    transition-all duration-150 shadow-sm
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingUsers ? (
                    <option value="">Loading users…</option>
                  ) : (
                    <>
                      <option value=""> Select a user </option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </>
                  )}
                </select>
                {loadingUsers ? (
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin pointer-events-none" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Main Content: Left modules + Right sidebar ── */}
      <div className="px-6 pb-16 max-w-[1200px] mx-auto">
        <div className="flex gap-5 items-start">

          {/* Left: Module Cards */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Empty state */}
            {!selectedUserId && !loadingUsers && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">👤</div>
                <p className="text-sm font-medium">Select a role and user to manage permissions</p>
              </div>
            )}

            {/* Loading */}
            {selectedUserId && loading && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm">Loading permissions…</span>
              </div>
            )}

            {/* Module Cards */}
            {selectedUserId && !loading && PERMISSION_MODULES.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                userAllowed={userAllowed}
                userDenied={userDenied}
                rolePermIds={rolePermIds}
                onStateChange={handleStateChange}
                collapsed={!!collapsed[module.id]}
                onToggle={() => toggleModule(module.id)}
              />
            ))}
          </div>

          {/* Right: Summary Sidebar */}
          <div className="w-72 shrink-0 sticky top-[65px]">
            <SummaryPanel
              userAllowed={userAllowed}
              userDenied={userDenied}
              rolePermIds={rolePermIds}
              selectedUser={selectedUser}
              hasChanges={hasChanges}
              onSave={handleSave}
              onReset={handleReset}
              saving={saving}
              lastSaved={lastSaved}
            />
          </div>

        </div>
      </div>

    </div>
  );
}