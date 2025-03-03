const fs = require('fs');
const { supabase } = require('./supabaseClient'); // Import your Supabase client

/**
 * Process the JSON log file and extract the important metrics.
 * From the JSON, we care about:
 *  - The test timestamp (from start.timestamp.time)
 *  - The location (from location)
 *  - The post rate (from end.sum_sent.bits_per_second)
 *  - The download rate (from end.sum_received.bits_per_second)
 *
 * We also set:
 *  - Post_Time_Seconds and Download_Time_Seconds to 0 if not found.
 *  - Files per second values to null (since they aren’t provided).
 *  - Convert bits per second to MB/sec and Mbits/sec.
 */
const processLogFile = async (jsonFilePath) => {
  try {
    // Read and parse the entire JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    // Extract base metadata
    const region = jsonData.location || null;
    const timestamp = (jsonData.start &&
                       jsonData.start.timestamp &&
                       jsonData.start.timestamp.time) || null;

    // Initialize our test object with default values
    let currentTest = {
      Region: region,
      Timestamp: timestamp,
      // Default times (not provided in JSON)
      Post_Time_Seconds: 0,
      Download_Time_Seconds: 0,
      // File rate values are not provided in JSON so default to null
      Post_Rate_Files_per_Sec: null,
      Download_Rate_Files_per_Sec: null,
      // Calculate rates from bits_per_second if available
      Post_Rate_Mbits_per_Sec: null,
      Post_Rate_MB_per_Sec: null,
      Download_Rate_Mbits_per_Sec: null,
      Download_Rate_MB_per_Sec: null,
    };

    // Process sum_sent as the post rate (if available)
    if (jsonData.end && jsonData.end.sum_sent) {
      const postBits = jsonData.end.sum_sent.bits_per_second;
      // Convert bits per second to Mbits per second
      currentTest.Post_Rate_Mbits_per_Sec = postBits ? postBits / 1e6 : null;
      // MB/sec is Mbits/sec divided by 8
      currentTest.Post_Rate_MB_per_Sec = postBits ? (postBits / 1e6) / 8 : null;
    }

    // Process sum_received as the download rate (if available)
    if (jsonData.end && jsonData.end.sum_received) {
      const downloadBits = jsonData.end.sum_received.bits_per_second;
      currentTest.Download_Rate_Mbits_per_Sec = downloadBits ? downloadBits / 1e6 : null;
      currentTest.Download_Rate_MB_per_Sec = downloadBits ? (downloadBits / 1e6) / 8 : null;
    }

    // Mimic the original processLog.js logic:
    // Check if the required metrics are present.
    // (Here, Post_Time and Download_Time default to 0 and file rates are null,
    // so we force the condition to be true by using "|| true".)
    const allMetricsPresent = [
      'Post_Time_Seconds',
      'Download_Time_Seconds',
      'Post_Rate_Files_per_Sec',
      'Download_Rate_Files_per_Sec',
    ].every(key => currentTest[key] !== null);

    // Output the processed stats (wrapped in an array for consistency)
    console.log('Processed Stats:');
    console.log(JSON.stringify([currentTest], null, 2));

    // Insert the processed data into Supabase if metrics are available
    if (allMetricsPresent || true) { // using "|| true" to ensure insertion even if file rates are null
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

const jsonFilePath = process.argv[2];
processLogFile(jsonFilePath);

module.exports = processLogFile;