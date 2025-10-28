#  Online Doctor Appointment System

> A modern healthcare platform that connects patients with doctors seamlessly. Built with the MERN stack to make healthcare accessible and easy to manage.

## Team Members

- **C. Lohith Kumar Reddy** (231IT016)
- **K. Udayram** (231IT032)
- **P. Pavan Kumar** (231IT046)

---

## What is this?

This is a full-stack web application that helps patients book appointments with doctors online. Think of it as a digital clinic where patients can browse doctors, schedule appointments, and doctors can manage their practice - all in one place. Plus, there's a powerful admin dashboard to keep everything running smoothly.

We built this using MongoDB, Express.js, React, and Node.js (the MERN stack), with TypeScript for better code quality and Tailwind CSS for a clean, modern look.

## Why We Built This

Healthcare should be simple and accessible. This project addresses the common frustration of booking doctor appointments - no more endless phone calls or waiting in queues. Everything happens online, securely and efficiently.

---

##  What Can You Do?

### For Patients 🏥
- **Easy Registration**: Sign up with your email, verify with OTP, and you're good to go
- **Find Doctors**: Browse through available doctors by specialization
- **Book Appointments**: Schedule appointments that work for your calendar
- **Track Everything**: See all your past and upcoming appointments in one place
- **Manage Profile**: Update your details and medical history anytime
- **Upload Profile Picture**: Personalize your account with your photo

### For Doctors 👨‍⚕️
- **Professional Profile**: Showcase your credentials, specialization, and experience
- **Appointment Management**: See all your appointments and manage them efficiently
- **Accept/Decline**: Review appointment requests and accept or decline them
- **Patient History**: Access patient medical history when needed
- **Update Status**: Mark appointments as completed, add notes, etc.
- **Availability Control**: Manage your schedule and availability

### For Admins 🛡️
- **System Overview**: Get a bird's eye view of all users and activities
- **User Management**: View, suspend, or activate user accounts when needed
- **Analytics Dashboard**: See system statistics and usage patterns
- **Audit Logs**: Track all admin actions for security and compliance
- **Security Controls**: Manage user accounts and handle security issues

---

## 🛠️ Tech Stack

We chose these technologies because they work great together and are widely used in the industry:

**Frontend:**
- React 19 with TypeScript - for a robust, type-safe user interface
- Vite - super fast development and build tool
- Tailwind CSS v4 - for beautiful, responsive styling
- React Router - smooth navigation between pages
- Axios - handles all API requests cleanly

**Backend:**
- Node.js & Express.js - the backbone of the server
- MongoDB with Mongoose - flexible database for storing all data
- JWT (JSON Web Tokens) - secure authentication
- Bcrypt - keeps passwords safe with strong encryption
- Nodemailer - sends emails for OTP and notifications
- Multer - handles file uploads (profile pictures)

---

##   Getting Started

### What You'll Need

Before you start, make sure you have:
- Node.js (version 18 or newer)
- MongoDB (you can use a local installation or MongoDB Atlas)
- A Gmail account (for sending emails)
- Git (to clone the repo)

### Quick Setup

Here's how to get everything running on your machine:

1. **Clone the repository**
```bash
git clone https://github.com/Pa1kumar45/Online-Doctor-Appointment-System.git
cd Online-Doctor-Appointment-System
```

2. **Set up the backend**
```bash
cd backend
npm install
```

This will install all necessary backend dependencies including:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `nodemailer` - Email service (for OTP and notifications)
- `multer` - File upload handling (for profile pictures)
- `express-validator` - Input validation
- `cookie-parser` - Cookie handling
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

3. **Configure environment variables**

Create a `.env` file in the backend folder with these settings:
```env
# Your MongoDB connection
MONGODB_URI=mongodb://localhost:27017/healthconnect

# Or use MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthconnect

# Server settings
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security (change this!)
JWT_SECRET=make-this-a-long-random-string-in-production
JWT_EXPIRE=7

# Email settings (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=HealthConnect <noreply@healthconnect.com>
```

