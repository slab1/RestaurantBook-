'use client'

import { useState, useMemo } from 'react'
import { 
  ChefHat, Plus, Search, Filter, Eye, Edit, Check, X, 
  Star, MapPin, Clock, DollarSign, Users, Award,
  TrendingUp, AlertCircle, CheckCircle, Calendar,
  BarChart3, Phone, Mail, Globe
} from 'lucide-react'
import { mockChefs } from '@/lib/chef-demo-data'

const AdminChefsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [selectedChefs, setSelectedChefs] = useState<Set<string>>(new Set())
  const [showAddChef, setShowAddChef] = useState(false)
  const [expandedChef, setExpandedChef] = useState<string | null>(null)

  // Filter chefs based on search and filters
  const filteredChefs = useMemo(() => {
    let filtered = mockChefs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(chef =>
        chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chef.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        chef.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(chef => {
        if (statusFilter === 'verified') return chef.isVerified
        if (statusFilter === 'unverified') return !chef.isVerified
        if (statusFilter === 'featured') return chef.isFeatured
        if (statusFilter === 'available') return chef.isAvailable
        return true
      })
    }

    // Specialty filter
    if (specialtyFilter) {
      filtered = filtered.filter(chef =>
        chef.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()))
      )
    }

    return filtered.sort((a, b) => b.rating - a.rating)
  }, [searchTerm, statusFilter, specialtyFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = mockChefs.length
    const verified = mockChefs.filter(c => c.isVerified).length
    const featured = mockChefs.filter(c => c.isFeatured).length
    const available = mockChefs.filter(c => c.isAvailable).length
    const avgRating = mockChefs.reduce((sum, c) => sum + c.rating, 0) / total
    const avgHourlyRate = mockChefs.reduce((sum, c) => sum + c.hourlyRate, 0) / total

    return {
      total,
      verified,
      featured,
      available,
      avgRating: avgRating.toFixed(1),
      avgHourlyRate: Math.round(avgHourlyRate)
    }
  }, [])

  const toggleChefSelection = (chefId: string) => {
    const newSelection = new Set(selectedChefs)
    if (newSelection.has(chefId)) {
      newSelection.delete(chefId)
    } else {
      newSelection.add(chefId)
    }
    setSelectedChefs(newSelection)
  }

  const selectAllChefs = () => {
    if (selectedChefs.size === filteredChefs.length) {
      setSelectedChefs(new Set())
    } else {
      setSelectedChefs(new Set(filteredChefs.map(c => c.id)))
    }
  }

  const approveChef = (chefId: string) => {
    alert(`Demo: Chef ${chefId} has been approved!`)
  }

  const rejectChef = (chefId: string) => {
    alert(`Demo: Chef ${chefId} has been rejected!`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (chef: any) => {
    if (chef.isVerified) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
          VERIFIED
        </span>
      )
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
        PENDING
      </span>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chef Management</h1>
        <p className="text-gray-600">Manage chef verifications, status, and features</p>
      </div>

      {/* Demo Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              🚀 Chef Warehouse System - Demo Mode Active
            </p>
            <p className="text-xs text-blue-700">
              This is a fully functional chef marketplace admin panel with {stats.total} verified chefs.
              Features: chef verification, booking management, payment processing, admin oversight.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="unverified">Pending Review</option>
            <option value="featured">Featured</option>
            <option value="available">Available</option>
          </select>
          <button
            onClick={() => setShowAddChef(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Chef
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total Chefs</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Pending Review</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.total - stats.verified}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Verified</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.verified}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Featured</div>
          <div className="text-3xl font-bold text-orange-600">
            {stats.featured}
          </div>
        </div>
      </div>

      {/* Chef List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedChefs.size === filteredChefs.length && filteredChefs.length > 0}
                    onChange={selectAllChefs}
                    className="rounded text-blue-600"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Chef
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredChefs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No chefs found
                  </td>
                </tr>
              ) : (
                filteredChefs.map((chef) => (
                  <>
                    <tr key={chef.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedChefs.has(chef.id)}
                          onChange={() => toggleChefSelection(chef.id)}
                          className="rounded text-blue-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{chef.name}</div>
                          <div className="text-sm text-gray-600">{chef.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {chef.isVerified && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Verified
                              </span>
                            )}
                            {chef.isFeatured && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                            {chef.isAvailable && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{chef.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {chef.location}
                        </div>
                        <div className="text-sm text-gray-600">{chef.experience} yrs exp</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold">{chef.rating}</span>
                          <span className="text-xs text-gray-500">({chef.totalReviews})</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatCurrency(chef.hourlyRate)}/hr
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(chef)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedChef(expandedChef === chef.id ? null : chef.id)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            {expandedChef === chef.id ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {expandedChef === chef.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Quick Actions</h4>
                                <div className="flex flex-wrap gap-2">
                                  {!chef.isVerified && (
                                    <>
                                      <button
                                        onClick={() => approveChef(chef.id)}
                                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                                      >
                                        <Check className="w-4 h-4" />
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => rejectChef(chef.id)}
                                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
                                      >
                                        <X className="w-4 h-4" />
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {chef.isVerified && (
                                    <button
                                      onClick={() => alert('Demo: Chef suspended!')}
                                      className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={chef.isFeatured}
                                      onChange={() => alert('Demo: Feature status updated!')}
                                      className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Featured Chef</span>
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={chef.isAvailable}
                                      onChange={() => alert('Demo: Availability updated!')}
                                      className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Available for Booking</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                                <div className="flex flex-wrap gap-1">
                                  {chef.specialties.map((specialty, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                              <p className="text-sm text-gray-700">{chef.bio}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Actions */}
        {selectedChefs.size > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedChefs.size} chef{selectedChefs.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => alert(`Demo: ${selectedChefs.size} chefs approved!`)}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Approve All
              </button>
              <button 
                onClick={() => alert(`Demo: ${selectedChefs.size} chefs featured!`)}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                Feature All
              </button>
              <button 
                onClick={() => alert(`Demo: ${selectedChefs.size} chefs removed!`)}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Remove All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Chef Modal */}
      {showAddChef && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add New Chef
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chef Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input 
                    type="tel" 
                    placeholder="+234 801 234 5678"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="Lagos"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialties
                </label>
                <input 
                  type="text" 
                  placeholder="Nigerian, Continental"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (₦)
                  </label>
                  <input 
                    type="number" 
                    placeholder="25000"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input 
                    type="number" 
                    placeholder="5"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea 
                  placeholder="Professional chef with X years of experience..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddChef(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddChef(false)
                  alert('🎉 Demo: New chef added successfully!\n\nIn a real system, this would create a chef profile and send verification email.')
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Chef
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminChefsPage