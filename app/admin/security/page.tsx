'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, Activity, Lock, AlertTriangle, FileText, Eye, 
  Search, Clock, CheckCircle, XCircle, AlertCircle, Download,
  Edit, Archive, Plus, Filter, Users, Database, Server,
  Key, Settings, Bell, Globe, Zap, Flag, Calendar,
  BarChart3, TrendingUp, Monitor, UserCheck, File,
  ShieldCheck, ShieldAlert, AlertOctagon, MessageSquare,
  UserX, Fingerprint, Wifi, MapPin, Smartphone, Chrome
} from 'lucide-react'
import { 
  getSecurityData, getAuditLogs, getSecurityIncidents, updateIncident,
  addIncidentAction, getComplianceRecords, updateComplianceRecord,
  getPrivacyRequests, updatePrivacyRequest, getAdminActivities,
  getSecurityPolicies, updateSecurityPolicy, getSecurityAlerts,
  acknowledgeAlert, resolveAlert, getSecurityMetrics,
  exportAuditLogsToCSV, exportComplianceReportToCSV, exportSecurityIncidentsToCSV,
  type AuditLog, type SecurityIncident, type ComplianceRecord,
  type PrivacyRequest, type AdminActivity, type SecurityPolicy,
  type SecurityAlert, type SecurityMetrics
} from '@/lib/admin-security-service'