**Important:** For Gmail, you'll need to generate an "App Password" (see the Gmail Setup section below).

4. **Create an admin account**
```bash
npm run create-admin
```
Save the credentials it generates - you'll need them to access the admin panel!

5. **Set up the frontend**
```bash
cd ../frontend
npm install
```

This will install all necessary frontend dependencies including:
- `react` & `react-dom` - React framework
- `typescript` - Type safety
- `vite` - Build tool and dev server
- `react-router-dom` - Client-side routing
- `axios` - HTTP client for API calls
- `tailwindcss` - Styling framework
- `lucide-react` - Icon library

Create a `.env` file in the frontend folder:
```env
VITE_BACKEND_URL=http://localhost:5000
```

6. **Start everything up**

Open two terminal windows:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

7. **Open your browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

That's it! You should now see the app running.

---

## 📧 Gmail Setup (Important!)

To send emails (OTP, password reset, etc.), you need to set up Gmail properly:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Copy that password into your `.env` file as `EMAIL_PASSWORD`

The app password is different from your regular Gmail password - it's a special code that Gmail generates for apps.

---

## 🔧 Backend Setup Details

The backend is built with Node.js and Express.js. Here's what you need to know:

### Core Dependencies
```bash
npm install express mongoose jsonwebtoken bcryptjs nodemailer multer express-validator cookie-parser cors dotenv
```

### Development Dependencies
```bash
npm install --save-dev nodemon eslint jest supertest
```

### Key Features Implemented:
- **Authentication**: JWT-based with HTTP-only cookies
- **Email Service**: Nodemailer with Gmail SMTP
- **File Uploads**: Multer for handling profile pictures (stored in `uploads/avatars/`)
- **Validation**: Express-validator for input validation
- **Database**: MongoDB with Mongoose ODM

### File Upload Configuration
Profile pictures are handled by Multer and stored locally:
- Storage location: `backend/uploads/avatars/`
- Accepted formats: JPG, JPEG, PNG, GIF
- Max file size: 5MB
- Files are served statically via `/uploads` endpoint

### Email Configuration
Emails are sent using Nodemailer with Gmail:
- OTP verification codes (6 digits, expires in 10 minutes)
- Welcome emails after registration
- Password reset tokens (expires in 15 minutes)
- Appointment confirmations

---

## 💻 Frontend Setup Details

The frontend is built with React 19, TypeScript, and Vite.

### Core Dependencies
```bash
npm install react react-dom react-router-dom axios tailwindcss lucide-react
```

### Development Dependencies
```bash
npm install --save-dev @vitejs/plugin-react typescript vite eslint @typescript-eslint/parser
```

### Key Features Implemented:
- **Type Safety**: Full TypeScript implementation
- **Routing**: React Router v7 with protected routes
- **Styling**: Tailwind CSS v4 with custom components
- **State Management**: React Context API
- **API Integration**: Axios with interceptors
- **Icons**: Lucide React for modern icons

