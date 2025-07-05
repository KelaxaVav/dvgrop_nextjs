# Loan Management System Backend

A secure, scalable backend for a Loan Management Web Application with RESTful API endpoints.

## Features

### 🧑‍💼 User Management
- Register/Login users (Admin, Loan Officer, Clerk, Customer)
- Secure password hashing with bcrypt
- JWT authentication
- Role-based access control
- Login activity tracking (IP, device, timestamp)

### 💰 Loan Module
- Create loan applications
- Approve/Reject/Disburse loans
- Store interest rate, EMI schedule, due dates
- Track loan balance and arrears

### 💳 Payment Module
- Record payments (amount, date, mode)
- Auto-calculate remaining balance
- Track overdue payments
- Generate EMI history

### ⚙️ Settings & Configuration
- Admin panel to update:
  - Penalty percentage
  - SMS templates
  - Loan ID prefix
- Save settings in a global_settings table
- History of changes (who, when, what)

### 📲 SMS Notifications
- Send SMS on:
  - Loan approval
  - Payment received
  - EMI due reminder
  - Overdue warning
- Integration with Twilio
- Log SMS status and message content

### 🗂️ Reports Module
- Generate:
  - Daily payment report
  - Loan disbursed report
  - Defaulter list
- Export as JSON, CSV

### 🧾 Collection Day Calculator API
- Calculate working days between dates
- Exclude Sundays and holidays
- Reference leave_days table for holidays

## Installation

1. Clone the repository
```
git clone https://github.com/yourusername/loan-management-system.git
```

2. Install dependencies
```
npm install
```

3. Create a .env file in the root directory with the following variables:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/loan_management_system
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. Run the server
```
npm run server
```

## API Documentation

### Authentication
- POST /api/v1/auth/register - Register a new user
- POST /api/v1/auth/login - Login user
- GET /api/v1/auth/logout - Logout user
- GET /api/v1/auth/me - Get current user
- PUT /api/v1/auth/updatedetails - Update user details
- PUT /api/v1/auth/updatepassword - Update password

### Users
- GET /api/v1/users - Get all users (Admin only)
- GET /api/v1/users/:id - Get single user (Admin only)
- POST /api/v1/users - Create user (Admin only)
- PUT /api/v1/users/:id - Update user (Admin only)
- DELETE /api/v1/users/:id - Delete user (Admin only)
- GET /api/v1/users/:id/login-history - Get user login history (Admin only)
- PUT /api/v1/users/:id/unlock - Unlock user account (Admin only)
- PUT /api/v1/users/:id/force-logout - Force logout user (Admin only)

### Customers
- GET /api/v1/customers - Get all customers
- GET /api/v1/customers/:id - Get single customer
- POST /api/v1/customers - Create customer
- PUT /api/v1/customers/:id - Update customer
- DELETE /api/v1/customers/:id - Delete customer (Admin only)
- PUT /api/v1/customers/:id/documents - Upload customer document
- DELETE /api/v1/customers/:id/documents/:docId - Delete customer document

### Loans
- GET /api/v1/loans - Get all loans
- GET /api/v1/customers/:customerId/loans - Get customer loans
- GET /api/v1/loans/:id - Get single loan
- POST /api/v1/customers/:customerId/loans - Create loan
- PUT /api/v1/loans/:id - Update loan
- DELETE /api/v1/loans/:id - Delete loan (Admin only)
- PUT /api/v1/loans/:id/documents - Upload loan document
- DELETE /api/v1/loans/:id/documents/:docId - Delete loan document
- POST /api/v1/loans/:id/schedule - Generate loan repayment schedule

### Payments
- GET /api/v1/payments - Get all repayments
- GET /api/v1/loans/:loanId/payments - Get loan repayments
- GET /api/v1/payments/:id - Get single repayment
- POST /api/v1/loans/:loanId/payments - Create repayment
- PUT /api/v1/payments/:id - Update repayment
- POST /api/v1/payments/bulk - Process bulk payments
- GET /api/v1/payments/daily/:date? - Get daily payments
- GET /api/v1/payments/overdue - Get overdue payments

### Settings
- GET /api/v1/settings - Get all settings (Admin only)
- GET /api/v1/settings/:group - Get settings by group (Admin only)
- PUT /api/v1/settings/:group - Update settings (Admin only)
- GET /api/v1/settings/leave-days - Get leave days
- POST /api/v1/settings/leave-days - Add leave day (Admin only)
- DELETE /api/v1/settings/leave-days/:id - Delete leave day (Admin only)
- POST /api/v1/settings/collection-days/calculate - Calculate collection days

### SMS
- GET /api/v1/sms/logs - Get all SMS logs
- GET /api/v1/sms/logs/customer/:customerId - Get customer SMS logs
- POST /api/v1/sms/send - Send SMS
- POST /api/v1/sms/send-bulk - Send bulk SMS
- GET /api/v1/sms/templates - Get SMS templates
- PUT /api/v1/sms/templates - Update SMS templates (Admin only)
- GET /api/v1/sms/pending-notifications - Get pending notifications

### Reports
- GET /api/v1/reports/dashboard - Get dashboard report
- GET /api/v1/reports/collection - Get collection report
- GET /api/v1/reports/loan-analytics - Get loan analytics report
- GET /api/v1/reports/customer - Get customer report
- GET /api/v1/reports/overdue - Get overdue report
- GET /api/v1/reports/financial - Get financial report (Admin/Officer only)

### Collection Days
- POST /api/v1/collection-days/calculate - Calculate collection days
- GET /api/v1/collection-days/leave-days - Get leave days
- POST /api/v1/collection-days/leave-days - Add leave day (Admin only)
- DELETE /api/v1/collection-days/leave-days/:id - Delete leave day (Admin only)

### Email Contacts
- GET /api/v1/email-contacts - Get all email contacts
- GET /api/v1/email-contacts/:id - Get single email contact
- POST /api/v1/email-contacts - Create email contact
- PUT /api/v1/email-contacts/:id - Update email contact
- DELETE /api/v1/email-contacts/:id - Delete email contact
- POST /api/v1/email-contacts/sync - Sync email contacts
- GET /api/v1/email-contacts/sync-config - Get email sync config
- PUT /api/v1/email-contacts/sync-config - Update email sync config (Admin only)
- POST /api/v1/email-contacts/import - Import email contacts from CSV (Admin only)

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation & sanitization
- Rate limiting
- Security headers with Helmet
- XSS protection
- CORS enabled
- Secure cookies# dvgrop_nextjs
