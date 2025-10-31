/**
 * Feature Flag Dashboard Component
 * 
 * Admin page showing all configured features and their status
 * Useful for debugging and understanding what's enabled
 */

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

interface FeatureStatus {
  tier: 'core' | 'basic' | 'advanced'
  totalEnabled: number
  totalMissing: number
  enabled: string[]
  missing: Array<{feature: string; envVar: string; tier: string}>
  coverage: {
    core: number
    basic: number
    advanced: number
  }
}

interface ProductionStatus {
  ready: boolean
  missing: string[]
}

interface Compatibility {
  warning: string
  suggestion: string
}

interface Recommendation {
  feature: string
  reason: string
  tier: string
}

export default function FeatureFlagDashboard() {
  const [status, setStatus] = useState<FeatureStatus | null>(null)
  const [productionReady, setProductionReady] = useState<ProductionStatus | null>(null)
  const [compatibility, setCompatibility] = useState<Compatibility[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    // Fetch feature status from API
    fetch('/api/admin/features/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data.status)
        setProductionReady(data.productionReady)
        setCompatibility(data.compatibility)
        setRecommendations(data.recommendations)
      })
      .catch(err => console.error('Failed to load feature status:', err))
  }, [])

  if (!status) {
    return <div>Loading feature status...</div>
  }

  const tierBadgeColor = {
    core: 'bg-gray-500',
    basic: 'bg-blue-500',
    advanced: 'bg-purple-500'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feature Configuration</h1>
        <Badge className={tierBadgeColor[status.tier]}>
          {status.tier.toUpperCase()} TIER
        </Badge>
      </div>

      {/* Production Readiness */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          {productionReady?.ready ? (
            <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-500 mt-1" />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">
              {productionReady?.ready ? 'Production Ready ✓' : 'Not Production Ready'}
            </h2>
            {!productionReady?.ready && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Missing required services for production:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {productionReady?.missing.map(item => (
                    <li key={item} className="text-sm text-red-600">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Feature Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Core Features</h3>
            <Badge variant="outline">{status.coverage.core}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Essential features (always enabled)
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Basic Features</h3>
            <Badge variant="outline">{status.coverage.basic}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Payments, maps, email
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Advanced Features</h3>
            <Badge variant="outline">{status.coverage.advanced}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Social, delivery, SMS
          </p>
        </Card>
      </div>

      {/* Compatibility Warnings */}
      {compatibility.length > 0 && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-500 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Compatibility Warnings</h2>
              <div className="space-y-3">
                {compatibility.map((warning, idx) => (
                  <div key={idx} className="border-l-4 border-yellow-500 pl-4">
                    <p className="font-medium">{warning.warning}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      💡 {warning.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Enabled Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Enabled Features ({status.totalEnabled})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {status.enabled.map(feature => (
            <div key={feature} className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-mono">{feature}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Missing Features */}
      {status.totalMissing > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Available Features to Enable ({status.totalMissing})
          </h2>
          <div className="space-y-2">
            {status.missing.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border rounded">
                <XCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.feature}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add environment variable: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{item.envVar}</code>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-500 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Recommended Next Steps</h2>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rec.feature}</span>
                      <Badge variant="outline" className="text-xs">
                        {rec.tier}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rec.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Setup Guide Link */}
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Need Help Setting Up?</h3>
            <p className="text-sm text-blue-800 mb-3">
              Follow our tiered environment setup guide to gradually enable more features.
            </p>
            <a 
              href="/docs/ENVIRONMENT_SETUP_GUIDE.md" 
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View Environment Setup Guide →
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}
