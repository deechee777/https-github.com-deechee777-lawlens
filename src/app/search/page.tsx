'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ExternalLink, CreditCard } from 'lucide-react';

interface LawAnswer {
  id: string;
  question: string;
  answer: string;
  source_url: string;
  is_public: boolean;
}

function SearchPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [answer, setAnswer] = useState<LawAnswer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [email, setEmail] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      searchForAnswer(query);
    }
  }, [query]);

  const searchForAnswer = async (question: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(question)}`);
      const data = await response.json();
      
      if (data.answer) {
        setAnswer(data.answer);
        setShowPaymentForm(false);
      } else {
        setAnswer(null);
        setShowPaymentForm(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setShowPaymentForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setPaymentProcessing(true);
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          question: query
        })
      });
      
      const { checkout_url } = await response.json();
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto border-b border-gray-200">
        <a href="/" className="text-2xl font-bold text-black">LawLens</a>
        <div className="space-x-6">
          <a href="/bad-decision-calculator" className="text-gray-600 hover:text-black transition-colors">Bad Decision Calculator</a>
          <a href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</a>
          <a href="/about" className="text-gray-600 hover:text-black transition-colors">About</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <form onSubmit={handleNewSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask about any local law or regulation..."
              className="w-full px-12 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching our database...</p>
          </div>
        ) : answer ? (
          /* Answer Found */
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-black mb-4">Answer Found!</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Question:</h3>
              <p className="text-gray-700 mb-4">"{query}"</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Answer:</h3>
              <div className="text-gray-700 leading-relaxed">
                {answer.answer_text?.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                )) || <p>No answer available</p>}
              </div>
            </div>

            {answer.source_url && (
              <div className="border-t border-gray-200 pt-4">
                <a 
                  href={answer.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Law Source
                </a>
              </div>
            )}
          </div>
        ) : showPaymentForm ? (
          /* Payment Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
              <h2 className="text-2xl font-bold text-black mb-4">Question Not in Our Database</h2>
              <p className="text-gray-600 mb-6">
                We don't have an answer for "{query}" yet, but we can research it for you!
              </p>
              
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We'll email you the answer once our legal team researches it
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full bg-black text-white px-6 py-4 text-lg font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  {paymentProcessing ? 'Processing...' : 'Pay $1 & Get Answer'}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Need unlimited lookups?</p>
                <a
                  href="/pricing"
                  className="inline-block bg-gray-100 text-black px-6 py-3 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Subscribe for $20/month
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
    </div>}>
      <SearchPageContent />
    </Suspense>
  );
}