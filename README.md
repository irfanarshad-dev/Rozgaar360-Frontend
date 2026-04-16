<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</div>

<h1 align="center">🚀 Rozgaar360 - Frontend</h1>

<p align="center">
  <strong>A modern, production-grade SaaS platform connecting skilled workers with customers across Pakistan</strong>
</p>

<p align="center">
  Built with Next.js 15 App Router • Real-time Chat • AI Recommendations • Stripe Payments • Interactive Maps
</p>

<div align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-deployment">Deployment</a>
</div>

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **Role-Based Access Control**: Customer, Worker, and Admin roles with protected routes
- **Password Management**: Forgot password and reset password functionality
- **Middleware Protection**: Route-level authentication and authorization
- **Token Expiry Checker**: Automatic token validation and logout on expiry

### 👥 Modern Dashboard System
- **Customer Dashboard**: 
  - Stats overview (Active Bookings, Completed Jobs, Messages)
  - Profile management
  - Quick action cards with hover effects
  - Responsive sidebar navigation
  
- **Worker Dashboard**: 
  - Job request statistics (Pending, Active, Completed)
  - Profile editing with photo upload
  - CNIC verification upload
  - Earnings tracking
  
- **Admin Dashboard**: 
  - User management
  - Verification approvals
  - Platform analytics

### 🎯 Core Functionality
- **Smart Worker Recommendations**: AI-powered matching based on:
  - Location proximity
  - Skills and experience
  - Ratings and reviews
  - Availability
  
- **Complete Booking System**:
  - Service booking with date/time selection
  - Status tracking (Pending → Confirmed → In Progress → Completed)
  - Booking history and management
  - Cancellation handling
  
- **Real-time Chat**: 
  - Socket.io powered messaging
  - Conversation management
  - Message history
  - Online status indicators
  
- **Payment Integration**:
  - Stripe checkout integration
  - Secure payment processing
  - Payment status tracking
  - Test mode with test cards
  
- **Review & Rating System**:
  - Customer reviews for completed jobs
  - Star ratings
  - Review display on worker profiles
  
- **CNIC Verification**:
  - Secure document upload
  - Admin verification workflow
  - Status tracking (Pending/Approved/Rejected)

### 🗺️ Location Features
- **Interactive Maps**: Leaflet.js integration
- **Geolocation**: Find workers near you
- **Distance Calculation**: Sort by proximity
- **City-based Filtering**: Pakistan cities support

### 🌐 Internationalization
- **Bilingual Support**: English and Urdu
- **i18next Integration**: Dynamic language switching
- **RTL Support**: Ready for Urdu interface
- **Translation Files**: Organized by feature modules

### 📱 Modern UI/UX
- **Production-Grade Design System**:
  - Reusable Button component (5 variants)
  - Card system with hover effects
  - Dashboard layout with collapsible sidebar
  - Consistent spacing and typography
  
- **Responsive Design**:
  - Mobile-first approach
  - Tablet optimized
  - Desktop enhanced
  - Sidebar becomes drawer on mobile
  
- **Micro-interactions**:
  - Smooth transitions (200-300ms)
  - Hover animations
  - Loading states with spinners
  - Skeleton screens
  - Toast notifications
  
- **Professional Aesthetics**:
  - Soft color palette (Blue primary, neutral grays)
  - Subtle shadows (shadow-sm to shadow-lg)
  - Rounded corners (rounded-2xl)
  - Clean typography hierarchy

### 🔔 Notifications
- **Real-time Notifications**: Bell icon with unread count
- **Notification Types**: Booking updates, messages, reviews
- **Notification Center**: Dedicated page for all notifications

### 👤 Profile Management
- **Public Worker Profiles**: View worker details, ratings, reviews
- **Profile Photo Upload**: Image upload with preview
- **Profile Editing**: Update personal information
- **Skill Management**: Add/edit skills and experience

---

## 🛠 Tech Stack