export default function SecurityCompliance() {
  // State management
  const [activeTab, setActiveTab] = useState('audit')
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([])
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([])
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([])
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  
  // Modal states
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null)
  const [selectedPrivacyRequest, setSelectedPrivacyRequest] = useState<PrivacyRequest | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [timeRangeFilter, setTimeRangeFilter] = useState('7d')

  // Load data
  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = () => {
    setAuditLogs(getAuditLogs())
    setIncidents(getSecurityIncidents())
    setComplianceRecords(getComplianceRecords())
    setPrivacyRequests(getPrivacyRequests())
    setAdminActivities(getAdminActivities())
    setSecurityPolicies(getSecurityPolicies())
    setSecurityAlerts(getSecurityAlerts())
    setMetrics(getSecurityMetrics())
  }

  // Filtered data
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || log.riskLevel === severityFilter
    
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
    
    return matchesSearch && matchesStatus && matchesSeverity
  })

  // Handlers
  const handleIncidentStatusUpdate = (incidentId: string, status: string) => {
    const updates: any = { status }
    if (status === 'resolved' || status === 'closed') {
      updates.resolvedAt = new Date().toISOString()
    }
    updateIncident(incidentId, updates)
    loadSecurityData()
    showToast(`Incident ${status} successfully`)
  }

  const handleAddIncidentAction = (incidentId: string, action: string) => {
    addIncidentAction(incidentId, {
      action,
      performedBy: 'security@restaurantbook.com',
      performedAt: new Date().toISOString(),
      status: 'completed',
      details: action
    })
    loadSecurityData()
    showToast('Action added to incident')
  }

  const handleComplianceUpdate = (recordId: string, status: string) => {
    updateComplianceRecord(recordId, { 
      status: status as any,
      lastAssessed: new Date().toISOString()
    })
    loadSecurityData()
    showToast('Compliance status updated')
  }

  const handlePrivacyRequestUpdate = (requestId: string, status: string) => {
    const updates: any = { status }
    if (status === 'completed') {
      updates.processedAt = new Date().toISOString()
      updates.processedBy = 'privacy@restaurantbook.com'
    }
    updatePrivacyRequest(requestId, updates)
    loadSecurityData()
    showToast('Privacy request updated')
  }

  const handleAlertAcknowledge = (alertId: string) => {
    acknowledgeAlert(alertId, 'security@restaurantbook.com')
    loadSecurityData()
    showToast('Alert acknowledged')
  }

  const handleAlertResolve = (alertId: string) => {
    resolveAlert(alertId)
    loadSecurityData()
    showToast('Alert resolved')
  }

  const showToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 3000)
  }

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-200 text-red-900',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[severity as keyof typeof styles]}`}>
        {severity.toUpperCase()}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      blocked: 'bg-gray-100 text-gray-800',
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      contained: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      compliant: 'bg-green-100 text-green-800',
      non_compliant: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      not_applicable: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const renderAuditLogs = () => (
    <div className="space-y-6">
      {/* Audit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Audit Logs</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{metrics?.totalAuditLogs || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Logins (24h)</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{metrics?.failedLogins24h || 0}</p>
            </div>
            <Lock className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Admin Sessions</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{metrics?.activeAdminSessions || 0}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{metrics?.securityScore || 0}%</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
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
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={timeRangeFilter}
            onChange={(e) => setTimeRangeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={exportAuditLogsToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAuditLogs.slice(0, 20).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.userEmail}</div>
                    <div className="text-sm text-gray-500">{log.userRole}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{log.targetType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.ipAddress}</div>
                    <div className="text-sm text-gray-500">{log.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getSeverityBadge(log.riskLevel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSecurityMonitoring = () => (
    <div className="space-y-6">
      {/* Security Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Incidents</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{metrics?.activeIncidents || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Incidents</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{metrics?.criticalIncidents || 0}</p>
            </div>
            <AlertOctagon className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Alerts</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{securityAlerts.filter(a => !a.resolved).length}</p>
            </div>
            <Bell className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{(metrics?.vulnerabilities.critical || 0) + (metrics?.vulnerabilities.high || 0)}</p>
            </div>
            <ShieldAlert className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Live Security Alerts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Live Security Alerts</h3>
            <span className="text-sm text-gray-500">{securityAlerts.filter(a => !a.resolved).length} unresolved</span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {securityAlerts.filter(alert => !alert.resolved).map((alert) => (
            <div key={alert.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span>Source: {alert.source}</span>
                    <span>Triggered: {new Date(alert.triggeredAt).toLocaleString()}</span>
                    <span>Entities: {alert.affectedEntities.join(', ')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alert.recommendedActions.map((action, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!alert.acknowledgedBy && (
                    <button
                      onClick={() => handleAlertAcknowledge(alert.id)}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleAlertResolve(alert.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Incidents */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Security Incidents</h3>
            <button
              onClick={exportSecurityIncidentsToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        <div className="space-y-4 p-6">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">{incident.incidentNumber}</span>
                    {getSeverityBadge(incident.severity)}
                    {getStatusBadge(incident.status)}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{incident.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium capitalize">{incident.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reported</p>
                      <p className="font-medium">{new Date(incident.reportedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned To</p>
                      <p className="font-medium">{incident.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Affected Users</p>
                      <p className="font-medium">{incident.affectedUsers}</p>
                    </div>
                  </div>
                  {incident.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {incident.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedIncident(incident)
                      setIsIncidentModalOpen(true)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Investigate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCompliance = () => (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Score</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{metrics?.complianceScore || 0}%</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">GDPR Score</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{metrics?.compliance.gdpr || 0}%</p>
            </div>
            <File className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ISO 27001</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{metrics?.compliance.iso27001 || 0}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SOC 2</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{metrics?.compliance.soc2 || 0}%</p>
            </div>
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Compliance Records */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Compliance Framework Status</h3>
            <button
              onClick={exportComplianceReportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
        <div className="space-y-4 p-6">
          {complianceRecords.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-blue-600">{record.framework}</span>
                    {getStatusBadge(record.status)}
                    {getSeverityBadge(record.riskLevel)}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{record.requirement}</h4>
                  <p className="text-sm text-gray-600 mb-3">{record.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <p className="text-gray-500">Last Assessed</p>
                      <p className="font-medium">{new Date(record.lastAssessed).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Next Assessment</p>
                      <p className="font-medium">{new Date(record.nextAssessment).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Responsible Party</p>
                      <p className="font-medium">{record.responsibleParty}</p>
                    </div>
                  </div>
                  {record.remediationActions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Remediation Actions:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {record.remediationActions.map((action, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {record.notes && (
                    <p className="text-sm text-gray-600 italic">{record.notes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <select
                    value={record.status}
                    onChange={(e) => handleComplianceUpdate(record.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="compliant">Compliant</option>
                    <option value="non_compliant">Non-Compliant</option>
                    <option value="partial">Partial</option>
                    <option value="not_applicable">Not Applicable</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDataPrivacy = () => (
    <div className="space-y-6">
      {/* Privacy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Privacy Requests</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{privacyRequests.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{privacyRequests.filter(r => r.status === 'pending').length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{privacyRequests.filter(r => r.status === 'completed').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Breaches</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{metrics?.dataBreaches || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Privacy Request Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Request Types</h3>
          <div className="space-y-3">
            {['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'].map((type) => {
              const count = privacyRequests.filter(r => r.type === type).length
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${(count / privacyRequests.length) * 100}%`}}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Times</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Average Response Time</span>
              </div>
              <span className="text-sm font-bold text-gray-900">2.3 days</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">SLA Compliance</span>
              </div>
              <span className="text-sm font-bold text-gray-900">96%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Requests This Month</span>
              </div>
              <span className="text-sm font-bold text-gray-900">127</span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Requests */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Privacy Requests</h3>
        </div>
        <div className="space-y-4 p-6">
          {privacyRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">{request.requestNumber}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                      {request.type}
                    </span>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <p className="text-gray-500">User</p>
                      <p className="font-medium">{request.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Requested</p>
                      <p className="font-medium">{new Date(request.requestedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Deadline</p>
                      <p className="font-medium">{new Date(request.responseDeadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Legal Basis</p>
                      <p className="font-medium">{request.legalBasis}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{request.details}</p>
                  <div className="flex flex-wrap gap-2">
                    {request.dataTypes.map((type, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <select
                    value={request.status}
                    onChange={(e) => handlePrivacyRequestUpdate(request.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => {
                      setSelectedPrivacyRequest(request)
                      setIsPrivacyModalOpen(true)
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAdminActivity = () => (
    <div className="space-y-6">
      {/* Admin Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{adminActivities.filter(a => !a.logoutAt).length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">2FA Usage</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{Math.round((adminActivities.filter(a => a.twoFactorUsed).length / adminActivities.length) * 100)}%</p>
            </div>
            <Fingerprint className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Sessions</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{adminActivities.filter(a => a.riskScore > 70).length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Session Time</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{Math.round(adminActivities.reduce((acc, a) => acc + a.activeDuration, 0) / adminActivities.length)}m</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Admin Sessions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Admin Session Activity</h3>
        </div>
        <div className="space-y-4 p-6">
          {adminActivities.map((activity) => (
            <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">{activity.adminEmail}</span>
                    {activity.riskScore > 70 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        High Risk
                      </span>
                    )}
                    {activity.twoFactorUsed ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        2FA
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        No 2FA
                      </span>
                    )}
                    {!activity.logoutAt && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Wifi className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-500">IP Address</p>
                        <p className="font-medium">{activity.ipAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-medium">{activity.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Device</p>
                        <p className="font-medium">{activity.device}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Chrome className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Browser</p>
                        <p className="font-medium">{activity.browser}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <p className="text-gray-500">Login Time</p>
                      <p className="font-medium">{new Date(activity.loginAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Session Duration</p>
                      <p className="font-medium">{activity.activeDuration} minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Actions Performed</p>
                      <p className="font-medium">{activity.actionsPerformed}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Risk Score</p>
                      <p className={`font-medium ${activity.riskScore > 70 ? 'text-red-600' : activity.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {activity.riskScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {activity.systemsAccessed.map((system, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {system}
                      </span>
                    ))}
                  </div>
                  {activity.anomalies.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-700">Anomalies Detected:</p>
                      {activity.anomalies.map((anomaly, index) => (
                        <p key={index} className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          {anomaly}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecurityPolicies = () => (
    <div className="space-y-6">
      {/* Policy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{securityPolicies.filter(p => p.status === 'active').length}</p>
            </div>
            <File className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Policy Violations</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{securityPolicies.reduce((acc, p) => acc + p.violations, 0)}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due for Review</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{securityPolicies.filter(p => new Date(p.reviewDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auto Enforced</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{securityPolicies.filter(p => p.enforcement === 'automatic').length}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Security Policies</h3>
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </button>
          </div>
        </div>
        <div className="space-y-4 p-6">
          {securityPolicies.map((policy) => (
            <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{policy.name}</h4>
                    {getStatusBadge(policy.status)}
                    <span className="text-sm text-gray-500">v{policy.version}</span>
                    {policy.enforcement === 'automatic' && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Auto Enforced
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium capitalize">{policy.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Owner</p>
                      <p className="font-medium">{policy.owner}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Effective Date</p>
                      <p className="font-medium">{new Date(policy.effectiveDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Next Review</p>
                      <p className="font-medium">{new Date(policy.reviewDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {policy.violations > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{policy.violations} violations</span>
                      {policy.lastViolation && (
                        <span>• Last: {new Date(policy.lastViolation).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedPolicy(policy)
                      setIsPolicyModalOpen(true)
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security & Compliance</h1>
        <p className="text-gray-600 mt-1">Comprehensive security monitoring, compliance tracking, and audit capabilities</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'audit', name: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
            { id: 'monitoring', name: 'Security Monitoring', icon: <Monitor className="w-4 h-4" /> },
            { id: 'compliance', name: 'Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'privacy', name: 'Data Privacy', icon: <Eye className="w-4 h-4" /> },
            { id: 'activity', name: 'Admin Activity', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'policies', name: 'Security Policies', icon: <File className="w-4 h-4" /> }
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
      {activeTab === 'audit' && renderAuditLogs()}
      {activeTab === 'monitoring' && renderSecurityMonitoring()}
      {activeTab === 'compliance' && renderCompliance()}
      {activeTab === 'privacy' && renderDataPrivacy()}
      {activeTab === 'activity' && renderAdminActivity()}
      {activeTab === 'policies' && renderSecurityPolicies()}

      {/* Incident Modal */}
      {isIncidentModalOpen && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Incident Investigation - {selectedIncident.incidentNumber}</h2>
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Incident Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedIncident.title}</div>
                    <div><strong>Category:</strong> {selectedIncident.category}</div>
                    <div><strong>Severity:</strong> {selectedIncident.severity}</div>
                    <div><strong>Status:</strong> {selectedIncident.status}</div>
                    <div><strong>Affected Users:</strong> {selectedIncident.affectedUsers}</div>
                    <div><strong>Assigned To:</strong> {selectedIncident.assignedTo || 'Unassigned'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Detected:</strong> {new Date(selectedIncident.detectedAt).toLocaleString()}</div>
                    <div><strong>Reported:</strong> {new Date(selectedIncident.reportedAt).toLocaleString()}</div>
                    {selectedIncident.resolvedAt && (
                      <div><strong>Resolved:</strong> {new Date(selectedIncident.resolvedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Impact Assessment</h3>
                <p className="text-sm text-gray-700">{selectedIncident.impactAssessment}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Response Actions</h3>
                <div className="space-y-3">
                  {selectedIncident.responseActions.map((action, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{action.action}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          action.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          action.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{action.details}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {action.performedBy} at {new Date(action.performedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Add Action</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Describe the action taken..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const action = (e.target as HTMLInputElement).value
                        if (action.trim()) {
                          handleAddIncidentAction(selectedIncident.id, action)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Add Action
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <select
                  value={selectedIncident.status}
                  onChange={(e) => handleIncidentStatusUpdate(selectedIncident.id, e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="contained">Contained</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}