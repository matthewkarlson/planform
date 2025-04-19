'use client'

import { useState } from 'react'
import { joinWaitlist } from '@/lib/actions/waitlist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function WaitlistPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setMessage(null)

        const formData = new FormData()
        formData.append('email', email)

        try {
            const result = await joinWaitlist(formData)
            
            if (result.success) {
                setMessage({ type: 'success', text: result.message })
                setEmail('')
            } else {
                setMessage({ type: 'error', text: result.message })
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: 'Something went wrong. Please try again later.' 
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 md:py-24 flex justify-center">
            <div className="container max-w-6xl px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Waitlist</h1>
                        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                            Be the first to know when we launch. Sign up to get early access to our platform.
                        </p>
                    </div>
                </div>
                
                <div className="mx-auto max-w-md">
                    <Card className="p-6 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                            </Button>
                            
                            {message && (
                                <div className={`p-3 rounded-md ${
                                    message.type === 'success' 
                                        ? 'bg-green-50 text-green-700' 
                                        : 'bg-red-50 text-red-700'
                                }`}>
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </Card>
                </div>
                
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
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
                                className="text-primary"
                            >
                                <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold">Early Access</h3>
                        <p className="text-gray-500 text-center">Be the first to try our platform and get access to exclusive features.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
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
                                className="text-primary"
                            >
                                <path d="M17 6.1H3M21 12.1H3M14 18.1H3" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold">Special Offers</h3>
                        <p className="text-gray-500 text-center">Get exclusive discounts and promotions when we launch.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
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
                                className="text-primary"
                            >
                                <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                                <path d="M12 2v2" />
                                <path d="M12 20v2" />
                                <path d="m4.93 4.93 1.41 1.41" />
                                <path d="m17.66 17.66 1.41 1.41" />
                                <path d="M2 12h2" />
                                <path d="M20 12h2" />
                                <path d="m6.34 17.66-1.41 1.41" />
                                <path d="m19.07 4.93-1.41 1.41" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold">Priority Support</h3>
                        <p className="text-gray-500 text-center">Get dedicated support and onboarding assistance.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}