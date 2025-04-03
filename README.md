# AncientMonad

A web application for bridging assets between Sepolia, Base Sepolia, and Monad networks with XP tracking and social features.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Connection
POSTGRES_URL="postgres://your-username:your-password@your-neon-db-host/your-database"

# Twitter OAuth
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

