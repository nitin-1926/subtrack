import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcrypt';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error('Invalid credentials');
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});

				if (!user) {
					throw new Error('Invalid credentials');
				}

				const isValidPassword = await compare(credentials.password, user.password);

				if (!isValidPassword) {
					throw new Error('Invalid credentials');
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			async profile(profile) {
				// Handle Google OAuth user creation/update
				let user = await prisma.user.findUnique({
					where: { email: profile.email },
				});

				if (!user) {
					// Create new user if they don't exist
					user = await prisma.user.create({
						data: {
							email: profile.email,
							name: profile.name,
							password: '', // Google users don't have passwords
						},
					});
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			},
		}),
	],
	pages: {
		signIn: '/login',
	},
	session: {
		strategy: 'jwt',
		maxAge: 24 * 60 * 60, // 24 hours
	},
	jwt: {
		maxAge: 24 * 60 * 60, // 24 hours
	},
	secret: process.env.NEXTAUTH_SECRET,
	debug: process.env.NODE_ENV === 'development',
	callbacks: {
		async jwt({ token, user, account }) {
			// Initial sign in
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
			}

			// Add account info for OAuth providers
			if (account) {
				token.provider = account.provider;
			}

			return token;
		},
		async session({ session, token }) {
			// Send properties to the client
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
			}
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
