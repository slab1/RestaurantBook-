# React Stability Testing Instructions

## Deployment URL
https://pz0vd542yvxg.space.minimax.io

## Test Credentials
**Demo User**:
- Email: demo@restaurantbook.com
- Password: password123

**Admin User**:
- Email: admin@restaurantbook.com
- Password: admin123

---

## Critical Tests

### 1. Route Functionality Test
**Purpose**: Verify all routes show correct content (not defaulting to homepage)

**Test Routes**:
1. Homepage: https://pz0vd542yvxg.space.minimax.io/
2. Login: https://pz0vd542yvxg.space.minimax.io/login/
3. Register: https://pz0vd542yvxg.space.minimax.io/register/
4. Profile: https://pz0vd542yvxg.space.minimax.io/profile/
5. Bookings: https://pz0vd542yvxg.space.minimax.io/bookings/
6. Restaurants: https://pz0vd542yvxg.space.minimax.io/restaurants/
7. Restaurant Detail: https://pz0vd542yvxg.space.minimax.io/restaurants/1/
8. Nearby: https://pz0vd542yvxg.space.minimax.io/nearby/
9. Admin Login: https://pz0vd542yvxg.space.minimax.io/admin/login/

**Success Criteria**:
- Each route displays its unique content
- No routes show homepage content
- Page titles and headings are correct
- Navigation works properly

---

### 2. React Error Check
**Purpose**: Verify no React errors #418 or #423 in console

**Steps**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through different pages
4. Check for React errors

**Success Criteria**:
- No "Minified React error #418" messages
- No "Minified React error #423" messages
- No hydration warnings
- Clean console output

---

### 3. Authentication Flow Test
**Purpose**: Verify login/logout works without errors

**Steps**:
1. Go to /login page
2. Enter demo credentials
3. Verify successful login and redirect
4. Navigate to /profile page
5. Verify user data displays
6. Click logout
7. Verify redirect to login

**Success Criteria**:
- Login successful with demo@restaurantbook.com
- Profile shows user information
- Logout clears session
- No errors during auth flow

---

### 4. Error Boundary Test
**Purpose**: Verify error boundaries catch component failures

**Steps**:
1. Navigate through multiple pages
2. Try invalid routes (e.g., /invalid-route)
3. Check for graceful error handling

**Success Criteria**:
- Invalid routes show 404 page (not blank screen)
- 404 page has "Back to Homepage" button
- Application doesn't crash completely
- Error UI is user-friendly

---

### 5. Mobile Navigation Test
**Purpose**: Verify mobile navigation works correctly

**Steps**:
1. Resize browser to mobile viewport (or use mobile device)
2. Test bottom navigation buttons
3. Navigate between pages

**Success Criteria**:
- Bottom navigation visible on mobile
- All 5 navigation buttons clickable
- Navigation routes to correct pages
- Active state shows current page

---

### 6. Admin Dashboard Test
**Purpose**: Verify admin system works with new error handling

**Steps**:
1. Go to /admin/login
2. Login with admin credentials
3. Verify admin dashboard loads
4. Navigate through admin sections

**Success Criteria**:
- Admin login successful
- Admin dashboard displays correctly
- All admin sections accessible
- No React errors in console

---

## Expected Behavior

### Before Fix (Problems):
- Routes defaulted to homepage content
- React errors #418 and #423 in console
- Application crashes on component errors
- No graceful error handling

### After Fix (Expected):
- All routes show correct unique content
- No React errors in console
- Error boundaries catch failures gracefully
- User-friendly error messages
- Application stable across all scenarios

---

## Console Logging to Check

### Successful Patterns:
```
[Auth] Login attempt for: demo@restaurantbook.com
[Auth] Demo login successful
[MobileNav] Clicked: /restaurants
[Nearby] Requesting geolocation...
```

### Error Patterns to Avoid:
```
Minified React error #418
Minified React error #423
Uncaught Error: Hydration failed
Warning: Text content does not match
```

---

## Browser Testing
Recommended to test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Reporting Issues

If any issues found, note:
1. **Route URL**: Exact URL where issue occurs
2. **Console Errors**: Screenshot or copy error messages
3. **Steps to Reproduce**: Exact steps that trigger the issue
4. **Expected vs Actual**: What should happen vs what happens
5. **Browser/Device**: Browser version and device type
