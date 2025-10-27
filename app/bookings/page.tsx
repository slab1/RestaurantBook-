import BookingsClient from './client'

export const metadata = {
  title: 'My Bookings - Restaurant Reservations',
  description: 'Manage your restaurant reservations, view booking history, and track loyalty points',
}

export default function BookingsPage() {
  return <BookingsClient />
}