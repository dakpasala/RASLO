const fs = require('fs');
const { supabase } = require('./supabaseClient'); // Import your Supabase client

/**
 * Process the JSON log file and extract the important metrics.
 * 
 * Features:
 *  - Convert location to Title Case (lowercase + uppercase first letters).
 *  - Convert timestamp to PST.
 *  - Convert bits per second to Mbits and MB per second (MB = Mbits / 8), rounded to 3 decimals.
 */
const processLogFile = async (jsonFilePath) => {
  try {
    // Read and parse the entire JSON file
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    // 1) Safely extract and normalize the location
    let rawLocation = jsonData.location || '';
    let normalizedLocation = rawLocation
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // 2) Convert the timestamp to PST
    let timeStamp = jsonData?.start?.timestamp?.time || null;
    let pstDateString = null;
    if (timeStamp) {
      const date = new Date(timeStamp);
      // Convert to Pacific Standard Time
      pstDateString = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    }

    // 3) Prepare the base metrics object
    let currentTest = {
      Region: normalizedLocation || null,
      Timestamp: pstDateString,
      Post_Time_Seconds: 0,           // Default if not provided
      Download_Time_Seconds: 0,       // Default if not provided
      Post_Rate_Files_per_Sec: null,  // Not provided in JSON
      Download_Rate_Files_per_Sec: null, // Not provided in JSON
      Post_Rate_Mbits_per_Sec: null,
      Post_Rate_MB_per_Sec: null,
      Download_Rate_Mbits_per_Sec: null,
      Download_Rate_MB_per_Sec: null,
    };

    // 4) Extract upload bits/sec and convert to Mbits and MB (rounded to 3 decimals)
    if (jsonData.end && jsonData.end.sum_sent) {
      const uploadBps = jsonData.end.sum_sent.bits_per_second;
      if (typeof uploadBps === 'number') {
        const uploadMbps = parseFloat((uploadBps / 1e6).toFixed(3)); // Round to 3 decimals
        const uploadMBps = parseFloat((uploadMbps / 8).toFixed(3));  // Round to 3 decimals
        currentTest.Post_Rate_Mbits_per_Sec = uploadMbps;
        currentTest.Post_Rate_MB_per_Sec = uploadMBps;
      }
    }

    // 5) Extract download bits/sec and convert to Mbits and MB (rounded to 3 decimals)
    if (jsonData.end && jsonData.end.sum_received) {
      const downloadBps = jsonData.end.sum_received.bits_per_second;
      if (typeof downloadBps === 'number') {
        const downloadMbps = parseFloat((downloadBps / 1e6).toFixed(3)); // Round to 3 decimals
        const downloadMBps = parseFloat((downloadMbps / 8).toFixed(3));  // Round to 3 decimals
        currentTest.Download_Rate_Mbits_per_Sec = downloadMbps;
        currentTest.Download_Rate_MB_per_Sec = downloadMBps;
      }
    }

    // Mimic the original logic for checking required metrics
    const allMetricsPresent = [
      'Post_Time_Seconds',
      'Download_Time_Seconds',
      'Post_Rate_Files_per_Sec',
      'Download_Rate_Files_per_Sec',
    ].every((key) => currentTest[key] !== null);

    // Output the processed stats for debugging
    console.log('Processed Stats:');
    console.log(JSON.stringify([currentTest], null, 2));

    // Insert into Supabase (force insertion with "|| true")
    if (allMetricsPresent || true) {
      const { data, error } = await supabase.from('speeds').insert([currentTest]);
      if (error) {
        console.error('Error inserting data into Supabase:', error);
      } else {
        console.log('Data successfully inserted into Supabase:', data);
      }
    } else {
      console.warn('Required metrics missing. No data inserted into Supabase.');
    }
  } catch (error) {
    console.error('Error processing JSON log:', error);
  }
};

// Allow running from CLI (node processLogFile.js <jsonFilePath>)
const jsonFilePath = process.argv[2];
if (jsonFilePath) {
  processLogFile(jsonFilePath);
}

module.exports = processLogFile;
