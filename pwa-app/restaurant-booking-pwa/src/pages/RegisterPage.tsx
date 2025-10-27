import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { useToast } from '../hooks/use-toast'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useI18n } from '../contexts/I18nContext'
import { Building2, User, Mail, Lock, Phone, ArrowRight, CheckCircle } from 'lucide-react'

export function RegisterPage() {
  const { register, isLoading } = useAuthStore()
  const { toast } = useToast()
  const { t } = useI18n()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { number: 1, title: t('register.step1'), description: t('register.step1Desc') },
    { number: 2, title: t('register.step2'), description: t('register.step2Desc') },
  ]

  const validateStep = (step: number) => {
    if (step === 1) {
      return formData.firstName && formData.lastName && formData.email && formData.phone
    }
    if (step === 2) {
      return formData.password && formData.confirmPassword && 
             formData.password === formData.confirmPassword && 
             formData.acceptTerms
    }
    return false
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    } else {
      toast({
        title: t('register.validationError'),
        description: t('register.fillRequiredFields'),
        variant: 'destructive',
      })
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      toast({
        title: t('register.validationError'),
        description: t('register.fillRequiredFields'),
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      })
      
      toast({
        title: t('register.success'),
        description: t('register.successMessage'),
      })
      
      navigate('/')
    } catch (error) {
      toast({
        title: t('register.error'),
        description: t('register.errorMessage'),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">RestaurantBook</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {t('register.title')}
          </h2>
          <p className="text-gray-600 mt-2">
            {t('register.subtitle')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <Badge 
                  variant={currentStep >= step.number ? "default" : "outline"}
                  className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${
                    currentStep > step.number ? 'bg-green-500' : ''
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </Badge>
                <span className="text-xs text-center mt-1 max-w-20">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder={t('auth.firstNamePlaceholder')}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder={t('auth.lastNamePlaceholder')}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('auth.emailPlaceholder')}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('auth.phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t('auth.phonePlaceholder')}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full">
                    {t('common.next')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={t('auth.passwordPlaceholder')}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        required
                        className="pl-10"
                      />
                    </div>
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-600">{t('auth.passwordMismatch')}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm">
                      {t('register.acceptTerms')}{' '}
                      <a href="/terms" className="text-primary hover:underline">
                        {t('register.termsOfService')}
                      </a>
                    </Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                      {t('common.back')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!validateStep(2) || isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        t('auth.signingUp')
                      ) : (
                        <>
                          {t('auth.signUp')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.hasAccount')}{' '}
                <a href="/login" className="font-medium text-primary hover:underline">
                  {t('auth.signIn')}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
