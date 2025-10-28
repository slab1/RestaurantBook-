'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, Search, Clock, CheckCircle, AlertCircle, Send, 
  Phone, Mail, Users, Star, ArrowUpRight, Filter, Plus, 
  Download, Edit, Archive, Megaphone, Target, Calendar,
  BarChart3, TrendingUp, MessageCircle, FileText, Settings,
  Eye, ThumbsUp, ThumbsDown, Bookmark, Flag, User,
  HeadphonesIcon, Zap, Activity, Globe, Share2, Bell
} from 'lucide-react'
import { 
  getSupportData, getTickets, updateTicket, addTicketMessage,
  getFAQArticles, updateFAQ, createFAQ, getAnnouncements, 
  createAnnouncement, updateAnnouncement, getDirectMessages,
  addDirectMessage, getSupportAnalytics, exportTicketsToCSV,
  exportFAQsToCSV, getMessageTemplates, type SupportTicket,
  type FAQArticle, type Announcement, type DirectMessage,
  type SupportAnalytics
} from '@/lib/admin-support-service'

export default function CustomerSupport() {
  // State management
  const [activeTab, setActiveTab] = useState('tickets')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [faqs, setFAQs] = useState<FAQArticle[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [analytics, setAnalytics] = useState<SupportAnalytics | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  
  // Modal states
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false)
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQArticle | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  
  // Filter states
  const [ticketFilter, setTicketFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Load data
  useEffect(() => {
    loadSupportData()
  }, [])

  const loadSupportData = () => {
    setTickets(getTickets())
    setFAQs(getFAQArticles())
    setAnnouncements(getAnnouncements())
    setMessages(getDirectMessages())
    setAnalytics(getSupportAnalytics())
    setTemplates(getMessageTemplates())
  }

  // Filtered data
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = ticketFilter === 'all' || ticket.status === ticketFilter
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const filteredFAQs = faqs.filter(faq =>
    faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handlers
  const handleTicketStatusUpdate = (ticketId: string, status: string) => {
    const updates: any = { status }
    if (status === 'resolved' || status === 'closed') {
      updates.resolvedAt = new Date().toISOString()
    }
    updateTicket(ticketId, updates)
    loadSupportData()
    showToast(`Ticket ${status} successfully`)
  }

  const handleTicketAssignment = (ticketId: string, assignedTo: string) => {
    updateTicket(ticketId, { assignedTo })
    loadSupportData()
    showToast('Ticket assigned successfully')
  }

  const handleAddTicketMessage = (ticketId: string, message: string) => {
    addTicketMessage(ticketId, {
      sender: 'admin',
      senderName: 'Admin User',
      message,
      attachments: [],
      isInternal: false
    })
    loadSupportData()
    showToast('Message sent successfully')
  }

  const handleFAQUpdate = (faqId: string, updates: Partial<FAQArticle>) => {
    updateFAQ(faqId, updates)
    loadSupportData()
    showToast('FAQ updated successfully')
  }

  const handleCreateFAQ = (faqData: any) => {
    createFAQ({
      title: faqData.title,
      content: faqData.content,
      category: faqData.category,
      tags: faqData.tags,
      status: 'published',
      author: 'Admin User',
      featured: faqData.featured || false,
      searchKeywords: faqData.searchKeywords || []
    })
    loadSupportData()
    setIsFAQModalOpen(false)
    showToast('FAQ created successfully')
  }

  const handleCreateAnnouncement = (announcementData: any) => {
    createAnnouncement({
      title: announcementData.title,
      content: announcementData.content,
      type: announcementData.type,
      targetAudience: announcementData.targetAudience,
      locations: announcementData.locations,
      scheduledAt: announcementData.scheduledAt,
      publishedAt: new Date().toISOString(),
      expiresAt: announcementData.expiresAt,
      status: 'published',
      author: 'Admin User',
      priority: announcementData.priority || false
    })
    loadSupportData()
    setIsAnnouncementModalOpen(false)
    showToast('Announcement created successfully')
  }

  const showToast = (message: string) => {
    // Simple toast implementation
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 3000)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      waiting_customer: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-red-200 text-red-900',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[priority as keyof typeof styles]}`}>
        {priority.toUpperCase()}
      </span>
    )
  }

  const renderTicketManagement = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{analytics?.openTickets || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{analytics?.totalTickets || 0}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{analytics?.avgResponseTime || 0}h</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{analytics?.customerSatisfaction || 0}%</p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_customer">Waiting Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="account">Account</option>
            <option value="booking">Booking</option>
            <option value="payment">Payment</option>
            <option value="restaurant">Restaurant</option>
            <option value="technical">Technical</option>
            <option value="other">Other</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={exportTicketsToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-medium text-gray-900">{ticket.ticketNumber}</span>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                  {ticket.slaBreach && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      SLA BREACH
                    </span>
                  )}
                  {ticket.vipCustomer && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      VIP
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.subject}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="font-medium">{ticket.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium capitalize">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Assigned To</p>
                    <p className="font-medium">{ticket.assignedTo || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Messages</p>
                    <p className="font-medium">{ticket.messages.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>SLA: {new Date(ticket.slaDeadline).toLocaleDateString()}</span>
                  {ticket.resolvedAt && (
                    <>
                      <span>•</span>
                      <span>Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedTicket(ticket)
                    setIsTicketModalOpen(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDirectMessaging = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Direct Messages</h2>
        <button
          onClick={() => setIsMessageModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Conversations</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{messages.filter(m => m.status === 'active').length}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{messages.reduce((acc, m) => acc + m.messages.length, 0)}</p>
            </div>
            <Send className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">94%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {messages.map((conversation) => (
            <div key={conversation.id} className="p-6 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{conversation.subject}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      conversation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conversation.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Participants: {conversation.participants.join(', ')}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{conversation.messages.length} messages</span>
                    <span>Last: {new Date(conversation.lastMessageAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFAQManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">FAQ Management</h2>
        <button
          onClick={() => setIsFAQModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{faqs.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{faqs.filter(f => f.status === 'published').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{faqs.reduce((acc, f) => acc + f.viewCount, 0)}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Helpful Votes</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{faqs.reduce((acc, f) => acc + f.helpfulCount, 0)}</p>
            </div>
            <ThumbsUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={exportFAQsToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFAQs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900">{faq.title}</h3>
                  {faq.featured && (
                    <Bookmark className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{faq.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <span>Category: {faq.category}</span>
                  <span>Views: {faq.viewCount}</span>
                  <span className="flex items-center">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {faq.helpfulCount}
                  </span>
                  <span className="flex items-center">
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    {faq.notHelpfulCount}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    faq.status === 'published' ? 'bg-green-100 text-green-800' : 
                    faq.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {faq.status.toUpperCase()}
                  </span>
                  {faq.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedFAQ(faq)
                    setIsFAQModalOpen(true)
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFAQUpdate(faq.id, { status: faq.status === 'published' ? 'archived' : 'published' })}
                  className="p-2 text-gray-600 hover:text-orange-600"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
        <button
          onClick={() => setIsAnnouncementModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{announcements.filter(a => a.status === 'published').length}</p>
            </div>
            <Megaphone className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{announcements.filter(a => a.status === 'scheduled').length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{announcements.reduce((acc, a) => acc + a.viewCount, 0)}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Click Rate</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">12.3%</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.type === 'critical' ? 'bg-red-100 text-red-800' :
                    announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {announcement.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.status === 'published' ? 'bg-green-100 text-green-800' :
                    announcement.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    announcement.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.status.toUpperCase()}
                  </span>
                  {announcement.priority && (
                    <Flag className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-3">
                  <div>
                    <p className="text-gray-400">Target Audience</p>
                    <p className="font-medium">{announcement.targetAudience.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Views</p>
                    <p className="font-medium">{announcement.viewCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Clicks</p>
                    <p className="font-medium">{announcement.clickCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Published</p>
                    <p className="font-medium">{new Date(announcement.publishedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {announcement.expiresAt && (
                  <div className="text-xs text-orange-600">
                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedAnnouncement(announcement)
                    setIsAnnouncementModalOpen(true)
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-green-600">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Support Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {analytics ? Math.round((analytics.resolvedTickets / analytics.totalTickets) * 100) : 0}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{analytics?.avgResolutionTime || 0}h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Productivity</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">89%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets by Category</h3>
          <div className="space-y-3">
            {analytics?.ticketsByCategory && Object.entries(analytics.ticketsByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${(count / analytics.totalTickets) * 100}%`}}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">First Response Time</span>
              </div>
              <span className="text-sm font-bold text-gray-900">1.2h</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics?.customerSatisfaction || 0}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Active Support Agents</span>
              </div>
              <span className="text-sm font-bold text-gray-900">12</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Ticket #TKT-1234 resolved', agent: 'Sarah Johnson', time: '2 minutes ago', type: 'success' },
            { action: 'New FAQ article published', agent: 'Mike Chen', time: '15 minutes ago', type: 'info' },
            { action: 'SLA breach detected for ticket #TKT-1235', agent: 'System', time: '32 minutes ago', type: 'warning' },
            { action: 'Customer satisfaction survey completed', agent: 'Customer', time: '1 hour ago', type: 'info' },
            { action: 'Announcement sent to all users', agent: 'Alex Rivera', time: '2 hours ago', type: 'success' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">by {activity.agent}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSupportTools = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Support Tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quick Actions Used</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">147</p>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-green-600 mt-1">8</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tools Available</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">15</p>
            </div>
            <Settings className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { name: 'Send Password Reset', icon: <User className="w-4 h-4" />, count: 23 },
              { name: 'Issue Refund', icon: <ArrowUpRight className="w-4 h-4" />, count: 12 },
              { name: 'Unlock Account', icon: <CheckCircle className="w-4 h-4" />, count: 18 },
              { name: 'Escalate to Manager', icon: <Flag className="w-4 h-4" />, count: 7 },
              { name: 'Send Compensation', icon: <Star className="w-4 h-4" />, count: 9 }
            ].map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  {action.icon}
                  <span className="text-sm font-medium text-gray-700">{action.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Used {action.count} times</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Support Resources</h3>
          <div className="space-y-3">
            {[
              { name: 'Knowledge Base', icon: <FileText className="w-4 h-4" />, status: 'Online' },
              { name: 'Customer Database', icon: <Users className="w-4 h-4" />, status: 'Online' },
              { name: 'Payment System', icon: <ArrowUpRight className="w-4 h-4" />, status: 'Online' },
              { name: 'Restaurant Portal', icon: <Globe className="w-4 h-4" />, status: 'Online' },
              { name: 'Notification Service', icon: <Bell className="w-4 h-4" />, status: 'Online' }
            ].map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {resource.icon}
                  <span className="text-sm font-medium text-gray-700">{resource.name}</span>
                </div>
                <span className="text-xs text-green-600 font-medium">{resource.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Message Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{template.name}</span>
                <span className="text-xs text-gray-500">{template.category}</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{template.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
        <p className="text-gray-600 mt-1">Comprehensive support management and communication tools</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'tickets', name: 'Support Tickets', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'messages', name: 'Direct Messages', icon: <Send className="w-4 h-4" /> },
            { id: 'faq', name: 'FAQ Management', icon: <FileText className="w-4 h-4" /> },
            { id: 'announcements', name: 'Announcements', icon: <Megaphone className="w-4 h-4" /> },
            { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'tools', name: 'Support Tools', icon: <HeadphonesIcon className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'tickets' && renderTicketManagement()}
      {activeTab === 'messages' && renderDirectMessaging()}
      {activeTab === 'faq' && renderFAQManagement()}
      {activeTab === 'announcements' && renderAnnouncements()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'tools' && renderSupportTools()}

      {/* Modals */}
      {isTicketModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Ticket Details - {selectedTicket.ticketNumber}</h2>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ticket Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Subject:</strong> {selectedTicket.subject}</div>
                    <div><strong>Customer:</strong> {selectedTicket.customerEmail}</div>
                    <div><strong>Category:</strong> {selectedTicket.category}</div>
                    <div><strong>Priority:</strong> {selectedTicket.priority}</div>
                    <div><strong>Status:</strong> {selectedTicket.status}</div>
                    <div><strong>Assigned To:</strong> {selectedTicket.assignedTo || 'Unassigned'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => handleTicketStatusUpdate(selectedTicket.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={selectedTicket.status}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_customer">Waiting Customer</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      onChange={(e) => handleTicketAssignment(selectedTicket.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={selectedTicket.assignedTo || ''}
                    >
                      <option value="">Unassigned</option>
                      <option value="Sarah Johnson">Sarah Johnson</option>
                      <option value="Mike Chen">Mike Chen</option>
                      <option value="Alex Rivera">Alex Rivera</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Conversation History</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {selectedTicket.messages.map((message, index) => (
                    <div key={index} className={`p-4 rounded-lg ${message.sender === 'admin' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{message.senderName}</span>
                        <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Add Response</h3>
                <textarea
                  placeholder="Type your response..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-24"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      const message = (e.target as HTMLTextAreaElement).value
                      if (message.trim()) {
                        handleAddTicketMessage(selectedTicket.id, message)
                        ;(e.target as HTMLTextAreaElement).value = ''
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Press Ctrl+Enter to send</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFAQModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedFAQ ? 'Edit FAQ' : 'Create FAQ'}
              </h2>
              <button
                onClick={() => {
                  setIsFAQModalOpen(false)
                  setSelectedFAQ(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const data = {
                title: formData.get('title') as string,
                content: formData.get('content') as string,
                category: formData.get('category') as string,
                tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
                featured: formData.get('featured') === 'on',
                searchKeywords: (formData.get('searchKeywords') as string).split(',').map(k => k.trim())
              }
              
              if (selectedFAQ) {
                handleFAQUpdate(selectedFAQ.id, data)
                setIsFAQModalOpen(false)
                setSelectedFAQ(null)
              } else {
                handleCreateFAQ(data)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedFAQ?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    defaultValue={selectedFAQ?.content || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={selectedFAQ?.category || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={selectedFAQ?.tags.join(', ') || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Keywords (comma-separated)</label>
                  <input
                    type="text"
                    name="searchKeywords"
                    defaultValue={selectedFAQ?.searchKeywords.join(', ') || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={selectedFAQ?.featured || false}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Featured Article</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsFAQModalOpen(false)
                    setSelectedFAQ(null)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedFAQ ? 'Update' : 'Create'} FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create Announcement</h2>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const data = {
                title: formData.get('title') as string,
                content: formData.get('content') as string,
                type: formData.get('type') as string,
                targetAudience: (formData.get('targetAudience') as string).split(',').map(t => t.trim()),
                locations: (formData.get('locations') as string).split(',').map(l => l.trim()),
                scheduledAt: formData.get('scheduledAt') as string || null,
                expiresAt: formData.get('expiresAt') as string || null,
                priority: formData.get('priority') === 'on'
              }
              handleCreateAnnouncement(data)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                      <option value="success">Success</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <input
                      type="text"
                      name="targetAudience"
                      placeholder="all, users, restaurants"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locations (comma-separated)</label>
                  <input
                    type="text"
                    name="locations"
                    placeholder="US, UK, Canada"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For (optional)</label>
                    <input
                      type="datetime-local"
                      name="scheduledAt"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="priority" className="mr-2" />
                  <label className="text-sm font-medium text-gray-700">High Priority</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}