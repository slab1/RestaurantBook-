'use client'

import { useState } from 'react'
import { Flag, Eye, Check, X, AlertTriangle, MessageSquare, Star, Image } from 'lucide-react'

const mockReports = [
  {
    id: 'RPT-001',
    type: 'review',
    content: 'Terrible service, rude staff, would never recommend!',
    author: 'Anonymous User',
    restaurant: 'The Golden Spoon',
    reason: 'Inappropriate language',
    status: 'pending',
    reportedBy: 'john.doe@example.com',
    reportedAt: '2024-10-27 10:30',
    severity: 'high',
  },
  {
    id: 'RPT-002',
    type: 'photo',
    content: '[Photo content]',
    author: 'Mike Brown',
    restaurant: 'Bella Vista',
    reason: 'Inappropriate content',
    status: 'pending',
    reportedBy: 'jane.smith@example.com',
    reportedAt: '2024-10-27 14:15',
    severity: 'critical',
  },
  {
    id: 'RPT-003',
    type: 'review',
    content: 'Great food but a bit pricey for what you get.',
    author: 'Alice Johnson',
    restaurant: 'Sakura Sushi',
    reason: 'Spam or fake review',
    status: 'reviewed',
    reportedBy: 'user123@example.com',
    reportedAt: '2024-10-26 09:45',
    severity: 'low',
  },
]

const stats = {
  pendingReports: 15,
  reviewedToday: 8,
  approvedContent: 234,
  removedContent: 12,
}

export default function ContentModeration() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const filteredReports = mockReports.filter(
    (report) => selectedStatus === 'all' || report.status === selectedStatus
  )

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Critical</span>
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">High</span>
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Low</span>
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'photo':
        return <Image className="w-4 h-4 text-blue-500" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-green-500" />
      default:
        return <Flag className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-gray-600 mt-1">Review and moderate reported content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingReports}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reviewed Today</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.reviewedToday}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.approvedContent}</p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Removed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.removedContent}</p>
            </div>
            <X className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Reports</option>
          <option value="pending">Pending Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  {getTypeBadge(report.type)}
                  <span className="font-medium text-gray-900">{report.id}</span>
                  {getSeverityBadge(report.severity)}
                  <span className="text-sm text-gray-500">{report.reportedAt}</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-900 font-medium mb-2">Reported Content:</p>
                  <p className="text-sm text-gray-700">{report.content}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Author</p>
                    <p className="text-gray-900 font-medium">{report.author}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Restaurant</p>
                    <p className="text-gray-900 font-medium">{report.restaurant}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Reason</p>
                    <p className="text-gray-900 font-medium">{report.reason}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Reported By</p>
                    <p className="text-gray-900 font-medium">{report.reportedBy}</p>
                  </div>
                </div>
              </div>

              {report.status === 'pending' && (
                <div className="flex space-x-2 ml-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
