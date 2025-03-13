
# Idolyst - Full Stack Startup Platform

Idolyst is a comprehensive platform that integrates social media functionalities with gamification elements, modern animations, and a Progressive Web App (PWA) experience for the startup ecosystem.

## Features

- User Profiles & Authentication
- Home Feed & Content Sharing
- Events Module
- Crowdfunding Section
- Gamification Elements
- Mentor Section (Coming Soon)
- Progressive Web App (PWA) Features (Coming Soon)

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Framer Motion for animations
- React Query for data fetching
- React Router for navigation

### Backend
- Node.js with Express
- PostgreSQL database
- JWT for authentication
- AWS S3 for file storage
- Stripe for payment processing (Coming Soon)

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- AWS account (for S3 file storage)
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```
   git clone https://github.com/your-username/idolyst.git
   cd idolyst
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env` and update the values:
   ```
   cp .env.example .env
   ```

4. **Set up the database**
   
   Create a PostgreSQL database:
   ```
   psql -U postgres
   CREATE DATABASE idolyst;
   \q
   ```

   Run the database schema:
   ```
   psql -U postgres -d idolyst -f database-schema.sql
   ```

5. **Start the development server**
   
   Start the backend server:
   ```
   npm run server
   ```

   In a new terminal, start the frontend:
   ```
   npm run dev
   ```

6. **Access the application**
   
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
idolyst/
├── src/
│   ├── components/         # React components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── server/             # Backend server code
│   │   ├── controllers/    # Request handlers
│   │   ├── db/             # Database connection and models
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── services/           # Frontend services
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── database-schema.sql     # Database schema
├── .env.example            # Example environment variables
└── README.md               # Project documentation
```

## API Documentation

The API documentation is available at `/api-docs` when running the server locally.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
