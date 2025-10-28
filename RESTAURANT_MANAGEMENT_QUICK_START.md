# Restaurant Management - Quick Start Guide

## 🚀 Access the System

**URL**: https://xz5q6wz85dtt.space.minimax.io/admin/login

**Login Credentials**:
- Email: `admin@restaurantbook.com`
- Password: `admin123`

---

## 📋 How to Test Each Feature

### 1. Restaurant Application Approval/Rejection

**Steps**:
1. Login to admin dashboard
2. Click "Restaurant Management" in sidebar
3. Look for restaurants with **"Pending"** status badge (yellow)
4. Click the **eye icon** or restaurant name to open details
5. Click "Review Application" or the action menu → "Approve/Reject"
6. In the modal:
   - Review all restaurant information
   - Check document upload status
   - Click **"Approve & Activate"** to approve
   - OR click **"Reject"** and provide a reason
7. **Refresh the page** - changes will persist!

**Expected Restaurants**: Bella Italia Trattoria, Le Petit Bistro

---

### 2. Restaurant Verification Process

**Steps**:
1. Find any restaurant in the list
2. Click the action menu (three dots) → "View Verification"
3. In the Verification modal:
   - See document checklist:
     - Business License
     - Health Certificate
     - Tax ID
     - Insurance Certificate
     - Food Handler Certificate
   - Check upload/verification status
   - View expiry dates
   - Click **"Complete Verification"** to mark as verified
4. **Refresh the page** - verification status persists!

**Test On**: Any restaurant, especially those "In-Progress"

---

### 3. Restaurant Status Management

**Steps**:
1. Find an **active** restaurant (green badge)
2. Click action menu → **"Suspend"**
3. Enter a suspension reason (e.g., "Health violation")
4. Confirm suspension - status changes to "Suspended" (red badge)
5. To reactivate:
   - Find the suspended restaurant
   - Click action menu → **"Activate"**
   - Status changes back to "Active"
6. **Refresh the page** - status changes persist!

**Test On**: The Golden Spoon, Sakura Sushi House

---

### 4. Restaurant Profile Management

**Steps**:
1. Click any restaurant's name or eye icon
2. Click "View Profile" or action menu → "Profile"
3. In the Profile modal, view:
   - **Basic Info**: Name, cuisine, capacity, price range
   - **Contact**: Phone, email, website, address
   - **Owner**: Name and email
   - **Features**: List of amenities
   - **Operating Hours**: Weekly schedule
4. Click **"Edit"** to modify information (if implemented)
5. Changes save to localStorage automatically

**Test On**: Any restaurant for complete information

---

### 5. Performance Metrics & Analytics

**Steps**:
1. Click any **active** restaurant
2. Click action menu → "View Performance"
3. In the Performance modal, view:
   - **Key Metrics**:
     - Average rating (★)
     - Total reviews
     - Total bookings
     - Monthly revenue
   - **Performance Indicators**:
     - Booking trend (↑ +12.5% or ↓ -5.3%)
     - Revenue growth
     - Cancellation rate
     - Customer retention rate
     - Response time
4. Observe trend arrows (↑ green = good, ↓ red = declining)

**Best Examples**:
- **The Golden Spoon**: Excellent performance (+12.5%, +15.3%)
- **Spice Route**: Declining performance (-5.3%, -8.2%)

---

### 6. Compliance & Quality Assurance

**Steps**:
1. Click any restaurant
2. Click action menu → "View Compliance"
3. In the Compliance modal, view:
   - **Health Inspection Score**: 0-100
   - **Last Inspection Date**
   - **Violations List**:
     - Type (Health & Safety, Sanitation)
     - Description
     - Severity (Minor 🟡, Major 🟠, Critical 🔴)
     - Date
     - Resolution status
   - **Warnings Count**
   - **Suspensions Count**

**Best Examples**:
- **Spice Route Indian Kitchen**: Has 2 violations (1 major, 1 minor)
- **The Golden Spoon**: Clean record (95 score, no violations)

---

## 🔍 Additional Features to Test

### Search & Filter

