'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Store, Search, Filter, Download, MoreVertical, X,
  CheckCircle, XCircle, Clock, AlertTriangle, Eye,
  Edit, MapPin, Star, TrendingUp, TrendingDown,
  FileText, Shield, Award, Phone, Mail, Globe,
  Calendar, DollarSign, Users, BarChart3, Activity,
  Ban, PlayCircle, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  adminRestaurantService,
  type Restaurant,
  type RestaurantActivity
} from '@/lib/admin-restaurant-service'

type SortField = 'name' | 'rating' | 'totalBookings' | 'monthlyRevenue' | 'submittedAt'
type FilterStatus = 'all' | 'pending' | 'approved' | 'active' | 'suspended' | 'inactive'

export default function ComprehensiveRestaurantManagement() {
  const { toast } = useToast()
  
  // State management
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortField, setSortField] = useState<SortField>('submittedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<any>(null)
  
  // Modal states
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [showReview, setShowReview] = useState<string | null>(null)
  const [showVerification, setShowVerification] = useState<string | null>(null)
  const [showPerformance, setShowPerformance] = useState<string | null>(null)
  const [showCompliance, setShowCompliance] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState<string | null>(null)
  const [showActivityLog, setShowActivityLog] = useState<string | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  const itemsPerPage = 10

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allRestaurants, statistics] = await Promise.all([
        adminRestaurantService.getAllRestaurants(),
        adminRestaurantService.getStatistics()
      ])
      setRestaurants(allRestaurants)
      setStats(statistics)
    } catch (error) {
      console.error('Failed to load restaurants:', error)
      toast({
        title: 'Error',
        description: 'Failed to load restaurant data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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
      
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortField) {
        case 'name':
          aVal = a.name
          bVal = b.name
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
        case 'submittedAt':
          aVal = new Date(a.submittedAt).getTime()
          bVal = new Date(b.submittedAt).getTime()
          break
        default:
          aVal = a.name
          bVal = b.name
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [restaurants, searchQuery, filterStatus, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRestaurants.length / itemsPerPage)
  const paginatedRestaurants = filteredAndSortedRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const handleApprove = async (id: string) => {
    try {
      await adminRestaurantService.approveRestaurant(id)
      await loadData()
      toast({
        title: 'Restaurant approved',
        description: 'The restaurant has been approved and activated'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve restaurant',
        variant: 'destructive'
      })
    }
  }

  const handleSuspend = async (id: string, reason: string) => {
    try {
      await adminRestaurantService.suspendRestaurant(id, reason)
      await loadData()
      toast({
        title: 'Restaurant suspended',
        description: 'The restaurant has been suspended'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend restaurant',
        variant: 'destructive'
      })
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await adminRestaurantService.activateRestaurant(id)
      await loadData()
      toast({
        title: 'Restaurant activated',
        description: 'The restaurant has been reactivated'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate restaurant',
        variant: 'destructive'
      })
    }
  }

  const handleExport = async () => {
    try {
      const csvContent = await adminRestaurantService.exportRestaurants()
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `restaurants-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Export completed',
        description: `${filteredAndSortedRestaurants.length} restaurant(s) exported`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export restaurants',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
        <p className="text-gray-600 mt-1">Comprehensive restaurant lifecycle management</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Restaurants"
            value={stats.total.toString()}
            icon={<Store className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Active"
            value={stats.approved.toString()}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Pending Review"
            value={stats.pending.toString()}
            icon={<Clock className="w-5 h-5" />}
            color="yellow"
          />
          <StatCard
            label="Total Revenue"
            value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
            icon={<DollarSign className="w-5 h-5" />}
            color="purple"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as FilterStatus)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRestaurants.size === paginatedRestaurants.length && paginatedRestaurants.length > 0}
                    onChange={() => {
                      if (selectedRestaurants.size === paginatedRestaurants.length) {
                        setSelectedRestaurants(new Set())
                      } else {
                        setSelectedRestaurants(new Set(paginatedRestaurants.map(r => r.id)))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
                <SortableHeader label="Restaurant" field="name" currentField={sortField} order={sortOrder} onClick={(f) => {
                  if (sortField === f) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortField(f)
                    setSortOrder('desc')
                  }
                }} />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <SortableHeader label="Performance" field="rating" currentField={sortField} order={sortOrder} onClick={(f) => {
                  if (sortField === f) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortField(f)
                    setSortOrder('desc')
                  }
                }} />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRestaurants.has(restaurant.id)}
                      onChange={() => {
                        const newSelection = new Set(selectedRestaurants)
                        if (newSelection.has(restaurant.id)) {
                          newSelection.delete(restaurant.id)
                        } else {
                          newSelection.add(restaurant.id)
                        }
                        setSelectedRestaurants(newSelection)
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {restaurant.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{restaurant.name}</div>
                        <div className="text-sm text-gray-500">{restaurant.cuisine.slice(0, 2).join(', ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{restaurant.ownerName}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {restaurant.city}, {restaurant.state}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={restaurant.status} />
                      <VerificationBadge status={restaurant.verificationStatus} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {restaurant.status === 'active' || restaurant.status === 'approved' ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({restaurant.reviewCount})</span>
                        </div>
                        <div className="text-sm text-gray-600">{restaurant.totalBookings} bookings</div>
                        <div className="text-sm text-gray-600">${restaurant.monthlyRevenue.toLocaleString()}/mo</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDetails(restaurant.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowPerformance(restaurant.id)}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                        title="Performance"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      {restaurant.status === 'pending' && (
                        <button
                          onClick={() => setShowReview(restaurant.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Review Application"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {restaurant.status === 'active' && (
                        <button
                          onClick={() => handleSuspend(restaurant.id, 'Admin action')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {restaurant.status === 'suspended' && (
                        <button
                          onClick={() => handleActivate(restaurant.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Activate"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedRestaurants.length)} of {filteredAndSortedRestaurants.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetails && <RestaurantDetailsModal restaurantId={showDetails} onClose={() => setShowDetails(null)} onRefresh={loadData} />}
      {showReview && <ApplicationReviewModal restaurantId={showReview} onClose={() => setShowReview(null)} onRefresh={loadData} />}
      {showPerformance && <PerformanceMetricsModal restaurantId={showPerformance} onClose={() => setShowPerformance(null)} />}
    </div>
  )
}

// Helper components
function StatCard({ label, value, icon, color }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color as keyof typeof colors]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function SortableHeader({ label, field, currentField, order, onClick }: any) {
  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
      onClick={() => onClick(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {currentField === field && (
          <span className="text-blue-600">{order === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-700'
  }
  
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  )
}

function VerificationBadge({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
        <Shield className="w-3 h-3" />
        Verified
      </span>
    )
  }
  return null
}

// Modal components (simplified for now - will be expanded)
function RestaurantDetailsModal({ restaurantId, onClose, onRefresh }: any) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const r = await adminRestaurantService.getRestaurantById(restaurantId)
    setRestaurant(r)
  }

  if (!restaurant) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Restaurant Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {restaurant.name}</div>
                <div><strong>Owner:</strong> {restaurant.ownerName}</div>
                <div><strong>Cuisine:</strong> {restaurant.cuisine.join(', ')}</div>
                <div><strong>Capacity:</strong> {restaurant.capacity} seats</div>
                <div><strong>Price Range:</strong> {restaurant.priceRange}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {restaurant.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {restaurant.email}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {restaurant.address}, {restaurant.city}, {restaurant.state}
                </div>
                {restaurant.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {restaurant.website}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600">{restaurant.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
            <div className="flex flex-wrap gap-2">
              {restaurant.features.map((feature, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplicationReviewModal({ restaurantId, onClose, onRefresh }: any) {
  const { toast } = useToast()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const r = await adminRestaurantService.getRestaurantById(restaurantId)
    setRestaurant(r)
  }

  const handleApprove = async () => {
    try {
      await adminRestaurantService.approveRestaurant(restaurantId)
      toast({ title: 'Restaurant approved', description: 'Application has been approved' })
      onRefresh()
      onClose()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' })
    }
  }

  const handleReject = async () => {
    try {
      await adminRestaurantService.rejectRestaurant(restaurantId, 'Does not meet requirements')
      toast({ title: 'Application rejected', description: 'Restaurant application rejected' })
      onRefresh()
      onClose()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject', variant: 'destructive' })
    }
  }

  if (!restaurant) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Review Application</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Restaurant: {restaurant.name}</h3>
            <p className="text-sm text-gray-600">Owner: {restaurant.ownerName}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Document Verification</h4>
            <div className="space-y-2">
              {Object.entries(restaurant.documents).map(([key, doc]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {doc.verified ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : doc.uploaded ? (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleApprove}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={handleReject}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PerformanceMetricsModal({ restaurantId, onClose }: any) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const r = await adminRestaurantService.getRestaurantById(restaurantId)
    setRestaurant(r)
  }

  if (!restaurant) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Booking Trend"
              value={`${restaurant.performance.bookingTrend > 0 ? '+' : ''}${restaurant.performance.bookingTrend}%`}
              trend={restaurant.performance.bookingTrend > 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="Revenue Growth"
              value={`${restaurant.performance.revenueGrowth > 0 ? '+' : ''}${restaurant.performance.revenueGrowth}%`}
              trend={restaurant.performance.revenueGrowth > 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="Average Rating"
              value={restaurant.performance.averageRating.toFixed(1)}
            />
            <MetricCard
              label="Customer Retention"
              value={`${restaurant.performance.customerRetention.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, trend }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          trend === 'up' ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )
        )}
      </div>
    </div>
  )
}
