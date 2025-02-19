// Import necessary React hooks and visualization components
import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import ReactSpeedometer from 'react-d3-speedometer';
import { rasloLogo } from '../public/raslo.png';

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
import { MetricsTable } from '../components/MetricsTable'; // Component for displaying metrics in tabular format

console.log('Image source:', rasloLogo);


// Register required Chart.js components for visualization
Chart.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// Main StatsPage component that displays WiFi speed statistics
export default function StatsPage({ locations, statsByRegion }) {
  // State management for various component features
  const [currentRegion, setCurrentRegion] = useState(locations[0]); // Track selected region
  const [currentStats, setCurrentStats] = useState(statsByRegion[locations[0]]); // Store stats for current region
  const [uploadMessage, setUploadMessage] = useState(''); // Feedback message for file uploads
  const [filteredStats, setFilteredStats] = useState({}); // Stats filtered by time range
  const [timeRange, setTimeRange] = useState('all'); // Selected time period filter

  // Update current stats when region changes
  useEffect(() => {
    setCurrentStats(statsByRegion[currentRegion]);
  }, [currentRegion, statsByRegion]);

  // Filter stats when time range or current stats change
  useEffect(() => {
    if (currentStats) {
      filterStatsByTimeRange();
    }
  }, [currentStats, timeRange]);

  // Function to filter statistics based on selected time range
  const filterStatsByTimeRange = () => {
    const now = new Date();
    const filteredData = {
      timestamps: [],
      postRatesMB: [],
      downloadRatesMB: [],
    };

    // Iterate through timestamps and filter based on selected time range
    currentStats.timestamps.forEach((timestamp, index) => {
      const date = new Date(timestamp);

      // Apply different date filters based on selected time range
      if (
        (timeRange === 'today' && date.toDateString() === now.toDateString()) ||
        (timeRange === 'week' &&
          date > new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)) ||
        (timeRange === 'month' &&
          date > new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())) ||
        timeRange === 'all'
      ) {
        filteredData.timestamps.push(timestamp);
        filteredData.postRatesMB.push(currentStats.postRatesMB[index]);
        filteredData.downloadRatesMB.push(currentStats.downloadRatesMB[index]);
      }
    });

    setFilteredStats(filteredData);
  };

  // Handle log file upload and processing
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.log')) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Send file to server for processing
        const response = await fetch('/api/upload-log', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUploadMessage(result.message);

          // Refresh page to show updated data
          window.location.reload();
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

  // Prepare data for the doughnut chart comparing average rates
  const rateChartData = {
    labels: ['Average Post Rate', 'Average Download Rate'],
    datasets: [
      {
        data: [
          // Calculate averages for post and download rates
          filteredStats.postRatesMB?.reduce((a, b) => a + b, 0) /
            (filteredStats.postRatesMB?.length || 1) || 0,
          filteredStats.downloadRatesMB?.reduce((a, b) => a + b, 0) /
            (filteredStats.downloadRatesMB?.length || 1) || 0,
        ],
        backgroundColor: ['#4CAF50', '#FF5722'],
      },
    ],
  };

  // Prepare data for the line chart showing rate trends over time
  const lineChartDataRates = {
    labels: filteredStats.timestamps || [],
    datasets: [
      {
        label: 'Post Rate MB/sec',
        data: filteredStats.postRatesMB || [],
        borderColor: '#4CAF50',
        fill: false,
      },
      {
        label: 'Download Rate MB/sec',
        data: filteredStats.downloadRatesMB || [],
        borderColor: '#FF5722',
        fill: false,
      },
    ],
  };

  // Component UI rendering
  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/*raslo image */}
      <img
        src='./raslo.png' // Replace this with "/raslo.png" if using the public folder
        alt="RASLO Logo"
        className="absolute top-5 right-5" // Positions the image at the top-right corner
        style={{
          width: 'auto',  // Maintain the aspect ratio of the image
          height: '200px', // Set the height (adjust this value as needed)
          objectFit: 'contain', // Ensures the image doesn't stretch
        }}
      />


      <h1 className="text-3xl font-bold mb-6">WiFi Speed Dashboard</h1>

      {/* Region selection buttons */}
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

      {/* Time range filter buttons */}
      <div className="flex gap-4 mb-6">
        {['today', 'week', 'month', 'all'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded ${
              range === timeRange ? 'bg-blue-600' : 'bg-gray-800'
            } text-white hover:bg-blue-500`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* File upload section */}
      <div className="mb-6">
        <input
          type="file"
          name="file"
          accept=".log"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        {uploadMessage && <p className="mt-2 text-green-500">{uploadMessage}</p>}
      </div>

      <h2 className="text-2xl font-bold mb-4">Region: {currentRegion}</h2>

      {/* Metrics table section */}
      <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800 mt-6">
        <h2 className="text-xl font-semibold mb-4">
          Detailed Metrics Table ({timeRange})
        </h2>
        <MetricsTable
          data={
            filteredStats.timestamps?.map((timestamp, index) => ({
              Timestamp: timestamp,
              PostRate: filteredStats.postRatesMB[index],
              DownloadRate: filteredStats.downloadRatesMB[index],
            })) || []
          }
        />
      </div>

      {/* Speedometers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold text-center mb-4">Post Rate (MB/s)</h2>
          <ReactSpeedometer
            maxValue={100}
            value={
              filteredStats.postRatesMB?.reduce((a, b) => a + b, 0) /
                (filteredStats.postRatesMB?.length || 1) || 0
            }
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
            value={
              filteredStats.downloadRatesMB?.reduce((a, b) => a + b, 0) /
                (filteredStats.downloadRatesMB?.length || 1) || 0
            }
            segments={10}
            needleColor="#FF5722"
            startColor="#FF5722"
            endColor="#4CAF50"
            height={200}
          />
        </div>
      </div>

      {/* Doughnut chart section */}
      <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
        <h2 className="text-xl font-semibold">Download vs. Post Rate Comparison</h2>
        <div className="w-1/2 mx-auto">
          <Doughnut
            data={{
              ...rateChartData,
              datasets: [
                {
                  ...rateChartData.datasets[0],
                  backgroundColor: ['#1E90FF', '#8B0000'], // Blue for Post Rate, Red for Download Rate
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Line chart section */}
      <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800 mt-6">
        <h2 className="text-xl font-semibold">Post and Download Rates Over Time</h2>
        <Line
          data={{
            ...lineChartDataRates,
            datasets: [
              {
                ...lineChartDataRates.datasets[0],
                borderColor: '#1E90FF', // Blue for Post Rate
              },
              {
                ...lineChartDataRates.datasets[1],
                borderColor: '#8B0000', // Red for Download Rate
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

// Server-side data fetching function
export async function getServerSideProps() {
  const stats = await loadCsvData();

  // Process and group data by region
  const statsByRegion = stats.reduce((acc, entry) => {
    const region = entry.Region || "Unknown"; // Default to 'Unknown' if region is undefined
    if (!acc[region]) {
      acc[region] = {
        timestamps: [],
        postRatesMB: [],
        downloadRatesMB: [],
      };
    }
    acc[region].timestamps.push(entry.Timestamp || null);
    acc[region].postRatesMB.push(entry.Post_Rate_MB_per_Sec || 0);
    acc[region].downloadRatesMB.push(entry.Download_Rate_MB_per_Sec || 0);
    return acc;
  }, {});

  return {
    props: {
      locations: Object.keys(statsByRegion),
      statsByRegion,
    },
  };
}