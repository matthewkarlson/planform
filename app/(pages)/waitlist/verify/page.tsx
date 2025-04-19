'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyWaitlistEmail } from '@/lib/actions/waitlist'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function VerifyContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    
    const [status, setStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null)
    
    const [isVerifying, setIsVerifying] = useState(true)
    
    useEffect(() => {
        async function verifyToken() {
            if (!token) {
                setStatus({
                    success: false,
                    message: 'Invalid verification link',
                })
                setIsVerifying(false)
                return
            }
            
            try {
                const result = await verifyWaitlistEmail(token)
                setStatus(result)
            } catch (error) {
                setStatus({
                    success: false,
                    message: 'Something went wrong. Please try again later.',
                })
            } finally {
                setIsVerifying(false)
            }
        }
        
        verifyToken()
    }, [token])
    
    return (
        <div className="flex flex-col items-center space-y-6 text-center">
            {isVerifying ? (
                <>
                    <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <h1 className="text-2xl font-bold">Verifying your email...</h1>
                    <p className="text-gray-500">Please wait while we verify your email address.</p>
                </>
            ) : status?.success ? (
                <>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
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
                            className="text-green-600"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">Email Verified!</h1>
                    <p className="text-gray-500">{status.message}</p>
                    <p className="text-gray-500">We'll notify you when we launch.</p>
                    <Link href="/" passHref>
                        <Button>Return to Home</Button>
                    </Link>
                </>
            ) : (
                <>
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
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
                            className="text-red-600"
                        >
                            <path d="M18 6L6 18" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">Verification Failed</h1>
                    <p className="text-gray-500">{status?.message}</p>
                    <Link href="/waitlist" passHref>
                        <Button>Try Again</Button>
                    </Link>
                </>
            )}
        </div>
    )
}

export default function VerifyWaitlistPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 md:py-24 flex items-center justify-center">
            <div className="container max-w-lg px-4 md:px-6 mx-auto">
                <Card className="p-8 shadow-lg">
                    <Suspense fallback={
                        <div className="flex flex-col items-center space-y-6 text-center">
                            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                            <h1 className="text-2xl font-bold">Loading...</h1>
                        </div>
                    }>
                        <VerifyContent />
                    </Suspense>
                </Card>
            </div>
        </div>
    )
} 