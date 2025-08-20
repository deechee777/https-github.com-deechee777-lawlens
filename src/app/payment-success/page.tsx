'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, Mail } from 'lucide-react';

function PaymentSuccessContent() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = searchParams.get('session_id');
    setSessionId(session);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto border-b border-gray-200">
        <a href="/" className="text-2xl font-bold text-black">LawLens</a>
        <div className="space-x-6">
          <a href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</a>
          <a href="/about" className="text-gray-600 hover:text-black transition-colors">About</a>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-black mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600">
            Thank you for your payment. We've received your legal question and our team will begin researching it right away.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-black mb-6">What happens next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 text-left">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600 mt-1" />
              </div>
              <div>
                <h3 className="font-medium text-black">Research Phase (24-48 hours)</h3>
                <p className="text-gray-600 text-sm">
                  Our legal research team will investigate your question using official government sources and legal databases.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 text-left">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-green-600 mt-1" />
              </div>
              <div>
                <h3 className="font-medium text-black">Answer Delivery</h3>
                <p className="text-gray-600 text-sm">
                  You'll receive a detailed, plain-English answer via email along with links to the original legal sources.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-8">
          {sessionId && (
            <p>Payment ID: {sessionId}</p>
          )}
          <p>Keep this page bookmarked for your records.</p>
        </div>

        <div className="space-y-4">
          <a
            href="/"
            className="inline-block bg-black text-white px-8 py-3 font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ask Another Question
          </a>
          
          <div>
            <p className="text-gray-600 text-sm mb-2">Need more frequent legal research?</p>
            <a
              href="/pricing"
              className="inline-block text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Check out our unlimited subscription plan →
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-left max-w-lg mx-auto">
          <h3 className="font-semibold text-black mb-3">Important Notes:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• This service provides legal information, not legal advice</li>
            <li>• Laws change frequently - always verify current status for critical decisions</li>
            <li>• For legal advice specific to your situation, consult a qualified attorney</li>
            <li>• We'll add your question to our public database once answered (unless requested otherwise)</li>
          </ul>
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
    </div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}