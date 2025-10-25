# Online Doctor Appointment System
**HealthConnect - A Comprehensive Healthcare Platform**

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**HealthConnect** is a full-stack MERN (MongoDB, Express.js, React, Node.js) healthcare platform designed to streamline doctor-patient interactions. The system provides a secure, user-friendly environment for:

- **Appointment Scheduling** - Book, manage, and track medical appointments
- **User Authentication** - Role-based access control with OTP verification
- **Profile Management** - Complete patient and doctor profile management
- **Admin Dashboard** - Comprehensive system administration and user management
- **Medical Records** - Maintain patient health records and appointment history
- **Secure Communication** - JWT-based authentication with password reset functionality

This project demonstrates modern web development practices including RESTful API design, secure authentication, database management, and responsive UI design.

---

## ✨ Features

### 👤 User Management
- **Multi-Role Authentication System**
  - Patient registration and login with OTP verification
  - Doctor registration with professional details
  - Admin login with role-based permissions
- **Secure Password Management**
  - Password hashing with bcrypt
  - Forgot password functionality with email tokens
  - Password reset with secure token validation
  - Change password for authenticated users
- **Profile Management**
  - Complete user profile updates
  - Medical history for patients
  - Specialization and credentials for doctors

### 📅 Appointment System
- **Comprehensive Appointment Management**
  - Patients can book appointments with available doctors
  - Doctors can accept, reject, or reschedule appointments
  - Real-time appointment status tracking (pending, scheduled, completed, cancelled)
  - Filter appointments by date range and status
  - View upcoming and past appointments
- **Appointment Details**
  - Appointment notes and recommendations
  - Patient medical history access for doctors
  - Appointment history tracking

### 🛡️ Admin Dashboard
- **System Administration**
  - View and manage all users (doctors and patients)
  - User account suspension and activation
  - View system statistics and analytics
  - Action logging for audit trails
- **User Management**
  - Search and filter users
  - View user details and activity
  - Suspend/unsuspend accounts
  - Delete users if necessary

### 🔐 Security Features
- **JWT Authentication** with httpOnly cookies
- **OTP Verification** for registration and login
- **Password Reset** via email tokens (15-minute expiry)
- **Input Validation** with express-validator
- **Role-Based Access Control** (Patient, Doctor, Admin)
- **Account Security** - Suspension mechanism for security

### 📧 Email Notifications
- OTP codes for registration and login
- Welcome emails for new users
- Password reset instructions
- Appointment confirmations

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v18+ | Server runtime environment |
| **Express.js** | v4.21.2 | Web application framework |
| **MongoDB** | v8.x | NoSQL database |
| **Mongoose** | v8.12.1 | MongoDB ODM |
| **JWT** | v9.0.2 | Authentication & authorization |
| **Bcrypt.js** | v3.0.2 | Password hashing |
| **Nodemailer** | v7.0.9 | Email service |
| **Express-Validator** | v7.2.1 | Input validation |
| **Jest** | v30.2.0 | Testing framework |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | v19.0.0 | UI library |
| **TypeScript** | v5.7.2 | Type-safe JavaScript |
| **Vite** | v6.2.0 | Build tool & dev server |
| **React Router** | v7.3.0 | Client-side routing |
| **Axios** | v1.8.4 | HTTP client |
| **Tailwind CSS** | v4.0.13 | Utility-first CSS framework |
| **Lucide React** | v0.482.0 | Icon library |

