'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === 'authenticated') {
			router.push('/dashboard');
		} else if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
		</div>
	);
}
