import { Scale, Search, Clock, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto border-b border-gray-200">
        <a href="/" className="text-2xl font-bold text-black">LawLens</a>
        <div className="space-x-6">
          <a href="/bad-decision-calculator" className="text-gray-600 hover:text-black transition-colors">Bad Decision Calculator</a>
          <a href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</a>
          <a href="/about" className="text-gray-600 hover:text-black transition-colors font-medium">About</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-6">Making Local Laws Accessible to Everyone</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            LawLens cuts through legal jargon to provide clear, researched answers about obscure local laws and regulations. 
            We believe everyone deserves to understand the rules that govern their daily lives.
          </p>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-black text-center mb-12">How LawLens Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-black mb-2">1. Ask Your Question</h3>
              <p className="text-gray-600 text-sm">
                Type your legal question about any local law or regulation
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Scale className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-black mb-2">2. Legal Research</h3>
              <p className="text-gray-600 text-sm">
                Our team researches official sources and legal databases
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-black mb-2">3. Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Receive your answer in plain English within 24-48 hours
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-black mb-2">4. Verified Sources</h3>
              <p className="text-gray-600 text-sm">
                Every answer includes links to the original legal sources
              </p>
            </div>
          </div>
        </section>

        {/* What We Cover */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-black text-center mb-12">What Types of Questions We Cover</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-black mb-4">Local Ordinances</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Unusual city and county laws</li>
                <li>• Zoning and property regulations</li>
                <li>• Business licensing requirements</li>
                <li>• Public behavior ordinances</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-4">State Regulations</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Professional licensing laws</li>
                <li>• Consumer protection rules</li>
                <li>• Transportation regulations</li>
                <li>• Environmental compliance</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-4">Municipal Rules</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Parking and traffic laws</li>
                <li>• Noise ordinances</li>
                <li>• Pet and animal regulations</li>
                <li>• Public space usage rules</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-4">Quirky Laws</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Outdated but still active laws</li>
                <li>• Unusual prohibitions</li>
                <li>• Regional legal oddities</li>
                <li>• Historical legal curiosities</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-bold text-black text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-black mb-3">Is this legal advice?</h3>
              <p className="text-gray-600">
                No, LawLens provides information about laws and regulations, not legal advice. We research and explain what laws say, 
                but we don't provide counsel on legal strategy or specific situations. For legal advice, please consult a qualified attorney.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-black mb-3">How accurate is your research?</h3>
              <p className="text-gray-600">
                We take accuracy seriously and research official government sources, legal databases, and current statutes. 
                However, laws change frequently, so we always recommend verifying current status with local authorities for critical decisions.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-black mb-3">What if you can't find an answer?</h3>
              <p className="text-gray-600">
                If we can't locate a definitive answer through our research, we'll provide you with the best available information 
                and direct you to the appropriate authorities who can help. We don't charge for questions we can't answer.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-black mb-3">Do you cover federal laws?</h3>
              <p className="text-gray-600">
                Our focus is on local, state, and municipal laws that vary by location. For federal law questions, 
                we recommend consulting legal databases like FindLaw or speaking with an attorney.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-black mb-3">How do you protect my privacy?</h3>
              <p className="text-gray-600">
                We only collect the information necessary to provide our service (email and payment info). 
                Your questions are stored securely and used only to improve our database for all users.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-black mb-3">Can I request priority research?</h3>
              <p className="text-gray-600">
                Subscribers automatically get priority research with faster turnaround times (12-24 hours vs 24-48 hours). 
                One-time customers can upgrade to priority for an additional $10.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <div className="mt-20 text-center bg-gray-50 rounded-xl p-12">
          <h2 className="text-2xl font-bold text-black mb-4">Have a Different Question?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you have questions about our service or need help with something specific, 
            feel free to reach out to us.
          </p>
          <a 
            href="mailto:hello@lawlens.com"
            className="inline-block bg-black text-white px-8 py-3 font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Contact Us
          </a>
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