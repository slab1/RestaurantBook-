import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useI18n } from '../contexts/I18nContext'
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react'

export function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const { t } = useI18n()
  
  const [formState, setFormState] = useState({ email: '', password: '' })
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    login(formState.email, formState.password).catch(console.error)
  }
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setFormState(prev => ({ ...prev, email: newEmail }))
  }
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setFormState(prev => ({ ...prev, password: newPassword }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">RestaurantBook</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-gray-600 mt-2">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.welcomeBack')}</CardTitle>
            <CardDescription>
              {t('auth.loginDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={formState.email}
                    onChange={handleEmailChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={formState.password}
                    onChange={handlePasswordChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  t('auth.signingIn')
                ) : (
                  <>
                    {t('auth.signIn')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Demo Login */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                {t('auth.demoLogin')}
              </p>
              <div className="space-y-2 text-xs text-blue-700">
                <p>Email: demo@restaurantbook.com</p>
                <p>Password: demo123</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  {t('auth.signUp')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4">
            <div className="text-primary mb-2">
              <svg className="h-6 w-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">{t('auth.feature1')}</p>
          </div>
          <div className="p-4">
            <div className="text-primary mb-2">
              <svg className="h-6 w-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">{t('auth.feature2')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
