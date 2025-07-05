// Script to generate dummy customers and loans for the Loan Management System
const fs = require('fs');

// Helper function to generate random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to format date to ISO string
function formatDate(date) {
  return date.toISOString();
}

// Helper function to generate random string
function randomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Helper function to generate random NIC
function generateNIC() {
  const year = Math.floor(Math.random() * 30) + 1970;
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${year}${number}`;
}

// Helper function to generate random phone number
function generatePhone() {
  return `+9477${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
}

// Generate 20 dummy customers
function generateCustomers() {
  const firstNames = ['Kamal', 'Nimal', 'Sunil', 'Anil', 'Saman', 'Priyantha', 'Chaminda', 'Roshan', 'Nuwan', 'Lalith', 'Kumara', 'Ajith', 'Sampath', 'Dinesh', 'Ruwan', 'Thilak', 'Mahesh', 'Prasad', 'Jagath', 'Chamara'];
  const lastNames = ['Perera', 'Silva', 'Fernando', 'Dissanayake', 'Bandara', 'Rajapaksa', 'Gunawardena', 'Jayawardena', 'Wickramasinghe', 'Ranasinghe', 'Fonseka', 'Mendis', 'Weerasinghe', 'Karunaratne', 'Samaraweera', 'Gunasekara', 'Seneviratne', 'Liyanage', 'Ratnayake', 'Amarasinghe'];
  const occupations = ['Business Owner', 'Government Employee', 'Teacher', 'Doctor', 'Engineer', 'Lawyer', 'Accountant', 'Salesperson', 'IT Professional', 'Farmer', 'Driver', 'Shopkeeper', 'Contractor', 'Electrician', 'Plumber', 'Chef', 'Waiter', 'Security Guard', 'Mechanic', 'Carpenter'];
  const addresses = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Batticaloa', 'Negombo', 'Matara', 'Anuradhapura', 'Badulla', 'Kurunegala', 'Ratnapura', 'Trincomalee', 'Hambantota', 'Vavuniya', 'Kilinochchi', 'Mannar', 'Ampara', 'Puttalam', 'Kegalle', 'Polonnaruwa'];
  
  const customers = [];
  
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    
    const customer = {
      id: `C${i + 1}`,
      name,
      nic: generateNIC(),
      dob: formatDate(randomDate(new Date(1970, 0, 1), new Date(2000, 0, 1))),
      address: `No. ${Math.floor(Math.random() * 500) + 1}, ${addresses[Math.floor(Math.random() * addresses.length)]} Road, ${addresses[Math.floor(Math.random() * addresses.length)]}`,
      phone: generatePhone(),
      email,
      maritalStatus: Math.random() > 0.5 ? 'married' : 'single',
      occupation: occupations[Math.floor(Math.random() * occupations.length)],
      income: Math.floor(Math.random() * 150000) + 30000, // Income between 30,000 and 180,000
      bankAccount: Math.random() > 0.3 ? `${Math.floor(Math.random() * 10000000000)}` : undefined,
      documents: [],
      createdAt: formatDate(randomDate(new Date(2023, 0, 1), new Date())),
      updatedAt: formatDate(new Date())
    };
    
    customers.push(customer);
  }
  
  return customers;
}

