# Health-Connect - Features Documentation

**Version:** 1.0.0  
**Last Updated:** October 20, 2025  
**Platform:** MERN Stack Healthcare Appointment System

---

## Table of Contents

1. [User Authentication & Authorization](#1-user-authentication--authorization)
2. [Doctor Management](#2-doctor-management)
3. [Patient Management](#3-patient-management)
4. [Appointment System](#4-appointment-system)
5. [Admin Panel](#5-admin-panel)
6. [Security Features](#6-security-features)
7. [User Interface](#7-user-interface)
8. [API Features](#8-api-features)

---

## 1. User Authentication & Authorization

### 1.1 Multi-Role Registration
**Endpoint:** `POST /api/auth/register`

**Supported Roles:**
- **Doctor Registration**
  - Required: name, email, password, specialization, experience, qualification
  - Auto-assigned: verification status (pending)
  - Password hashing: bcryptjs with 14 salt rounds
  
- **Patient Registration**
  - Required: name, email, password
  - Optional: medical history, allergies, emergency contacts
  - Password hashing: bcryptjs with 12 salt rounds

**Features:**
- ✅ Email uniqueness validation across all user types
- ✅ Role-specific field validation
- ✅ Automatic JWT token generation
- ✅ httpOnly cookie session management

### 1.2 Secure Login System
**Endpoints:** 
- `POST /api/auth/login` (Doctor/Patient)
- `POST /api/auth/admin/login` (Admin)

**Login Process:**
1. Email/password validation
2. Account status check (active/suspended)
3. Verification status check (pending/verified/rejected)
4. Password comparison using bcrypt
5. JWT token generation (7-day expiration)
6. Session cookie creation

**Account State Blocking:**
- **Suspended Accounts:** Returns 403 with suspension reason
- **Rejected Accounts:** Blocks login with rejection details
- **Pending Verification:** Login allowed but limited access

### 1.3 Session Management
**Endpoint:** `POST /api/auth/logout`

**Features:**
- ✅ Cookie-based session tracking
- ✅ Secure token expiration
- ✅ Automatic session cleanup on logout
- ✅ Cross-tab logout support

### 1.4 Current User Retrieval
**Endpoint:** `GET /api/auth/me`

**Returns:**
- Complete user profile
- Role information
- Verification status
- Account state

---

## 2. Doctor Management

### 2.1 Doctor Profiles

**Core Information:**
- Personal: Name, email, contact number, avatar
- Professional: Specialization, experience, qualifications
- Description: About/bio section
- Availability: Weekly schedule with time slots

**Profile Fields:**
```javascript
{
  name: String,
  email: String (unique),
  specialization: String,
  experience: Number (years),
  qualification: String,
  about: String,
  contactNumber: String,
  avatar: String (URL),
  schedule: Array of weekly slots
}
```

### 2.2 Doctor Directory
**Endpoint:** `GET /api/doctors`

**Features:**
- ✅ Public access (no authentication required)
- ✅ Returns all active, verified doctors
- ✅ Includes profile pictures and specializations
- ✅ Optimized for browsing and selection

**Frontend Filtering:**
- Search by name or specialization
- Filter by specialization category
- Filter by minimum experience (5/10/15+ years)
- Real-time filter updates

### 2.3 Individual Doctor View
**Endpoint:** `GET /api/doctors/:id`

**Displays:**
- Full profile information
- Professional qualifications
- Years of experience
- Specialization details
- Contact information
- Availability schedule
- Appointment booking interface

### 2.4 Doctor Profile Management
**Endpoint:** `PUT /api/doctors/profile`

**Editable Fields:**
- Personal information (name, contact)
- Professional details (specialization, experience)
- Bio/about section
- Availability schedule
- Profile picture

**Authorization:** Requires doctor authentication

### 2.5 Doctor Dashboard
**Location:** `frontend/src/pages/DoctorDashboard.tsx`

**Capabilities:**
- View all appointments (pending, scheduled, completed)
- Accept/decline pending appointments
- Add comments when accepting appointments
- Mark appointments as completed
- Add medical notes post-appointment
- Filter appointments by status
- Sort by date and time

**Appointment Actions:**
- **Accept:** Change status to 'scheduled', add comment
- **Decline:** Change status to 'cancelled'
- **Complete:** Change status to 'completed', add notes

### 2.6 Verification System

**Verification States:**
- `pending` - Newly registered, awaiting admin review
- `verified` - Approved by admin, full access granted
- `rejected` - Rejected by admin, login blocked
- `under_review` - Currently being reviewed by admin

**Admin-Managed Fields:**
- verificationStatus
- verifiedBy (admin ID)
- verifiedAt (timestamp)
- rejectionReason (if rejected)

---

## 3. Patient Management

### 3.1 Patient Profiles

**Personal Information:**
- Basic: Name, email, date of birth, gender
- Contact: Phone number, emergency contacts
- Medical: Blood group, allergies

**Emergency Contacts:**
```javascript
{
  name: String,
  relationship: String,
  phone: String
}
```

**Profile Fields:**
```javascript
{
  name: String,
  email: String (unique),
  dateOfBirth: String,
  gender: Enum ['male', 'female', ''],
  contactNumber: String,
  allergies: String,
  bloodGroup: Enum ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  emergencyContact: Array,
  avatar: String (URL)
}
```

### 3.2 Patient Profile Management
**Endpoint:** `PUT /api/patients/profile`

**Editable Fields:**
- Personal details
- Medical information
- Emergency contacts
- Profile picture

**Authorization:** Requires patient authentication

### 3.3 Patient Appointments View
**Endpoint:** `GET /api/appointments/patient`

**Features:**
- View all booked appointments
- See appointment status (pending/scheduled/completed/cancelled)
- View doctor information
- See appointment date, time, and reason
- Access past appointments
- View doctor's notes (for completed appointments)

**Display Information:**
- Doctor name and specialization
- Appointment date and time
- Appointment status with color coding
- Reason for visit
- Doctor's comments (if provided)
- Medical notes (post-appointment)

---

## 4. Appointment System

### 4.1 Appointment Booking
**Endpoint:** `POST /api/appointments`

**Booking Process:**
1. Patient selects doctor from directory
2. Views doctor's profile and availability
3. Chooses date and time slot
4. Enters reason for appointment
5. Submits booking request
6. Appointment created with 'pending' status

**Required Information:**
- doctorId (selected doctor)
- patientId (current user, auto-filled)
- date (YYYY-MM-DD format)
- startTime (HH:MM format)
- endTime (HH:MM format)
- reason (optional, patient's description)

### 4.2 Appointment States

**Status Flow:**
```
pending → scheduled → completed
   ↓
cancelled
   ↓
rescheduled
```

**Status Descriptions:**
- **pending:** Initial state, awaiting doctor acceptance
- **scheduled:** Doctor accepted, appointment confirmed
- **completed:** Appointment finished, may include notes
- **cancelled:** Declined or cancelled by doctor/patient
- **rescheduled:** Time/date changed (new appointment created)

### 4.3 Appointment Management
**Endpoint:** `PUT /api/appointments/:id`

**Update Capabilities:**
- Status changes (by doctor/patient)
- Add comments (doctor, when accepting)
- Add medical notes (doctor, post-appointment)
- Add rating and review (patient, post-appointment)

**Authorization:**
- Only involved doctor or patient can update
- Validates ownership before allowing modifications

### 4.4 Appointment Retrieval

**For Doctors:**
**Endpoint:** `GET /api/appointments/doctor`
- Returns all appointments where user is the doctor
- Sorted by date and start time
- Includes patient information
- Filtered by authentication

**For Patients:**
**Endpoint:** `GET /api/appointments/patient`
- Returns all appointments where user is the patient
- Sorted by date
- Includes doctor information
- Shows all statuses

### 4.5 Appointment Display Features

**Frontend Presentation:**
- Color-coded status badges
  - Yellow: Pending
  - Green: Scheduled
  - Blue: Completed
  - Red: Cancelled
- Date/time formatting (locale-aware)
- Doctor/patient name display
- Specialization tags
- Action buttons based on status and role

### 4.6 Appointment Details

**Stored Information:**
```javascript
{
  doctorId: ObjectId,
  patientId: ObjectId,
  date: String,
  startTime: String,
  endTime: String,
  status: String,
  reason: String (patient input),
  comment: String (doctor, on acceptance),
  notes: String (doctor, post-appointment),
  rating: Number (1-5, patient feedback),
  review: String (patient feedback),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. Admin Panel

### 5.1 Admin Authentication
**Endpoint:** `POST /api/auth/admin/login`

**Admin Roles:**
- **admin:** Standard admin privileges
- **super_admin:** Full system access

**Features:**
- Separate login endpoint from regular users
- Role validation (admin/super_admin only)
- Last login timestamp tracking
- Audit trail for all actions

### 5.2 Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard/stats`

**Metrics Displayed:**
- **User Counts:**
  - Total active doctors
  - Total active patients
  - Pending verifications (doctors + patients)
  - Suspended accounts
  
- **Appointment Stats:**
  - Today's appointments
  - Total appointments (all time)
  
- **Recent Activity:**
  - New doctors (last 30 days)
  - New patients (last 30 days)

**Data Aggregation:**
- Real-time counts from database
- Cached for performance
- Refreshed on page load

### 5.3 User Management
**Endpoint:** `GET /api/admin/users`

**Features:**
- **Pagination:** Page-based navigation (default: 10 per page)
- **Filtering:**
  - By role (doctor/patient)
  - By status (active/inactive)
  - By verification status
  - By search term (name, email, phone)
  
**User List Display:**
- User type (doctor/patient)
- Full name
- Email
- Verification status badge
- Active/inactive status badge
- Registration date
- Action buttons (verify, suspend, activate)

### 5.4 User Verification
**Endpoint:** `PUT /api/admin/users/:id/verify`

**Actions:**
- **Verify:** Approve user registration
  - Sets verificationStatus to 'verified'
  - Records verifiedBy (admin ID)
  - Records verifiedAt (timestamp)
  
- **Reject:** Deny user registration
  - Sets verificationStatus to 'rejected'
  - Sets isActive to false (blocks login)
  - Requires rejection reason
  - Records admin and timestamp

**Admin Input:**
- Verification decision (verify/reject)
- Reason (required for rejection)
- User type (doctor/patient)

**Logging:**
- All actions recorded in AdminActionLog
- Includes previous and new data
- Tracks admin ID, IP address, user agent

### 5.5 User Suspension System
**Endpoint:** `PUT /api/admin/users/:id/toggle-status`

**Suspend Action:**
- Sets isActive to false
- Blocks user login immediately
- Requires suspension reason (mandatory)
- Records suspendedBy (admin ID)
- Records suspendedAt (timestamp)
- Cancels future appointments (if doctor)

**Activate Action:**
- Sets isActive to true
- Restores login access
- Preserves suspension history
- Logs reactivation

**Suspension Reason Display:**
- Shown to user on login attempt
- Includes suspension date
- Displays admin contact information

### 5.6 Admin Action Logging
**Endpoint:** `GET /api/admin/logs`

**Logged Actions:**
- User verification/rejection
- Account suspension/activation
- Role changes
- Permission updates

**Log Entry Details:**
```javascript
{
  adminId: ObjectId,
  actionType: String,
  targetUserId: ObjectId,
  targetUserType: String,
  previousData: Object,
  newData: Object,
  reason: String,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

**Audit Trail Features:**
- Immutable log entries
- Timestamped actions
- IP address tracking
- User agent recording
- Before/after data capture

### 5.7 Admin Dashboard UI
**Location:** `frontend/src/pages/AdminDashboard.tsx`

**Components:**
- Statistics cards (4 main metrics)
- User management table
- Filter controls (role, status, verification)
- Search functionality
- Action modals (verify, suspend, activate)
- Pagination controls

**User Actions:**
- **Verify:** Green checkmark icon
- **Suspend:** Pause icon (yellow)
- **Activate:** Play icon (green)
- **View Details:** Info icon

**Modal Interfaces:**
- Verification modal (verify/reject with reason)
- Suspension modal (reason input required)
- Activation confirmation
- Success/error notifications

---

## 6. Security Features

### 6.1 Password Security

**Hashing:**
- Algorithm: bcryptjs
- Salt Rounds: 12-14 (varies by model)
- Pre-save middleware: Automatic hashing on password change
- Comparison: Secure bcrypt.compare() method

**Password Requirements:**
- Minimum length: 6 characters
- Stored as hash only (never plain text)
- Cannot be retrieved (only reset)

### 6.2 JWT Token Management

**Token Generation:**
- Secret: Environment variable (JWT_SECRET)
- Payload: userId, role
- Expiration: 7 days
- Algorithm: Default (HS256)

**Token Storage:**
- httpOnly cookies (prevents XSS)
- SameSite: strict (prevents CSRF)
- Secure flag: true (HTTPS only in production)
- Max age: 7 days

**Token Verification:**
- Middleware: `protect()`
- Validates signature
- Checks expiration
- Extracts user info
- Populates req.user and req.userRole

### 6.3 Role-Based Access Control (RBAC)

**Middleware Functions:**
- `protect()` - Requires authentication
- `adminOnly()` - Admin or super_admin only
- `superAdminOnly()` - Super admin only
- `doctorOnly()` - Doctor role only
- `patientOnly()` - Patient role only

**Protected Routes:**
```javascript
// Admin routes
app.use('/api/admin', protect, adminOnly, adminRoutes);

// Doctor-specific routes
router.put('/profile', protect, doctorOnly, updateProfile);

// Patient-specific routes
router.get('/appointments', protect, patientOnly, getAppointments);
```

### 6.4 CORS Protection

**Configuration:**
- Origin: Whitelist (FRONTEND_URL from env)
- Credentials: true (allows cookies)
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: Content-Type, Authorization, x-requested-with

**Preflight Handling:**
- OPTIONS requests allowed
- Success status: 200

### 6.5 Input Validation

**Backend Validation:**
- express-validator for request validation
- Required field checks
- Email format validation
- Role enum validation
- Data sanitization (trim, normalize)

**Frontend Validation:**
- Required field checks
- Email format validation
- Password length enforcement
- Role selection validation

### 6.6 Account Security

**Account States:**
- Active: Normal operation
- Suspended: Blocked by admin
- Rejected: Verification denied

**Login Blocking:**
- Checks isActive before password validation
- Returns 403 for suspended accounts
- Includes suspension/rejection reason
- Shows contact information

**Session Security:**
- Automatic logout on token expiration
- Cookie expiration sync with JWT
- Cross-tab session management

---

## 7. User Interface

### 7.1 Navigation System
**Component:** `frontend/src/components/Navbar.tsx`

**Features:**
- Logo/branding
- Role-based menu items
- Dark mode toggle
- User profile dropdown
- Responsive mobile menu

**Navigation Items:**
- **Not Logged In:** Home, Login, Sign Up
- **Patient:** Home, My Appointments, Profile, Logout
- **Doctor:** Home, Dashboard, Profile, Logout
- **Admin:** Dashboard, Users, Profile, Logout

### 7.2 Theme System

**Dark Mode:**
- Toggle switch in navbar
- Persists to localStorage
- System-wide theme application
- Tailwind CSS dark: classes
- Smooth transitions

**Color Schemes:**
- Light mode: White/gray backgrounds
- Dark mode: Dark gray/black backgrounds
- Consistent color usage across components

### 7.3 Page Components

**Public Pages:**
- **Login:** Role-based authentication form
- **SignUp:** Multi-role registration forms
- **DoctorList:** Browse all doctors with filters

**Patient Pages:**
- **DoctorPage:** Doctor profile + booking
- **PatientAppointments:** Appointment history
- **PatientProfile:** Edit personal information

**Doctor Pages:**
- **DoctorDashboard:** Appointment management
- **DoctorProfile:** Edit professional info

**Admin Pages:**
- **AdminDashboard:** User management interface

### 7.4 UI Components

**Reusable Components:**
- **LoadingSpinner:** Loading state indicator
- **UserActionModal:** Admin action confirmations
- **Navbar:** Navigation bar
- **AccountBlockedModal:** Suspension/rejection notice

**Status Badges:**
```javascript
// Color coding
pending: 'yellow'
verified: 'green'
rejected: 'red'
scheduled: 'green'
completed: 'blue'
cancelled: 'red'
```

### 7.5 Form Handling

**Form Features:**
- Controlled components
- Real-time validation
- Error message display
- Loading states during submission
- Success confirmations

**Forms:**
- Login form (role selection)
- Registration forms (role-specific fields)
- Appointment booking form
- Profile edit forms
- Admin action forms

### 7.6 Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Responsive Features:**
- Mobile-first approach
- Hamburger menu on mobile
- Grid layouts adapt to screen size
- Touch-friendly buttons
- Optimized font sizes

### 7.7 User Feedback

**Visual Feedback:**
- Loading spinners during async operations
- Success/error messages
- Color-coded status indicators
- Modal confirmations
- Toast notifications

**Error Handling:**
- API error display
- Form validation errors
- Network error messages
- Session expiration notices

---

## 8. API Features

### 8.1 RESTful Design

**Conventions:**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- JSON request/response format
- Consistent error responses
- Status code adherence

**Response Format:**
```javascript
// Success
{
  success: true,
  message: "Operation successful",
  data: { ... }
}

// Error
{
  success: false,
  message: "Error description",
  error: "Technical details"
}
```

### 8.2 Error Handling

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad request / Validation error
- 401: Unauthorized / Missing token
- 403: Forbidden / Insufficient permissions
- 404: Not found
- 500: Server error

**Error Responses:**
- Descriptive error messages
- Field-specific validation errors
- Stack traces in development only
- Generic messages in production

### 8.3 Request/Response Patterns

**Authentication Required:**
```javascript
Headers: {
  Cookie: "token=<JWT_TOKEN>"
}
```

**Pagination:**
```javascript
Query: {
  page: Number,
  limit: Number
}

Response: {
  data: Array,
  pagination: {
    currentPage: Number,
    totalPages: Number,
    totalItems: Number,
    hasNext: Boolean,
    hasPrev: Boolean
  }
}
```

### 8.4 Data Population

**Mongoose Populate:**
- Appointments populate doctor/patient names
- Admin logs populate admin details
- Verification records show admin info

**Example:**
```javascript
.populate('doctorId', 'name specialization')
.populate('patientId', 'name')
```

### 8.5 API Performance

**Optimizations:**
- Database indexing (doctorId, patientId, date)
- Selective field projection
- Query result limiting
- Pagination for large datasets

**Indexes:**
```javascript
// Appointment model
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });

// AdminActionLog model
adminActionLogSchema.index({ createdAt: -1 });
```

---

## Feature Summary Matrix

| Feature | Doctor | Patient | Admin | Public |
|---------|--------|---------|-------|--------|
| Browse Doctors | ✅ | ✅ | ✅ | ✅ |
| Register Account | ✅ | ✅ | ❌ | ✅ |
| Login/Logout | ✅ | ✅ | ✅ | ✅ |
| Edit Profile | ✅ | ✅ | ✅ | ❌ |
| Book Appointment | ❌ | ✅ | ❌ | ❌ |
| Manage Appointments | ✅ | ❌ | ❌ | ❌ |
| View Appointments | ✅ | ✅ | ✅ | ❌ |
| Verify Users | ❌ | ❌ | ✅ | ❌ |
| Suspend Accounts | ❌ | ❌ | ✅ | ❌ |
| View Dashboard Stats | ❌ | ❌ | ✅ | ❌ |
| Access Admin Logs | ❌ | ❌ | ✅ | ❌ |

---

## Technology Feature Integration

### Backend Features
- ✅ Express.js REST API
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication
- ✅ bcryptjs password hashing
- ✅ express-validator input validation
- ✅ Cookie-based sessions
- ✅ CORS protection
- ✅ Jest testing framework
- ✅ Environment-based configuration

### Frontend Features
- ✅ React 19 with TypeScript
- ✅ Vite build tool
- ✅ React Router for navigation
- ✅ Context API for state management
- ✅ Axios for HTTP requests
- ✅ TailwindCSS for styling
- ✅ Lucide React icons
- ✅ Dark mode support
- ✅ Responsive design

### DevOps Features
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ Nodemon for development
- ✅ Environment variable management
- ✅ Separate test database
- ✅ NPM scripts for automation

---

## Removed Features (For Reference)

The following features were previously implemented but have been removed:

- ❌ Real-time chat messaging (Socket.io)
- ❌ Video call functionality (WebRTC)
- ❌ Image uploads (Cloudinary)
- ❌ Message model and routes
- ❌ Socket.io server integration
- ❌ Appointment mode selection (video/chat)

**Reason:** Simplified to focus on core appointment booking functionality.

---

## Future Enhancement Possibilities

**Potential Features:**
- Email notifications (verification, appointments)
- SMS reminders
- Payment integration
- Medical records upload
- Prescription management
- Doctor reviews and ratings
- Advanced search filters
- Calendar integration
- Multi-language support
- Export appointment history
- Analytics dashboard
- Mobile app

---

## Documentation Cross-Reference

For more detailed information, refer to:
- `PROJECT_SUMMARY.md` - Comprehensive system overview
- `QUICK_START.md` - Setup and running instructions
- `ADMIN_SYSTEM_COMPLETE.md` - Admin implementation details
- `HOW_TO_USE_ADMIN_PAGE.md` - Admin usage guide
- `SUSPENSION_IMPLEMENTATION.md` - Account suspension details
- `USER_ACCOUNT_STATES_GUIDE.md` - Account state management
- `TESTING_GUIDE.md` - Testing documentation
- `CHAT_VIDEO_REMOVAL_SUMMARY.md` - Feature removal details

---

**Document Version:** 1.0.0  
**Last Updated:** October 20, 2025  
**Maintained By:** Development Team
