import RestaurantDetailClient from './client'

// Generate static paths for all restaurants
export async function generateStaticParams() {
  // Return the restaurant IDs that should be pre-generated
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
  ]
}

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
  return <RestaurantDetailClient restaurantId={params.id} />
}