// Generate 20 dummy loans
function generateLoans(customers) {
  const loanTypes = ['personal', 'business', 'agriculture', 'vehicle', 'housing'];
  const loanPurposes = [
    'Home renovation', 'Business expansion', 'Education expenses', 'Medical expenses', 
    'Debt consolidation', 'Vehicle purchase', 'Wedding expenses', 'Travel expenses',
    'Farm equipment', 'Inventory purchase', 'Office setup', 'Working capital',
    'Land purchase', 'House construction', 'Shop renovation', 'Machinery purchase',
    'Personal needs', 'Family event', 'Emergency funds', 'Investment opportunity'
  ];
  const loanStatuses = ['pending', 'approved', 'rejected', 'disbursed', 'active', 'completed'];
  const approvers = ['Loan Officer', 'Branch Manager', 'Credit Manager', 'System Admin'];
  
  const loans = [];
  
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const type = loanTypes[Math.floor(Math.random() * loanTypes.length)];
    const requestedAmount = Math.floor(Math.random() * 900000) + 100000; // Between 100,000 and 1,000,000
    const interestRate = Math.floor(Math.random() * 15) + 5; // Between 5% and 20%
    const period = Math.floor(Math.random() * 48) + 12; // Between 12 and 60 months
    
    // Calculate EMI (simplified)
    const monthlyInterestRate = interestRate / 100;
    const emi = Math.round((requestedAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, period)) / (Math.pow(1 + monthlyInterestRate, period) - 1));
    
    const createdDate = randomDate(new Date(2023, 0, 1), new Date());
    const status = loanStatuses[Math.floor(Math.random() * loanStatuses.length)];
    
    const loan = {
      id: `L${i + 100}`,
      customerId: customer.id,
      type,
      requestedAmount,
      interestRate,
      period,
      emi,
      startDate: formatDate(new Date(createdDate.getTime() + 1000 * 60 * 60 * 24 * 15)).split('T')[0], // 15 days after creation
      purpose: loanPurposes[Math.floor(Math.random() * loanPurposes.length)],
      status,
      documents: [],
      createdAt: formatDate(createdDate),
      updatedAt: formatDate(new Date())
    };
    
    // Add approval details if approved, rejected, disbursed, active, or completed
    if (status !== 'pending') {
      const approvedDate = new Date(createdDate.getTime() + 1000 * 60 * 60 * 24 * 7); // 7 days after creation
      loan.approvedBy = approvers[Math.floor(Math.random() * approvers.length)];
      loan.approvedDate = formatDate(approvedDate);
      loan.approvedAmount = Math.floor(requestedAmount * (Math.random() * 0.3 + 0.7)); // 70% to 100% of requested amount
      
      // Add disbursement details if disbursed, active, or completed
      if (['disbursed', 'active', 'completed'].includes(status)) {
        const disbursedDate = new Date(approvedDate.getTime() + 1000 * 60 * 60 * 24 * 5); // 5 days after approval
        loan.disbursedDate = formatDate(disbursedDate);
        loan.disbursedAmount = loan.approvedAmount;
        loan.disbursementMethod = ['bank_transfer', 'cash', 'cheque'][Math.floor(Math.random() * 3)];
        loan.disbursementReference = `REF${randomString(8)}`;
        loan.disbursedBy = approvers[Math.floor(Math.random() * approvers.length)];
      }
      
      // Add guarantor for some loans
      if (Math.random() > 0.5) {
        loan.guarantor = {
          name: `${['Ajith', 'Suresh', 'Mahinda', 'Lasith', 'Chamara'][Math.floor(Math.random() * 5)]} ${['Perera', 'Silva', 'Fernando', 'Gunawardena', 'Bandara'][Math.floor(Math.random() * 5)]}`,
          nic: generateNIC(),
          phone: generatePhone(),
          address: `No. ${Math.floor(Math.random() * 500) + 1}, Main Road, Colombo`,
          occupation: occupations[Math.floor(Math.random() * occupations.length)],
          income: Math.floor(Math.random() * 100000) + 50000
        };
      }
      
      // Add collateral for some loans
      if (Math.random() > 0.6) {
        const collateralTypes = ['Property', 'Vehicle', 'Gold', 'Fixed Deposit', 'Machinery'];
        const type = collateralTypes[Math.floor(Math.random() * collateralTypes.length)];
        
        loan.collateral = {
          type,
          description: `${type} - ${['New', 'Used', 'Excellent condition', 'Good condition'][Math.floor(Math.random() * 4)]}`,
          value: Math.floor(requestedAmount * (Math.random() + 1)), // 100% to 200% of requested amount
          ownership: Math.random() > 0.7 ? 'Joint' : 'Sole'
        };
      }
    }
    
    loans.push(loan);
  }
  
  return loans;
}

