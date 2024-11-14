// pages/stats.js
import { loadCsvData } from '../utils/loadCsv';
import { useEffect, useState } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
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

// Register the required elements
Chart.register(ArcElement, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StatsPage({ stats }) {
  const [averagePostTime, setAveragePostTime] = useState(0);
  const [averageDownloadTime, setAverageDownloadTime] = useState(0);
  const [averagePostRate, setAveragePostRate] = useState(0);
  const [averageDownloadRate, setAverageDownloadRate] = useState(0);

  useEffect(() => {
    if (stats.length > 0) {
      // Calculate averages
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

  // Data for Line Chart (Trends over time)
  const lineChartData = {
    labels: stats.map(entry => entry.Timestamp), // Timestamps as labels
    datasets: [
      {
        label: 'Post Time (s)',
        data: stats.map(entry => entry.Post_Time_Seconds),
        borderColor: '#4CAF50',
        fill: false,
      },
      {
        label: 'Download Time (s)',
        data: stats.map(entry => entry.Download_Time_Seconds),
        borderColor: '#FF5722',
        fill: false,
      },
    ],
  };

  // Data for Bar Chart (Comparing average post and download times)
  const timeComparisonData = {
    labels: ['Average Post Time', 'Average Download Time'],
    datasets: [
      {
        data: [averagePostTime, averageDownloadTime],
        backgroundColor: ['#4CAF50', '#FF5722'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">WiFi Speed Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Average Post Time</h2>
          <p className="text-4xl font-bold">{averagePostTime.toFixed(2)} s</p>
        </div>
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Average Download Time</h2>
          <p className="text-4xl font-bold">{averageDownloadTime.toFixed(2)} s</p>
        </div>
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Average Post Rate</h2>
          <p className="text-4xl font-bold">{averagePostRate.toFixed(2)} files/s</p>
        </div>
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Average Download Rate</h2>
          <p className="text-4xl font-bold">{averageDownloadRate.toFixed(2)} files/s</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Download vs. Post Rate Comparison</h2>
          <Doughnut data={rateChartData} />
        </div>
        <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-xl font-semibold">Post and Download Times Over Time</h2>
          <Line data={lineChartData} />
        </div>
      </div>

      <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800 mt-6">
        <h2 className="text-xl font-semibold">Average Post vs Download Time</h2>
        <Bar data={timeComparisonData} />
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
