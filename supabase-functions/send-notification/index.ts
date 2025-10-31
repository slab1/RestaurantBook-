// Supabase Edge Function: Send Notification
// Description: Handles email and push notifications for bookings and orders
// Features: Email notifications, SMS backup, push notifications, template management

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse request body
    const requestData = await req.json()
    const {
      notification_id,
      user_id,
      type,
      title,
      message,
      data = {},
      delivery_methods = ['email']
    } = requestData

    // Validate required fields
    if (!user_id || !type || !title || !message) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'MISSING_FIELDS', 
            message: 'Missing required notification fields' 
          } 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (prefError && prefError.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', prefError)
    }

    // Check if user has opted out of email notifications
    const emailOptedOut = preferences && preferences.notifications_email === false
    const smsOptedOut = preferences && preferences.notifications_sms === false

    // Filter delivery methods based on user preferences
    let availableMethods = delivery_methods.filter(method => {
      if (method === 'email' && emailOptedOut) return false
      if (method === 'sms' && smsOptedOut) return false
      return true
    })

    // If no valid methods, mark as sent but don't send
    if (availableMethods.length === 0) {
      await supabase
        .from('notifications')
        .update({
          is_sent: true,
          delivery_methods: []
        })
        .eq('id', notification_id)

      return new Response(JSON.stringify({ 
        data: { 
          message: 'Notification skipped - user opted out',
          delivery_methods: []
        } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user profile for personalization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
    }

    const userName = profile?.full_name || 'Valued Customer'

    // Send notifications based on delivery methods
    const results = {}

    // Send Email Notifications
    if (availableMethods.includes('email')) {
      results.email = await sendEmailNotification({
        user: profile,
        type,
        title,
        message,
        data,
        userName
      })
    }

    // Send SMS Notifications (if configured)
    if (availableMethods.includes('sms')) {
      results.sms = await sendSMSNotification({
        user: profile,
        type,
        title,
        message,
        data,
        userName
      })
    }

    // Send Push Notifications (if configured)
    if (availableMethods.includes('push')) {
      results.push = await sendPushNotification({
        user: profile,
        type,
        title,
        message,
        data,
        userName
      })
    }

    // Update notification record
    if (notification_id) {
      const sentMethods = Object.keys(results).filter(key => results[key]?.success)
      
      await supabase
        .from('notifications')
        .update({
          is_sent: sentMethods.length > 0,
          delivery_methods: sentMethods,
          updated_at: new Date().toISOString()
        })
        .eq('id', notification_id)
    }

    // Return results
    const response = {
      data: {
        message: 'Notification processing completed',
        delivery_methods: availableMethods,
        results: results,
        user_preferences: {
          email_opt_out: emailOptedOut,
          sms_opt_out: smsOptedOut
        }
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Notification error:', error)
    
    const errorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while sending notifications'
      }
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})

// Send Email Notification
async function sendEmailNotification({ user, type, title, message, data, userName }) {
  try {
    // Check if email service is configured
    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL')
    const emailApiKey = Deno.env.get('EMAIL_API_KEY')
    
    if (!emailServiceUrl || !emailApiKey) {
      console.log('Email service not configured, simulating send')
      return { success: true, method: 'simulated', message: 'Email service not configured' }
    }

    // Generate email content based on type
    const emailContent = generateEmailContent({
      type,
      title,
      message,
      data,
      userName,
      user
    })

    // Send email via external service
    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: user?.email,
        subject: title,
        html: emailContent.html,
        text: emailContent.text
      })
    })

    if (response.ok) {
      console.log('Email sent successfully to:', user?.email)
      return { success: true, method: 'external_service' }
    } else {
      const error = await response.text()
      console.error('Email send failed:', error)
      return { success: false, error: error }
    }

  } catch (error) {
    console.error('Email notification error:', error)
    return { success: false, error: error.message }
  }
}

// Send SMS Notification
async function sendSMSNotification({ user, type, title, message, data, userName }) {
  try {
    // Check if SMS service is configured
    const smsServiceUrl = Deno.env.get('SMS_SERVICE_URL')
    const smsApiKey = Deno.env.get('SMS_API_KEY')
    
    if (!smsServiceUrl || !smsApiKey || !user?.phone) {
      console.log('SMS service not configured or no phone number')
      return { success: false, reason: 'Service not configured or no phone' }
    }

    // Generate SMS content
    const smsContent = generateSMSContent({ type, title, message, data, userName })

    // Send SMS via external service
    const response = await fetch(smsServiceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${smsApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: user.phone,
        message: smsContent,
        from: 'Restaurant Platform'
      })
    })

    if (response.ok) {
      console.log('SMS sent successfully to:', user.phone)
      return { success: true, method: 'external_service' }
    } else {
      const error = await response.text()
      console.error('SMS send failed:', error)
      return { success: false, error: error }
    }

  } catch (error) {
    console.error('SMS notification error:', error)
    return { success: false, error: error.message }
  }
}

