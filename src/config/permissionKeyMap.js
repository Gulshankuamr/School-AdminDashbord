// src/utils/permissionMap.js
//
// MAPPING LAYER
// backend key (from API)  →  frontend key (used in sidebarConfig + can())
//
// WHY this exists:
//   Backend sends:  "view_students"
//   Frontend uses:  "view_all_student"
//   This file bridges the two WITHOUT changing either side.
//
// school_admin bypass:
//   can() in AuthContext returns true for school_admin BEFORE
//   ever reaching this map — so admin never needs to be in this map.
// ─────────────────────────────────────────────────────────────────────────

export const PERMISSION_MAP = {

  // ── STUDENTS ──────────────────────────────────────────────
  view_students:   'view_all_student',
  add_student:     'add_student',
  edit_student:    'edit_student',
  delete_student:  'delete_student',

  // ── TEACHERS ──────────────────────────────────────────────
  view_teachers:   'view_all_teacher',
  add_teacher:     'add_teacher',
  edit_teacher:    'edit_teacher',
  delete_teacher:  'delete_teacher',

  // ── ACCOUNTANTS ───────────────────────────────────────────
  view_accountants:  'view_accountants',
  add_accountant:    'add_accountant',
  edit_accountants:  'edit_accountants',

  // ── CLASSES ───────────────────────────────────────────────
  view_classes:    'view_classes',
  manage_classes:  'manage_classes',

  // ── SECTIONS ──────────────────────────────────────────────
  view_sections:   'view_sections',
  manage_sections: 'manage_sections',

  // ── SUBJECTS ──────────────────────────────────────────────
  view_subjects:   'view_subjects',

  // ── TIMETABLE ─────────────────────────────────────────────
  view_timetable:    'view_timetable',
  manage_timetable:  'manage_timetable',

  // ── FEES ──────────────────────────────────────────────────
  view_fees:         'view_fees',
  manage_fees:       'manage_fees',

  // ── PAYMENTS ──────────────────────────────────────────────
  view_payments:     'view_payments',
  collect_payment:   'collect_payment',
  generate_receipt:  'generate_receipt',

  // ── NOTICES ───────────────────────────────────────────────
  view_notices:   'view_notices',
  create_notice:  'create_notice',
  edit_notice:    'edit_notice',

  // ── NOTIFICATIONS ─────────────────────────────────────────
  'notification.view':    'notification_view',
  'notification.send':    'notification_send',
  'notification.delete':  'notification_delete',

  // ── HOMEWORK ──────────────────────────────────────────────
  view_hw_from_student:    'view_hw_from_student',
  teacher_create_homework: 'teacher_create_homework',

  // ── SETTINGS / SYSTEM ─────────────────────────────────────
  manage_school_settings: 'manage_school_settings',
  manage_users:           'manage_users',
  manage_permissions:     'manage_permissions',
}

/**
 * mapPermissions(perms)
 *
 * Converts an array of raw backend permission strings into
 * their mapped frontend equivalents.
 *
 * Unknown keys are passed through unchanged (safe fallback).
 *
 * @param   {string[]} perms  – raw array from API, e.g. ["view_students", ...]
 * @returns {string[]}         – mapped array, e.g. ["view_all_student", ...]
 *
 * @example
 *   mapPermissions(["view_students", "add_student"])
 *   // → ["view_all_student", "add_student"]
 */
export function mapPermissions(perms = []) {
  return perms.map(p => PERMISSION_MAP[p] ?? p)
}