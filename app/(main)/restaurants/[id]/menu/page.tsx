import { RestaurantMenuClient } from './client'

export function generateStaticParams() {
  return ['1', '2', '3', '4', '5', '6'].map((id) => ({
    id,
  }))
}

export default function RestaurantMenuPage({
  params,
}: {
  params: { id: string }
}) {
  return <RestaurantMenuClient restaurantId={params.id} />
}