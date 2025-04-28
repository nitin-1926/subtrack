'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: FormValues) => {
		setIsLoading(true);

		try {
			const result = await signIn('credentials', {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				toast({
					variant: 'destructive',
					title: 'Login failed',
					description: result.error,
				});
			} else {
				toast({
					title: 'Login successful',
					description: 'You have been logged in successfully',
				});
				router.push('/dashboard');
				router.refresh();
			}
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Login failed',
				description: 'An unexpected error occurred. Please try again.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="grid gap-6">
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
							autoComplete="email"
							disabled={isLoading}
							{...register('email')}
						/>
						{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							autoComplete="current-password"
							disabled={isLoading}
							{...register('password')}
						/>
						{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
					</div>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? 'Signing in...' : 'Sign In'}
					</Button>
				</div>
			</form>
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
				</div>
			</div>
			<Button
				variant="outline"
				type="button"
				disabled={isLoading}
				onClick={() => signIn('google', { callbackUrl: '/' })}
			>
				Google
			</Button>
			<p className="text-center text-sm text-muted-foreground">
				Don&apos;t have an account?{' '}
				<Link href="/register" className="underline underline-offset-4 hover:text-primary">
					Create an account
				</Link>
			</p>
		</div>
	);
}
