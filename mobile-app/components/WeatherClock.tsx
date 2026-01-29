import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography } from '@/lib/theme';

const isTV = Platform.isTV;

interface WeatherData {
  temperature: number;
  weatherCode: number;
}

const weatherIcons: Record<number, string> = {
  0: '☀️',   // Clear sky
  1: '🌤️',   // Mainly clear
  2: '⛅',   // Partly cloudy
  3: '☁️',   // Overcast
  45: '🌫️',  // Fog
  48: '🌫️',  // Depositing rime fog
  51: '🌧️',  // Light drizzle
  53: '🌧️',  // Moderate drizzle
  55: '🌧️',  // Dense drizzle
  61: '🌧️',  // Slight rain
  63: '🌧️',  // Moderate rain
  65: '🌧️',  // Heavy rain
  71: '🌨️',  // Slight snow
  73: '🌨️',  // Moderate snow
  75: '🌨️',  // Heavy snow
  77: '🌨️',  // Snow grains
  80: '🌧️',  // Slight rain showers
  81: '🌧️',  // Moderate rain showers
  82: '🌧️',  // Violent rain showers
  85: '🌨️',  // Slight snow showers
  86: '🌨️',  // Heavy snow showers
  95: '⛈️',  // Thunderstorm
  96: '⛈️',  // Thunderstorm with slight hail
  99: '⛈️',  // Thunderstorm with heavy hail
};

interface WeatherClockProps {
  lat?: number;
  lon?: number;
}

export function WeatherClock({ lat = 34.3917, lon = -118.5426 }: WeatherClockProps) {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather every 10 minutes
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
        );
        const data = await response.json();
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
        });
      } catch (e) {
        console.warn('Failed to fetch weather:', e);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const weatherIcon = weather ? (weatherIcons[weather.weatherCode] || '🌡️') : '';

  return (
    <View style={styles.container}>
      {weather && (
        <View style={styles.weatherRow}>
          <Text style={styles.weatherIcon}>{weatherIcon}</Text>
          <Text style={styles.temperature}>{weather.temperature}°F</Text>
        </View>
      )}
      <Text style={styles.time}>{formatTime(time)}</Text>
      <Text style={styles.date}>{formatDate(time)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: isTV ? 40 : 20,
    right: isTV ? 40 : 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: isTV ? 24 : 12,
    alignItems: 'flex-end',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTV ? 8 : 4,
  },
  weatherIcon: {
    fontSize: isTV ? 32 : 20,
    marginRight: isTV ? 8 : 4,
  },
  temperature: {
    color: 'white',
    fontSize: isTV ? 28 : 16,
    fontWeight: '600',
  },
  time: {
    color: 'white',
    fontSize: isTV ? 36 : 20,
    fontWeight: '700',
  },
  date: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: isTV ? 20 : 12,
    marginTop: isTV ? 4 : 2,
  },
});

export default WeatherClock;
