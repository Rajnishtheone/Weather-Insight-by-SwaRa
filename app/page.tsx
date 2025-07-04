"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Search,
  MapPin,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  AlertCircle,
  Settings,
  Clock,
  Timer,
  AlarmClock,
  Calendar,
  Play,
  Pause,
  Square,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { JSX } from "react/jsx-runtime"

interface WeatherData {
  current: {
    city: string
    country: string
    temperature: number
    description: string
    icon: string
    humidity: number
    windSpeed: number
    windDirection: number
    pressure: number
    visibility: number
    feelsLike: number
    uvIndex: number
  }
  forecast: Array<{
    date: string
    day: string
    high: number
    low: number
    description: string
    icon: string
    humidity: number
    windSpeed: number
  }>
}

interface City {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

interface WorldClockCity {
  name: string
  timezone: string
  country: string
}

const worldClockCities: WorldClockCity[] = [
  { name: "New York", timezone: "America/New_York", country: "USA" },
  { name: "London", timezone: "Europe/London", country: "UK" },
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "Japan" },
  { name: "Sydney", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Dubai", timezone: "Asia/Dubai", country: "UAE" },
  { name: "Mumbai", timezone: "Asia/Kolkata", country: "India" },
  { name: "Paris", timezone: "Europe/Paris", country: "France" },
  { name: "Singapore", timezone: "Asia/Singapore", country: "Singapore" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", country: "USA" },
  { name: "Moscow", timezone: "Europe/Moscow", country: "Russia" },
]

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C")
  const [showSettings, setShowSettings] = useState(false)

  // Clock states
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedWorldClock, setSelectedWorldClock] = useState<WorldClockCity>(worldClockCities[0])
  const [worldTime, setWorldTime] = useState(new Date())

