'use client';

import { useEffect, useState } from 'react';
import GameStatsChart from '@/components/GameStatsChart';
import GamePieChart from '@/components/GamePieChart';
import GameScatterPlot from '@/components/GameScatterPlot';

interface GameStats {
  name: string;
  rating: number;
  plays: number;
}

export default function StatsPage() {
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/stats/public');
        
        if (!response.ok) {
          throw new Error('Greška pri dohvaćanju podataka');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setGameStats(data);
        } else {
          throw new Error('Nema dostupnih podataka');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Greška pri dohvaćanju statistike:', error);
        setError('Greška pri učitavanju podataka s IGDB API-ja.');
        
        // Fallback na demo podatke u slučaju greške
        const fallbackData: GameStats[] = [
          { name: 'The Witcher 3', rating: 9.5, plays: 15234 },
          { name: 'Elden Ring', rating: 9.2, plays: 18456 },
          { name: 'Baldur\'s Gate 3', rating: 9.7, plays: 12890 },
          { name: 'Red Dead Redemption 2', rating: 9.3, plays: 16543 },
          { name: 'God of War', rating: 9.4, plays: 13245 },
          { name: 'Cyberpunk 2077', rating: 8.5, plays: 11234 },
        ];
        setGameStats(fallbackData);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Učitavanje IGDB podataka...</p>
        </div>
      </div>
    );
  }

  const totalGames = gameStats.length;
  const avgRating = (gameStats.reduce((sum, game) => sum + game.rating, 0) / totalGames).toFixed(2);
  const totalPlays = gameStats.reduce((sum, game) => sum + game.plays, 0);
  const topGame = gameStats.reduce((max, game) => game.rating > max.rating ? game : max, gameStats[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📊 Statistika Top Igara
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Najpopularnije i najbolje ocijenjene igre s IGDB baze • D3.js vizualizacije
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🎮</div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{totalGames}</div>
            <div className="text-xs sm:text-base text-blue-100">Prikazano Igara</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">⭐</div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{avgRating}</div>
            <div className="text-xs sm:text-base text-purple-100">Prosječna Ocjena</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🔥</div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{(totalPlays / 1000).toFixed(1)}K</div>
            <div className="text-xs sm:text-base text-pink-100">Ukupno Ocjena</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🏆</div>
            <div className="text-base sm:text-xl font-bold mb-1 truncate">{topGame.name}</div>
            <div className="text-xs sm:text-base text-orange-100">Top Igra ({topGame.rating}/10)</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Bar Chart */}
          <GameStatsChart 
            data={gameStats} 
            title="📊 Ocjene Igara - Bar Chart"
          />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <GamePieChart 
              data={gameStats} 
              title="🥧 Distribucija Popularnosti"
            />

            {/* Scatter Plot */}
            <GameScatterPlot 
              data={gameStats} 
              title="📈 Ocjena vs Popularnost"
            />
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">📋 Top Gaming Lista</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm">#</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm">Igra</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm">Ocjena</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm hidden sm:table-cell">Broj Ocjena</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm hidden md:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {gameStats
                  .sort((a, b) => b.rating - a.rating)
                  .map((game, index) => (
                    <tr 
                      key={game.name} 
                      className={`border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-600 text-xs sm:text-base">{index + 1}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-xs sm:text-base">{game.name}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                        <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm ${
                          game.rating >= 9 
                            ? 'bg-green-100 text-green-800' 
                            : game.rating >= 8 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          ⭐ {game.rating}/10
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">
                        <span className="bg-purple-100 text-purple-800 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm">
                          👥 {game.plays.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                        {game.plays > 10000 ? (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                            🔥 Ultra Popularna
                          </span>
                        ) : game.plays > 5000 ? (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                            🌟 Popularna
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                            ✓ Kvalitetna
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 sm:mt-8 text-center text-gray-600 text-xs sm:text-sm">
          <p>Podaci dohvaćeni s IGDB API-ja • Vizualizacije kreirane pomoću D3.js biblioteke • Interaktivni grafikoni s animacijama</p>
        </div>
      </div>
    </div>
  );
}
