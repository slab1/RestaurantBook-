'use client'

export function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 text-center text-sm font-medium shadow-md">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>DEMO MODE:</strong> This is a fully functional demonstration with sample data. 
          All bookings and payments are simulated. Real database integration available on request.
        </span>
      </div>
    </div>
  )
}
