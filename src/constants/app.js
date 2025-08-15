// Application Constants
export const APP_CONFIG = {
  NAME: 'Spor Salonu Yönetim Sistemi',
  VERSION: '1.0.0',
  ADMIN_PASSWORD: '1'
};

// Page Names
export const PAGES = {
  DASHBOARD: 'dashboard',
  CUSTOMERS: 'customers',
  PAYMENTS: 'payments',
  PROGRAMS: 'programs',
  ENTRIES: 'entries',
  MEMBERSHIPS: 'memberships',
  MEMBERSHIP_TYPES: 'membership_types',
  EXERCISES: 'exercises',
  MEMBER_PROGRAMS: 'member_programs',
  SETTINGS: 'settings'
};

// Modal Types
export const MODAL_TYPES = {
  ADD_CUSTOMER: 'add_customer',
  EDIT_CUSTOMER: 'edit_customer',
  ADD_PAYMENT: 'add_payment',
  ADD_PROGRAM: 'add_program',
  ADD_ENTRY: 'add_entry',
  ADD_MEMBERSHIP: 'add_membership',
  RENEW_MEMBERSHIP: 'renew_membership',
  EDIT_MEMBERSHIP: 'edit_membership',
  ADD_MEMBERSHIP_TYPE: 'add_membership_type',
  EDIT_MEMBERSHIP_TYPE: 'edit_membership_type',
  ADD_EXERCISE: 'add_exercise',
  EDIT_EXERCISE: 'edit_exercise',
  ADD_MEMBER_PROGRAM: 'add_member_program',
  EDIT_MEMBER_PROGRAM: 'edit_member_program'
};

// Form Field Types
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'tel',
  DATE: 'date',
  SELECT: 'select',
  TEXTAREA: 'textarea',
  NUMBER: 'number'
};

// Membership Status
export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'erkek', label: 'Erkek' },
  { value: 'kadin', label: 'Kadın' }
];

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'nakit', label: 'Nakit' },
  { value: 'kredi_karti', label: 'Kredi Kartı' },
  { value: 'banka_havalesi', label: 'Banka Havalesi' }
]; 