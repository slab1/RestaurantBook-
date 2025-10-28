'use client'

import { Shield, Activity, Lock, AlertTriangle, FileText, Eye } from 'lucide-react'

const auditLogs = [
  {
    id: 1,
    action: 'User login',
    user: 'admin@restaurantbook.com',
    ipAddress: '192.168.1.100',
    timestamp: '2024-10-27 15:30:45',
    status: 'success',
  },
  {
    id: 2,
    action: 'Restaurant approved',
    user: 'admin@restaurantbook.com',
    ipAddress: '192.168.1.100',
    timestamp: '2024-10-27 14:22:10',
    status: 'success',
  },
  {
    id: 3,
    action: 'Failed login attempt',
    user: 'unknown@example.com',
    ipAddress: '203.0.113.42',
    timestamp: '2024-10-27 12:15:33',
    status: 'failed',
  },
  {
    id: 4,
    action: 'User suspended',
    user: 'admin@restaurantbook.com',
    ipAddress: '192.168.1.100',
    timestamp: '2024-10-27 10:05:20',
    status: 'success',
  },
]

const securityStats = {
  activeAdmins: 5,
  failedLogins: 12,
  suspiciousActivity: 3,
  dataBackups: 'Daily',
}

export default function Security() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security & Compliance</h1>
        <p className="text-gray-600 mt-1">Monitor security events and maintain compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Admins</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{securityStats.activeAdmins}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Logins</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{securityStats.failedLogins}</p>
            </div>
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{securityStats.suspiciousActivity}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Backups</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{securityStats.dataBackups}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.ipAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.status === 'success' ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Success
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Session Timeout</p>
                <p className="text-sm text-gray-600">Auto logout after 30 minutes of inactivity</p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">IP Whitelist</p>
                <p className="text-sm text-gray-600">Restrict admin access to specific IPs</p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">GDPR Compliance</span>
              </div>
              <span className="text-xs font-semibold text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Data Encryption</span>
              </div>
              <span className="text-xs font-semibold text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Regular Backups</span>
              </div>
              <span className="text-xs font-semibold text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