### DevOps & Tools
- **Docker & Docker Compose** - Containerization
- **MongoDB Atlas** - Cloud database (production)
- **Git** - Version control
- **ESLint** - Code linting
- **Nodemon** - Development auto-restart

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Patient   │  │    Doctor    │  │   Admin Panel    │   │
│  │  Dashboard  │  │   Dashboard  │  │                  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                           │                                  │
│                    Axios HTTP Client                         │
└─────────────────────────────────────────────────────────────┘
                            │
                   RESTful API (JSON)
                            │
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Middleware Layer                        │    │
│  │  • JWT Authentication  • CORS  • Validation          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Routes Layer                        │    │
│  │  /auth  /patients  /doctors  /appointments  /admin   │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               Controllers Layer                      │    │
│  │  Business Logic & Request Handling                   │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Models Layer                         │    │
│  │  Patient | Doctor | Admin | Appointment | OTP        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                   MongoDB Connection
                            │
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                        │
│  Collections: users, doctors, patients, admins,             │
│               appointments, otps, adminactionlogs            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **MongoDB** (v6.x or higher) - [Download](https://www.mongodb.com/try/download/community)
  - **OR** MongoDB Atlas account (Cloud database) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

### Optional (for Docker deployment)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (included with Docker Desktop)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Online-Doctor-Appointment-System
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/healthconnect
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/healthconnect?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=HealthConnect <your-email@gmail.com>

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# OTP Configuration
OTP_EXPIRY=10
```

#### 2.4 Setup Gmail for Email Service
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated 16-character password
   - Use this as `EMAIL_PASS` in your `.env` file

#### 2.5 Create Admin Account (Optional but Recommended)
```bash
npm run create-admin
```
This creates a default admin account:
- **Email:** admin@healthconnect.com
- **Password:** Admin@123

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
cd ../frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Configure Environment Variables
Create a `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🏃 Running the Application

### Option 1: Run Backend and Frontend Separately (Development Mode)

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```
Backend will run on: **http://localhost:5000**

#### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on: **http://localhost:5173**

### Option 2: Run with Docker Compose (Production-like Environment)

```bash
# From the root directory
docker-compose up --build
```

This will start:
- **MongoDB** on port 27017
- **Backend API** on port 5000
- **Frontend** on port 5173

To stop:
```bash
docker-compose down
```

To stop and remove volumes:
```bash
docker-compose down -v
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Patient Registration
**POST** `/auth/register/patient`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "1234567890",
  "age": 30,
  "gender": "male",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email. Please verify to complete registration.",
  "email": "john@example.com"
}
```

#### 2. Doctor Registration
**POST** `/auth/register/doctor`

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@example.com",
  "password": "Password@123",
  "phone": "1234567890",
  "specialization": "Cardiology",
  "experience": 10,
  "qualification": "MBBS, MD",
  "fees": 500
}
```

#### 3. OTP Verification
**POST** `/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login.",
  "user": { /* user data */ }
}
```

#### 4. Login (Patient/Doctor)
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### 5. Admin Login
**POST** `/auth/admin/login`

**Request Body:**
```json
{
  "email": "admin@healthconnect.com",
  "password": "Admin@123"
}
```

#### 6. Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset instructions sent to email"
}
```

#### 7. Reset Password
**POST** `/auth/reset-password/:token`

**Request Body:**
```json
{
  "password": "NewPassword@123"
}
```

#### 8. Change Password (Authenticated)
**POST** `/auth/change-password`

**Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

### Appointment Endpoints

#### 1. Create Appointment
**POST** `/appointments`

**Request Body:**
```json
{
  "doctorId": "doctor_id",
  "appointmentDate": "2025-10-25T10:00:00.000Z",
  "reason": "Regular checkup"
}
```

#### 2. Get All Appointments (Patient/Doctor)
**GET** `/appointments`

Query Parameters:
- `status` - Filter by status (pending, scheduled, completed, cancelled)
- `startDate` - Filter from date
- `endDate` - Filter to date

#### 3. Get Appointment by ID
**GET** `/appointments/:id`

#### 4. Update Appointment Status (Doctor)
**PATCH** `/appointments/:id/status`

**Request Body:**
```json
{
  "status": "scheduled"
}
```

### Patient Endpoints

#### 1. Get Patient Profile
**GET** `/patients/profile`

#### 2. Update Patient Profile
**PUT** `/patients/profile`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "age": 31,
  "address": "456 New St"
}
```

### Doctor Endpoints

#### 1. Get All Doctors
**GET** `/doctors`

Query Parameters:
- `specialization` - Filter by specialization
- `search` - Search by name

#### 2. Get Doctor Profile
**GET** `/doctors/profile`

#### 3. Update Doctor Profile
**PUT** `/doctors/profile`

### Admin Endpoints

#### 1. Get All Users
**GET** `/admin/users`

Query Parameters:
- `role` - Filter by role (patient, doctor)
- `status` - Filter by status (active, suspended)

#### 2. Suspend User
**PUT** `/admin/users/:userId/suspend`

#### 3. Unsuspend User
**PUT** `/admin/users/:userId/unsuspend`

