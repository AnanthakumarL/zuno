# 🔐 Client Portal Authentication Guide

## Features Added

✅ User Registration (Signup)
✅ User Login  
✅ User Menu with Profile Info
✅ Logout Functionality
✅ Persistent Login (localStorage)
✅ Protected Routes Ready

## Usage

### 1. **Signup / Get Started Process**

Navigate to: http://localhost:3000/signup

**Smart Account Management:**
- **New User?** → Creates a new account
- **Existing User?** → Automatically logs you in

**Steps:**
1. Enter your full name
2. Enter your 10-digit Indian mobile number (without +91)
3. Optionally enter your email address
4. Create a password (minimum 6 characters)
5. Confirm password
6. Click "Continue"
7. Enter the 6-digit OTP (shown in demo mode)
8. Click "Verify & Continue"
9. System will either:
   - ✅ Create your account → "Account created successfully! 🎉"
   - ✅ Login to existing account → "Welcome back! Logged in successfully 🍦"

**Indian Users Only:** 
- Phone number is mandatory with +91 prefix (auto-added)
- Only 10-digit mobile numbers are accepted
- Email is optional

**Demo Mode:** The OTP is displayed on screen for testing. In production, this would be sent via SMS.

### 2. **Login Process**

Navigate to: http://localhost:3000/login

**Steps:**
1. Enter your email address OR phone number
   - Email: `your@email.com`
   - Phone: `9876543210` (10 digits) or `+919876543210` (with country code)
2. Enter your password
3. Click "Login"

**Flexible Login Options:**
- ✅ Valid email address (e.g., `john@example.com`)
- ✅ 10-digit phone number (e.g., `9876543210` - automatically adds +91)
- ✅ Full phone with country code (e.g., `+919876543210`)
- ❌ Invalid formats will show an error message

### 3. **User Menu**

After logging in:
- **Desktop:** Click the user icon (👤) in the navbar (next to cart)
  - Shows your name and email/phone
  - Logout button available
  
- **Mobile:** Open menu and see user info at the bottom
  - Displays your profile information
  - Logout button available

### 4. **Logout**

Click the "Logout" button in the user menu dropdown.

## Navigation

### Navbar Buttons

**When Not Logged In:**
- Desktop: "Login" button with user icon (👤) next to cart
- Mobile: "Login / Sign Up" in the mobile menu

**When Logged In:**
- Desktop: User icon (👤) that opens a dropdown menu
- Mobile: User profile card with logout button in mobile menu

## API Endpoints Used

All authentication is handled by the backend server:

- `POST /api/v1/auth/signup/request-otp` - Request OTP for signup
- `POST /api/v1/auth/signup/verify` - Verify OTP and create account
- `POST /api/v1/auth/login` - Login with credentials

## Data Storage

- User session is stored in `localStorage` as `amudhu_user`
- Data persists across page reloads
- Cleared on logout

## Testing

1. **Create an account:**
   - Visit: http://localhost:3000/signup
   - Use test email: test@example.com
   - Password: test123
   - Note the OTP shown on screen and enter it

2. **Login:**
   - Visit: http://localhost:3000/login
   - Use the credentials you created
   - Click login

3. **Verify user menu:**
   - Look for user icon (👤) next to cart icon in navbar
   - Click to see profile dropdown
   - Verify your name and email/phone are displayed

4. **Logout:**
   - Click "Logout" button in the dropdown
   - Verify you're redirected and navbar shows "Login" again

## File Structure

```
Client/src/
├── context/
│   └── AuthContext.jsx      # Authentication state management
├── pages/
│   ├── Login.jsx            # Login page
│   └── Signup.jsx           # Signup with OTP verification
└── components/
    └── Navbar.jsx           # Updated with auth buttons
```

## Next Steps

To add authentication requirements to specific pages (like checkout), you can:

1. Import `useAuth` hook in the component
2. Check `isAuthenticated` status
3. Redirect to login if not authenticated

Example:
```javascript
import { useAuth } from '../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

function Checkout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // ... rest of checkout component
}
```

## Demo Credentials
Phone: 9876543210 (will be saved as +919876543210)
- Email: demo@amudhu.com (optional)
For quick testing, create an account with:
- Email: demo@amudhu.com
- Password: demo123

The OTP will be displayed on the signup screen.

---

**Note:** The authentication system is fully integrated and ready to use! 🎉