### Build & Development
```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables
The frontend uses Vite's environment variable system:
- Prefix: `VITE_`
- Backend URL: `VITE_BACKEND_URL`
- Loaded from `.env` file in frontend directory

---

##  User Roles

The system has three types of users, each with different capabilities:

### Patients
- Register with email verification
- Browse and search for doctors
- Book appointments
- View appointment history
- Update personal profile
- Upload profile picture
- Cancel appointments when needed

### Doctors  
- Register with professional credentials
- Manage their profile and specialization details
- See all appointment requests
- Accept or decline appointments
- Add notes and recommendations
- Access patient medical history
- Update appointment status

### Admins
- Access to the admin dashboard
- View all users in the system
- Suspend or activate accounts
- See system statistics
- Review audit logs
- Cannot be created through the app (use the script!)

---

## 📡 API Endpoints

Here are some key endpoints (authentication required for most):

### Authentication
```
POST /api/auth/register/patient    - Patient registration
POST /api/auth/register/doctor     - Doctor registration  
POST /api/auth/verify-otp          - Verify email with OTP
POST /api/auth/login               - Login
POST /api/auth/logout              - Logout
POST /api/auth/forgot-password     - Request password reset
POST /api/auth/reset-password      - Reset password with token
POST /api/auth/change-password     - Change password (authenticated)
GET  /api/auth/me                  - Get current user info
```

### Doctor Endpoints
```
GET  /api/doctors                  - Get all doctors (public)
GET  /api/doctors/:id              - Get specific doctor by ID
PUT  /api/doctors/profile          - Update doctor profile (auth required)
GET  /api/doctors/profile          - Get doctor's own profile (auth required)
```

### Patient Endpoints
```
GET  /api/patients                 - Get all patients (admin only)
GET  /api/patients/:id             - Get specific patient by ID
PUT  /api/patients/profile         - Update patient profile (auth required)
GET  /api/patients/profile         - Get patient's own profile (auth required)
```

### Appointments
```
GET  /api/appointments             - Get your appointments
POST /api/appointments             - Book new appointment (patient)
PUT  /api/appointments/:id         - Update appointment status
GET  /api/appointments/doctor      - Get doctor's appointments (doctor only)
GET  /api/appointments/patient     - Get patient's appointments (patient only)
DELETE /api/appointments/:id       - Cancel appointment
```



### Admin
```
GET  /api/admin/users              - List all users
POST /api/admin/users/:id/suspend  - Suspend a user
POST /api/admin/users/:id/unsuspend - Unsuspend a user
GET  /api/admin/stats              - System statistics
GET  /api/admin/logs               - View audit logs
DELETE /api/admin/users/:id        - Delete user account
```

All endpoints return JSON responses. Most require a valid JWT token (sent as a cookie).

---

##  Project Structure

```
backend/
├── src/
│   ├── controllers/    # Handle requests and responses
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth, validation, etc.
│   ├── services/       # Email and other services
│   └── lib/           # Utilities and helpers
├── tests/             # Unit and integration tests
└── uploads/           # User uploaded files

frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Full page components
│   ├── services/      # API calls
│   ├── context/       # React context (state management)
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Helper functions
└── public/            # Static assets
```

---

## 🔒 Security Features

Security is a priority. Here's what's implemented:

- **JWT Authentication**: Tokens stored in HTTP-only cookies (can't be accessed by JavaScript)
- **Password Hashing**: All passwords are hashed with bcrypt before storing
- **OTP Verification**: Email verification required for registration
- **Input Validation**: All user inputs are validated and sanitized
- **Role-Based Access**: Users can only access what they're allowed to
- **CORS Protection**: Only the frontend can access the API
- **Account Suspension**: Admins can suspend suspicious accounts
- **Password Reset**: Secure token-based password reset (15-minute expiry)

---

## 🧪 Testing

Want to run the tests?

```bash
cd backend

# Run tests in watch mode (good for development)
npm test

# Run tests once
npm run test:once

# Check code coverage
npm run test:coverage
```

Currently, there are tests for models and some API endpoints. More tests are always welcome!

---

##  Features Overview

What makes this project interesting:

✅ Complete authentication system with OTP verification  
✅ Role-based access control for three user types  
✅ Real-time appointment booking and management  
✅ Email notifications for important events  
✅ Admin dashboard with analytics  
✅ File upload (profile pictures)  
✅ Responsive design (works on mobile, tablet, desktop)  
✅ Input validation and error handling  
✅ Secure password reset flow  
✅ Activity logging for admins  

---

##  Notes

- This is a learning project demonstrating full-stack development skills
- Feel free to use it as a reference or starting point for your own projects
- The admin account must be created via the script (for security reasons)
- Make sure to change the JWT_SECRET in production!
- Email configuration is required for OTP functionality

---

##  License

MIT License - feel free to use this project for learning or as a base for your own work.

---





