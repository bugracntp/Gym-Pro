# 🏋️‍♂️ Gym Membership System - User Guide

## 🎯 System Features

This system is developed to manage and maintain gym memberships for customers.

### ✅ Available Features

- **Membership Management**: Add, edit, delete new memberships
- **Membership Types**: Different duration and price options
- **Membership Renewal**: Extend existing memberships
- **Status Tracking**: Active, expiring soon, expired memberships
- **Payment Status**: Paid, pending, overdue
- **Statistics**: Total, active, expiring membership counts

## 🚀 Setup and Running

### 1. Start Backend
```bash
npm run server
```
Backend will run at http://localhost:3001

### 2. Start Frontend
```bash
npm start
```
Frontend will run at http://localhost:3000

### 3. Start Full System
```bash
npm run dev
```
Both backend and frontend start simultaneously

## 📱 Usage Steps

### **Renewing User Membership**

#### 1. **Check Membership Status**
- Click "Memberships" page from left menu
- View membership status by customer name
- Status colors:
  - 🟢 **Green**: Active membership
  - 🟡 **Yellow**: Expiring soon (within 7 days)
  - 🔴 **Red**: Expired or overdue payment

#### 2. **Membership Renewal (Continue)**
- Find the relevant customer in membership list
- Click "🔄" (Renew) button
- System automatically:
  - Takes current end date
  - Calculates new end date based on membership type
  - Updates fee
  - Sets payment status to "Pending"

#### 3. **Add New Membership**
- Click "New Membership" button
- Fill in required information:
  - **Customer**: Select from existing customers
  - **Membership Type**: Duration and price options
  - **Start Date**: Date membership begins
  - **End Date**: Date membership ends
  - **Fee**: Membership fee
  - **Payment Status**: Paid/Pending/Overdue

#### 4. **Edit Membership**
- Click "✏️" (Edit) button in membership list
- Update necessary fields
- Click "Update" button

## 🔧 Technical Details

### **Backend API Endpoints**

```
GET    /api/memberships              # Get all memberships
GET    /api/memberships/:id          # Get membership by ID
POST   /api/memberships              # Add new membership
PUT    /api/memberships/:id          # Update membership
DELETE /api/memberships/:id          # Delete membership
GET    /api/memberships/status/active # Active memberships
GET    /api/memberships/status/expiring/:days # Expiring soon
GET    /api/memberships/status/expired # Expired
GET    /api/memberships/payment/:status # By payment status
GET    /api/memberships/stats/overview # Statistics
```

### **Database Structure**

```sql
-- Memberships table
CREATE TABLE memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  membership_type_id INTEGER,
  start_date DATE,
  end_date DATE,
  fee DECIMAL(10,2),
  payment_status TEXT,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1
);

-- Membership types table
CREATE TABLE membership_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_name TEXT,
  duration_months INTEGER,
  price DECIMAL(10,2),
  description TEXT,
  active INTEGER DEFAULT 1
);
```

## 📊 Membership Statuses

### **Status Colors and Meanings**

| Status | Color | Description |
|--------|-------|-------------|
| **Active** | 🟢 Green | Membership duration continues |
| **Expiring Soon** | 🟡 Yellow | Expires within 7 days |
| **Expired** | 🔴 Red | Membership duration ended |
| **Overdue Payment** | 🔴 Red | Payment is overdue |

### **Payment Statuses**

| Status | Description |
|--------|-------------|
| **Paid** | Membership fee fully paid |
| **Pending** | Payment awaited |
| **Overdue** | Payment is overdue |

## 🎯 Membership Renewal Process

### **Automatic Calculation**

System during membership renewal:

1. **Takes current end date**
2. **Calculates new duration** based on membership type
3. **Automatically determines** new end date
4. **Applies current fee**
5. **Sets payment status** to "Pending"

### **Calculation Example**

```
Current membership: 3 months (Jan 1 - Apr 1)
Renewal date: March 15
New end: Apr 1 + 3 months = July 1
```

## 🔍 Troubleshooting

### **Common Issues**

#### 1. **Membership Cannot Be Renewed**
- Ensure customer information is correct
- Check if membership type is active
- Test database connection

#### 2. **Date Errors**
- Ensure date format is YYYY-MM-DD
- Don't use past dates
- Check that end date is after start date

#### 3. **API Errors**
- Ensure backend is running
- Check if port 3001 is open
- Review error messages in console

### **Log Control**

To check backend logs:
```bash
# Monitor backend output in terminal
npm run server
```

## 📈 Statistics and Reports

### **Dashboard Statistics**

- **Total Memberships**: All memberships in system
- **Active Memberships**: Memberships with continuing duration
- **Expiring Soon**: Memberships expiring within 7 days
- **Payment Pending**: Memberships awaiting payment

### **Filtering and Search**

- Search by customer name
- Filter by membership type
- Filter by status
- Filter by date range

## 🚀 Future Features

### **Planned Developments**

- [ ] **Automatic Reminders**: SMS/Email membership duration warnings
- [ ] **Online Payment**: Credit card online payment integration
- [ ] **Mobile App**: Mobile membership management for customers
- [ ] **Advanced Reports**: Detailed analysis and charts
- [ ] **Bulk Operations**: Bulk membership renewal
- [ ] **Discount System**: Loyalty discounts and campaigns

## 📞 Support

### **Technical Support**

- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: This guide and API documentation
- **Log Files**: Backend and frontend logs

### **Contact**

- **Developer**: AI Assistant
- **Project**: Gym Management System
- **Version**: 1.0.0

---

## 🎉 Congratulations!

Your gym membership system is now fully operational! Your customers can easily continue their memberships, add new memberships, and track all membership statuses.

**Important**: When the system is first run, the database will be automatically created and sample data will be added.

**Security**: Admin password is set to "1" by default. Be sure to change it in production environment! 