// Send Push Notification
async function sendPushNotification({ user, type, title, message, data, userName }) {
  try {
    // Check if push service is configured
    const pushServiceUrl = Deno.env.get('PUSH_SERVICE_URL')
    const pushApiKey = Deno.env.get('PUSH_API_KEY')
    
    if (!pushServiceUrl || !pushApiKey) {
      console.log('Push notification service not configured')
      return { success: false, reason: 'Service not configured' }
    }

    // Get user's push tokens (would need to be stored in user preferences)
    const pushTokens = [] // This would come from user preferences or a separate table

    if (pushTokens.length === 0) {
      return { success: false, reason: 'No push tokens found' }
    }

    // Send push notifications to all user devices
    const results = []
    for (const token of pushTokens) {
      const response = await fetch(pushServiceUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pushApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: token,
          title: title,
          body: message,
          data: data,
          icon: '/images/icon-192x192.png'
        })
      })

      results.push({
        token,
        success: response.ok,
        response: response.ok ? 'sent' : await response.text()
      })
    }

    const successCount = results.filter(r => r.success).length
    console.log(`Push notifications sent: ${successCount}/${pushTokens.length}`)
    
    return { 
      success: successCount > 0, 
      method: 'external_service',
      results: results
    }

  } catch (error) {
    console.error('Push notification error:', error)
    return { success: false, error: error.message }
  }
}

// Generate Email Content
function generateEmailContent({ type, title, message, data, userName, user }) {
  const templates = {
    booking_confirmed: {
      subject: `Booking Confirmed - ${data.restaurant_name || 'Restaurant'}`,
      html: generateBookingConfirmationEmail({ title, message, data, userName }),
      text: generateBookingConfirmationText({ title, message, data, userName })
    },
    booking_reminder: {
      subject: `Booking Reminder - Tomorrow at ${data.booking_time}`,
      html: generateBookingReminderEmail({ title, message, data, userName }),
      text: generateBookingReminderText({ title, message, data, userName })
    },
    order_confirmed: {
      subject: `Order Confirmed - ${data.restaurant_name || 'Restaurant'}`,
      html: generateOrderConfirmationEmail({ title, message, data, userName }),
      text: generateOrderConfirmationText({ title, message, data, userName })
    },
    order_ready: {
      subject: `Order Ready for Pickup - ${data.restaurant_name || 'Restaurant'}`,
      html: generateOrderReadyEmail({ title, message, data, userName }),
      text: generateOrderReadyText({ title, message, data, userName })
    }
  }

  const template = templates[type] || {
    subject: title,
    html: `<p>Dear ${userName},</p><p>${message}</p>`,
    text: `Dear ${userName},\n\n${message}`
  }

  return template
}

// Generate SMS Content
function generateSMSContent({ type, title, message, data, userName }) {
  const templates = {
    booking_confirmed: `Hi ${userName}! Your booking at ${data.restaurant_name} on ${data.booking_date} at ${data.booking_time} is confirmed. Ref: ${data.booking_reference}`,
    booking_reminder: `Reminder: Your booking at ${data.restaurant_name} is tomorrow at ${data.booking_time}. See you soon!`,
    order_confirmed: `Order confirmed at ${data.restaurant_name}! Estimated prep time: ${data.estimated_prep_time} mins. Order #${data.order_number}`,
    order_ready: `Your order #${data.order_number} at ${data.restaurant_name} is ready for pickup!`
  }

  return templates[type] || message
}

// Email template generators (simplified versions)
function generateBookingConfirmationEmail({ title, message, data, userName }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>${message}</p>
          
          <div class="details">
            <h3>Booking Details</h3>
            <p><strong>Restaurant:</strong> ${data.restaurant_name}</p>
            <p><strong>Date:</strong> ${data.booking_date}</p>
            <p><strong>Time:</strong> ${data.booking_time}</p>
            <p><strong>Party Size:</strong> ${data.party_size}</p>
            <p><strong>Reference:</strong> ${data.booking_reference}</p>
          </div>
          
          <p>We look forward to serving you!</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Restaurant Platform</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateBookingConfirmationText({ title, message, data, userName }) {
  return `Dear ${userName},

${message}

Booking Details:
Restaurant: ${data.restaurant_name}
Date: ${data.booking_date}
Time: ${data.booking_time}
Party Size: ${data.party_size}
Reference: ${data.booking_reference}

We look forward to serving you!

Restaurant Platform`
}

function generateBookingReminderEmail({ title, message, data, userName }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>${message}</p>
          <p>We're excited to see you tomorrow!</p>
        </div>
        <div class="footer">
          <p>Restaurant Platform</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateBookingReminderText({ title, message, data, userName }) {
  return `Dear ${userName},

${message}

See you tomorrow!

Restaurant Platform`
}

function generateOrderConfirmationEmail({ title, message, data, userName }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>${message}</p>
          
          <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${data.order_number}</p>
            <p><strong>Restaurant:</strong> ${data.restaurant_name}</p>
            <p><strong>Total Amount:</strong> $${data.total_amount}</p>
            <p><strong>Estimated Prep Time:</strong> ${data.estimated_prep_time} minutes</p>
          </div>
        </div>
        <div class="footer">
          <p>Restaurant Platform</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateOrderConfirmationText({ title, message, data, userName }) {
  return `Dear ${userName},

${message}

Order Details:
Order Number: ${data.order_number}
Restaurant: ${data.restaurant_name}
Total Amount: $${data.total_amount}
Estimated Prep Time: ${data.estimated_prep_time} minutes

Restaurant Platform`
}

function generateOrderReadyEmail({ title, message, data, userName }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Ready</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Ready!</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>Restaurant Platform</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateOrderReadyText({ title, message, data, userName }) {
  return `Dear ${userName},

${message}

Restaurant Platform`
}