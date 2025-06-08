'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface AuthUser {
	id: string;
	email: string;
	name: string | null;
}

export function useAuth() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const user: AuthUser | null = session?.user
		? {
				id: session.user.id,
				email: session.user.email!,
				name: session.user.name || null,
			}
		: null;

	const login = useCallback(async (credentials: { email: string; password: string }) => {
		try {
			const result = await signIn('credentials', {
				email: credentials.email,
				password: credentials.password,
				redirect: false,
			});

			if (result?.error) {
				throw new Error(result.error);
			}

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Login failed',
			};
		}
	}, []);

	const loginWithGoogle = useCallback(async () => {
		try {
			await signIn('google', { callbackUrl: '/dashboard' });
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Google login failed',
			};
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			await signOut({ redirect: false });
			router.push('/');
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Logout failed',
			};
		}
	}, [router]);

	const isAuthenticated = status === 'authenticated';
	const isLoading = status === 'loading';

	return {
		user,
		isAuthenticated,
		isLoading,
		login,
		loginWithGoogle,
		logout,
		session,
	};
}
