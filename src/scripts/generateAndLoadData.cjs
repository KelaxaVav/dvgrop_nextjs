// Combined script to generate and load dummy data
const { exec } = require('child_process');

console.log('Generating dummy data...');
exec('node src/scripts/generateDummyData.cjs', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error generating data: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  console.log('Loading dummy data...');
  
  exec('node src/scripts/loadDummyData.cjs', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error loading data: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    
    console.log(stdout);
    console.log('Process complete!');
  });
});