  // Stopwatch states
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)

  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(5)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerTimeLeft, setTimerTimeLeft] = useState(0)

  // Alarm states
  const [alarmTime, setAlarmTime] = useState("07:00")
  const [alarmEnabled, setAlarmEnabled] = useState(false)

  // Update clocks
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)

      // Update world clock
      const worldTimeNow = new Date(now.toLocaleString("en-US", { timeZone: selectedWorldClock.timezone }))
      setWorldTime(worldTimeNow)

      // Check alarm
      if (alarmEnabled) {
        const currentTimeString = now.toTimeString().slice(0, 5)
        if (currentTimeString === alarmTime) {
          alert("⏰ Alarm! Time's up!")
          setAlarmEnabled(false)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [selectedWorldClock, alarmTime, alarmEnabled])

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 10)
      }, 10)
    }
    return () => clearInterval(interval)
  }, [stopwatchRunning])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning && timerTimeLeft > 0) {
      interval = setInterval(() => {
        setTimerTimeLeft((prev) => {
          if (prev <= 1000) {
            setTimerRunning(false)
            alert("⏰ Timer finished!")
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerTimeLeft])

  // Temperature conversion functions
  const convertTemperature = (temp: number, fromUnit: "C" | "F" = "C", toUnit: "C" | "F" = "C") => {
    let celsius = temp

    // Convert to Celsius first
    if (fromUnit === "F") {
      celsius = ((temp - 32) * 5) / 9
    }

    // Convert to target unit
    if (toUnit === "F") {
      return (celsius * 9) / 5 + 32
    }
    return celsius
  }

  const formatTemperature = (temp: number) => {
    const converted = convertTemperature(temp, "C", temperatureUnit)
    return `${Math.round(converted)}°${temperatureUnit}`
  }

  // Format time functions
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    const milliseconds = Math.floor((time % 1000) / 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
  }

  const formatTimerTime = (time: number) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Search for cities
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCities([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/search-cities?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        console.error("Search API error:", response.status, response.statusText)
        setCities([])
        return
      }

      const data = await response.json()
      setCities(Array.isArray(data.cities) ? data.cities : [])
    } catch (error) {
      console.error("Error searching cities:", error)
      setCities([])
    }
  }

  // Fetch weather data
  const fetchWeather = async (city: string, lat?: number, lon?: number) => {
    console.log("Fetching weather for:", city, lat, lon);
    setLoading(true)
    setError(null)
    try {
      const url = lat && lon ? `/api/weather?lat=${lat}&lon=${lon}` : `/api/weather?city=${encodeURIComponent(city)}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || "Failed to fetch weather data")
        return
      }

      setWeatherData(data)
      // Save weather context for RajnishBot
      try {
        localStorage.setItem(
          "weather-context",
          JSON.stringify({
            city: data.current.city,
            country: data.current.country,
            temperature: data.current.temperature,
            description: data.current.description,
            humidity: data.current.humidity,
            windSpeed: data.current.windSpeed,
            windDirection: data.current.windDirection,
            pressure: data.current.pressure,
            visibility: data.current.visibility,
            feelsLike: data.current.feelsLike,
            uvIndex: data.current.uvIndex
          })
        )
      } catch {}
      setShowSuggestions(false)
    } catch (error) {
      console.error("Error fetching weather:", error)
      setError("Failed to fetch weather data. Please check your internet connection.")
    } finally {
      setLoading(false)
    }
  }

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(true)
    searchCities(value)
  }

  // Handle city selection
  const handleCitySelect = (city: City) => {
    console.log("Selected city:", city);
    setSearchQuery(`${city.name}, ${city.country}`);
    fetchWeather(city.name, city.lat, city.lon);
  }

  // Timer controls
  const startTimer = () => {
    const totalTime = (timerMinutes * 60 + timerSeconds) * 1000
    setTimerTimeLeft(totalTime)
    setTimerRunning(true)
  }

  const stopTimer = () => {
    setTimerRunning(false)
  }

  const resetTimer = () => {
    setTimerRunning(false)
    setTimerTimeLeft(0)
  }

  // Get weather icon
  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      "01d": <Sun className="w-8 h-8 text-yellow-500" />,
      "01n": <Sun className="w-8 h-8 text-yellow-300" />,
      "02d": <Cloud className="w-8 h-8 text-gray-400" />,
      "02n": <Cloud className="w-8 h-8 text-gray-500" />,
      "03d": <Cloud className="w-8 h-8 text-gray-500" />,
      "03n": <Cloud className="w-8 h-8 text-gray-600" />,
      "04d": <Cloud className="w-8 h-8 text-gray-600" />,
      "04n": <Cloud className="w-8 h-8 text-gray-700" />,
      "09d": <CloudRain className="w-8 h-8 text-blue-500" />,
      "09n": <CloudRain className="w-8 h-8 text-blue-600" />,
      "10d": <CloudRain className="w-8 h-8 text-blue-500" />,
      "10n": <CloudRain className="w-8 h-8 text-blue-600" />,
      "11d": <Zap className="w-8 h-8 text-yellow-600" />,
      "11n": <Zap className="w-8 h-8 text-yellow-700" />,
      "13d": <CloudSnow className="w-8 h-8 text-blue-200" />,
      "13n": <CloudSnow className="w-8 h-8 text-blue-300" />,
    }
    return iconMap[iconCode] || <Sun className="w-8 h-8 text-yellow-500" />
  }

  // Load default weather on mount
  useEffect(() => {
    fetchWeather("New York", 40.7128, -74.006)
  }, [])

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Clock and Settings */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">Weather & Time Hub</h1>
            <p className="text-blue-100">Weather, clocks, and time management in one place</p>
          </div>

          {/* Current Time Display */}
          <div className="text-right text-white">
            {mounted ? (
              <>
                <div className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</div>
                <div className="text-sm opacity-80">{currentTime.toLocaleDateString()}</div>
              </>
            ) : (
              <div className="text-2xl font-bold">--:--:--</div>
            )}
          </div>

          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
            className="ml-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Temperature Unit:</label>
                <Select value={temperatureUnit} onValueChange={(value: "C" | "F") => setTemperatureUnit(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">Celsius (°C)</SelectItem>
                    <SelectItem value="F">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="weather" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/20 backdrop-blur-sm">
            <TabsTrigger
              value="weather"
              className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <Sun className="w-4 h-4 mr-2" />
              Weather
            </TabsTrigger>
            <TabsTrigger
              value="worldclock"
              className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <Clock className="w-4 h-4 mr-2" />
              World Clock
            </TabsTrigger>
            <TabsTrigger
              value="stopwatch"
              className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <Timer className="w-4 h-4 mr-2" />
              Stopwatch
            </TabsTrigger>
            <TabsTrigger
              value="timer"
              className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <AlarmClock className="w-4 h-4 mr-2" />
              Timer
            </TabsTrigger>
            <TabsTrigger
              value="alarm"
              className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <AlarmClock className="w-4 h-4 mr-2" />
              Alarm
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-3 w-full rounded-lg border-0 shadow-lg"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
                />
              </div>

              {/* City Suggestions */}
              {showSuggestions && cities.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-10">
                  {cities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <div className="text-sm text-gray-500">
                            {city.state ? `${city.state}, ` : ""}
                            {city.country}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading && (
              <div className="text-center text-white">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="mt-2">Loading weather data...</p>
              </div>
            )}

            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center text-red-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {weatherData && (
              <div className="space-y-6">
                {/* Current Weather */}
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                      {weatherData.current.city}
                      {weatherData.current.country && `, ${weatherData.current.country}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start mb-4">
                          {getWeatherIcon(weatherData.current.icon)}
                          <div className="ml-4">
                            <div className="text-5xl font-bold text-gray-800">
                              {formatTemperature(weatherData.current.temperature)}
                            </div>
                            <div className="text-xl text-gray-600 capitalize">{weatherData.current.description}</div>
                          </div>
                        </div>
                        <div className="text-gray-600">
                          Feels like {formatTemperature(weatherData.current.feelsLike)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Wind className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Wind</span>
                          </div>
                          <div className="text-lg font-bold text-gray-800">{weatherData.current.windSpeed} m/s</div>
                          <div className="text-sm text-gray-600">{weatherData.current.windDirection}°</div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Droplets className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Humidity</span>
                          </div>
                          <div className="text-lg font-bold text-gray-800">{weatherData.current.humidity}%</div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Gauge className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Pressure</span>
                          </div>
                          <div className="text-lg font-bold text-gray-800">{weatherData.current.pressure} hPa</div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Eye className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Visibility</span>
                          </div>
                          <div className="text-lg font-bold text-gray-800">
                            {(weatherData.current.visibility / 1000).toFixed(1)} km
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 7-Day Forecast */}
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">7-Day Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                      {weatherData.forecast.map((day, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center"
                        >
                          <div className="font-medium text-gray-800 mb-2">{day.day}</div>
                          <div className="text-sm text-gray-600 mb-3">{day.date}</div>
                          <div className="flex justify-center mb-3">{getWeatherIcon(day.icon)}</div>
                          <div className="text-sm text-gray-700 capitalize mb-2">{day.description}</div>
                          <div className="space-y-1">
                            <div className="font-bold text-gray-800">{formatTemperature(day.high)}</div>
                            <div className="text-gray-600">{formatTemperature(day.low)}</div>
                          </div>
                          <div className="mt-3 space-y-1 text-xs text-gray-600">
                            <div className="flex items-center justify-center">
                              <Droplets className="w-3 h-3 mr-1" />
                              {day.humidity}%
                            </div>
                            <div className="flex items-center justify-center">
                              <Wind className="w-3 h-3 mr-1" />
                              {day.windSpeed} m/s
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* World Clock Tab */}
          <TabsContent value="worldclock">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Clock className="w-6 h-6 mr-2 text-blue-600" />
                  World Clock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Select City:</label>
                  <Select
                    value={selectedWorldClock.name}
                    onValueChange={(value) => {
                      const city = worldClockCities.find((c) => c.name === value)
                      if (city) setSelectedWorldClock(city)
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {worldClockCities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}, {city.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-800 mb-2">
                    {worldTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                  <div className="text-xl text-gray-600">
                    {selectedWorldClock.name}, {selectedWorldClock.country}
                  </div>
                  <div className="text-lg text-gray-500">
                    {worldTime.toLocaleDateString([], {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {worldClockCities.slice(0, 8).map((city) => {
                    const cityTime = new Date().toLocaleString("en-US", { timeZone: city.timezone })
                    const time = new Date(cityTime)
                    return (
                      <div key={city.name} className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="font-medium text-gray-800">{city.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{city.country}</div>
                        <div className="text-lg font-bold text-blue-600">
                          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stopwatch Tab */}
          <TabsContent value="stopwatch">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Timer className="w-6 h-6 mr-2 text-blue-600" />
                  Stopwatch
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="text-6xl font-bold text-gray-800 font-mono">{formatTime(stopwatchTime)}</div>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setStopwatchRunning(!stopwatchRunning)}
                    size="lg"
                    className={stopwatchRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                  >
                    {stopwatchRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                    {stopwatchRunning ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={() => {
                      setStopwatchRunning(false)
                      setStopwatchTime(0)
                    }}
                    size="lg"
                    variant="outline"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timer Tab */}
          <TabsContent value="timer">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <AlarmClock className="w-6 h-6 mr-2 text-blue-600" />
                  Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                {!timerRunning && timerTimeLeft === 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-center items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setTimerMinutes(Math.max(0, timerMinutes - 1))}
                          size="sm"
                          variant="outline"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-2xl font-bold w-16">{timerMinutes}</span>
                        <Button onClick={() => setTimerMinutes(timerMinutes + 1)} size="sm" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg">min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setTimerSeconds(Math.max(0, timerSeconds - 1))}
                          size="sm"
                          variant="outline"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-2xl font-bold w-16">{timerSeconds}</span>
                        <Button
                          onClick={() => setTimerSeconds(Math.min(59, timerSeconds + 1))}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg">sec</span>
                      </div>
                    </div>
                    <Button onClick={startTimer} size="lg" className="bg-green-500 hover:bg-green-600">
                      <Play className="w-5 h-5 mr-2" />
                      Start Timer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl font-bold text-gray-800 font-mono">{formatTimerTime(timerTimeLeft)}</div>
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={timerRunning ? stopTimer : startTimer}
                        size="lg"
                        className={timerRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                      >
                        {timerRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                        {timerRunning ? "Pause" : "Resume"}
                      </Button>
                      <Button onClick={resetTimer} size="lg" variant="outline">
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alarm Tab */}
          <TabsContent value="alarm">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <AlarmClock className="w-6 h-6 mr-2 text-blue-600" />
                  Alarm Clock
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center items-center space-x-4">
                    <label className="text-lg font-medium">Set Alarm Time:</label>
                    <Input
                      type="time"
                      value={alarmTime}
                      onChange={(e) => setAlarmTime(e.target.value)}
                      className="w-32 text-center text-lg"
                    />
                  </div>
                  <div className="text-4xl font-bold text-gray-800">{alarmTime}</div>
                  <Button
                    onClick={() => setAlarmEnabled(!alarmEnabled)}
                    size="lg"
                    className={alarmEnabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                  >
                    <AlarmClock className="w-5 h-5 mr-2" />
                    {alarmEnabled ? "Disable Alarm" : "Enable Alarm"}
                  </Button>
                  {alarmEnabled && <div className="text-green-600 font-medium">✅ Alarm is set for {alarmTime}</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-gray-800">
                    {currentTime.toLocaleDateString([], {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-6xl font-bold text-blue-600">{currentTime.getDate()}</div>
                  <div className="text-2xl text-gray-600">
                    {currentTime.toLocaleDateString([], { month: "long", year: "numeric" })}
                  </div>
                  <div className="grid grid-cols-7 gap-2 mt-8">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center font-medium text-gray-600 p-2">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date(currentTime.getFullYear(), currentTime.getMonth(), i - 6)
                      const isCurrentMonth = date.getMonth() === currentTime.getMonth()
                      const isToday = date.toDateString() === currentTime.toDateString()
                      return (
                        <div
                          key={i}
                          className={`text-center p-2 rounded ${
                            isToday
                              ? "bg-blue-600 text-white font-bold"
                              : isCurrentMonth
                                ? "text-gray-800 hover:bg-blue-100"
                                : "text-gray-400"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
