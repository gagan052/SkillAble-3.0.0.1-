# SkillAble - Freelancing Platform

## Overview
SkillAble is a full-stack freelancing platform that connects clients with skilled freelancers. The platform allows users to browse gigs, place orders, communicate with freelancers, and process payments securely.

## Project Structure
This project consists of two main components:

- **Client**: React-based frontend application
- **API**: Express.js backend server

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- MongoDB database
- Stripe account for payment processing

## Quick Start

### Setting up the API Server
1. Navigate to the API directory:
   ```
   cd api
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGO=your_mongodb_connection_string
   JWT_KEY=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
4. Start the server:
   ```
   npm start
   ```

### Setting up the Client
1. Navigate to the client directory:
   ```
   cd client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   VITE_API_BASE_URL=http://localhost:8800/api/
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Key Features
- User authentication and authorization
- Gig browsing and creation
- Order management
- Messaging system
- Review system
- Secure payment processing with Stripe

## Technologies Used

### Frontend
- React
- React Router
- React Query
- Axios
- SCSS
- Stripe JS

### Backend
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- Stripe API

## Detailed Documentation
For more detailed information about each component:

- [Client Documentation](./client/README.md)
- API Documentation (see API directory)

## License
ISC