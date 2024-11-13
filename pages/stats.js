// pages/stats.js
import { loadCsvData } from '../utils/loadCsv';

import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the required elements
Chart.register(ArcElement, Tooltip, Legend);

export default function StatsPage({ stats }) {
  const [mostPPG, setMostPPG] = useState(null);
  const [leastPPG, setLeastPPG] = useState(null);
  const [mostGames, setMostGames] = useState(null);
  const [leastGames, setLeastGames] = useState(null);

  useEffect(() => {
    if (stats.length > 0) {
      setMostPPG(stats.reduce((max, player) => (player["Points Per Game"] > max["Points Per Game"] ? player : max)));
      setLeastPPG(stats.reduce((min, player) => (player["Points Per Game"] < min["Points Per Game"] ? player : min)));
      setMostGames(stats.reduce((max, player) => (player["Games Played"] > max["Games Played"] ? player : max)));
      setLeastGames(stats.reduce((min, player) => (player["Games Played"] < min["Games Played"] ? player : min)));
    }
  }, [stats]);

  const chartData = {
    labels: ['Most PPG', 'Least PPG'],
    datasets: [
      {
        data: [mostPPG ? mostPPG["Points Per Game"] : 0, leastPPG ? leastPPG["Points Per Game"] : 0],
        backgroundColor: ['#4CAF50', '#FF5722'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Basketball Stats Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Most Points per Game</h2>
          {mostPPG && <p className="text-4xl font-bold">{mostPPG.Player}: {mostPPG["Points Per Game"]} PPG</p>}
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Least Points per Game</h2>
          {leastPPG && <p className="text-4xl font-bold">{leastPPG.Player}: {leastPPG["Points Per Game"]} PPG</p>}
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Most Games Played</h2>
          {mostGames && <p className="text-4xl font-bold">{mostGames.Player}: {mostGames["Games Played"]} Games</p>}
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Least Games Played</h2>
          {leastGames && <p className="text-4xl font-bold">{leastGames.Player}: {leastGames["Games Played"]} Games</p>}
        </div>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold">Points Per Game Comparison</h2>
        <Doughnut data={chartData} />
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const stats = await loadCsvData();
  return {
    props: {
      stats,
    },
  };
}