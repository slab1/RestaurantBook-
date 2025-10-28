'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Search, Filter, Download, MoreVertical, X,
  CheckCircle, Clock, XCircle, AlertTriangle, Eye,
  Calendar, Users, DollarSign, TrendingUp, TrendingDown,
  MessageSquare, RefreshCw, Ban, FileText, Activity,
  ChevronLeft, ChevronRight, AlertCircle, Phone, Mail,
  MapPin, CreditCard, ShieldAlert, CheckSquare, Award
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  adminBookingService,
  type Booking,
  type Dispute,
  type Refund,
  type BookingActivity,
  type BookingStatistics
} from '@/lib/admin-booking-service'

type SortField = 'bookingNumber' | 'date' | 'customerName' | 'totalAmount' | 'createdAt'
type SortOrder = 'asc' | 'desc'
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'

export default function BookingManagement() {
  const { toast } = useToast()

  // State management
  const [bookings, setBookings] = useState<Booking[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [statistics, setStatistics] = useState<BookingStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterDate, setFilterDate] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal states
  const [showBookingDetails, setShowBookingDetails] = useState<string | null>(null)
  const [showDisputeModal, setShowDisputeModal] = useState<string | null>(null)
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null)
  const [showActivityLog, setShowActivityLog] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const itemsPerPage = 10

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allBookings, allDisputes, allRefunds, stats] = await Promise.all([
        adminBookingService.getAllBookings(),
        adminBookingService.getAllDisputes(),
        adminBookingService.getAllRefunds(),
        adminBookingService.getStatistics()
      ])
      setBookings(allBookings)
      setDisputes(allDisputes)
      setRefunds(allRefunds)
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load booking data. Please refresh the page.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtering and sorting
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      const matchesSearch =
        booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
      const matchesDate = !filterDate || booking.date === filterDate

      return matchesSearch && matchesStatus && matchesDate
    })

    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortField) {
        case 'bookingNumber':
          aVal = a.bookingNumber
          bVal = b.bookingNumber
          break
        case 'date':
          aVal = new Date(a.date + ' ' + a.time).getTime()
          bVal = new Date(b.date + ' ' + b.time).getTime()
          break
        case 'customerName':
          aVal = a.customerName.toLowerCase()
          bVal = b.customerName.toLowerCase()
          break
        case 'totalAmount':
          aVal = a.totalAmount
          bVal = b.totalAmount
          break
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [bookings, searchQuery, filterStatus, filterDate, sortField, sortOrder])

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedBookings.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedBookings, currentPage])

  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage)

  // Actions
  const handleConfirmBooking = async (id: string) => {
    try {
      await adminBookingService.confirmBooking(id)
      await loadData()
      toast({
        title: 'Booking Confirmed',
        description: 'The booking has been confirmed successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to confirm booking.',
        variant: 'destructive'
      })
    }
  }

  const handleCancelBooking = async (id: string, reason: string) => {
    try {
      await adminBookingService.cancelBooking(id, reason)
      await loadData()
      toast({
        title: 'Booking Cancelled',
        description: 'The booking has been cancelled.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking.',
        variant: 'destructive'
      })
    }
  }

  const handleCompleteBooking = async (id: string) => {
    try {
      await adminBookingService.completeBooking(id)
      await loadData()
      toast({
        title: 'Booking Completed',
        description: 'The booking has been marked as completed.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete booking.',
        variant: 'destructive'
      })
    }
  }

  const handleMarkNoShow = async (id: string) => {
    try {
      await adminBookingService.markNoShow(id)
      await loadData()
      toast({
        title: 'Marked as No-Show',
        description: 'The booking has been marked as no-show.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark no-show.',
        variant: 'destructive'
      })
    }
  }

  const handleExport = async () => {
    try {
      const csvData = await adminBookingService.exportBookings()
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Export Successful',
        description: 'Booking data has been exported to CSV.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export booking data.',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600 mt-1">Comprehensive platform-wide booking oversight and management</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Bookings"
              value={statistics.total}
              icon={<Calendar className="w-6 h-6" />}
              color="blue"
            />
            <MetricCard
              title="Confirmed"
              value={statistics.confirmed}
              icon={<CheckCircle className="w-6 h-6" />}
              color="green"
            />
            <MetricCard
              title="Pending"
              value={statistics.pending}
              icon={<Clock className="w-6 h-6" />}
              color="yellow"
            />
            <MetricCard
              title="Active Disputes"
              value={statistics.activeDisputes}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.todayBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tomorrow's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.tomorrowBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${statistics.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Refunds</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.pendingRefunds}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Party Size</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.averagePartySize} guests</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancellation Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.cancellationRate}%</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">No-Show Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.noShowRate}%</p>
                </div>
                <Ban className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAnalytics(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{filteredAndSortedBookings.length} bookings</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking #, customer, restaurant, email..."
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
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  field="bookingNumber"
                  currentField={sortField}
                  sortOrder={sortOrder}
                  onSort={toggleSort}
                >
                  Booking #
                </SortableHeader>
                <SortableHeader
                  field="date"
                  currentField={sortField}
                  sortOrder={sortOrder}
                  onSort={toggleSort}
                >
                  Date & Time
                </SortableHeader>
                <SortableHeader
                  field="customerName"
                  currentField={sortField}
                  sortOrder={sortOrder}
                  onSort={toggleSort}
                >
                  Customer
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <SortableHeader
                  field="totalAmount"
                  currentField={sortField}
                  sortOrder={sortOrder}
                  onSort={toggleSort}
                >
                  Amount
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.bookingNumber}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.date}</div>
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.restaurantName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.guests} guests</div>
                    <div className="text-xs text-gray-500">{booking.tablePreference}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${booking.totalAmount}</div>
                    {booking.depositAmount && (
                      <div className="text-xs text-gray-500">Deposit: ${booking.depositAmount}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={booking.status} />
                    {booking.hasDispute && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Dispute
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ActionMenu booking={booking} onViewDetails={setShowBookingDetails} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showBookingDetails && (
        <BookingDetailsModal
          bookingId={showBookingDetails}
          onClose={() => setShowBookingDetails(null)}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
          onComplete={handleCompleteBooking}
          onMarkNoShow={handleMarkNoShow}
        />
      )}

      {showAnalytics && (
        <AnalyticsModal
          bookings={bookings}
          disputes={disputes}
          refunds={refunds}
          statistics={statistics}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  )
}

// Helper Components
function MetricCard({ title, value, icon, color }: any) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={colorClasses[color]}>{icon}</div>
      </div>
    </div>
  )
}

