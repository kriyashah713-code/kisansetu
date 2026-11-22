import { WeatherData } from '../types/kisansetu';
import { DEMO_WEATHER } from './mockData';

/**
 * Weather & Farm Alerts Service Layer
 * Structured so IMD / OpenWeatherMap API responses can replace DEMO_WEATHER directly.
 */
export const weatherService = {
  async getFarmWeather(locationLabel?: string): Promise<WeatherData> {
    return {
      ...DEMO_WEATHER,
      location: locationLabel || DEMO_WEATHER.location,
    };
  },
};
