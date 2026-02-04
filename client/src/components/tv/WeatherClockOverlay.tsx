import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

// Map weather codes to icons and descriptions
// Using Open-Meteo WMO weather codes
function getWeatherInfo(code: number): { icon: React.ReactNode; description: string } {
  // Clear
  if (code === 0) return { icon: <Sun className="tv-icon-md" />, description: "Clear" };
  // Mainly clear, partly cloudy
  if (code >= 1 && code <= 2) return { icon: <Sun className="tv-icon-md" />, description: "Partly Cloudy" };
  // Overcast
  if (code === 3) return { icon: <Cloud className="tv-icon-md" />, description: "Cloudy" };
  // Fog
  if (code >= 45 && code <= 48) return { icon: <CloudFog className="tv-icon-md" />, description: "Foggy" };
  // Drizzle
  if (code >= 51 && code <= 57) return { icon: <CloudRain className="tv-icon-md" />, description: "Drizzle" };
  // Rain
  if (code >= 61 && code <= 67) return { icon: <CloudRain className="tv-icon-md" />, description: "Rain" };
  // Snow
  if (code >= 71 && code <= 77) return { icon: <CloudSnow className="tv-icon-md" />, description: "Snow" };
  // Rain showers
  if (code >= 80 && code <= 82) return { icon: <CloudRain className="tv-icon-md" />, description: "Showers" };
  // Snow showers
  if (code >= 85 && code <= 86) return { icon: <CloudSnow className="tv-icon-md" />, description: "Snow Showers" };
  // Thunderstorm
  if (code >= 95 && code <= 99) return { icon: <CloudLightning className="tv-icon-md" />, description: "Thunderstorm" };
  
  return { icon: <Cloud className="tv-icon-md" />, description: "Unknown" };
}

export function WeatherClockOverlay() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<{
    temperature: number;
    weatherCode: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch weather data from Open-Meteo API (free, no API key required)
  // Santa Clarita, CA coordinates: 34.3917° N, 118.5426° W
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=34.3917&longitude=-118.5426&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America/Los_Angeles"
        );
        
        if (response.ok) {
          const data = await response.json();
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
          });
        }
      } catch (error) {
        console.warn("Failed to fetch weather:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeather();
    
    // Refresh weather every 10 minutes
    const weatherTimer = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(weatherTimer);
  }, []);
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };
  
  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : null;
  
  return (
    <div className="absolute tv-widget-position-top-right z-50 flex items-center gap-[clamp(0.5rem,1.5vw,1.5rem)]">
      {/* Weather Widget */}
      {weather && weatherInfo && (
        <div className="flex items-center gap-[clamp(0.25rem,0.75vw,0.75rem)] bg-black/50 backdrop-blur-sm rounded-2xl tv-widget-padding text-white">
          <div className="text-white/90">
            {weatherInfo.icon}
          </div>
          <div className="flex flex-col">
            <span className="tv-widget-text-xl font-semibold leading-tight">
              {weather.temperature}°F
            </span>
            <span className="text-[clamp(0.625rem,0.9vw,1rem)] text-white/70">
              {weatherInfo.description}
            </span>
          </div>
        </div>
      )}
      
      {/* Clock Widget */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl tv-widget-padding text-white">
        <div className="tv-widget-text-xl font-semibold leading-tight">
          {formatTime(time)}
        </div>
        <div className="text-[clamp(0.625rem,0.9vw,1rem)] text-white/70">
          {formatDate(time)}
        </div>
      </div>
    </div>
  );
}
