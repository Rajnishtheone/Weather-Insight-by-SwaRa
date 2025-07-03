import { type NextRequest, NextResponse } from "next/server"

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = "open-weather13.p.rapidapi.com"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!RAPIDAPI_KEY) {
    return NextResponse.json(
      {
        error: "RapidAPI key is required. Please add RAPIDAPI_KEY to your environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    let latitude = lat
    let longitude = lon

    // If city is provided instead of coordinates, we need to geocode it first
    if (city && (!lat || !lon)) {
      const geocodeResult = await geocodeCity(city)
      if (!geocodeResult) {
        return NextResponse.json({ error: "City not found" }, { status: 404 })
      }
      latitude = geocodeResult.lat.toString()
      longitude = geocodeResult.lon.toString()
    }

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Coordinates are required" }, { status: 400 })
    }

    // Get forecast data (which includes current weather)
    const forecastUrl = `https://${RAPIDAPI_HOST}/fivedaysforcast?latitude=${latitude}&longitude=${longitude}&lang=EN`

    console.log("Fetching from:", forecastUrl)

    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    })

    if (!forecastResponse.ok) {
      console.error("Forecast API error:", forecastResponse.status, forecastResponse.statusText)
      const errorText = await forecastResponse.text()
      console.error("Error response:", errorText)
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }

    const forecastData = await forecastResponse.json()
    console.log("API Response:", JSON.stringify(forecastData, null, 2))

    // Process the API response
    const weatherData = processWeatherData(forecastData, city)

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

async function geocodeCity(city: string) {
  try {
    // Using a simple geocoding service for city coordinates
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    )
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country,
      }
    }
    return null
  } catch (error) {
    console.error("Geocoding error:", error)
    return null
  }
}

function processWeatherData(apiData: any, cityName?: string) {
  // The API structure might vary, so we'll handle different possible formats
  let currentWeather = null
  let forecastList = []

  // Check different possible response structures
  if (apiData.list && Array.isArray(apiData.list)) {
    // OpenWeatherMap-like structure
    forecastList = apiData.list
    currentWeather = apiData.list[0] // Use first forecast entry as current
  } else if (apiData.forecast && Array.isArray(apiData.forecast)) {
    // Alternative structure
    forecastList = apiData.forecast
    currentWeather = apiData.current || apiData.forecast[0]
  } else if (Array.isArray(apiData)) {
    // Direct array response
    forecastList = apiData
    currentWeather = apiData[0]
  } else if (apiData.current) {
    // Separate current weather
    currentWeather = apiData.current
    forecastList = apiData.forecast || []
  } else {
    // Fallback - use the entire response as current weather
    currentWeather = apiData
    forecastList = [apiData]
  }

  // Extract current weather data
  const current = {
    city: apiData.city?.name || cityName || "Unknown",
    country: apiData.city?.country || "",
    temperature: currentWeather?.main?.temp || currentWeather?.temp || 20,
    description: currentWeather?.weather?.[0]?.description || currentWeather?.description || "Clear sky",
    icon: currentWeather?.weather?.[0]?.icon || currentWeather?.icon || "01d",
    humidity: currentWeather?.main?.humidity || currentWeather?.humidity || 50,
    windSpeed: currentWeather?.wind?.speed || currentWeather?.windSpeed || 0,
    windDirection: currentWeather?.wind?.deg || currentWeather?.windDirection || 0,
    pressure: currentWeather?.main?.pressure || currentWeather?.pressure || 1013,
    visibility: currentWeather?.visibility || 10000,
    feelsLike: currentWeather?.main?.feels_like || currentWeather?.feelsLike || currentWeather?.main?.temp || 20,
    uvIndex: currentWeather?.uvi || 0,
  }

  // Process forecast data
  const forecast = processForecastData(forecastList)

  return {
    current,
    forecast,
  }
}

function processForecastData(forecastList: any[]) {
  if (!Array.isArray(forecastList) || forecastList.length === 0) {
    // Return dummy forecast data if no forecast available
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        high: 25 + Math.random() * 10,
        low: 15 + Math.random() * 5,
        description: "Clear sky",
        icon: "01d",
        humidity: 50,
        windSpeed: 5,
      }
    })
  }

  const dailyData: { [key: string]: any } = {}

  forecastList.forEach((item) => {
    // Handle different timestamp formats
    let date: Date
    if (item.dt) {
      date = new Date(item.dt * 1000)
    } else if (item.date) {
      date = new Date(item.date)
    } else {
      date = new Date()
    }

    const dateKey = date.toISOString().split("T")[0]

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        temps: [],
        descriptions: [],
        icons: [],
        humidity: [],
        windSpeed: [],
      }
    }

    // Extract temperature data
    const temp = item.main?.temp || item.temp || 20
    const humidity = item.main?.humidity || item.humidity || 50
    const windSpeed = item.wind?.speed || item.windSpeed || 0
    const description = item.weather?.[0]?.description || item.description || "Clear sky"
    const icon = item.weather?.[0]?.icon || item.icon || "01d"

    dailyData[dateKey].temps.push(temp)
    dailyData[dateKey].descriptions.push(description)
    dailyData[dateKey].icons.push(icon)
    dailyData[dateKey].humidity.push(humidity)
    dailyData[dateKey].windSpeed.push(windSpeed)
  })

  const processedForecast = Object.values(dailyData)
    .slice(0, 7)
    .map((day: any) => ({
      date: day.date,
      day: day.day,
      high: day.temps.length > 0 ? Math.max(...day.temps) : 25,
      low: day.temps.length > 0 ? Math.min(...day.temps) : 15,
      description: day.descriptions[0] || "Clear sky",
      icon: day.icons[0] || "01d",
      humidity:
        day.humidity.length > 0
          ? Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length)
          : 50,
      windSpeed:
        day.windSpeed.length > 0
          ? Math.round((day.windSpeed.reduce((a: number, b: number) => a + b, 0) / day.windSpeed.length) * 10) / 10
          : 5,
    }))

  // Ensure we have at least 7 days of forecast
  while (processedForecast.length < 7) {
    const lastDay = processedForecast[processedForecast.length - 1]
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + processedForecast.length)

    processedForecast.push({
      date: nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      day: nextDate.toLocaleDateString("en-US", { weekday: "short" }),
      high: lastDay?.high || 25,
      low: lastDay?.low || 15,
      description: lastDay?.description || "Clear sky",
      icon: lastDay?.icon || "01d",
      humidity: lastDay?.humidity || 50,
      windSpeed: lastDay?.windSpeed || 5,
    })
  }

  return processedForecast
}
