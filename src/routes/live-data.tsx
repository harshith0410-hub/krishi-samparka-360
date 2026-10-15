import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { 
  fetchLiveWeather, 
  fetchLiveMandiPrices, 
  LiveWeatherData, 
  MandiRecord 
} from '../services/agriService';

export const Route = createFileRoute('/live-data')({
  component: LiveDataPage,
});

function LiveDataPage() {
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [mandiPrices, setMandiPrices] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [weatherRes, mandiRes] = await Promise.all([
          fetchLiveWeather("Bengaluru"),
          fetchLiveMandiPrices("Karnataka", "Onion")
        ]);

        setWeather(weatherRes);
        setMandiPrices(mandiRes);
      } catch (err: any) {
        console.error("API Call Error:", err);
        setError("Failed to fetch live API data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <div className="p-4">Loading Krishi Samparka 360 live data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🌾 Krishi Samparka 360 Live Data</h1>

      {/* Live Weather Card */}
      <div className="p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-2">Live Weather — {weather?.name}</h2>
        <p><strong>Temperature:</strong> {weather?.main.temp} °C</p>
        <p><strong>Humidity:</strong> {weather?.main.humidity}%</p>
        <p><strong>Condition:</strong> {weather?.weather[0]?.description}</p>
      </div>

      {/* Live Mandi Prices Card */}
      <div className="p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-2">Live Mandi Prices (Onion - Karnataka)</h2>
        {mandiPrices.length === 0 ? (
          <p>No recent mandi price records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Market</th>
                  <th className="p-2">District</th>
                  <th className="p-2">Min Price (₹)</th>
                  <th className="p-2">Max Price (₹)</th>
                  <th className="p-2">Modal Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {mandiPrices.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.market}</td>
                    <td className="p-2">{item.district}</td>
                    <td className="p-2">{item.min_price}</td>
                    <td className="p-2">{item.max_price}</td>
                    <td className="p-2 font-bold">{item.modal_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}