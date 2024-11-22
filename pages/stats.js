import { useEffect, useState } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import ReactSpeedometer from 'react-d3-speedometer';
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { loadCsvData } from '../utils/loadCsv';

// Register Chart.js elements
Chart.register(ArcElement, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StatsPage({ locations, statsByRegion }) {
  const [currentRegion, setCurrentRegion] = useState(locations[0]); // Default to the first location
  const [currentStats, setCurrentStats] = useState(statsByRegion[locations[0]]);

  useEffect(() => {
    setCurrentStats(statsByRegion[currentRegion]);
  }, [currentRegion, statsByRegion]);

  // Data for Doughnut Chart
  const rateChartData = {
    labels: ['Average Post Rate', 'Average Download Rate'],
    datasets: [
      {
        data: [
          currentStats.averagePostRateFilesPerSec || 0,
          currentStats.averageDownloadRateFilesPerSec || 0,
        ],
        backgroundColor: ['#4CAF50', '#FF5722'],
      },
    ],
  };

  // Data for Line Chart (Trends over time for MB/sec and Mbits/sec)
  const lineChartDataRates = {
    labels: currentStats.timestamps || [],
    datasets: [
      {
        label: 'Post Rate MB/sec',
        data: currentStats.postRatesMB || [],
        borderColor: '#4CAF50',
        fill: false,
      },
      {
        label: 'Download Rate MB/sec',
        data: currentStats.downloadRatesMB || [],
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
        {locations.map((region) => (
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

      <h2 className="text-2xl font-bold mb-4">Region: {currentRegion}</h2>

      {/* Speedometers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold text-center mb-4">Post Rate (MB/s)</h2>
          <ReactSpeedometer
            maxValue={100}
            value={currentStats.averagePostRateMBPerSec || 0}
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
            value={currentStats.averageDownloadRateMBPerSec || 0}
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
  const stats = await loadCsvData();

  // Group data by Region
  const statsByRegion = stats.reduce((acc, entry) => {
    const region = entry.Region || 'Unknown'; // Handle undefined Region values
    if (!acc[region]) {
      acc[region] = {
        timestamps: [],
        postTimes: [],
        downloadTimes: [],
        postRatesMB: [],
        downloadRatesMB: [],
        averagePostRateFilesPerSec: 0,
        averageDownloadRateFilesPerSec: 0,
        averagePostRateMBPerSec: 0,
        averageDownloadRateMBPerSec: 0,
      };
    }
    acc[region].timestamps.push(entry.Timestamp || null);
    acc[region].postTimes.push(entry.Post_Time_Seconds || 0);
    acc[region].downloadTimes.push(entry.Download_Time_Seconds || 0);
    acc[region].postRatesMB.push(entry.Post_Rate_MB_per_Sec || 0);
    acc[region].downloadRatesMB.push(entry.Download_Rate_MB_per_Sec || 0);

    // Calculate averages on the fly
    acc[region].averagePostRateFilesPerSec += entry.Post_Rate_Files_per_Sec || 0;
    acc[region].averageDownloadRateFilesPerSec += entry.Download_Rate_Files_per_Sec || 0;
    acc[region].averagePostRateMBPerSec += entry.Post_Rate_MB_per_Sec || 0;
    acc[region].averageDownloadRateMBPerSec += entry.Download_Rate_MB_per_Sec || 0;

    return acc;
  }, {});

  // Finalize averages for each region
  for (const region in statsByRegion) {
    const data = statsByRegion[region];
    const entryCount = data.timestamps.length;
    statsByRegion[region].averagePostRateFilesPerSec /= entryCount;
    statsByRegion[region].averageDownloadRateFilesPerSec /= entryCount;
    statsByRegion[region].averagePostRateMBPerSec /= entryCount;
    statsByRegion[region].averageDownloadRateMBPerSec /= entryCount;
  }

  // Get all unique locations
  const locations = Object.keys(statsByRegion);

  return {
    props: {
      locations,
      statsByRegion,
    },
  };
}
