import { hash } from 'bcrypt';
import { signIn, signOut } from 'next-auth/react';
import { prisma } from './prisma';

const SALT_ROUNDS = 10;

export interface UserCredentials {
	email: string;
	password: string;
}

export interface UserRegistration extends UserCredentials {
	name?: string;
}

export async function registerUser(userData: UserRegistration) {
	try {
		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: userData.email },
		});

		if (existingUser) {
			return { error: 'User already exists' };
		}

		// Hash password
		const hashedPassword = await hash(userData.password, SALT_ROUNDS);

		// Create user
		const user = await prisma.user.create({
			data: {
				email: userData.email,
				password: hashedPassword,
				name: userData.name,
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		return { success: true, user };
	} catch (error) {
		console.error('Registration error:', error);
		return { error: 'Registration failed' };
	}
}

export async function loginUser(credentials: UserCredentials) {
	try {
		const result = await signIn('credentials', {
			email: credentials.email,
			password: credentials.password,
			redirect: false,
		});

		if (result?.error) {
			return { error: result.error };
		}

		return { success: true };
	} catch (error) {
		console.error('Login error:', error);
		return { error: 'Login failed' };
	}
}

export async function logoutUser() {
	try {
		await signOut({ redirect: false });
		return { success: true };
	} catch (error) {
		console.error('Logout error:', error);
		return { error: 'Logout failed' };
	}
}

// Utility function to get user by ID (for server-side use)
export async function getUserById(id: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return user;
	} catch (error) {
		console.error('Error fetching user:', error);
		return null;
	}
}

// Utility function to update user profile
export async function updateUserProfile(id: string, data: { name?: string; email?: string }) {
	try {
		const user = await prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				email: true,
				name: true,
				updatedAt: true,
			},
		});

		return { success: true, user };
	} catch (error) {
		console.error('Error updating user profile:', error);
		return { error: 'Failed to update profile' };
	}
}
