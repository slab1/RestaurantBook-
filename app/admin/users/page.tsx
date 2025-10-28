'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Search, Filter, Download, Mail, Ban, CheckCircle, X,
  Eye, Clock, TrendingUp, MapPin, Calendar, DollarSign,
  Star, FileText, Shield, AlertTriangle, Check, XCircle,
  MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  adminUserService,
  type User,
  type UserActivity,
  type RestaurantApplication
} from '@/lib/admin-user-service'
import { userEngagementMetrics } from '@/lib/mock-user-data'

type SortField = 'name' | 'email' | 'createdAt' | 'lastLogin' | 'totalBookings' | 'totalSpent'
type SortOrder = 'asc' | 'desc'
type FilterStatus = 'all' | 'active' | 'suspended' | 'pending'

export default function EnhancedUserManagement() {
  const { toast } = useToast()
  
  // State management
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingAppCount, setPendingAppCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null)
  const [showActivityLog, setShowActivityLog] = useState<string | null>(null)
  const [showApprovals, setShowApprovals] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  const itemsPerPage = 10

  // Load users on mount
  useEffect(() => {
    loadUsers()
    loadPendingCount()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await adminUserService.getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users. Please refresh the page.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPendingCount = async () => {
    try {
      const apps = await adminUserService.getAllApplications()
      setPendingAppCount(apps.filter(a => a.status === 'pending').length)
    } catch (error) {
      console.error('Failed to load pending count:', error)
    }
  }

  // Filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal, bVal

      switch (sortField) {
        case 'name':
          aVal = `${a.firstName} ${a.lastName}`
          bVal = `${b.firstName} ${b.lastName}`
          break
        case 'email':
          aVal = a.email
          bVal = b.email
          break
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
        case 'lastLogin':
          aVal = new Date(a.lastLogin).getTime()
          bVal = new Date(b.lastLogin).getTime()
          break
        case 'totalBookings':
          aVal = a.totalBookings
          bVal = b.totalBookings
          break
        case 'totalSpent':
          aVal = a.totalSpent
          bVal = b.totalSpent
          break
        default:
          aVal = a.email
          bVal = b.email
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [users, searchQuery, filterStatus, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      await adminUserService.suspendUser(userId)
      await loadUsers() // Reload to get updated data
      toast({
        title: 'User suspended',
        description: 'The user account has been suspended successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend user',
        variant: 'destructive'
      })
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      await adminUserService.activateUser(userId)
      await loadUsers() // Reload to get updated data
      toast({
        title: 'User activated',
        description: 'The user account has been activated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate user',
        variant: 'destructive'
      })
    }
  }

  const handleSelectUser = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)))
    }
  }

  const handleBulkSuspend = async () => {
    try {
      const count = selectedUsers.size
      const userIds = Array.from(selectedUsers)
      await adminUserService.bulkSuspendUsers(userIds)
      await loadUsers() // Reload to get updated data
      setSelectedUsers(new Set())
      setShowBulkActions(false)
      toast({
        title: 'Bulk action completed',
        description: `${count} user(s) have been suspended.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend users',
        variant: 'destructive'
      })
    }
  }

  const handleBulkEmail = () => {
    const count = selectedUsers.size
    setSelectedUsers(new Set())
    setShowBulkActions(false)
    toast({
      title: 'Email sent',
      description: `Notification email sent to ${count} user(s).`,
    })
  }

  const handleExportUsers = async () => {
    try {
      const csvContent = await adminUserService.exportUsers()
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Export completed',
        description: `${filteredAndSortedUsers.length} user(s) exported to CSV.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export users',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, approvals, and analytics</p>
        </div>
        <button
          onClick={() => setShowApprovals(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <AlertTriangle className="w-5 h-5" />
          Pending Approvals ({pendingAppCount})
        </button>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard 
          label="Daily Active"
          value={userEngagementMetrics.dailyActiveUsers.toLocaleString()}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard 
          label="Weekly Active"
          value={userEngagementMetrics.weeklyActiveUsers.toLocaleString()}
          icon={<Calendar className="w-5 h-5" />}
        />
        <MetricCard 
          label="Monthly Active"
          value={userEngagementMetrics.monthlyActiveUsers.toLocaleString()}
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard 
          label="Avg Session"
          value={userEngagementMetrics.averageSessionDuration}
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard 
          label="Conversion"
          value={userEngagementMetrics.bookingConversionRate}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard 
          label="Repeat Users"
          value={userEngagementMetrics.repeatUserRate}
          icon={<Star className="w-5 h-5" />}
        />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as FilterStatus)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>

            <button
              onClick={handleExportUsers}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>

            {selectedUsers.size > 0 && (
              <button
                onClick={() => setShowBulkActions(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
                Bulk Actions ({selectedUsers.size})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
                <SortableHeader label="Name" field="name" currentField={sortField} order={sortOrder} onClick={handleSort} />
                <SortableHeader label="Email" field="email" currentField={sortField} order={sortOrder} onClick={handleSort} />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <SortableHeader label="Bookings" field="totalBookings" currentField={sortField} order={sortOrder} onClick={handleSort} />
                <SortableHeader label="Spent" field="totalSpent" currentField={sortField} order={sortOrder} onClick={handleSort} />
                <SortableHeader label="Last Login" field="lastLogin" currentField={sortField} order={sortOrder} onClick={handleSort} />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} verified={user.emailVerified} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.totalBookings}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${user.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowUserDetails(user.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowActivityLog(user.id)}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                        title="Activity Log"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Activate"
                        >
                          <CheckCircle className="w-4 h-4" />
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUserDetails && <UserDetailsModal user={users.find(u => u.id === showUserDetails)!} onClose={() => setShowUserDetails(null)} />}
      {showActivityLog && <ActivityLogModal userId={showActivityLog} onClose={() => setShowActivityLog(null)} />}
      {showApprovals && <ApprovalsModal onClose={() => setShowApprovals(false)} />}
      {showBulkActions && (
        <BulkActionsModal
          selectedCount={selectedUsers.size}
          onSuspend={handleBulkSuspend}
          onEmail={handleBulkEmail}
          onClose={() => setShowBulkActions(false)}
        />
      )}
    </div>
  )
}

// Component helpers
function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function SortableHeader({ 
  label, 
  field, 
  currentField, 
  order, 
  onClick 
}: { 
  label: string
  field: SortField
  currentField: SortField
  order: SortOrder
  onClick: (field: SortField) => void
}) {
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

function StatusBadge({ status, verified }: { status: string; verified: boolean }) {
  const colors = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700'
  }
  
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
      {!verified && (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          Unverified
        </span>
      )}
    </div>
  )
}

function UserDetailsModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <StatusBadge status={user.status} verified={user.emailVerified} />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<Shield />} label="Role" value={user.role.replace('_', ' ')} />
            <DetailItem icon={<Calendar />} label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
            <DetailItem icon={<Clock />} label="Last Login" value={new Date(user.lastLogin).toLocaleDateString()} />
            <DetailItem icon={<FileText />} label="Total Bookings" value={user.totalBookings.toString()} />
            <DetailItem icon={<DollarSign />} label="Total Spent" value={`$${user.totalSpent.toFixed(2)}`} />
            <DetailItem icon={<Star />} label="Reviews" value={user.reviewsCount.toString()} />
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">User Statistics</h4>
            <div className="space-y-2">
              <StatBar label="Engagement Score" value={85} max={100} color="blue" />
              <StatBar label="Booking Rate" value={user.totalBookings} max={100} color="green" />
              <StatBar label="Review Activity" value={user.reviewsCount} max={50} color="purple" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-1">{icon}</div>
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-medium text-gray-900">{value}</div>
      </div>
    </div>
  )
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600'
  }
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-900 font-medium">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function ActivityLogModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [userId])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const userActivities = await adminUserService.getUserActivities(userId)
      setActivities(userActivities)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const activityIcons = {
    login: <Shield className="w-5 h-5" />,
    booking: <Calendar className="w-5 h-5" />,
    review: <Star className="w-5 h-5" />,
    profile_update: <FileText className="w-5 h-5" />,
    password_change: <Shield className="w-5 h-5" />,
    admin_action: <Shield className="w-5 h-5" />
  }

  const activityColors = {
    login: 'bg-blue-100 text-blue-600',
    booking: 'bg-green-100 text-green-600',
    review: 'bg-yellow-100 text-yellow-600',
    profile_update: 'bg-purple-100 text-purple-600',
    password_change: 'bg-red-100 text-red-600',
    admin_action: 'bg-orange-100 text-orange-600'
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity history available
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activityColors[activity.type]}`}>
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{activity.description}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    {activity.metadata && (
                      <div className="text-sm text-gray-600 mt-2">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            <strong>{key}:</strong> {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ApprovalsModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast()
  const [applications, setApplications] = useState<RestaurantApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const allApps = await adminUserService.getAllApplications()
      setApplications(allApps.filter(a => a.status === 'pending'))
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleApprove = async (id: string) => {
    try {
      await adminUserService.approveApplication(id)
      await loadApplications()
      toast({
        title: 'Application approved',
        description: 'Restaurant has been approved and notified.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve application',
        variant: 'destructive'
      })
    }
  }
  
  const handleReject = async (id: string) => {
    try {
      await adminUserService.rejectApplication(id)
      await loadApplications()
      toast({
        title: 'Application rejected',
        description: 'Application has been rejected and applicant notified.',
        variant: 'destructive'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject application',
        variant: 'destructive'
      })
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Pending Restaurant Applications</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending applications
            </div>
          ) : (
            applications.map(app => (
              <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{app.businessName}</h3>
                    <p className="text-gray-600">{app.ownerName} • {app.ownerEmail}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-full">
                    Pending Review
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-medium text-gray-900">{app.city}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Capacity</div>
                    <div className="font-medium text-gray-900">{app.capacity} seats</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cuisine</div>
                    <div className="font-medium text-gray-900">{app.cuisine.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Submitted</div>
                    <div className="font-medium text-gray-900">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Document Verification</div>
                  <div className="flex gap-3">
                    <DocStatus label="Business License" verified={app.documents.businessLicense} />
                    <DocStatus label="Tax ID" verified={app.documents.taxId} />
                    <DocStatus label="Health Cert" verified={app.documents.healthCertificate} />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(app.id)}
                    disabled={!app.documents.businessLicense || !app.documents.taxId || !app.documents.healthCertificate}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function DocStatus({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
      verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {verified ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function BulkActionsModal({ 
  selectedCount, 
  onSuspend, 
  onEmail, 
  onClose 
}: { 
  selectedCount: number
  onSuspend: () => void
  onEmail: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Bulk Actions</h2>
          <p className="text-sm text-gray-600 mt-1">{selectedCount} user(s) selected</p>
        </div>
        
        <div className="p-6 space-y-3">
          <button
            onClick={onSuspend}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Ban className="w-5 h-5" />
            <span className="font-medium">Suspend Users</span>
          </button>
          
          <button
            onClick={onEmail}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Send Email Notification</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
