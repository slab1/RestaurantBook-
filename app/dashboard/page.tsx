import DashboardClient from './client'

export const metadata = {
  title: 'Restaurant Dashboard - Manage Your Restaurant',
  description: 'Comprehensive dashboard for restaurant owners to manage bookings, menu, reviews, and analytics',
}

export default function DashboardPage() {
  return <DashboardClient />
}