// Generate repayments for active loans
function generateRepayments(loans) {
  const repayments = [];
  let repaymentId = 1;
  
  loans.forEach(loan => {
    if (['active', 'completed'].includes(loan.status) && loan.disbursedDate) {
      const startDate = new Date(loan.startDate);
      const today = new Date();
      
      // Determine how many EMIs have passed since loan start
      const monthsPassed = Math.min(
        loan.period,
        Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30)) + 1
      );
      
      for (let i = 1; i <= monthsPassed; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i - 1);
        
        // Determine if this EMI is paid, pending, or overdue
        let status = 'pending';
        let paidAmount = undefined;
        let balance = loan.emi;
        let paymentDate = undefined;
        let paymentMode = undefined;
        
        // For completed loans, all EMIs are paid
        if (loan.status === 'completed') {
          status = 'paid';
          paidAmount = loan.emi;
          balance = 0;
          paymentDate = formatDate(new Date(dueDate.getTime() + 1000 * 60 * 60 * 24 * Math.floor(Math.random() * 5))).split('T')[0]; // 0-5 days after due date
          paymentMode = ['cash', 'online', 'cheque'][Math.floor(Math.random() * 3)];
        } 
        // For active loans, EMIs before today might be paid or overdue
        else if (dueDate < today) {
          // 80% chance of being paid
          if (Math.random() < 0.8) {
            status = 'paid';
            paidAmount = loan.emi;
            balance = 0;
            paymentDate = formatDate(new Date(dueDate.getTime() + 1000 * 60 * 60 * 24 * Math.floor(Math.random() * 5))).split('T')[0]; // 0-5 days after due date
            paymentMode = ['cash', 'online', 'cheque'][Math.floor(Math.random() * 3)];
          } else {
            // Overdue payment (still has 'pending' status)
            // Will be displayed as overdue in the UI based on due date
          }
        }
        // Future EMIs are always pending
        
        repayments.push({
          id: `R${repaymentId++}`,
          loanId: loan.id,
          emiNo: i,
          dueDate: formatDate(dueDate).split('T')[0],
          amount: loan.emi,
          paidAmount,
          balance,
          paymentDate,
          paymentMode,
          status
        });
      }
    }
  });
  
  return repayments;
}

// Generate email contacts from customers
function generateEmailContacts(customers) {
  const emailContacts = [];
  
  customers.forEach((customer, index) => {
    if (customer.email) {
      const syncStatus = ['pending', 'synced', 'failed'][Math.floor(Math.random() * 3)];
      const isSubscribed = Math.random() > 0.2; // 80% chance of being subscribed
      
      const tags = ['customer'];
      if (Math.random() > 0.5) tags.push('active');
      if (Math.random() > 0.7) tags.push('premium');
      if (index % 5 === 0) tags.push('vip');
      
      emailContacts.push({
        id: `EC${index + 1}`,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        source: 'customer_registration',
        customerId: customer.id,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        syncStatus,
        lastSyncedAt: syncStatus === 'synced' ? formatDate(new Date()) : undefined,
        tags,
        isSubscribed
      });
    }
  });
  
  return emailContacts;
}

// Main function to generate and save all data
function generateAndSaveData() {
  try {
    // Load existing data from localStorage
    let existingData = {};
    try {
      const customers = localStorage.getItem('lms_customers');
      const loans = localStorage.getItem('lms_loans');
      const repayments = localStorage.getItem('lms_repayments');
      const emailContacts = localStorage.getItem('lms_email_contacts');
      
      if (customers) existingData.customers = JSON.parse(customers);
      if (loans) existingData.loans = JSON.parse(loans);
      if (repayments) existingData.repayments = JSON.parse(repayments);
      if (emailContacts) existingData.emailContacts = JSON.parse(emailContacts);
    } catch (e) {
      console.error('Error loading existing data:', e);
    }
    
    // Generate new data
    const customers = generateCustomers();
    const loans = generateLoans(customers);
    const repayments = generateRepayments(loans);
    const emailContacts = generateEmailContacts(customers);
    
    // Combine with existing data if needed
    const finalData = {
      customers: [...(existingData.customers || []), ...customers],
      loans: [...(existingData.loans || []), ...loans],
      repayments: [...(existingData.repayments || []), ...repayments],
      emailContacts: [...(existingData.emailContacts || []), ...emailContacts]
    };
    
    // Save to files for reference
    fs.writeFileSync('dummy_customers.json', JSON.stringify(customers, null, 2));
    fs.writeFileSync('dummy_loans.json', JSON.stringify(loans, null, 2));
    fs.writeFileSync('dummy_repayments.json', JSON.stringify(repayments, null, 2));
    fs.writeFileSync('dummy_email_contacts.json', JSON.stringify(emailContacts, null, 2));
    
    console.log(`Generated ${customers.length} customers, ${loans.length} loans, ${repayments.length} repayments, and ${emailContacts.length} email contacts.`);
    console.log('Data saved to JSON files for reference.');
    console.log('To load this data into the application, copy the contents of these files into localStorage.');
    
    return finalData;
  } catch (error) {
    console.error('Error generating data:', error);
    return null;
  }
}

// Execute the function
const generatedData = generateAndSaveData();
console.log('Data generation complete!');