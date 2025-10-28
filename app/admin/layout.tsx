import { Metadata } from 'next'
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { ErrorBoundary } from '@/components/error-boundary'
import { SafeClientProvider } from '@/components/providers/safe-client-provider'

export const metadata: Metadata = {
  title: 'Admin Dashboard - RestaurantBook',
  description: 'Administrative interface for RestaurantBook platform management',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <SafeClientProvider>
        <AdminAuthGuard>
          <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <AdminHeader />
              
              {/* Page Content */}
              <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AdminAuthGuard>
      </SafeClientProvider>
    </ErrorBoundary>
  )
}
