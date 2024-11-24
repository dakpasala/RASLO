const fs = require('fs');
const readline = require('readline');
const path = require('path');

const processLogFile = async (logFilePath) => {
  // Path to the output CSV file
  const outputCsvPath = path.join(process.cwd(), 'NetworkSpeed.csv');

  // Initialize list to store consolidated data
  let testData = [];

  // Regular expressions to extract data
  const regionPattern = /==========Beginning test to (.+?) Database==========/;
  const timestampPattern = /\w+,\s\w+\s\d+,\s\d+\s[\d:]+(?:\s[A|P]M)?/;
  const postTimePattern = /Seconds to Post File: ([\d.]+)s/;
  const downloadTimePattern = /Seconds to Download File: ([\d.]+)s/;
  const postRatePatternFiles = /Post Directory rate: ([\d.]+) files\/sec/;
  const downloadRatePatternFiles = /Download Directory rate: ([\d.]+) files\/sec/;
  const mbMbitsPattern = /([\d.]+) MB\/sec, ([\d.]+) Mbits\/sec/;

  // Initialize an empty object for the current test metrics
  let currentTest = {
    Region: null,
    Timestamp: null,
    Post_Time_Seconds: null,
    Download_Time_Seconds: null,
    Post_Rate_Files_per_Sec: null,
    Download_Rate_Files_per_Sec: null,
    Post_Rate_MB_per_Sec: null,
    Post_Rate_Mbits_per_Sec: null,
    Download_Rate_MB_per_Sec: null,
    Download_Rate_Mbits_per_Sec: null,
  };

  // Function to save the current test entry if it has at least one metric
  function saveCurrentTest() {
    const hasMetrics = [
      'Post_Time_Seconds',
      'Download_Time_Seconds',
      'Post_Rate_Files_per_Sec',
      'Download_Rate_Files_per_Sec',
      'Post_Rate_MB_per_Sec',
      'Post_Rate_Mbits_per_Sec',
      'Download_Rate_MB_per_Sec',
      'Download_Rate_Mbits_per_Sec',
    ].some((key) => currentTest[key] !== null);
    if (hasMetrics) {
      // Append a copy of current test to testData to avoid overwriting issues
      testData.push({ ...currentTest });
    }
  }

  // Function to escape CSV values
  function escapeCsvValue(value) {
    if (value == null) return '';
    const strValue = value.toString();
    if (/[",\r\n]/.test(strValue)) {
      // Escape double quotes by replacing " with ""
      const escaped = strValue.replace(/"/g, '""');
      return `"${escaped}"`;
    } else {
      return strValue;
    }
  }

  // Read through the log file and collect data
  const rl = readline.createInterface({
    input: fs.createReadStream(logFilePath),
    crlfDelay: Infinity,
  });

  const lines = []; // To keep track of lines for lookahead
  rl.on('line', (line) => {
    lines.push(line);
  }).on('close', () => {
    // Process the lines array
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Extract region information
      const regionMatch = line.match(regionPattern);
      if (regionMatch) {
        currentTest.Region = regionMatch[1].trim();
      }

      // Extract timestamp
      const timestampMatch = line.match(timestampPattern);
      if (timestampMatch) {
        const timestamp = timestampMatch[0];
        // If a new timestamp appears, save the current test if it has valid metrics, then reset for a new one
        if (currentTest.Timestamp && currentTest.Timestamp !== timestamp) {
          saveCurrentTest(); // Save the current test entry
          // Reset for the next test with new timestamp
          currentTest = {
            Region: currentTest.Region,
            Timestamp: timestamp,
            Post_Time_Seconds: null,
            Download_Time_Seconds: null,
            Post_Rate_Files_per_Sec: null,
            Download_Rate_Files_per_Sec: null,
            Post_Rate_MB_per_Sec: null,
            Post_Rate_Mbits_per_Sec: null,
            Download_Rate_MB_per_Sec: null,
            Download_Rate_Mbits_per_Sec: null,
          };
        }
        currentTest.Timestamp = timestamp;
      }

      // Extract metrics and update current test data
      const postTimeMatch = line.match(postTimePattern);
      const downloadTimeMatch = line.match(downloadTimePattern);
      const postRateMatchFiles = line.match(postRatePatternFiles);
      const downloadRateMatchFiles = line.match(downloadRatePatternFiles);

      if (postTimeMatch) {
        currentTest.Post_Time_Seconds = parseFloat(postTimeMatch[1]);
      }
      if (downloadTimeMatch) {
        currentTest.Download_Time_Seconds = parseFloat(downloadTimeMatch[1]);
      }
      if (postRateMatchFiles) {
        currentTest.Post_Rate_Files_per_Sec = parseFloat(postRateMatchFiles[1]);
        // Look for MB/sec and Mbits/sec on the next line
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        const mbMbitsMatch = nextLine.match(mbMbitsPattern);
        if (mbMbitsMatch) {
          currentTest.Post_Rate_MB_per_Sec = parseFloat(mbMbitsMatch[1]);
          currentTest.Post_Rate_Mbits_per_Sec = parseFloat(mbMbitsMatch[2]);
          i++; // Skip the next line since we've processed it
        }
      }
      if (downloadRateMatchFiles) {
        currentTest.Download_Rate_Files_per_Sec = parseFloat(downloadRateMatchFiles[1]);
        // Look for MB/sec and Mbits/sec on the next line
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        const mbMbitsMatch = nextLine.match(mbMbitsPattern);
        if (mbMbitsMatch) {
          currentTest.Download_Rate_MB_per_Sec = parseFloat(mbMbitsMatch[1]);
          currentTest.Download_Rate_Mbits_per_Sec = parseFloat(mbMbitsMatch[2]);
          i++; // Skip the next line since we've processed it
        }
      }

      // After each complete set of data, save it and reset the current test for the next data
      const allMetricsPresent = [
        'Post_Time_Seconds',
        'Download_Time_Seconds',
        'Post_Rate_Files_per_Sec',
        'Download_Rate_Files_per_Sec',
      ].every((key) => currentTest[key] !== null);
      if (allMetricsPresent) {
        saveCurrentTest();
        // Reset only metrics, keeping Region and Timestamp for further entries with the same timestamp
        currentTest.Post_Time_Seconds = null;
        currentTest.Download_Time_Seconds = null;
        currentTest.Post_Rate_Files_per_Sec = null;
        currentTest.Download_Rate_Files_per_Sec = null;
        currentTest.Post_Rate_MB_per_Sec = null;
        currentTest.Post_Rate_Mbits_per_Sec = null;
        currentTest.Download_Rate_MB_per_Sec = null;
        currentTest.Download_Rate_Mbits_per_Sec = null;
      }
    }

    // Append the final test's data if it has values
    saveCurrentTest();

    // Convert the testData array to CSV format
    const columns = [
      'Region',
      'Timestamp',
      'Post_Time_Seconds',
      'Download_Time_Seconds',
      'Post_Rate_Files_per_Sec',
      'Download_Rate_Files_per_Sec',
      'Post_Rate_MB_per_Sec',
      'Post_Rate_Mbits_per_Sec',
      'Download_Rate_MB_per_Sec',
      'Download_Rate_Mbits_per_Sec',
    ];

    // Build CSV header if the file is empty or doesn't exist
    let csvContent = '';
    const fileExists = fs.existsSync(outputCsvPath);
    if (!fileExists || fs.statSync(outputCsvPath).size === 0) {
      csvContent += columns.join(',') + '\n';
    }

    // Append data rows
    testData.forEach((data) => {
      const row = columns.map((col) => escapeCsvValue(data[col])).join(',');
      csvContent += row + '\n';
    });

    // Append the data to the CSV file
    fs.appendFile(outputCsvPath, csvContent, (err) => {
      if (err) {
        console.error(`Error appending data to CSV: ${err}`);
      } else {
        console.log(`Data has been appended to ${outputCsvPath}`);
      }
    });
  });
};

module.exports = processLogFile;
