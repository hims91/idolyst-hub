
# Full-Stack Founder Platform

A comprehensive platform for founders to connect, share ideas, find funding, and grow their startups.

## Features

- User authentication and profiles
- Community discussions and member directory
- Crowdfunding campaigns
- Events management
- Rewards and achievements
- Admin dashboard

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI component library
- Framer Motion for animations
- React Query for data fetching
- React Router for navigation

### Backend
- Node.js with Express
- PostgreSQL database
- Authentication with JWT
- AWS S3 for file storage
- SendGrid for emails (optional)
- Stripe for payments (optional)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Package manager (npm, yarn, or pnpm)
- PostgreSQL database service

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/founder-platform.git
   cd founder-platform
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory based on the `.env.example` file.

4. Initialize the database
   ```bash
   psql -U your_username -d postgres -f database-schema.sql
   ```

5. Start the backend server
   ```bash
   npm run server
   ```

6. Start the frontend development server
   ```bash
   npm run dev
   ```

## Database Setup

1. Create a PostgreSQL database
   ```bash
   createdb founder_platform
   ```

2. Create the tables using the provided schema
   ```bash
   psql -d founder_platform -f database-schema.sql
   ```

## Backend API Setup

The backend API is built with Express and includes the following features:

- Authentication with JWT (registration, login, password reset)
- User profiles and follow functionality
- Posts and comments
- Events management
- Crowdfunding campaigns
- Admin features

### Running the Backend

```bash
npm run server
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

#### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/avatar` - Update profile picture
- `POST /api/users/follow/:id` - Follow a user
- `POST /api/users/unfollow/:id` - Unfollow a user
- `GET /api/users/followers` - Get user followers
- `GET /api/users/following` - Get users being followed

#### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get a single post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/like` - Like a post
- `POST /api/posts/:id/unlike` - Unlike a post
- `POST /api/posts/:id/comments` - Add a comment
- `GET /api/posts/:id/comments` - Get post comments

#### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get a single event
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event
- `POST /api/events/:id/attend` - Register to attend an event
- `POST /api/events/:id/cancel` - Cancel attendance

#### Crowdfunding
- `GET /api/crowdfunding` - Get all campaigns
- `GET /api/crowdfunding/:id` - Get a single campaign
- `POST /api/crowdfunding` - Create a new campaign
- `PUT /api/crowdfunding/:id` - Update a campaign
- `POST /api/crowdfunding/:id/back` - Back a campaign
- `GET /api/crowdfunding/:id/backers` - Get campaign backers

#### Admin
- `GET /api/admin/stats` - Get admin dashboard stats
- `GET /api/admin/users` - Manage users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/posts` - Manage posts
- `PUT /api/admin/posts/:id/status` - Update post status

## File Storage

The platform uses AWS S3 for file storage. To set up:

1. Create an AWS account if you don't have one
2. Create an S3 bucket
3. Create an IAM user with S3 access
4. Add the AWS credentials to your `.env` file

## Deployment

### Frontend
Deploy the frontend to a static hosting service like Vercel, Netlify, or AWS S3.

### Backend
Deploy the backend to a service like Railway, Heroku, AWS, or a VPS provider.

### Database
Use a managed database service like Railway PostgreSQL, AWS RDS, or similar.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
