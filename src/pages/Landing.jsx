import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Users, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            Affili<span className="text-brand-600">fy</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-slate-600 font-medium">
          <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
          <a href="#sellers" className="hover:text-brand-600 transition-colors">For Sellers</a>
          <a href="#creators" className="hover:text-brand-600 transition-colors">For Creators</a>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium px-4 py-2 transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="gradient-bg text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 hover:opacity-95 transform hover:-translate-y-0.5 transition-all duration-200">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 px-6 md:px-12 bg-white">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full filter blur-3xl opacity-50 transform translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full filter blur-3xl opacity-40 transform -translate-x-12 translate-y-12"></div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-left space-y-8">
            <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full text-brand-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Unlocking Social Commerce Affiliate Power</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
              Connect Brands <br />
              with Top <span className="gradient-text font-black">Creators</span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-lg">
              Launch affiliate campaigns, auto-generate exclusive promo codes, track influencer conversions, and distribute payouts transparently on the all-in-one affiliate system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/signup?role=seller" className="gradient-bg text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-brand-500/20 text-center flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 hover:shadow-brand-500/30 transition-all duration-200">
                <span>Start as Seller</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/signup?role=creator" className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-8 py-4 rounded-2xl text-center transform hover:-translate-y-0.5 transition-all duration-200">
                Join as Creator
              </Link>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md p-6 bg-gradient-to-br from-brand-50 to-purple-50 border border-brand-100 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-300/20 rounded-full filter blur-xl"></div>
              
              {/* Decorative representation of Dashboard */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Affiliate Revenue</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">+28%</span>
                </div>
                <div className="text-3xl font-black text-slate-900">$45,290.00</div>
                <div className="h-24 bg-gradient-to-t from-brand-50 to-brand-100/30 rounded-xl flex items-end justify-between p-3 gap-2">
                  <div className="w-full bg-brand-200 h-10 rounded-md"></div>
                  <div className="w-full bg-brand-300 h-16 rounded-md"></div>
                  <div className="w-full bg-brand-400 h-12 rounded-md"></div>
                  <div className="w-full bg-brand-500 h-20 rounded-md"></div>
                </div>
              </div>

              {/* Creators Card overlay */}
              <div className="mt-4 bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center space-x-3 transform md:translate-x-8">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700">
                  JD
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">Jessica Doe (TikTok Creator)</div>
                  <div className="text-xs text-slate-500">Promo Code: JESSICA20</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Earned</span>
                  <span className="font-bold text-brand-600 text-sm">+$1,420</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-brand-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-black text-brand-300">$2.4M+</div>
            <div className="text-sm text-brand-100 font-medium">Referred Sales</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-black text-brand-300">12,000+</div>
            <div className="text-sm text-brand-100 font-medium">Promo Codes Issued</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-black text-brand-300">500+</div>
            <div className="text-sm text-brand-100 font-medium">Active Brands</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-black text-brand-300">99.8%</div>
            <div className="text-sm text-brand-100 font-medium">Payout Accuracy</div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            A Powerful Platform for Both Sides
          </h2>
          <p className="text-slate-600">
            Affilify bridges the gap between commercial sellers and content creators to drive exponential sales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Sellers Features */}
          <div id="sellers" className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8 hover:border-brand-200 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Target className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">For Sellers & Brands</h3>
              <p className="text-slate-600">Scale your brand awareness and boost sales with influencer-driven marketing.</p>
            </div>

            <ul className="space-y-4">
              {[
                'Easily create campaigns and set custom commission rates.',
                'Approve/track creators who generate unique promo codes.',
                'Gain analytics on total clicks, uses, orders, and wallet tracking.',
                'Secure escrowed payouts with transparent ledger accounting.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <Link to="/signup?role=seller" className="inline-flex items-center space-x-2 text-brand-600 font-bold hover:text-brand-700">
              <span>Launch your brand campaign</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Creators Features */}
          <div id="creators" className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8 hover:border-brand-200 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Users className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">For Creators & Influencers</h3>
              <p className="text-slate-600">Monetize your network by sharing the brands and products you love.</p>
            </div>

            <ul className="space-y-4">
              {[
                'Browse campaigns and instantly get unique promo codes.',
                'Share discount codes with your followers on any social media.',
                'Earn fixed or percentage-based commissions on every single checkout.',
                'Track earnings in real-time and request payouts straight to your wallet.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/signup?role=creator" className="inline-flex items-center space-x-2 text-purple-600 font-bold hover:text-purple-700">
              <span>Start earning as creator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-brand-800 to-purple-950 py-20 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_60%)]"></div>
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            Ready to Accelerate Your Affiliate Growth?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-lg">
            Sellers gain risk-free sales. Creators gain passive income. Sign up today and experience the future of commerce.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="bg-white text-brand-900 font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:bg-brand-50 transition-all duration-200">
              Create Free Account
            </Link>
            <Link to="/login" className="border border-brand-300 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-200">
              Access Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-auto border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Affili<span className="text-brand-400">fy</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Affilify Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
