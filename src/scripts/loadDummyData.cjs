// Script to load dummy data into localStorage
const fs = require('fs');

function loadDummyData() {
  try {
    // Read the generated JSON files
    const customers = JSON.parse(fs.readFileSync('dummy_customers.json', 'utf8'));
    const loans = JSON.parse(fs.readFileSync('dummy_loans.json', 'utf8'));
    const repayments = JSON.parse(fs.readFileSync('dummy_repayments.json', 'utf8'));
    const emailContacts = JSON.parse(fs.readFileSync('dummy_email_contacts.json', 'utf8'));
    
    // Prepare data for localStorage
    const localStorageData = {
      lms_customers: JSON.stringify(customers),
      lms_loans: JSON.stringify(loans),
      lms_repayments: JSON.stringify(repayments),
      lms_email_contacts: JSON.stringify(emailContacts)
    };
    
    // Output the localStorage commands
    console.log('Copy and paste the following commands in your browser console:');
    console.log('');
    
    Object.entries(localStorageData).forEach(([key, value]) => {
      console.log(`localStorage.setItem('${key}', '${value.replace(/'/g, "\\'")}');`);
    });
    
    console.log('');
    console.log('After pasting, refresh the page to see the dummy data in the application.');
    
    // Also save a single file with all localStorage commands for easier copying
    const commands = Object.entries(localStorageData)
      .map(([key, value]) => `localStorage.setItem('${key}', '${value.replace(/'/g, "\\'")}');`)
      .join('\n');
    
    fs.writeFileSync('load_to_localstorage.js', commands);
    console.log('Commands also saved to load_to_localstorage.js');
    
  } catch (error) {
    console.error('Error loading dummy data:', error);
  }
}

// Check if the dummy data files exist
if (!fs.existsSync('dummy_customers.json')) {
  console.error('Dummy data files not found. Please run generateDummyData.js first.');
  process.exit(1);
}

loadDummyData();