**Search**:
1. Use search box at top
2. Search by: restaurant name, owner, city, or cuisine
3. Example: Search "sushi" to find Sakura Sushi House

**Filter by Status**:
1. Use status dropdown
2. Select: Pending, Active, Suspended, Rejected
3. Table updates to show only matching restaurants

**Filter by Verification**:
1. Use verification dropdown
2. Select: Verified, In-Progress, Pending
3. Table updates accordingly

### Sorting

**Steps**:
1. Click any column header: Name, Submitted Date, Rating, Bookings, Revenue
2. Click again to reverse sort order
3. Arrow indicates sort direction (↑ asc, ↓ desc)

### Bulk Operations

**Steps**:
1. Check boxes next to multiple restaurants
2. Click "Bulk Actions" button that appears
3. Select "Suspend Selected"
4. Confirm bulk suspension
5. All selected restaurants change to "Suspended" status

### Export to CSV

**Steps**:
1. Click **"Export CSV"** button
2. File downloads: `restaurants-export-2025-10-28.csv`
3. Open in Excel/Google Sheets
4. See all restaurant data in spreadsheet format

### Activity Log

**Steps**:
1. Click any restaurant
2. Click action menu → "View Activity Log"
3. See history of all actions:
   - Status changes
   - Verifications
   - Compliance events
   - Admin actions
4. Each entry shows: type, description, timestamp, performer

---

## 💾 Data Persistence Test

**Critical Test**:
1. **Make changes**: Approve a restaurant, suspend another, verify documents
2. **Refresh the browser page** → All changes remain
3. **Close browser tab completely**
4. **Reopen** → Navigate to admin → Login → Restaurant Management
5. **Verify**: All your changes are still there!

**Why it works**: localStorage saves all data locally in your browser

---

## 📊 Statistics Dashboard

At the top of the page, view real-time statistics:

**Top Row**:
- Total Restaurants
- Active & Approved
- Pending Review
- Suspended

**Bottom Row**:
- Verified Restaurants
- Total Monthly Revenue
- Total Bookings

**Updates**: Statistics update automatically after any action

---

## 🎯 Quick Testing Checklist

- [ ] Login successfully
- [ ] View statistics dashboard
- [ ] Search for a restaurant
- [ ] Filter by status
- [ ] Sort a column
- [ ] Approve a pending restaurant
- [ ] Reject a pending restaurant
- [ ] View verification modal
- [ ] Complete verification
- [ ] Suspend an active restaurant
- [ ] Activate a suspended restaurant
- [ ] View performance metrics
- [ ] View compliance details
- [ ] View profile information
- [ ] View activity log
- [ ] Bulk select restaurants
- [ ] Export to CSV
- [ ] Refresh page → verify persistence
- [ ] Close and reopen → verify persistence

---

## 🐛 What to Look For

### Should Work:
✅ All buttons and links clickable  
✅ Modals open and close properly  
✅ Data displays correctly  
✅ Actions update the UI immediately  
✅ Toast notifications appear for actions  
✅ Data persists after refresh  
✅ Search and filters work  
✅ Sorting updates the table  
✅ CSV export downloads  
✅ Statistics update after actions

### Report If You See:
❌ Errors in console  
❌ Buttons not working  
❌ Data not persisting after refresh  
❌ Modals not opening  
❌ Missing restaurant information  
❌ Layout issues  

---

## 📱 Browser Recommendations

**Best Experience**:
- Chrome, Edge, Firefox (latest versions)
- Desktop or tablet (admin tools optimized for larger screens)

**Mobile**: Works but optimized for desktop workflows

---

## 💡 Tips

1. **Always refresh** after major actions to confirm persistence
2. **Check the statistics** - they update in real-time
3. **Look for badges** - Green (active), Yellow (pending), Red (suspended)
4. **Use filters** to find specific restaurants quickly
5. **Export CSV** to see all data in spreadsheet format
6. **Activity logs** show complete history of admin actions

---

## 🚀 Ready to Test!

Open the URL, login, and start testing all 6 feature categories. Everything persists to localStorage, so your changes will survive page refreshes and browser restarts.

**Enjoy testing the comprehensive restaurant management system!** 🎉