#### 4. Get System Statistics
**GET** `/admin/statistics`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPatients": 150,
    "totalDoctors": 25,
    "totalAppointments": 500,
    "pendingAppointments": 30
  }
}
```

---

## 👥 User Roles & Permissions

### Patient
✅ Register and login with OTP verification  
✅ View and update own profile  
✅ Browse available doctors  
✅ Book appointments with doctors  
✅ View own appointments (past and upcoming)  
✅ Cancel appointments  
✅ Reset password  

### Doctor
✅ Register and login with OTP verification  
✅ View and update professional profile  
✅ View all appointments assigned to them  
✅ Accept or reject appointment requests  
✅ Update appointment status (scheduled, completed)  
✅ View patient medical history  
✅ Reset password  

### Admin
✅ Login to admin dashboard  
✅ View all system users (patients and doctors)  
✅ Suspend/unsuspend user accounts  
✅ View system statistics and analytics  
✅ View action logs for audit trails  
✅ Manage user accounts  
❌ Cannot be registered through API (must be created via script)

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend

# Run tests in watch mode
npm test

# Run tests once
npm run test:once

# Run tests with coverage
npm run test:coverage
```

### Test Files
- `backend/tests/models/doctor.test.js` - Doctor model tests
- `backend/tests/models/integration/admin.api.test.js` - Admin API integration tests

### Manual Testing with Postman

1. **Import Postman Collection** (if provided)
2. **Test Authentication Flow:**
   - Register a patient
   - Verify OTP
   - Login
   - Access protected routes

3. **Test Appointment Flow:**
   - Create appointment as patient
   - Login as doctor
   - Accept/reject appointment
   - Update status

4. **Test Admin Features:**
   - Login as admin
   - View users
   - Suspend/unsuspend accounts
   - View statistics

---

## 📁 Project Structure

```
Online-Doctor-Appointment-System/
│
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── patientController.js
│   │   │   ├── doctorController.js
│   │   │   ├── appointmentController.js
│   │   │   └── adminController.js
│   │   │
│   │   ├── models/               # Database schemas
│   │   │   ├── Patient.js
│   │   │   ├── Doctor.js
│   │   │   ├── Admin.js
│   │   │   ├── Appointment.js
│   │   │   └── AdminActionLog.js
│   │   │
│   │   ├── routes/               # API routes
│   │   │   ├── auth.js
│   │   │   ├── patients.js
│   │   │   ├── doctors.js
│   │   │   ├── appointments.js
│   │   │   └── admin.js
│   │   │
│   │   ├── middleware/           # Custom middleware
│   │   │   └── auth.js
│   │   │
│   │   ├── lib/                  # Utilities
│   │   │   ├── db.js            # Database connection
│   │   │   └── utils.js         # Helper functions
│   │   │
│   │   ├── scripts/              # Utility scripts
│   │   │   └── createTestAdmin.js
│   │   │
│   │   └── index.js              # Entry point
│   │
│   ├── tests/                    # Test files
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── UserActionModal.tsx
│   │   │
│   │   ├── pages/                # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── PatientProfile.tsx
│   │   │   ├── DoctorProfile.tsx
│   │   │   ├── DoctorList.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── PatientAppointments.tsx
│   │   │   └── AdminDashboard.tsx
│   │   │
│   │   ├── services/             # API services
│   │   │   ├── api.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── doctor.service.ts
│   │   │   ├── appointment.service.ts
│   │   │   └── admin.service.ts
│   │   │
│   │   ├── context/              # React context
│   │   │   └── AppContext.tsx
│   │   │
│   │   ├── types/                # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── admin.ts
│   │   │
│   │   ├── utils/                # Utilities
│   │   │   ├── auth.ts
│   │   │   └── axios.ts
│   │   │
│   │   ├── App.tsx               # Root component
│   │   └── main.tsx              # Entry point
│   │
│   ├── .env                      # Environment variables
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docs/                         # Documentation
│   ├── CRUD_GUIDE.md
│   └── SCHEMA_GUIDE.md
│
├── docker-compose.yml            # Docker configuration
├── PROJECT_README.md             # This file
└── Readme.md                     # Original readme
```

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/healthconnect` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key_here` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `EMAIL_USER` | Gmail email address | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `your-16-char-app-password` |
| `EMAIL_FROM` | Email sender name | `HealthConnect <email@gmail.com>` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `OTP_EXPIRY` | OTP expiry in minutes | `10` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:5000` |

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Error
**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Check if MongoDB is running: `mongod --version`
- Verify `MONGODB_URI` in `.env` file
- For MongoDB Atlas, ensure IP whitelist is configured
- Check username and password in connection string

#### 2. Email Not Sending
**Error:** `Error sending email: Invalid login`

**Solution:**
- Verify Gmail credentials in `.env`
- Ensure 2FA is enabled on Google account
- Use App Password instead of regular password
- Check if "Less secure app access" is needed

#### 3. Port Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

#### 4. Frontend Can't Connect to Backend
**Error:** `Network Error` or `CORS Error`

**Solution:**
- Verify backend is running on port 5000
- Check `VITE_BACKEND_URL` in frontend/.env
- Ensure `FRONTEND_URL` in backend/.env matches frontend URL
- Clear browser cache and restart dev servers

#### 5. JWT Token Issues
**Error:** `Invalid token` or `Token expired`

**Solution:**
- Clear browser cookies
- Check if `JWT_SECRET` is set in backend/.env
- Try logging in again to get new token
- Ensure JWT_EXPIRE is set properly (e.g., "7d")

#### 6. OTP Not Received
**Error:** OTP email not arriving

**Solution:**
- Check spam/junk folder
- Verify EMAIL_USER and EMAIL_PASS in .env
- Check email service logs in backend console
- Ensure OTP_EXPIRY is reasonable (10 minutes default)

#### 7. Database Seeding Issues
**Error:** Error creating admin account

**Solution:**
```bash
cd backend
npm run create-admin
```
- Ensure MongoDB is running first
- Check for existing admin with same email
- Verify database connection

#### 8. Build Errors
**Error:** Build fails with TypeScript errors

**Solution:**
```bash
# Frontend
cd frontend
npm install
npm run lint