### Core Framework
- **[Next.js 15.5](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19.1](https://react.dev/)** - Latest React with concurrent features
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS with custom design system

### Forms & Validation
- **[React Hook Form 7.65](https://react-hook-form.com/)** - Performant form management
- **[Zod 4.1](https://zod.dev/)** - TypeScript-first schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Form validation resolvers

### Data Fetching & Real-time
- **[Axios 1.12](https://axios-http.com/)** - HTTP client with interceptors
- **[Socket.io Client 4.8](https://socket.io/)** - Real-time bidirectional communication

### UI Components & Icons
- **[Lucide React 0.546](https://lucide.dev/)** - Beautiful & consistent icon library
- **[Leaflet 1.9](https://leafletjs.com/)** - Interactive maps
- **[React Leaflet 5.0](https://react-leaflet.js.org/)** - React components for Leaflet
- **[Three.js 0.180](https://threejs.org/)** - 3D graphics (for splash screen)

### Internationalization
- **[i18next 25.8](https://www.i18next.com/)** - Internationalization framework
- **[react-i18next 16.5](https://react.i18next.com/)** - React bindings
- **[next-i18next 15.4](https://github.com/i18next/next-i18next)** - Next.js integration
- **[i18next-http-backend 3.0](https://github.com/i18next/i18next-http-backend)** - Backend loader

### Utilities
- **[js-cookie 3.0](https://github.com/js-cookie/js-cookie)** - Cookie management

### Development Tools
- **[ESLint 9](https://eslint.org/)** - Code linting
- **[Tailwind PostCSS 4](https://tailwindcss.com/docs/using-with-preprocessors)** - CSS processing

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/rozgaar360-frontend.git
cd rozgaar360-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── locales/              # i18n translation files
│   │   ├── en/              # English translations
│   │   │   ├── auth.json
│   │   │   ├── common.json
│   │   │   ├── customer.json
│   │   │   ├── dashboard.json
│   │   │   └── worker.json
│   │   └── ur/              # Urdu translations
│   │       └── ...
│   ├── background.png        # Landing page background
│   └── user.png             # Default user avatar
│
├── src/
│   ├── app/
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/          # Design system components
│   │   │   │   ├── Button.js           # Reusable button (5 variants)
│   │   │   │   ├── Card.js             # Card system
│   │   │   │   └── DashboardLayout.js  # Dashboard wrapper
│   │   │   ├── ChatWindow.js           # Chat interface
│   │   │   ├── ConversationsList.js    # Chat conversations
│   │   │   ├── EditProfile.js          # Profile editor
│   │   │   ├── FormInput.js            # Form input component
│   │   │   ├── Navbar.js               # Main navigation
│   │   │   ├── NotificationBell.js     # Notification dropdown
│   │   │   ├── ProfilePhotoUpload.js   # Photo uploader
│   │   │   ├── ProtectedRoute.js       # Auth HOC
│   │   │   ├── RoleCard.js             # Role selection card
│   │   │   ├── SplashScreen.js         # Loading screen
│   │   │   ├── TokenExpiryChecker.js   # Token validator
│   │   │   ├── UploadCNIC.js           # CNIC uploader
│   │   │   ├── WorkerCard.js           # Worker display card
│   │   │   └── WorkerMap.js            # Map component
│   │   │
│   │   ├── customer/         # Customer pages
│   │   │   ├── dashboard/    # Customer dashboard
│   │   │   ├── bookings/     # Booking management
│   │   │   │   ├── [id]/     # Booking details
│   │   │   │   └── confirmation/[id]/
│   │   │   ├── notifications/ # Notification center
│   │   │   └── reviews/      # Review system
│   │   │       └── new/[id]/
│   │   │
│   │   ├── worker/           # Worker pages
│   │   │   ├── dashboard/    # Worker dashboard
│   │   │   └── bookings/     # Job requests
│   │   │       └── [id]/     # Job details
│   │   │
│   │   ├── admin/            # Admin pages
│   │   │   ├── dashboard/    # Admin panel
│   │   │   ├── login/        # Admin login
│   │   │   └── register/     # Admin registration
│   │   │
│   │   ├── chat/             # Real-time chat
│   │   │   ├── [id]/         # Specific conversation
│   │   │   └── page.js       # Chat list
│   │   │
│   │   ├── payment/          # Payment pages
│   │   │   ├── callback/     # Payment callback
│   │   │   ├── success/      # Success page
│   │   │   ├── cancel/       # Cancel page
│   │   │   └── page.js       # Checkout page
│   │   │
│   │   ├── profile/[id]/     # Public worker profiles
│   │   ├── recommendations/  # Worker discovery
│   │   ├── book/[id]/        # Booking flow
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration
│   │   ├── forgot-password/  # Password reset request
│   │   ├── reset-password/   # Password reset form
│   │   ├── layout.js         # Root layout
│   │   ├── page.js           # Landing page
│   │   ├── globals.css       # Global styles
│   │   ├── error.js          # Error boundary
│   │   └── not-found.js      # 404 page
│   │
│   ├── lib/
│   │   ├── auth.js           # Authentication service
│   │   ├── axios.js          # HTTP client config
│   │   ├── chatAPI.js        # Chat API service
│   │   ├── constants.js      # App constants (cities, skills)
│   │   ├── i18nProvider.js   # i18n provider
│   │   ├── LanguageContext.js # Language context
│   │   ├── translations.js   # Translation utilities
│   │   └── useChat.js        # Chat custom hook
│   │
│   ├── utils/
│   │   ├── api.js            # API utilities
│   │   └── withAuth.js       # Auth HOC
│   │
│   └── middleware.js         # Route protection middleware
│
├── .env.local                # Environment variables
├── .gitignore
├── eslint.config.mjs         # ESLint configuration
├── jsconfig.json             # JavaScript config
├── next.config.mjs           # Next.js configuration
├── next-i18next.config.js    # i18n configuration
├── package.json              # Dependencies
├── postcss.config.mjs        # PostCSS config
└── README.md
```

---

## 🎨 Design System

### Button Component

```jsx
import Button from '@/app/components/ui/Button';

// Primary button
<Button variant="primary" size="md">
  Click Me
</Button>

// With loading state
<Button variant="primary" loading={true}>
  Processing...
</Button>

// With icon
<Button variant="secondary" icon={IconComponent}>
  Save
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`  
**Sizes**: `sm`, `md`, `lg`

### Card Component

```jsx
import Card, { CardBody, CardHeader, CardFooter } from '@/app/components/ui/Card';

<Card hover>
  <CardHeader>
    <h2>Card Title</h2>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dashboard Layout

```jsx
import DashboardLayout from '@/app/components/ui/DashboardLayout';

export default function CustomerDashboard() {
  return (
    <DashboardLayout role="customer">
      {/* Your dashboard content */}
    </DashboardLayout>
  );
}
```

---

## 🔌 API Integration

### Authentication Endpoints
```javascript
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
POST /api/auth/forgot-password   # Request password reset
POST /api/auth/reset-password    # Reset password with token
```

### User Endpoints
```javascript
GET  /api/users/me               # Get current user profile
PUT  /api/users/me               # Update profile
GET  /api/users/:id              # Get user by ID
POST /api/users/upload-photo     # Upload profile photo
POST /api/users/upload-cnic      # Upload CNIC document
```

### Booking Endpoints
```javascript
GET  /api/bookings/my-bookings   # Get user's bookings
POST /api/bookings               # Create new booking
GET  /api/bookings/:id           # Get booking details
PUT  /api/bookings/:id           # Update booking status
DELETE /api/bookings/:id         # Cancel booking
```

### Payment Endpoints
```javascript
GET  /api/payment/checkout       # Create Stripe checkout session
POST /api/payments/stripe/callback # Handle payment callback
GET  /api/payments/booking/:id   # Get payment for booking
```

### Chat Endpoints
```javascript
GET  /api/conversations          # Get user conversations
POST /api/conversations          # Create conversation
GET  /api/messages/:conversationId # Get messages
POST /api/messages               # Send message
```

### Recommendation Endpoints
```javascript
GET  /api/recommendations         # Get AI-powered worker recommendations
```

### Notification Endpoints
```javascript
GET  /api/notifications          # Get user notifications
PUT  /api/notifications/:id/read # Mark as read
```

### Coding Standards

- Use functional components with hooks
- Follow existing component structure
- Maintain consistent naming conventions
- Add comments for complex logic
- Ensure responsive design
- Test on multiple devices
- Keep components small and focused
- Use TypeScript types where applicable

---

## 📝 License

This project is part of a Final Year Project (FYP) for educational purposes.

---

## 👨💻 Team

**Rozgaar360 Development Team**
- GitHub: [@yourusername](https://github.com/irfanarshad-dev)
- Email: dev.irfan077@gmail.com

---

## 🙏 Acknowledgments

- Next.js team for the incredible framework
- Vercel for seamless deployment
- Tailwind CSS for the utility-first approach
- Stripe for secure payment processing
- Socket.io for real-time capabilities
- All open-source contributors

---

<div align="center">
  <p>Made with ❤️ in Pakistan</p>
  <p>⭐ Star this repo if you find it helpful!</p>
  <p>
    <a href="https://github.com/yourusername/rozgaar360-frontend">View on GitHub</a> •
    <a href="https://rozgaar360.com">Live Demo</a>
  </p>
</div>
