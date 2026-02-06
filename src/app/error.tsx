'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Uncaught Application Error:', error);
    }, [error]);

    const isProduction = process.env.NODE_ENV === 'production';

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-xl">
                        <ShieldAlert className="h-12 w-12" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter uppercase font-heading italic">
                        Systems <span className="text-primary">Failure</span>
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        We encountered an unexpected error while processing your request.
                        Our automated recovery systems have been notified.
                    </p>
                </div>

                {/* Technical details shown only in development */}
                {!isProduction && (
                    <div className="p-4 bg-muted rounded-xl border border-border text-left overflow-hidden">
                        <p className="text-xs font-black uppercase opacity-40 mb-2">Technical Debug Info</p>
                        <p className="text-sm font-mono text-destructive break-all">
                            {error.message || 'Unknown error'}
                        </p>
                        {error.digest && (
                            <p className="text-[10px] font-mono opacity-50 mt-2">Digest: {error.digest}</p>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        onClick={() => reset()}
                        className="flex-1 h-12 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Try Recovery
                    </Button>
                    <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full h-12 gap-2 border-primary/20 hover:bg-primary/5">
                            <Home className="h-4 w-4" />
                            Return Home
                        </Button>
                    </Link>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 pt-8">
                    Rhine Route Security Protocols Active
                </p>
            </div>
        </div>
    );
}