# Backend
cd backend
npm install
```

---

## 📚 Additional Documentation

For more detailed information, refer to:

- **[CRUD_GUIDE.md](docs/CRUD_GUIDE.md)** - Complete CRUD operations guide
- **[SCHEMA_GUIDE.md](docs/SCHEMA_GUIDE.md)** - Database schema documentation
- **[TESTING_GUIDE.md](backend/TESTING_GUIDE.md)** - Testing documentation
- **[HOW_TO_USE_ADMIN_PAGE.md](HOW_TO_USE_ADMIN_PAGE.md)** - Admin features guide
- **[USER_ACCOUNT_STATES_GUIDE.md](USER_ACCOUNT_STATES_GUIDE.md)** - Account states documentation

---

## 🎓 Academic Notes

### Key Learning Outcomes

1. **Full-Stack Development**
   - Building RESTful APIs with Express.js
   - Creating responsive UIs with React and TypeScript
   - State management with React Context API

2. **Database Design**
   - MongoDB schema design with Mongoose
   - Relationships between collections
   - Indexing and query optimization

3. **Authentication & Security**
   - JWT-based authentication
   - Password hashing with bcrypt
   - OTP verification system
   - Role-based access control

4. **API Development**
   - RESTful API design principles
   - Request validation with express-validator
   - Error handling and status codes
   - Middleware implementation

5. **DevOps Practices**
   - Containerization with Docker
   - Environment configuration management
   - Testing with Jest
   - Version control with Git

### Project Highlights for Evaluation

✅ **Complete Authentication System** - Registration, login, OTP verification, password reset  
✅ **Role-Based Access Control** - Three distinct user roles with proper permissions  
✅ **CRUD Operations** - Full create, read, update, delete for all entities  
✅ **Email Integration** - Automated emails for OTP, welcome, and password reset  
✅ **Admin Dashboard** - Comprehensive system administration features  
✅ **API Documentation** - Well-documented API endpoints  
✅ **Error Handling** - Proper error responses and validation  
✅ **Security Best Practices** - Password hashing, JWT tokens, input validation  
✅ **Responsive UI** - Modern, user-friendly interface with Tailwind CSS  
✅ **Testing** - Unit and integration tests with Jest  

---

## 👨‍💻 Development Team

**Student Name:** [Your Name]  
**Roll Number:** [Your Roll Number]  
**Course:** [Course Name]  
**Professor:** [Professor Name]  
**Semester:** [Semester/Year]

---

## 📝 License

This project is created for academic purposes as part of a university course.

---

## 🙏 Acknowledgments

- Course instructor and teaching assistants
- MongoDB documentation and tutorials
- React and Express.js communities
- Stack Overflow community for troubleshooting support

---

## 📞 Support

For questions or issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the additional documentation in the `docs/` folder
3. Contact the development team

---

**Last Updated:** October 21, 2025

**Version:** 1.0.0
