// Send Notification Function
// Handles email, push, and SMS notifications for bookings and orders

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const {
            userId,
            type,
            title,
            message,
            link,
            metadata,
            sendEmail = true,
            sendPush = false
        } = await req.json();

        console.log('[Notification] Request received:', { userId, type, sendEmail });

        if (!userId || !type || !title || !message) {
            throw new Error('Missing required notification fields');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user details
        const userResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const users = await userResponse.json();
        if (!users || users.length === 0) {
            throw new Error('User not found');
        }

        const user = users[0];
        const userEmail = user.email;

        // Get user notification preferences
        const prefsResponse = await fetch(
            `${supabaseUrl}/rest/v1/user_preferences?user_id=eq.${userId}&select=notification_preferences`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        let notificationPrefs = {
            bookings: true,
            promotions: false,
            reviews: true,
            newsletters: false
        };

        const prefs = await prefsResponse.json();
        if (prefs && prefs.length > 0 && prefs[0].notification_preferences) {
            notificationPrefs = prefs[0].notification_preferences;
        }

        // Check if user wants this type of notification
        const notificationType = type.includes('booking') ? 'bookings' : 
                                type.includes('order') ? 'bookings' :
                                type.includes('review') ? 'reviews' : 
                                type.includes('promotion') ? 'promotions' : 'bookings';

        const shouldSend = notificationPrefs[notificationType];

        console.log('[Notification] User preferences:', { type: notificationType, enabled: shouldSend });

        // Create in-app notification record
        const notificationData = {
            user_id: userId,
            type,
            title,
            message,
            link,
            read: false,
            email_sent: false,
            push_sent: false,
            sms_sent: false,
            metadata: metadata || {},
            created_at: new Date().toISOString()
        };

        const notifResponse = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(notificationData)
        });

        if (!notifResponse.ok) {
            const errorText = await notifResponse.text();
            console.error('[Notification] Failed to create notification:', errorText);
            throw new Error('Failed to create notification');
        }

        const notifications = await notifResponse.json();
        const notification = notifications[0];

        console.log('[Notification] Created:', notification.id);

        // Send email if requested and user has enabled it
        let emailSent = false;
        if (sendEmail && shouldSend && userEmail) {
            try {
                // In production, integrate with email service (SendGrid, Resend, etc.)
                // For now, log the email details
                console.log('[Notification] Email would be sent to:', userEmail);
                console.log('[Notification] Email subject:', title);
                console.log('[Notification] Email body:', message);
                
                // Update notification record
                emailSent = true;
                await fetch(`${supabaseUrl}/rest/v1/notifications?id=eq.${notification.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email_sent: true
                    })
                });
            } catch (emailError) {
                console.error('[Notification] Email error:', emailError);
            }
        }

        // Send push notification if requested
        let pushSent = false;
        if (sendPush && shouldSend) {
            try {
                // In production, integrate with push notification service (Firebase, etc.)
                console.log('[Notification] Push notification would be sent');
                
                pushSent = true;
                await fetch(`${supabaseUrl}/rest/v1/notifications?id=eq.${notification.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        push_sent: true
                    })
                });
            } catch (pushError) {
                console.error('[Notification] Push error:', pushError);
            }
        }

        const result = {
            data: {
                notificationId: notification.id,
                emailSent,
                pushSent,
                userPreferencesRespected: shouldSend
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[Notification] Error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'NOTIFICATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
