import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export const loadCsvData = async () => {
  const filePath = path.join(process.cwd(), 'NetworkSpeed.csv'); // No 'public' directory
  const csvFile = fs.readFileSync(filePath, 'utf-8');

  return new Promise((resolve) => {
    Papa.parse(csvFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data);
      },
    });
  });
};