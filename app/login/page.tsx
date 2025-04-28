import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import LoginForm from '@/components/auth/login-form';
import Link from 'next/link';

export default async function LoginPage() {
	const session = await getServerSession(authOptions);

	// Redirect to dashboard if already authenticated
	if (session) {
		redirect('/dashboard');
	}

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center px-4 py-8">
			<div className="mb-8">
				<Link href="/" className="text-2xl font-bold text-primary">
					SubTrack
				</Link>
			</div>
			<div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
					<p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}
