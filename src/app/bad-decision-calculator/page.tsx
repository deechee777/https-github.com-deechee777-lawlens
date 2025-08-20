'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calculator, AlertTriangle, Share2, ArrowRight, Home } from 'lucide-react';

interface CalculatorResult {
  riskScore: number;
  explanation: string;
  shareSlug?: string;
  id?: string;
}

interface SharedResult {
  decisionText: string;
  riskScore: number;
  explanation: string;
  createdAt: string;
}

function BadDecisionCalculatorContent() {
  const [decisionText, setDecisionText] = useState('');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [sharedResult, setSharedResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const searchParams = useSearchParams();
  const shareSlug = searchParams.get('share');

  // Load shared result if share slug is present
  useEffect(() => {
    if (shareSlug) {
      loadSharedResult(shareSlug);
    }
  }, [shareSlug]);

  const loadSharedResult = async (slug: string) => {
    try {
      const response = await fetch(`/api/bad-decision?share=${slug}`);
      if (response.ok) {
        const data = await response.json();
        setSharedResult(data);
      }
    } catch (error) {
      console.error('Error loading shared result:', error);
    }
  };

  const calculateRisk = async () => {
    if (!decisionText.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/bad-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionText: decisionText.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to analyze decision');
      }
    } catch (error) {
      console.error('Error analyzing decision:', error);
      alert('Failed to analyze decision. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result?.shareSlug) return;
    
    const shareUrl = `${window.location.origin}/bad-decision-calculator?share=${result.shareSlug}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      prompt('Copy this link to share your result:', shareUrl);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return 'text-green-600';
    if (score <= 40) return 'text-yellow-600';
    if (score <= 60) return 'text-orange-600';
    if (score <= 80) return 'text-red-600';
    return 'text-red-800';
  };

  const getRiskBgColor = (score: number) => {
    if (score <= 20) return 'bg-green-50 border-green-200';
    if (score <= 40) return 'bg-yellow-50 border-yellow-200';
    if (score <= 60) return 'bg-orange-50 border-orange-200';
    if (score <= 80) return 'bg-red-50 border-red-200';
    return 'bg-red-100 border-red-300';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 20) return 'Not Terrible';
    if (score <= 40) return 'Questionable';
    if (score <= 60) return 'Bad Decision';
    if (score <= 80) return 'Oh Honey, No';
    return 'Darwin Award Territory';
  };

  // If viewing a shared result
  if (sharedResult) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto border-b border-gray-200">
          <a href="/" className="text-2xl font-bold text-black">LawLens</a>
          <a href="/bad-decision-calculator" className="text-gray-600 hover:text-black transition-colors">
            Try Calculator
          </a>
        </nav>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <Calculator className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-black mb-2">Shared Bad Decision Result</h1>
            <p className="text-gray-600">Someone wanted you to see their questionable life choice</p>
          </div>

          {/* Shared Result */}
          <div className={`rounded-lg border-2 p-8 text-center ${getRiskBgColor(sharedResult.riskScore)}`}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">The Decision:</h3>
              <p className="text-gray-700 italic">"{sharedResult.decisionText}"</p>
            </div>
            
            <div className="mb-6">
              <div className={`text-6xl font-bold ${getRiskColor(sharedResult.riskScore)} mb-2`}>
                {sharedResult.riskScore}
              </div>
              <div className={`text-xl font-semibold ${getRiskColor(sharedResult.riskScore)} mb-4`}>
                {getRiskLabel(sharedResult.riskScore)}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-6 mb-6">
              <p className="text-gray-800 leading-relaxed">{sharedResult.explanation}</p>
            </div>
            
            <p className="text-gray-500 text-sm">
              Calculated on {new Date(sharedResult.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-8 text-center space-y-4">
            <a
              href="/bad-decision-calculator"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <Calculator className="h-5 w-5" />
              Try Your Own Bad Decision
            </a>
            
            <div>
              <a
                href="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <Home className="h-4 w-4" />
                Back to LawLens
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto border-b border-gray-200">
        <a href="/" className="text-2xl font-bold text-black">LawLens</a>
        <div className="space-x-6">
          <a href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</a>
          <a href="/about" className="text-gray-600 hover:text-black transition-colors">About</a>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Calculator className="h-12 w-12 text-red-600" />
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">Bad Decision Calculator</h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            Wondering if your brilliant idea is actually terrible? Our AI will tell you exactly how bad it is.
          </p>
        </div>

        {/* Calculator Form */}
        {!result && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="mb-6">
              <label htmlFor="decision" className="block text-lg font-semibold text-black mb-3">
                Describe your decision or plan:
              </label>
              <textarea
                id="decision"
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                placeholder="e.g., I'm thinking about quitting my job to become a professional fortune cookie writer..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition-colors resize-none"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-2">
                {decisionText.length}/500 characters (minimum 10)
              </p>
            </div>
            
            <button
              onClick={calculateRisk}
              disabled={loading || decisionText.trim().length < 10}
              className="w-full bg-red-600 text-white px-6 py-4 text-lg font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Calculating Risk...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5" />
                  Calculate Risk Level
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`rounded-lg border-2 p-8 text-center ${getRiskBgColor(result.riskScore)}`}>
            <h2 className="text-2xl font-bold text-black mb-6">Your Bad Decision Score</h2>
            
            <div className="mb-6">
              <div className={`text-6xl font-bold ${getRiskColor(result.riskScore)} mb-2`}>
                {result.riskScore}
              </div>
              <div className={`text-xl font-semibold ${getRiskColor(result.riskScore)} mb-4`}>
                {getRiskLabel(result.riskScore)}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-6 mb-6">
              <p className="text-gray-800 leading-relaxed">{result.explanation}</p>
            </div>
            
            {/* Call to Action */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Want to know if this is actually legal?</h3>
              <p className="text-blue-700 mb-4">
                Our legal experts can research the real laws and regulations around your decision.
              </p>
              <a
                href={`/search?q=${encodeURIComponent(`Is it legal to ${decisionText.toLowerCase()}`)}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                LawLens Legal Lookup ($1) <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            
            {/* Share and Reset */}
            <div className="flex gap-4 justify-center">
              {result.shareSlug && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  {copied ? 'Link Copied!' : 'Share Result'}
                </button>
              )}
              
              <button
                onClick={() => {
                  setResult(null);
                  setDecisionText('');
                }}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Another Decision
              </button>
            </div>
          </div>
        )}

        {/* Example Decisions */}
        {!result && (
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-black mb-4">Need inspiration? Try these:</h3>
            <div className="space-y-2">
              {[
                "I want to quit my job and become a professional video game streamer",
                "I'm thinking about getting a face tattoo of my ex's name",
                "I want to invest my entire savings in cryptocurrency based on a TikTok video",
                "I'm planning to move in with someone I met on the internet yesterday"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setDecisionText(example)}
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 LawLens. All rights reserved. | Making bad decisions slightly less bad since today.</p>
        </div>
      </footer>
    </div>
  );
}

export default function BadDecisionCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading the bad decision analyzer...</p>
        </div>
      </div>
    }>
      <BadDecisionCalculatorContent />
    </Suspense>
  );
}