'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleExampleClick = (question: string) => {
    router.push(`/search?q=${encodeURIComponent(question)}`);
  };

  const exampleQuestions = [
    "Is it illegal to carry an ice cream cone in your back pocket in Alabama?",
    "Can I legally own a pet monkey in New York City?",
    "What are the weird parking laws in San Francisco?"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-black">LawLens</h1>
        <div className="space-x-6">
          <a href="/bad-decision-calculator" className="text-gray-600 hover:text-black transition-colors">Bad Decision Calculator</a>
          <a href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</a>
          <a href="/about" className="text-gray-600 hover:text-black transition-colors">About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-black mb-6">
          Get Plain-English Answers to Weird Local Laws
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Stop wondering about obscure legal questions. Get clear, researched answers to local laws and regulations.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
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

        {/* Example Questions */}
        <div className="mb-12">
          <p className="text-gray-600 mb-6">Try these popular questions:</p>
          <div className="space-y-3">
            {exampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(question)}
                className="block w-full max-w-2xl mx-auto px-6 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
              >
                "{question}"
              </button>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="pt-8 space-y-6">
          <div>
            <button
              onClick={() => router.push('/bad-decision-calculator')}
              className="bg-red-600 text-white px-8 py-4 text-xl font-bold rounded-lg hover:bg-red-700 transition-colors mb-4"
            >
              🎯 Try the Bad Decision Calculator
            </button>
            <p className="text-gray-500 text-sm">Find out how bad your idea really is (spoiler: probably very bad)</p>
          </div>
          
          <div>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-black text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ask Your Question for $1
            </button>
            <p className="text-gray-500 mt-3">Or subscribe for unlimited access at $20/month</p>
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