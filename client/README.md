# Freelancing Project Client

## Overview
This is the client-side application for the SkillAble freelancing platform, built with React and Vite. The application allows users to browse gigs, place orders, communicate with freelancers, and manage payments through Stripe.

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- API server running (see API setup section below)

## Installation

### Client Setup
1. Clone the repository
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

### Client Dependencies

#### Core Dependencies
- **React (^18.2.0)**: UI library
- **React DOM (^18.2.0)**: React rendering for web
- **React Router DOM (^6.8.0)**: Routing library

#### Data Management & API
- **Axios (^1.8.4)**: HTTP client for API requests
- **@tanstack/react-query (^5.69.0)**: Data fetching and state management

#### UI Components & Styling
- **Sass (^1.85.1)**: CSS preprocessor
- **Infinite React Carousel (^1.2.11)**: Carousel component
- **React Slick (^0.30.3)**: Carousel/slider component
- **Slick Carousel (^1.8.1)**: Dependency for React Slick
- **Moment (^2.30.1)**: Date formatting library

#### Payment Processing
- **@stripe/react-stripe-js (^3.5.0)**: React components for Stripe
- **@stripe/stripe-js (^6.1.0)**: Stripe JavaScript library

#### Development Dependencies
- **Vite (^4.0.0)**: Build tool and dev server
- **@vitejs/plugin-react (^3.0.0)**: React plugin for Vite
- **ESLint (^8.33.0)**: Code linting
- **ESLint Plugin React (^7.32.2)**: React specific linting
- **@types/react (^18.0.26)**: TypeScript definitions for React
- **@types/react-dom (^18.0.9)**: TypeScript definitions for React DOM

## Environment Variables Setup

This project uses environment variables to manage configuration settings. Follow these steps to set up your environment:

1. Create a `.env` file in the client directory (a template is provided in `.env.example`)
2. Add the following variables to your `.env` file:

```
# API Configuration
VITE_API_BASE_URL=http://localhost:8800/api/

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
```

**Note:** Never commit your `.env` file to version control as it may contain sensitive information. The `.env.example` file is provided as a template.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally

## API Server Setup

### API Dependencies
- **Express (^4.21.2)**: Web framework
- **Mongoose (^8.12.1)**: MongoDB ODM
- **Bcrypt (^5.1.1)**: Password hashing
- **JSON Web Token (^9.0.2)**: Authentication
- **Cookie Parser (^1.4.7)**: Parse cookies
- **CORS (^2.8.5)**: Cross-origin resource sharing
- **Dotenv (^16.4.7)**: Environment variable management
- **Stripe (^17.7.0)**: Payment processing
- **Nodemon (^3.1.9)**: Development server with auto-reload

### API Environment Variables
The API server requires the following environment variables in a `.env` file in the api directory:

```
# Database
MONGO=your_mongodb_connection_string

# JWT Authentication
JWT_KEY=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Starting the API Server
Navigate to the api directory and run:
```
npm install
npm start
```

## Project Structure

### Client Structure
- `/public` - Static assets
- `/src` - Source code
  - `/components` - Reusable UI components
  - `/pages` - Page components
  - `/reducers` - State management
  - `/utils` - Utility functions

### API Structure
- `/controllers` - Request handlers
- `/models` - Database models
- `/routes` - API endpoints
- `/middleware` - Custom middleware
- `/utils` - Utility functions

## Technologies Used

- React - Frontend library
- Vite - Build tool and development server
- Express - Backend framework
- MongoDB - Database
- Mongoose - MongoDB object modeling
- Stripe - Payment processing
- React Query - Data fetching and caching
- SCSS - Styling
- JWT - Authentication