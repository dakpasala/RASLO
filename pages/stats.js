import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import ReactSpeedometer from 'react-d3-speedometer';
import {
  Chart,
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { loadCsvData } from '../utils/loadCsv';

// Register Chart.js elements
Chart.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StatsPage({ locations, statsByRegion }) {
  const [currentRegion, setCurrentRegion] = useState(locations[0]); // Default to the first location
  const [currentStats, setCurrentStats] = useState(statsByRegion[locations[0]]);
  const [uploadMessage, setUploadMessage] = useState(''); // Message to display upload status

  useEffect(() => {
    setCurrentStats(statsByRegion[currentRegion]);
  }, [currentRegion, statsByRegion]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.log')) {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('/api/upload-log', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const result = await response.json();
          setUploadMessage(result.message);
  
          // Re-fetch updated data without reloading
          const updatedResponse = await fetch('/api/get-stats');
          const updatedData = await updatedResponse.json();
  
          setCurrentStats(updatedData[currentRegion]);
          console.log('Updated Stats:', updatedData);
        } else {
          const result = await response.json();
          setUploadMessage(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadMessage('An error occurred. Please try again.');
      }
    } else {
      setUploadMessage('Please upload a valid .log file.');
    }
  };  

  // Data for Doughnut Chart
  const rateChartData = {
    labels: ['Average Post Rate', 'Average Download Rate'],
    datasets: [
      {
        data: [
          currentStats?.averagePostRate || 0,
          currentStats?.averageDownloadRate || 0,
        ],
        backgroundColor: ['#4CAF50', '#FF5722'],
      },
    ],
  };

  // Data for Line Chart (Trends over time for MB/sec)
  const lineChartDataRates = {
    labels: currentStats?.timestamps || [],
    datasets: [
      {
        label: 'Post Rate MB/sec',
        data: currentStats?.postRatesMB || [],
        borderColor: '#4CAF50',
        fill: false,
      },
      {
        label: 'Download Rate MB/sec',
        data: currentStats?.downloadRatesMB || [],
        borderColor: '#FF5722',
        fill: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">WiFi Speed Dashboard</h1>

      {/* Location Selection Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.keys(statsByRegion).map((region) => (
          <button
            key={region}
            onClick={() => setCurrentRegion(region)}
            className={`px-4 py-2 rounded ${
              region === currentRegion ? 'bg-blue-600' : 'bg-gray-800'
            } text-white hover:bg-blue-500`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Add Data Button */}
      <div className="mb-6">
        <input
          type="file"
          name="file" // <-- This ensures the field name matches the backend
          accept=".log"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        {uploadMessage && <p className="mt-2 text-green-500">{uploadMessage}</p>}
      </div>

      <h2 className="text-2xl font-bold mb-4">Region: {currentRegion}</h2>

      {/* Speedometers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold text-center mb-4">Post Rate (MB/s)</h2>
          <ReactSpeedometer
            maxValue={100}
            value={currentStats?.averagePostRate || 0}
            segments={10}
            needleColor="#4CAF50"
            startColor="#FF5722"
            endColor="#4CAF50"
            height={200}
          />
        </div>
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold text-center mb-4">Download Rate (MB/s)</h2>
          <ReactSpeedometer
            maxValue={100}
            value={currentStats?.averageDownloadRate || 0}
            segments={10}
            needleColor="#FF5722"
            startColor="#FF5722"
            endColor="#4CAF50"
            height={200}
          />
        </div>
      </div>

      {/* Doughnut Chart */}
      <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
        <h2 className="text-xl font-semibold">Download vs. Post Rate Comparison</h2>
        <Doughnut data={rateChartData} />
      </div>

      {/* Line Chart */}
      <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800 mt-6">
        <h2 className="text-xl font-semibold">Post and Download Rates Over Time</h2>
        <Line data={lineChartDataRates} />
      </div>
    </div>
  );
}

export async function getStaticProps() {
  let stats = [];

  try {
    stats = await loadCsvData();
  } catch (error) {
    console.error('Failed to load data from Supabase:', error.message);
  }

  // Group data by Region
  const statsByRegion = stats.reduce((acc, entry) => {
    const region = entry.Region || 'Unknown'; // Handle undefined Region values
    if (!acc[region]) {
      acc[region] = {
        timestamps: [],
        averagePostRate: 0,
        averageDownloadRate: 0,
        postRatesMB: [],
        downloadRatesMB: [],
      };
    }
    acc[region].timestamps.push(entry.Timestamp || null);
    acc[region].postRatesMB.push(entry.Post_Rate_MB_per_Sec || 0);
    acc[region].downloadRatesMB.push(entry.Download_Rate_MB_per_Sec || 0);
    acc[region].averagePostRate =
      acc[region].postRatesMB.reduce((a, b) => a + b, 0) / acc[region].postRatesMB.length;
    acc[region].averageDownloadRate =
      acc[region].downloadRatesMB.reduce((a, b) => a + b, 0) / acc[region].downloadRatesMB.length;
    return acc;
  }, {});

  return {
    props: {
      locations: Object.keys(statsByRegion),
      statsByRegion,
    },
  };
}
