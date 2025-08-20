'use client';

import { Check, CreditCard, Zap } from 'lucide-react';

export default function PricingPage() {
  const handleOneTimeCheckout = () => {
    // This will be implemented with Stripe
    window.location.href = process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_CHECKOUT_URL || '#';
  };

  const handleSubscriptionCheckout = () => {
    // This will be implemented with Stripe
    window.location.href = process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_CHECKOUT_URL || '#';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto border-b border-gray-200">
        <a href="/" className="text-2xl font-bold text-black">LawLens</a>
        <div className="space-x-6">
          <a href="/bad-decision-calculator" className="text-gray-600 hover:text-black transition-colors">Bad Decision Calculator</a>
          <a href="/pricing" className="text-gray-600 hover:text-black transition-colors font-medium">Pricing</a>
          <a href="/about" className="text-gray-600 hover:text-black transition-colors">About</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for your legal research needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pay Per Question */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold text-black">Pay Per Question</h3>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-black">$1</span>
                <span className="text-gray-600">per question</span>
              </div>
              <p className="text-gray-600 mt-2">Perfect for occasional legal questions</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Researched answer within 24-48 hours</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Plain-English explanation</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Source links to original laws</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Email delivery</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">No subscription required</span>
              </li>
            </ul>

            <button
              onClick={handleOneTimeCheckout}
              className="w-full bg-black text-white px-6 py-4 text-lg font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started - $1
            </button>
          </div>

          {/* Unlimited Subscription */}
          <div className="bg-white border-2 border-black rounded-xl p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-black rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black">Unlimited Access</h3>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-black">$20</span>
                <span className="text-gray-600">per month</span>
              </div>
              <p className="text-gray-600 mt-2">Best for frequent researchers and professionals</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Unlimited questions per month</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Priority research (12-24 hours)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Access to growing database</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Email + dashboard access</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Cancel anytime</span>
              </li>
            </ul>

            <button
              onClick={handleSubscriptionCheckout}
              className="w-full bg-black text-white px-6 py-4 text-lg font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Subscribe for $20/month
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-black mb-3">How quickly will I get my answer?</h3>
              <p className="text-gray-600">
                One-time questions typically get answered within 24-48 hours. Subscribers get priority and receive answers in 12-24 hours.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-3">What types of laws do you cover?</h3>
              <p className="text-gray-600">
                We cover local, state, and municipal laws across the United States. This includes zoning laws, business regulations, 
                unusual local ordinances, parking rules, and other location-specific legal questions.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-3">Is this legal advice?</h3>
              <p className="text-gray-600">
                No, we provide information about laws and regulations, not legal advice. For legal advice specific to your situation, 
                please consult with a qualified attorney.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-3">Can I cancel my subscription?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 LawLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}