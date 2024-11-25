import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export const loadCsvData = async () => {
  const filePath = path.join(process.cwd(), 'NetworkSpeed.csv'); // Path to your CSV file
  const csvFile = fs.readFileSync(filePath, 'utf-8');

  return new Promise((resolve) => {
    Papa.parse(csvFile, {
      header: true,
      dynamicTyping: true, // Automatically converts numeric strings to numbers
      complete: (results) => {
        // Process and clean the parsed data
        const cleanedData = results.data.map((row) => ({
          Region: row.Region,
          Timestamp: row.Timestamp,
          Post_Time_Seconds: parseFloat(row.Post_Time_Seconds) || 0,
          Download_Time_Seconds: parseFloat(row.Download_Time_Seconds) || 0,
          Post_Rate_Files_per_Sec: parseFloat(row.Post_Rate_Files_per_Sec) || 0,
          Download_Rate_Files_per_Sec: parseFloat(row.Download_Rate_Files_per_Sec) || 0,
          Post_Rate_MB_per_Sec: parseFloat(row.Post_Rate_MB_per_Sec) || 0,
          Post_Rate_Mbits_per_Sec: parseFloat(row.Post_Rate_Mbits_per_Sec) || 0,
          Download_Rate_MB_per_Sec: parseFloat(row.Download_Rate_MB_per_Sec) || 0,
          Download_Rate_Mbits_per_Sec: parseFloat(row.Download_Rate_Mbits_per_Sec) || 0,
        }));
        resolve(cleanedData);
      },
    });
  });
};