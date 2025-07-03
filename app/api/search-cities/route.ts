import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] })
  }

  try {
    // Using Open-Meteo geocoding API (free and reliable)
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
    )

    if (!response.ok) {
      console.error("Geocoding API response not ok:", response.status, response.statusText)
      return NextResponse.json({ cities: [] })
    }

    const data = await response.json()

    // Check if data has results
    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json({ cities: [] })
    }

    const cities = data.results.map((city: any) => ({
      name: city.name,
      country: city.country,
      state: city.admin1, // State/province information
      lat: city.latitude,
      lon: city.longitude,
    }))

    return NextResponse.json({ cities })
  } catch (error) {
    console.error("City search error:", error)
    return NextResponse.json({ cities: [] })
  }
}
