import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from './api/auth/[...nextauth]/route';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Home() {
	const session = await getServerSession(authOptions);

	if (session) {
		redirect('/dashboard');
	}

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-40 border-b bg-background">
				<div className="container flex h-16 items-center justify-between py-4">
					<div className="flex items-center gap-6 md:gap-10">
						<Link href="/" className="flex items-center space-x-2">
							<span className="text-2xl font-bold">SubTrack</span>
						</Link>
					</div>
					<nav className="flex items-center gap-4">
						<Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
							Login
						</Link>
						<Button asChild>
							<Link href="/register">Sign Up</Link>
						</Button>
					</nav>
				</div>
			</header>
			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center gap-4 text-center">
							<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
								Track Your Email Subscriptions Effortlessly
							</h1>
							<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
								Gain insights into your spending on subscription services and take control of your
								finances.
							</p>
							<div className="flex flex-col gap-2 min-[400px]:flex-row">
								<Button asChild size="lg">
									<Link href="/register">Get Started</Link>
								</Button>
								<Button variant="outline" asChild size="lg">
									<Link href="/login">Sign In</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
					<div className="container px-4 md:px-6">
						<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
							<div className="flex flex-col items-center gap-2 text-center">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-6 w-6"
									>
										<path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"></path>
									</svg>
								</div>
								<h3 className="text-xl font-bold">Sync Email Accounts</h3>
								<p className="text-gray-500 dark:text-gray-400">
									Connect your email accounts to automatically track your subscriptions.
								</p>
							</div>
							<div className="flex flex-col items-center gap-2 text-center">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-6 w-6"
									>
										<path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11"></path>
										<path d="M8 8l4 0"></path>
										<path d="M8 12l4 0"></path>
										<path d="M8 16l4 0"></path>
									</svg>
								</div>
								<h3 className="text-xl font-bold">Track Expenses</h3>
								<p className="text-gray-500 dark:text-gray-400">
									Monitor how much you're spending on subscription services each month.
								</p>
							</div>
							<div className="flex flex-col items-center gap-2 text-center">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-6 w-6"
									>
										<path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
										<path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10"></path>
										<path d="M10 12l4 0"></path>
									</svg>
								</div>
								<h3 className="text-xl font-bold">Manage Subscriptions</h3>
								<p className="text-gray-500 dark:text-gray-400">
									Get insightful reports and recommendations to optimize your subscriptions.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="border-t py-6 md:py-0">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<p className="text-center text-sm leading-loose text-gray-500 md:text-left dark:text-gray-400">
						© 2025 SubTrack. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
