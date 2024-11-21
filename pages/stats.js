import { loadCsvData } from '../utils/loadCsv';
import { useEffect, useState } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import ReactSpeedometer from "react-d3-speedometer";
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

// Register Chart.js elements
Chart.register(ArcElement, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StatsPage({ stats }) {
  const [averagePostTime, setAveragePostTime] = useState(0);
  const [averageDownloadTime, setAverageDownloadTime] = useState(0);
  const [averagePostRate, setAveragePostRate] = useState(0);
  const [averageDownloadRate, setAverageDownloadRate] = useState(0);
  const [averagePostRateMB, setAveragePostRateMB] = useState(0);
  const [averagePostRateMbits, setAveragePostRateMbits] = useState(0);
  const [averageDownloadRateMB, setAverageDownloadRateMB] = useState(0);
  const [averageDownloadRateMbits, setAverageDownloadRateMbits] = useState(0);

  useEffect(() => {
    if (stats.length > 0) {
      setAveragePostTime(
        stats.reduce((total, entry) => total + parseFloat(entry.Post_Time_Seconds || 0), 0) / stats.length
      );
      setAverageDownloadTime(
        stats.reduce((total, entry) => total + parseFloat(entry.Download_Time_Seconds || 0), 0) / stats.length
      );
      setAveragePostRate(
        stats.reduce((total, entry) => total + parseFloat(entry.Post_Rate_Files_per_Sec || 0), 0) / stats.length
      );
      setAverageDownloadRate(
        stats.reduce((total, entry) => total + parseFloat(entry.Download_Rate_Files_per_Sec || 0), 0) / stats.length
      );
      setAveragePostRateMB(
        stats.reduce((total, entry) => total + parseFloat(entry.Post_Rate_MB_per_Sec || 0), 0) / stats.length
      );
      setAveragePostRateMbits(
        stats.reduce((total, entry) => total + parseFloat(entry.Post_Rate_Mbits_per_Sec || 0), 0) / stats.length
      );
      setAverageDownloadRateMB(
        stats.reduce((total, entry) => total + parseFloat(entry.Download_Rate_MB_per_Sec || 0), 0) / stats.length
      );
      setAverageDownloadRateMbits(
        stats.reduce((total, entry) => total + parseFloat(entry.Download_Rate_Mbits_per_Sec || 0), 0) / stats.length
      );
    }
  }, [stats]);

  // Data for Doughnut Chart
  const rateChartData = {
    labels: ['Average Post Rate', 'Average Download Rate'],
    datasets: [
      {
        data: [averagePostRate, averageDownloadRate],
        backgroundColor: ['#4CAF50', '#FF5722'],
      },
    ],
  };

  // Data for Line Chart (Trends over time for MB/sec and Mbits/sec)
  const lineChartDataRates = {
    labels: stats.map(entry => entry.Timestamp),
    datasets: [
      {
        label: 'Post Rate MB/sec',
        data: stats.map(entry => entry.Post_Rate_MB_per_Sec),
        borderColor: '#4CAF50',
        fill: false,
      },
      {
        label: 'Download Rate MB/sec',
        data: stats.map(entry => entry.Download_Rate_MB_per_Sec),
        borderColor: '#FF5722',
        fill: false,
      },
      {
        label: 'Post Rate Mbits/sec',
        data: stats.map(entry => entry.Post_Rate_Mbits_per_Sec),
        borderColor: '#3b82f6',
        fill: false,
      },
      {
        label: 'Download Rate Mbits/sec',
        data: stats.map(entry => entry.Download_Rate_Mbits_per_Sec),
        borderColor: '#f97316',
        fill: false,
      },
    ],
  };

  // Data for Bar Charts
  const postDownloadRateComparisonData = {
    labels: ['Post Rate MB/sec', 'Post Rate Mbits/sec', 'Download Rate MB/sec', 'Download Rate Mbits/sec'],
    datasets: [
      {
        data: [averagePostRateMB, averagePostRateMbits, averageDownloadRateMB, averageDownloadRateMbits],
        backgroundColor: ['#4CAF50', '#3b82f6', '#FF5722', '#f97316'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">WiFi Speed Dashboard</h1>

      {/* Speedometers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold text-center mb-4">Post Rate (MB/s)</h2>
          <ReactSpeedometer
            maxValue={100} // Adjust this based on expected max value
            value={averagePostRateMB}
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
            maxValue={100} // Adjust this based on expected max value
            value={averageDownloadRateMB}
            segments={10}
            needleColor="#FF5722"
            startColor="#FF5722"
            endColor="#4CAF50"
            height={200}
          />
        </div>
      </div>

      {/* Existing Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Average Post Time</h2>
          <p className="text-4xl font-bold">{averagePostTime.toFixed(2)} s</p>
        </div>
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Average Download Time</h2>
          <p className="text-4xl font-bold">{averageDownloadTime.toFixed(2)} s</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Download vs. Post Rate Comparison</h2>
          <Doughnut data={rateChartData} />
        </div>
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Post and Download Rates Over Time</h2>
          <Line data={lineChartDataRates} />
        </div>
      </div>

      <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800 mt-6">
        <h2 className="text-xl font-semibold">Average Post vs Download Rates (MB/s & Mbits/s)</h2>
        <Bar data={postDownloadRateComparisonData} />
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const stats = await loadCsvData(); // Load your CSV data here
  return {
    props: {
      stats,
    },
  };
}
