import { withAuth } from "next-auth/middleware"

// Middleware to protect routes
export default withAuth(
  function middleware(req) {
    // You can add additional logic here if needed
    // For example, role-based access control
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if the user has a valid token
        return !!token
      },
    },
  }
)

// Specify which routes should be protected
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/gmail-accounts/:path*',
    '/api/openai/:path*',
    // Add other protected routes here
  ]
} 