# Database Migration: Payment Status Tracking

This migration moves payment status tracking from the `uyelikler` table to the `odemeler` table.

## 🎯 Purpose

- Remove `odeme_durumu` field from `uyelikler` table
- Add `odeme_durumu` field to `odemeler` table
- Handle payment status tracking only from the payments table

## 📋 Changes Made

### 1. Database Structure
- `odeme_durumu` column removed from `uyelikler` table
- `odeme_durumu` column added to `odemeler` table (INTEGER, 0/1)

### 2. Backend Models
- `Stats.js`: `getUnpaidCustomers` function updated
- `Payment.js`: `updatePaymentStatus` function simplified
- `Customer.js`: Customer queries updated
- `Membership.js`: Membership queries updated

### 3. Frontend
- `Dashboard.js`: Payment status display updated (1/0 → Paid/Unpaid)

## 🚀 Running the Migration

### Automatic Migration
```bash
npm run migrate
```

### Manual Migration
1. Backup the database file
2. Run `server/migrations/run_migration.js` file
3. Restore from backup if errors occur

## ⚠️ Important Notes

1. **Take Backup**: Backup the database before migration
2. **Test**: Test the application after migration
3. **Rollback**: Restore from backup if errors occur

## 🔄 Post-Migration

### Payment Status Values
- **0**: Unpaid
- **1**: Paid

### Dashboard Display
- Unpaid customers are now checked only from the payments table
- List automatically updates when payment is made

## 🐛 Troubleshooting

### Migration Error
```bash
# Check error logs
npm run migrate

# Manually run the migration script
node server/migrations/run_migration.js
```

### Data Loss
- Restore from backup file
- Run the migration again

## 📞 Support

If you encounter issues during migration:
1. Save error messages
2. Check database backup
3. Contact the development team 