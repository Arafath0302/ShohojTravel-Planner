import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiSun, FiCloud, FiCloudRain, FiCloudSnow } from 'react-icons/fi';

function WeatherForecast({ trip }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!trip?.userSelection?.location?.lat || !trip?.userSelection?.location?.lon) {
        setError("Location coordinates not available");
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${trip.userSelection.location.lat}&lon=${trip.userSelection.location.lon}&units=metric&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
        );
        setWeatherData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch weather data");
        setLoading(false);
      }
    };

    if (trip?.userSelection?.location) {
      fetchWeather();
    }
  }, [trip]);

  const getWeatherIcon = (weatherCode) => {
    if (weatherCode >= 200 && weatherCode < 600) return <FiCloudRain className="text-2xl" />;
    if (weatherCode >= 600 && weatherCode < 700) return <FiCloudSnow className="text-2xl" />;
    if (weatherCode >= 800) return <FiSun className="text-2xl" />;
    return <FiCloud className="text-2xl" />;
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-200 rounded-md"></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Group forecast by day
  const dailyForecasts = weatherData?.list?.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = item;
    }
    return acc;
  }, {});

  return (
    <div className="my-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Weather Forecast</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {dailyForecasts && Object.entries(dailyForecasts).slice(0, 5).map(([date, forecast]) => (
          <div key={date} className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
            <div className="text-center">
              <p className="font-medium text-sm sm:text-base">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <p className="text-xs sm:text-sm text-gray-500">{date}</p>
              <div className="flex justify-center my-2">
                {getWeatherIcon(forecast.weather[0].id)}
              </div>
              <p className="font-bold text-sm sm:text-base">{Math.round(forecast.main.temp)}°C</p>
              <p className="text-xs text-gray-500 capitalize">{forecast.weather[0].description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherForecast;