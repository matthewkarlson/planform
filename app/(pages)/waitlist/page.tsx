'use client'

import { useState } from 'react'
import { joinWaitlist } from '@/lib/actions/waitlist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Check, AlignLeft, Sun } from 'lucide-react'
import { track } from '@vercel/analytics';

export default function WaitlistPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setMessage(null)
 
        track('Joined Waitlist');
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
                            <Check className="text-primary h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Early Access</h3>
                        <p className="text-gray-500 text-center">Be the first to try our platform and get access to exclusive features.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <AlignLeft className="text-primary h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Special Offers</h3>
                        <p className="text-gray-500 text-center">Get exclusive discounts and promotions when we launch.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sun className="text-primary h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Priority Support</h3>
                        <p className="text-gray-500 text-center">Get dedicated support and onboarding assistance.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}