function SortableHeader({ field, currentField, sortOrder, onSort, children }: any) {
  const isActive = currentField === field
  
  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {isActive && (
          <span className="text-blue-600">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
    'confirmed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Confirmed' },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Activity, label: 'In Progress' },
    'completed': { bg: 'bg-purple-100', text: 'text-purple-800', icon: CheckSquare, label: 'Completed' },
    'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Cancelled' },
    'no-show': { bg: 'bg-red-100', text: 'text-red-800', icon: Ban, label: 'No-Show' }
  }

  const config = statusConfig[status] || statusConfig['pending']
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  )
}

function ActionMenu({ booking, onViewDetails }: any) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={() => {
                onViewDetails(booking.id)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center rounded-t-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Customer
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center rounded-b-lg">
              <FileText className="w-4 h-4 mr-2" />
              Activity Log
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Booking Details Modal
function BookingDetailsModal({ bookingId, onClose, onConfirm, onCancel, onComplete, onMarkNoShow }: any) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [activities, setActivities] = useState<BookingActivity[]>([])
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const loadBooking = async () => {
    const data = await adminBookingService.getBookingById(bookingId)
    const acts = await adminBookingService.getBookingActivities(bookingId)
    setBooking(data)
    setActivities(acts)
  }

  if (!booking) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
              <div className="space-y-3">
                <InfoField label="Booking Number" value={booking.bookingNumber} />
                <InfoField label="Status" value={<StatusBadge status={booking.status} />} />
                <InfoField label="Date" value={booking.date} />
                <InfoField label="Time" value={booking.time} />
                <InfoField label="Guests" value={`${booking.guests} people`} />
                <InfoField label="Table Preference" value={booking.tablePreference} />
                {booking.specialOccasion && (
                  <InfoField label="Special Occasion" value={booking.specialOccasion} />
                )}
                {booking.specialRequests && (
                  <InfoField label="Special Requests" value={booking.specialRequests} />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <InfoField label="Name" value={booking.customerName} />
                <InfoField label="Email" value={booking.customerEmail} />
                <InfoField label="Phone" value={booking.customerPhone} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Payment Information</h3>
              <div className="space-y-3">
                <InfoField label="Total Amount" value={`$${booking.totalAmount}`} />
                {booking.depositAmount && (
                  <InfoField label="Deposit Paid" value={`$${booking.depositAmount}`} />
                )}
                <InfoField label="Source" value={booking.source} />
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant</h3>
            <div className="text-gray-900">{booking.restaurantName}</div>
          </div>

          {/* Activity Log */}
          {activities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{activity.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()} • {activity.performedBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {!showCancelForm ? (
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              {booking.status === 'pending' && (
                <button
                  onClick={() => onConfirm(booking.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Booking
                </button>
              )}
              {booking.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => onComplete(booking.id)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => onMarkNoShow(booking.id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Mark No-Show
                  </button>
                </>
              )}
              {['pending', 'confirmed'].includes(booking.status) && (
                <button
                  onClick={() => setShowCancelForm(true)}
                  className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Please provide a reason for cancellation..."
              />
              <div className="flex items-center justify-end space-x-4 mt-4">
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => onCancel(booking.id, cancelReason)}
                  disabled={!cancelReason.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Analytics Modal
function AnalyticsModal({ bookings, disputes, refunds, statistics, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Booking Analytics</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{statistics?.total}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {statistics && statistics.total > 0
                      ? Math.round((statistics.completed / statistics.total) * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    ${statistics?.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
              <div className="space-y-3">
                <StatusBar label="Confirmed" count={statistics?.confirmed} total={statistics?.total} color="green" />
                <StatusBar label="Pending" count={statistics?.pending} total={statistics?.total} color="yellow" />
                <StatusBar label="In Progress" count={statistics?.inProgress} total={statistics?.total} color="blue" />
                <StatusBar label="Completed" count={statistics?.completed} total={statistics?.total} color="purple" />
                <StatusBar label="Cancelled" count={statistics?.cancelled} total={statistics?.total} color="gray" />
                <StatusBar label="No-Show" count={statistics?.noShow} total={statistics?.total} color="red" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Average Party Size</span>
                  <span className="text-lg font-bold text-gray-900">{statistics?.averagePartySize} guests</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Cancellation Rate</span>
                  <span className="text-lg font-bold text-gray-900">{statistics?.cancellationRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">No-Show Rate</span>
                  <span className="text-lg font-bold text-gray-900">{statistics?.noShowRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-600">Active Disputes</span>
                  <span className="text-lg font-bold text-red-900">{statistics?.activeDisputes}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-orange-600">Pending Refunds</span>
                  <span className="text-lg font-bold text-orange-900">{statistics?.pendingRefunds}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['web', 'mobile', 'walk-in', 'phone'].map((source) => {
                const count = bookings.filter((b: Booking) => b.source === source).length
                const percentage = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0
                return (
                  <div key={source} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 capitalize">{source}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                    <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBar({ label, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500',
    red: 'bg-red-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function InfoField({ label, value }: any) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-sm text-gray-900 mt-1">{value}</div>
    </div>
  )
}
