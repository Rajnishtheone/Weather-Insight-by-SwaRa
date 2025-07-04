import { type NextRequest, NextResponse } from "next/server"

const WEATHERAPI_KEY = process.env.RAPIDAPI_KEY // still using the same env var for key

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!WEATHERAPI_KEY) {
    return NextResponse.json(
      {
        error: "WeatherAPI key is required. Please add RAPIDAPI_KEY to your environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    let query = ""
    if (lat && lon) {
      query = `${lat},${lon}`
    } else if (city) {
      query = city
    } else {
      return NextResponse.json({ error: "City or coordinates are required" }, { status: 400 })
    }

    // Build WeatherAPI.com URL
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=no&alerts=no`
    console.log("Fetching from:", forecastUrl)

    const forecastResponse = await fetch(forecastUrl)
    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text()
      console.error("Forecast API error:", forecastResponse.status, forecastResponse.statusText)
      console.error("Error response:", errorText)
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }

    const forecastData = await forecastResponse.json()
    console.log("API Response:", JSON.stringify(forecastData, null, 2))

    // Process the API response for weatherapi.com
    const weatherData = processWeatherApiData(forecastData)
    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

function processWeatherApiData(apiData: any) {
  // Extract current weather
  const current = {
    city: apiData.location?.name || "Unknown",
    country: apiData.location?.country || "",
    temperature: apiData.current?.temp_c ?? 20,
    description: apiData.current?.condition?.text || "Clear sky",
    icon: apiData.current?.condition?.icon || "01d",
    humidity: apiData.current?.humidity ?? 50,
    windSpeed: apiData.current?.wind_kph ? Math.round(apiData.current.wind_kph / 3.6) : 0, // convert kph to m/s
    windDirection: apiData.current?.wind_degree ?? 0,
    pressure: apiData.current?.pressure_mb ?? 1013,
    visibility: apiData.current?.vis_km ? apiData.current.vis_km * 1000 : 10000, // km to m
    feelsLike: apiData.current?.feelslike_c ?? apiData.current?.temp_c ?? 20,
    uvIndex: apiData.current?.uv ?? 0,
  }

  // Extract 7-day forecast
  const forecast = (apiData.forecast?.forecastday || []).map((day: any) => ({
    date: day.date,
    day: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
    high: day.day?.maxtemp_c ?? 25,
    low: day.day?.mintemp_c ?? 15,
    description: day.day?.condition?.text || "Clear sky",
    icon: day.day?.condition?.icon || "01d",
    humidity: day.day?.avghumidity ?? 50,
    windSpeed: day.day?.maxwind_kph ? Math.round(day.day.maxwind_kph / 3.6) : 0, // kph to m/s
  }))

  return { current, forecast }
}
