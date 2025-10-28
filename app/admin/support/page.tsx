'use client'

import { useState } from 'react'
import { MessageSquare, Search, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react'

const mockTickets = [
  {
    id: 'TKT-1234',
    subject: 'Payment issue with booking',
    customer: 'john.doe@example.com',
    status: 'open',
    priority: 'high',
    createdAt: '2024-10-27 10:30',
    lastUpdate: '2024-10-27 14:45',
    messages: 3,
  },
  {
    id: 'TKT-1235',
    subject: 'Cannot access restaurant dashboard',
    customer: 'restaurant@example.com',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-10-26 15:20',
    lastUpdate: '2024-10-27 09:15',
    messages: 5,
  },
  {
    id: 'TKT-1236',
    subject: 'Question about loyalty program',
    customer: 'user@example.com',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-10-25 11:00',
    lastUpdate: '2024-10-26 16:30',
    messages: 2,
  },
]

const stats = {
  openTickets: 12,
  inProgress: 8,
  resolvedToday: 15,
  avgResponseTime: '2.5 hrs',
}

export default function CustomerSupport() {
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredTickets = mockTickets.filter(
    (ticket) => selectedStatus === 'all' || ticket.status === selectedStatus
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Open
          </span>
        )
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        )
      case 'resolved':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Resolved
          </span>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">High</span>
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Low</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
        <p className="text-gray-600 mt-1">Manage support tickets and customer inquiries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.openTickets}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolvedToday}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.avgResponseTime}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tickets</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-medium text-gray-900">{ticket.id}</span>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.subject}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="font-medium">{ticket.customer}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{ticket.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Update</p>
                    <p className="font-medium">{ticket.lastUpdate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Messages</p>
                    <p className="font-medium">{ticket.messages}</p>
                  </div>
                </div>
              </div>
              <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Send className="w-4 h-4 mr-2" />
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
