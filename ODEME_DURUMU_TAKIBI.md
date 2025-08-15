# Payment Status Tracking Feature

This feature allows you to track the status of customer payments in the gym management system.

## Features

### 1. Payment Status Column
- **odeme_durumu** column added
- **0**: Not Paid
- **1**: Paid

### 2. New API Endpoints

#### Update Payment Status
```
PATCH /api/payments/:id/status
Body: { "odeme_durumu": 0 or 1 }
```

#### Get Unpaid Payments
```
GET /api/payments/unpaid
```

#### Get Paid Payments
```
GET /api/payments/paid
```

### 3. Frontend Features

#### Payment Status Display
- Status badge for each payment (Paid/Not Paid)
- Color coding: Green (Paid), Red (Not Paid)
- Clickable badges (to change status)

#### Filtering
- All statuses
- Only paid ones
- Only unpaid ones

#### Search
- Customer first name/last name
- Payment method

#### Summary Cards
- Total payment count
- Paid payment count
- Unpaid payment count

## Usage

### 1. Changing Payment Status
1. Go to the payments page
2. Click on the status badge of the relevant payment
3. Status will change automatically

### 2. Filtering
1. Select status from the dropdown at the top
2. "All Statuses", "Paid" or "Unpaid"

### 3. Search
1. Type customer name or payment method in the search box
2. Results will be filtered instantly

## Technical Details

### Database Changes
- `odeme_durumu` column added to `odemeler` table
- Default value: 0 (Not Paid)
- Data type: INTEGER

### Backend Changes
- Payment model updated
- New controller methods added
- New routes added

### Frontend Changes
- Payments page updated
- Payment status badges added
- Filtering and search features added
- Summary cards added

## API Examples

### Update Payment Status
```javascript
// Set payment status to "Paid"
await paymentService.updatePaymentStatus(paymentId, 1);

// Set payment status to "Not Paid"
await paymentService.updatePaymentStatus(paymentId, 0);
```

### Get Unpaid Payments
```javascript
const unpaidPayments = await paymentService.getUnpaidPayments();
```

### Get Paid Payments
```javascript
const paidPayments = await paymentService.getPaidPayments();
```

## Security

- All API endpoints require authentication
- Only authorized users can change payment status
- All changes are logged

## Error Handling

- Validation for invalid status values
- Appropriate error messages for database errors
- User-friendly error notifications in frontend

## Future Improvements

- Payment reminders
- Automatic payment tracking
- Payment reports
- Email notifications
- SMS reminders 