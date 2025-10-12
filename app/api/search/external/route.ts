import { NextRequest, NextResponse } from 'next/server'
import { YelpService, GoogleMapsService } from '@/lib/external-apis'

// GET /api/search/external - Search external APIs for restaurant data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || 'restaurants'
    const location = searchParams.get('location')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const source = searchParams.get('source') || 'yelp' // 'yelp' or 'google'

    let results = []

    if (source === 'yelp') {
      // Search Yelp for restaurants
      const yelpResults = await YelpService.searchRestaurants({
        term: query,
        location: location || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        limit: 20,
      })

      results = yelpResults.map((business: any) => ({
        id: business.id,
        name: business.name,
        description: business.categories?.map((cat: any) => cat.title).join(', '),
        address: business.location?.display_address?.join(', '),
        phone: business.phone,
        rating: business.rating,
        reviewCount: business.review_count,
        imageUrl: business.image_url,
        priceRange: business.price,
        cuisine: business.categories?.[0]?.title,
        latitude: business.coordinates?.latitude,
        longitude: business.coordinates?.longitude,
        source: 'yelp',
        externalUrl: business.url,
      }))
    } else if (source === 'google') {
      // Search Google Places for restaurants
      const lat = latitude ? parseFloat(latitude) : 40.7128
      const lng = longitude ? parseFloat(longitude) : -74.0060
      
      const googleResults = await GoogleMapsService.searchNearbyRestaurants(
        lat,
        lng,
        5000
      )

      results = googleResults.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        description: place.types?.join(', '),
        address: place.vicinity,
        rating: place.rating,
        priceRange: place.price_level ? '$'.repeat(place.price_level) : undefined,
        imageUrl: place.photos?.[0] 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
          : undefined,
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
        source: 'google',
        isOpen: place.opening_hours?.open_now,
      }))
    }

    return NextResponse.json({
      results,
      source,
      query,
      location: location || `${latitude}, ${longitude}`,
    })
  } catch (error) {
    console.error('External search error:', error)
    return NextResponse.json(
      { error: 'External search failed' },
      { status: 500 }
    )
  }
}