import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Sparkles, ArrowLeft, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function CreateCampaign() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commissionRate, setCommissionRate] = useState('15');
  const [discountValue, setDiscountValue] = useState('10');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('Not authenticated');

      const { data, error: campErr } = await supabase
        .from('campaigns')
        .insert([{
          seller_id: user.id,
          title,
          description,
          product_name: productName,
          product_url: productUrl,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300', // Default shirt template image
          commission_rate: Number(commissionRate),
          status: 'active'
        }]);

      if (campErr) throw campErr;

      navigate('/dashboard/seller');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to launch campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Link */}
        <Link to="/dashboard/seller" className="inline-flex items-center space-x-2 text-slate-500 hover:text-brand-650 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Back to Dashboard</span>
        </Link>

        {/* Form Container */}
        <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-8 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Launch New Campaign</h1>
              <p className="text-xs text-slate-500">Launch a campaign to start receiving affiliate applications from creators</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start space-x-2.5 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Campaign Title</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                placeholder="e.g. Summer Linen Collection Promotion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Campaign Description</label>
              <textarea
                required
                rows="4"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                placeholder="Explain to creators what this campaign is about, what kind of audience you are looking for, and details about the product."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Product Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                  placeholder="e.g. Premium Silk Scarf"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Product URL (Shop Link)</label>
                <input
                  type="url"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                  placeholder="https://yourstore.com/product"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Product Image URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="url"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                  placeholder="https://unsplash.com/photos/your-product-image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Creator Commission Rate (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200 font-bold"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Creator Follower Discount (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200 font-bold"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg hover:opacity-95 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Launching Campaign...</span>
                </>
              ) : (
                <span>Launch Campaign</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
