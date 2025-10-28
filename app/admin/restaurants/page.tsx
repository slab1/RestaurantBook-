'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Search, Filter, Download, MoreVertical, X,
  CheckCircle, Clock, XCircle, AlertTriangle, Eye,
  Store, MapPin, Star, TrendingUp, TrendingDown,
  DollarSign, Calendar, FileText, Shield, Users,
  Phone, Mail, Globe, Edit, Ban, Activity,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Building, Award, ClipboardCheck, AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  adminRestaurantService,
  type Restaurant,
  type RestaurantActivity,
  type Violation
} from '@/lib/admin-restaurant-service'

type SortField = 'name' | 'submittedAt' | 'rating' | 'totalBookings' | 'monthlyRevenue'
type SortOrder = 'asc' | 'desc'
type FilterStatus = 'all' | 'pending' | 'active' | 'inactive' | 'suspended' | 'rejected'
type FilterVerification = 'all' | 'verified' | 'in-progress' | 'pending' | 'failed' | 'expired'

export default function RestaurantManagement() {
  const { toast } = useToast()

  // State management
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterVerification, setFilterVerification] = useState<FilterVerification>('all')
  const [sortField, setSortField] = useState<SortField>('submittedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<string>>(new Set())

  // Modal states
  const [showApplicationReview, setShowApplicationReview] = useState<string | null>(null)
  const [showVerification, setShowVerification] = useState<string | null>(null)
  const [showPerformance, setShowPerformance] = useState<string | null>(null)
  const [showCompliance, setShowCompliance] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState<string | null>(null)
  const [showActivityLog, setShowActivityLog] = useState<string | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)

  const itemsPerPage = 10

  // Load data on mount
  useEffect(() => {
    loadRestaurants()
    loadStatistics()
  }, [])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const allRestaurants = await adminRestaurantService.getAllRestaurants()
      setRestaurants(allRestaurants)
    } catch (error) {
      console.error('Failed to load restaurants:', error)
      toast({
        title: 'Error',
        description: 'Failed to load restaurants. Please refresh the page.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await adminRestaurantService.getStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load statistics:', error)
    }
  }

  // Filtering and sorting
  const filteredAndSortedRestaurants = useMemo(() => {
    let filtered = restaurants.filter(restaurant => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = filterStatus === 'all' || restaurant.status === filterStatus
      const matchesVerification = filterVerification === 'all' || restaurant.verificationStatus === filterVerification

      return matchesSearch && matchesStatus && matchesVerification
    })

    filtered.sort((a, b) => {
      let aVal, bVal

      switch (sortField) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'submittedAt':
          aVal = new Date(a.submittedAt).getTime()
          bVal = new Date(b.submittedAt).getTime()
          break
        case 'rating':
          aVal = a.rating
          bVal = b.rating
          break
        case 'totalBookings':
          aVal = a.totalBookings
          bVal = b.totalBookings
          break
        case 'monthlyRevenue':
          aVal = a.monthlyRevenue
          bVal = b.monthlyRevenue
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [restaurants, searchQuery, filterStatus, filterVerification, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRestaurants.length / itemsPerPage)
  const paginatedRestaurants = filteredAndSortedRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Actions
  const handleApprove = async (id: string) => {
    try {
      await adminRestaurantService.approveRestaurant(id)
      await loadRestaurants()
      await loadStatistics()
      toast({
        title: 'Restaurant Approved',
        description: 'The restaurant has been approved and is now active.',
      })
      setShowApplicationReview(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve restaurant.',
        variant: 'destructive'
      })
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      await adminRestaurantService.rejectRestaurant(id, reason)
      await loadRestaurants()
      await loadStatistics()
      toast({
        title: 'Application Rejected',
        description: 'The restaurant application has been rejected.',
      })
      setShowApplicationReview(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject application.',
        variant: 'destructive'
      })
    }
  }

  const handleSuspend = async (id: string, reason: string) => {
    try {
      await adminRestaurantService.suspendRestaurant(id, reason)
      await loadRestaurants()
      await loadStatistics()
      toast({
        title: 'Restaurant Suspended',
        description: 'The restaurant has been suspended.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend restaurant.',
        variant: 'destructive'
      })
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await adminRestaurantService.activateRestaurant(id)
      await loadRestaurants()
      await loadStatistics()
      toast({
        title: 'Restaurant Activated',
        description: 'The restaurant has been activated.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate restaurant.',
        variant: 'destructive'
      })
    }
  }

  const handleVerify = async (id: string) => {
    try {
      await adminRestaurantService.verifyRestaurant(id)
      await loadRestaurants()
      toast({
        title: 'Restaurant Verified',
        description: 'The restaurant verification has been completed.',
      })
      setShowVerification(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify restaurant.',
        variant: 'destructive'
      })
    }
  }

  const handleExport = async () => {
    try {
      const csvData = await adminRestaurantService.exportRestaurants()
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `restaurants-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Export Successful',
        description: 'Restaurant data has been exported to CSV.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export restaurant data.',
        variant: 'destructive'
      })
    }
  }

  const handleBulkSuspend = async () => {
    try {
      for (const id of selectedRestaurants) {
        await adminRestaurantService.suspendRestaurant(id, 'Bulk suspension by admin')
      }
      await loadRestaurants()
      await loadStatistics()
      setSelectedRestaurants(new Set())
      setShowBulkActions(false)
      toast({
        title: 'Bulk Suspension Complete',
        description: `${selectedRestaurants.size} restaurant(s) have been suspended.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk suspension.',
        variant: 'destructive'
      })
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const toggleSelectAll = () => {
    if (selectedRestaurants.size === paginatedRestaurants.length) {
      setSelectedRestaurants(new Set())
    } else {
      setSelectedRestaurants(new Set(paginatedRestaurants.map(r => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedRestaurants)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRestaurants(newSelected)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
        <p className="text-gray-600 mt-1">Comprehensive restaurant lifecycle management and oversight</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Restaurants"
            value={statistics.total}
            icon={<Store className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Active & Approved"
            value={statistics.approved}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Pending Review"
            value={statistics.pending}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <MetricCard
            title="Suspended"
            value={statistics.suspended}
            icon={<Ban className="w-6 h-6" />}
            color="red"
          />
        </div>
      )}

      {/* Additional Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Restaurants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.verified}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${statistics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalBookings.toLocaleString()}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          {selectedRestaurants.size > 0 && (
            <button
              onClick={() => setShowBulkActions(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bulk Actions ({selectedRestaurants.size})
            </button>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, owner, city, or cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value as FilterVerification)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        {filteredAndSortedRestaurants.length > 0 && (
          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredAndSortedRestaurants.length} restaurant(s)
          </p>
        )}
      </div>

      {/* Restaurants Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRestaurants.size === paginatedRestaurants.length && paginatedRestaurants.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <SortableHeader
                  field="name"
                  label="Restaurant"
                  currentField={sortField}
                  currentOrder={sortOrder}
                  onSort={toggleSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <SortableHeader
                  field="rating"
                  label="Performance"
                  currentField={sortField}
                  currentOrder={sortOrder}
                  onSort={toggleSort}
                />
                <SortableHeader
                  field="monthlyRevenue"
                  label="Revenue"
                  currentField={sortField}
                  currentOrder={sortOrder}
                  onSort={toggleSort}
                />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRestaurants.has(restaurant.id)}
                      onChange={() => toggleSelect(restaurant.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">{restaurant.cuisine.join(', ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{restaurant.ownerName}</div>
                    <div className="text-sm text-gray-500">{restaurant.ownerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {restaurant.city}, {restaurant.state}
                    </div>
                    <div className="text-sm text-gray-500">Capacity: {restaurant.capacity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <StatusBadge status={restaurant.status} />
                      <VerificationBadge status={restaurant.verificationStatus} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {restaurant.rating > 0 ? (
                      <div>
                        <div className="flex items-center text-sm text-gray-900">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})
                        </div>
                        <div className="text-sm text-gray-500">{restaurant.totalBookings} bookings</div>
                        {restaurant.performance.bookingTrend !== 0 && (
                          <div className={`flex items-center text-sm ${restaurant.performance.bookingTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {restaurant.performance.bookingTrend > 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {Math.abs(restaurant.performance.bookingTrend).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No data</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {restaurant.monthlyRevenue > 0 ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          ${restaurant.monthlyRevenue.toLocaleString()}
                        </div>
                        {restaurant.performance.revenueGrowth !== 0 && (
                          <div className={`flex items-center text-sm ${restaurant.performance.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {restaurant.performance.revenueGrowth > 0 ? '+' : ''}
                            {restaurant.performance.revenueGrowth.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">$0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RestaurantActions
                      restaurant={restaurant}
                      onViewApplication={() => setShowApplicationReview(restaurant.id)}
                      onViewVerification={() => setShowVerification(restaurant.id)}
                      onViewPerformance={() => setShowPerformance(restaurant.id)}
                      onViewCompliance={() => setShowCompliance(restaurant.id)}
                      onViewProfile={() => setShowProfile(restaurant.id)}
                      onViewActivity={() => setShowActivityLog(restaurant.id)}
                      onApprove={() => handleApprove(restaurant.id)}
                      onSuspend={() => handleSuspend(restaurant.id, 'Suspended by admin')}
                      onActivate={() => handleActivate(restaurant.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showApplicationReview && (
        <ApplicationReviewModal
          restaurantId={showApplicationReview}
          onClose={() => setShowApplicationReview(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {showVerification && (
        <VerificationModal
          restaurantId={showVerification}
          onClose={() => setShowVerification(null)}
          onVerify={handleVerify}
        />
      )}

      {showPerformance && (
        <PerformanceModal
          restaurantId={showPerformance}
          onClose={() => setShowPerformance(null)}
        />
      )}

      {showCompliance && (
        <ComplianceModal
          restaurantId={showCompliance}
          onClose={() => setShowCompliance(null)}
        />
      )}

      {showProfile && (
        <ProfileModal
          restaurantId={showProfile}
          onClose={() => setShowProfile(null)}
          onUpdate={loadRestaurants}
        />
      )}

      {showActivityLog && (
        <ActivityLogModal
          restaurantId={showActivityLog}
          onClose={() => setShowActivityLog(null)}
        />
      )}

      {showBulkActions && (
        <BulkActionsModal
          selectedCount={selectedRestaurants.size}
          onClose={() => setShowBulkActions(false)}
          onSuspend={handleBulkSuspend}
        />
      )}
    </div>
  )
}

// Component: MetricCard
function MetricCard({ title, value, icon, color }: any) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={colorClasses[color as keyof typeof colorClasses]}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Component: SortableHeader
function SortableHeader({ field, label, currentField, currentOrder, onSort }: any) {
  const isActive = currentField === field

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {isActive && (
          currentOrder === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        )}
      </div>
    </th>
  )
}

// Component: StatusBadge
function StatusBadge({ status }: { status: string }) {
  const badges: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Inactive' },
    suspended: { color: 'bg-red-100 text-red-800', icon: Ban, label: 'Suspended' },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
  }

  const badge = badges[status] || badges.pending
  const Icon = badge.icon

  return (
    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {badge.label}
    </span>
  )
}

// Component: VerificationBadge
function VerificationBadge({ status }: { status: string }) {
  const badges: Record<string, { color: string; icon: any; label: string }> = {
    verified: { color: 'bg-blue-100 text-blue-800', icon: Shield, label: 'Verified' },
    'in-progress': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Verifying' },
    pending: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
    failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Failed' },
    expired: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Expired' }
  }

  const badge = badges[status] || badges.pending
  const Icon = badge.icon

  return (
    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {badge.label}
    </span>
  )
}

// Component: RestaurantActions
function RestaurantActions({ restaurant, onViewApplication, onViewVerification, onViewPerformance, onViewCompliance, onViewProfile, onViewActivity, onApprove, onSuspend, onActivate }: any) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={() => { onViewProfile(); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </button>
            <button
              onClick={() => { onViewPerformance(); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance Metrics
            </button>
            <button
              onClick={() => { onViewCompliance(); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Compliance & Quality
            </button>
            <button
              onClick={() => { onViewVerification(); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Verification Status
            </button>
            <button
              onClick={() => { onViewActivity(); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </button>
            
            <div className="border-t border-gray-200 my-1"></div>

            {restaurant.status === 'pending' && (
              <>
                <button
                  onClick={() => { onViewApplication(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Review Application
                </button>
                <button
                  onClick={() => { onApprove(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
              </>
            )}

            {(restaurant.status === 'active' || restaurant.status === 'approved') && (
              <button
                onClick={() => { onSuspend(); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Ban className="w-4 h-4 mr-2" />
                Suspend
              </button>
            )}

            {(restaurant.status === 'suspended' || restaurant.status === 'inactive') && (
              <button
                onClick={() => { onActivate(); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Modal: Application Review
function ApplicationReviewModal({ restaurantId, onClose, onApprove, onReject }: any) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const data = await adminRestaurantService.getRestaurantById(restaurantId)
    setRestaurant(data)
  }

  if (!restaurant) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Application Review</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Name" value={restaurant.name} />
              <InfoField label="Cuisine" value={restaurant.cuisine.join(', ')} />
              <InfoField label="Address" value={`${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}`} />
              <InfoField label="Phone" value={restaurant.phone} />
              <InfoField label="Email" value={restaurant.email} />
              <InfoField label="Website" value={restaurant.website || 'N/A'} />
              <InfoField label="Capacity" value={`${restaurant.capacity} seats`} />
              <InfoField label="Price Range" value={restaurant.priceRange} />
            </div>
          </div>

          {/* Owner Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Owner Name" value={restaurant.ownerName} />
              <InfoField label="Owner Email" value={restaurant.ownerEmail} />
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="space-y-2">
              <DocStatus label="Business License" doc={restaurant.documents.businessLicense} />
              <DocStatus label="Health Certificate" doc={restaurant.documents.healthCertificate} />
              <DocStatus label="Tax ID" doc={restaurant.documents.taxId} />
              <DocStatus label="Insurance Certificate" doc={restaurant.documents.insuranceCertificate} />
              <DocStatus label="Food Handler Certificate" doc={restaurant.documents.foodHandlerCertificate} />
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
            <div className="flex flex-wrap gap-2">
              {restaurant.features.map((feature, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(restaurant.operatingHours).map(([day, hours]: [string, any]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 capitalize">{day}:</span>
                  <span className="text-gray-600">
                    {hours.open === 'closed' ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!showRejectForm ? (
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => onApprove(restaurantId)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve & Activate
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Please provide a reason for rejection..."
              />
              <div className="flex items-center justify-end space-x-4 mt-4">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onReject(restaurantId, rejectReason)}
                  disabled={!rejectReason.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Modal: Verification
function VerificationModal({ restaurantId, onClose, onVerify }: any) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const data = await adminRestaurantService.getRestaurantById(restaurantId)
    setRestaurant(data)
  }

  if (!restaurant) return null

  const allDocsVerified = Object.values(restaurant.documents).every((doc: any) => doc.verified)
  const canVerify = allDocsVerified && restaurant.verificationStatus !== 'verified'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Verification Status</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
            <VerificationBadge status={restaurant.verificationStatus} />
            {restaurant.lastVerifiedAt && (
              <p className="text-sm text-gray-600 mt-2">
                Last verified: {new Date(restaurant.lastVerifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Verification Checklist</h3>
            <div className="space-y-3">
              <DocVerificationItem label="Business License" doc={restaurant.documents.businessLicense} />
              <DocVerificationItem label="Health Certificate" doc={restaurant.documents.healthCertificate} />
              <DocVerificationItem label="Tax ID" doc={restaurant.documents.taxId} />
              <DocVerificationItem label="Insurance Certificate" doc={restaurant.documents.insuranceCertificate} />
              <DocVerificationItem label="Food Handler Certificate" doc={restaurant.documents.foodHandlerCertificate} />
            </div>
          </div>

          {!allDocsVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Incomplete Verification</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Some documents are not yet verified. All documents must be verified before completing restaurant verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {canVerify && (
              <button
                onClick={() => onVerify(restaurantId)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Verification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal: Performance
function PerformanceModal({ restaurantId, onClose }: any) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const data = await adminRestaurantService.getRestaurantById(restaurantId)
    setRestaurant(data)
  }

  if (!restaurant) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
            <p className="text-gray-600">{restaurant.city}, {restaurant.state}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBox
              label="Overall Rating"
              value={restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'N/A'}
              icon={<Star className="w-5 h-5 text-yellow-500" />}
            />
            <MetricBox
              label="Total Reviews"
              value={restaurant.reviewCount}
              icon={<FileText className="w-5 h-5 text-blue-500" />}
            />
            <MetricBox
              label="Total Bookings"
              value={restaurant.totalBookings}
              icon={<Calendar className="w-5 h-5 text-green-500" />}
            />
            <MetricBox
              label="Monthly Revenue"
              value={`$${restaurant.monthlyRevenue.toLocaleString()}`}
              icon={<DollarSign className="w-5 h-5 text-purple-500" />}
            />
          </div>

          {/* Performance Indicators */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
            <div className="space-y-3">
              <PerformanceRow
                label="Booking Trend"
                value={restaurant.performance.bookingTrend}
                suffix="%"
              />
              <PerformanceRow
                label="Revenue Growth"
                value={restaurant.performance.revenueGrowth}
                suffix="%"
              />
              <PerformanceRow
                label="Cancellation Rate"
                value={restaurant.performance.cancellationRate}
                suffix="%"
                inverse
              />
              <PerformanceRow
                label="Customer Retention"
                value={restaurant.performance.customerRetention}
                suffix="%"
              />
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Response Time</span>
                <span className="text-sm text-gray-900">{restaurant.performance.responseTime} min</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Performance Summary</h4>
            <p className="text-sm text-blue-800">
              {restaurant.performance.bookingTrend > 0
                ? `This restaurant is experiencing positive growth with a ${restaurant.performance.bookingTrend.toFixed(1)}% increase in bookings.`
                : restaurant.performance.bookingTrend < 0
                ? `This restaurant is experiencing a decline with a ${Math.abs(restaurant.performance.bookingTrend).toFixed(1)}% decrease in bookings.`
                : 'This restaurant has stable booking performance.'}
              {' '}
              Customer retention is at {restaurant.performance.customerRetention.toFixed(1)}%.
            </p>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal: Compliance
function ComplianceModal({ restaurantId, onClose }: any) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const data = await adminRestaurantService.getRestaurantById(restaurantId)
    setRestaurant(data)
  }

  if (!restaurant) return null

  const hasViolations = restaurant.compliance.violations.length > 0
  const complianceScore = restaurant.compliance.healthInspectionScore

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Compliance & Quality Assurance</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
            <StatusBadge status={restaurant.status} />
          </div>

          {/* Health Inspection Score */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Inspection</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Inspection Score</span>
                <span className={`text-2xl font-bold ${
                  complianceScore >= 90 ? 'text-green-600' :
                  complianceScore >= 80 ? 'text-yellow-600' :
                  complianceScore > 0 ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {complianceScore > 0 ? complianceScore : 'N/A'}
                </span>
              </div>
              {restaurant.compliance.lastInspectionDate && (
                <p className="text-sm text-gray-600">
                  Last inspection: {new Date(restaurant.compliance.lastInspectionDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Compliance Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{restaurant.compliance.warnings}</p>
              <p className="text-sm text-yellow-600 mt-1">Warnings</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{restaurant.compliance.violations.length}</p>
              <p className="text-sm text-red-600 mt-1">Violations</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-700">{restaurant.compliance.suspensions}</p>
              <p className="text-sm text-orange-600 mt-1">Suspensions</p>
            </div>
          </div>

          {/* Violations */}
          {hasViolations && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Violations</h3>
              <div className="space-y-3">
                {restaurant.compliance.violations.map((violation: Violation) => (
                  <div
                    key={violation.id}
                    className={`border rounded-lg p-4 ${
                      violation.severity === 'critical' ? 'border-red-300 bg-red-50' :
                      violation.severity === 'major' ? 'border-orange-300 bg-orange-50' :
                      'border-yellow-300 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            violation.severity === 'critical' ? 'bg-red-600 text-white' :
                            violation.severity === 'major' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {violation.severity.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{violation.type}</span>
                        </div>
                        <p className="text-sm text-gray-700">{violation.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Reported: {new Date(violation.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        {violation.resolved ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            <span className="text-sm font-medium">Resolved</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <AlertTriangle className="w-5 h-5 mr-1" />
                            <span className="text-sm font-medium">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasViolations && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  No violations on record. This restaurant maintains good compliance standards.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal: Profile
function ProfileModal({ restaurantId, onClose, onUpdate }: any) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const data = await adminRestaurantService.getRestaurantById(restaurantId)
    setRestaurant(data)
  }

  if (!restaurant) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Restaurant Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Name" value={restaurant.name} />
              <InfoField label="Cuisine Types" value={restaurant.cuisine.join(', ')} />
              <InfoField label="Price Range" value={restaurant.priceRange} />
              <InfoField label="Capacity" value={`${restaurant.capacity} seats`} />
              <div className="col-span-2">
                <InfoField label="Description" value={restaurant.description} />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Phone" value={restaurant.phone} icon={<Phone className="w-4 h-4" />} />
              <InfoField label="Email" value={restaurant.email} icon={<Mail className="w-4 h-4" />} />
              <InfoField label="Website" value={restaurant.website || 'N/A'} icon={<Globe className="w-4 h-4" />} />
              <InfoField label="Location" value={`${restaurant.city}, ${restaurant.state}`} icon={<MapPin className="w-4 h-4" />} />
              <div className="col-span-2">
                <InfoField label="Address" value={`${restaurant.address}, ${restaurant.zipCode}`} />
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Owner Name" value={restaurant.ownerName} />
              <InfoField label="Owner Email" value={restaurant.ownerEmail} />
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {restaurant.features.map((feature, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(restaurant.operatingHours).map(([day, hours]: [string, any]) => (
                <div key={day} className="flex justify-between text-sm py-1">
                  <span className="font-medium text-gray-700 capitalize">{day}:</span>
                  <span className="text-gray-600">
                    {hours.open === 'closed' ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal: Activity Log
function ActivityLogModal({ restaurantId, onClose }: any) {
  const [activities, setActivities] = useState<RestaurantActivity[]>([])

  useEffect(() => {
    loadActivities()
  }, [restaurantId])

  const loadActivities = async () => {
    const data = await adminRestaurantService.getRestaurantActivities(restaurantId)
    setActivities(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                      {activity.performedBy && (
                        <p className="text-xs text-gray-600 mt-1">
                          By: {activity.performedBy}
                        </p>
                      )}
                    </div>
                    <ActivityTypeBadge type={activity.type} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No activity recorded yet</p>
            </div>
          )}

          <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal: Bulk Actions
function BulkActionsModal({ selectedCount, onClose, onSuspend }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Bulk Actions</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            {selectedCount} restaurant(s) selected
          </p>

          <div className="space-y-3">
            <button
              onClick={onSuspend}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <Ban className="w-5 h-5 mr-2" />
              Suspend Selected Restaurants
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function InfoField({ label, value, icon }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="flex items-center mt-1">
        {icon && <span className="text-gray-400 mr-2">{icon}</span>}
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function DocStatus({ label, doc }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center space-x-2">
        {doc.uploaded ? (
          <span className="text-xs text-green-600 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Uploaded
          </span>
        ) : (
          <span className="text-xs text-gray-400 flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Not uploaded
          </span>
        )}
        {doc.verified ? (
          <span className="text-xs text-blue-600 flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </span>
        ) : (
          <span className="text-xs text-gray-400">Unverified</span>
        )}
      </div>
    </div>
  )
}

function DocVerificationItem({ label, doc }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {doc.expiryDate && (
          <p className="text-xs text-gray-500 mt-1">
            Expires: {new Date(doc.expiryDate).toLocaleDateString()}
          </p>
        )}
        {doc.notes && (
          <p className="text-xs text-orange-600 mt-1">{doc.notes}</p>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {doc.uploaded && <CheckCircle className="w-5 h-5 text-green-600" />}
        {doc.verified && <Shield className="w-5 h-5 text-blue-600" />}
        {!doc.uploaded && <XCircle className="w-5 h-5 text-gray-400" />}
      </div>
    </div>
  )
}

function MetricBox({ label, value, icon }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  )
}

function PerformanceRow({ label, value, suffix, inverse = false }: any) {
  const isPositive = inverse ? value < 0 : value > 0
  const isNegative = inverse ? value > 0 : value < 0

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-semibold ${
          isPositive ? 'text-green-600' :
          isNegative ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {value > 0 && !inverse && '+'}{value.toFixed(1)}{suffix}
        </span>
        {isPositive && <TrendingUp className="w-4 h-4 text-green-600" />}
        {isNegative && <TrendingDown className="w-4 h-4 text-red-600" />}
      </div>
    </div>
  )
}

function ActivityTypeBadge({ type }: { type: string }) {
  const badges: Record<string, { color: string; label: string }> = {
    status_change: { color: 'bg-blue-100 text-blue-800', label: 'Status' },
    verification: { color: 'bg-purple-100 text-purple-800', label: 'Verification' },
    compliance: { color: 'bg-red-100 text-red-800', label: 'Compliance' },
    performance: { color: 'bg-green-100 text-green-800', label: 'Performance' },
    admin_action: { color: 'bg-gray-100 text-gray-800', label: 'Admin' }
  }

  const badge = badges[type] || badges.admin_action

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
      {badge.label}
    </span>
  )
}
