import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Compass, Tag, TrendingUp, DollarSign, 
  ShoppingBag, HelpCircle, CheckCircle, Plus, Copy, Check, Loader2, ArrowRight
} from 'lucide-react';

export default function CreatorDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('browse');
  const [loading, setLoading] = useState(true);

  // States
  const [availableCampaigns, setAvailableCampaigns] = useState([]);
  const [myCodes, setMyCodes] = useState([]);
  const [referredOrders, setReferredOrders] = useState([]);
  const [creatorStats, setCreatorStats] = useState({
    totalSales: 0,
    totalCommission: 0,
    activePromoCodes: 0
  });

  const [copiedId, setCopiedId] = useState('');
  const [requestLoading, setRequestLoading] = useState({});

  // Payout states
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [payoutError, setPayoutError] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch all active campaigns
      const { data: campaignData, error: campErr } = await supabase
        .from('campaigns')
        .select('*, sellers(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (campErr) throw campErr;
      setAvailableCampaigns(campaignData || []);

      // 2. Fetch my generated promo codes
      const { data: codeData, error: codeErr } = await supabase
        .from('promo_codes')
        .select('*, campaigns(*, sellers(*))')
        .eq('creator_id', user.id);

      if (codeErr) throw codeErr;
      setMyCodes(codeData || []);

      // 3. Fetch my referred orders
      const { data: orderData, error: ordErr } = await supabase
        .from('orders')
        .select('*, campaigns(*), promo_codes(*)')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (ordErr) throw ordErr;
      setReferredOrders(orderData || []);

      // Calculate Stats
      const totalSales = (orderData || []).reduce((acc, curr) => acc + Number(curr.order_amount), 0);
      const totalCommission = (orderData || []).reduce((acc, curr) => acc + Number(curr.commission_amount), 0);

      setCreatorStats({
        totalSales,
        totalCommission,
        activePromoCodes: (codeData || []).length
      });

      await refreshProfile();
    } catch (err) {
      console.error('Error fetching creator data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRequestPromoCode = async (campaignId) => {
    setRequestLoading(prev => ({ ...prev, [campaignId]: true }));
    try {
      // Formulate unique code
      const handleClean = profile?.details?.handle 
        ? profile.details.handle.replace('@', '').toUpperCase().substring(0, 8) 
        : 'REF';
      
      const randNum = Math.floor(100 + Math.random() * 900);
      const generatedCode = `${handleClean}${randNum}`;
      
      const { error } = await supabase
        .from('promo_codes')
        .insert([{
          campaign_id: campaignId,
          creator_id: user.id,
          code: generatedCode,
          discount_value: 10 // Default 10% discount for followers
        }]);

      if (error) throw error;
      
      fetchData();
    } catch (err) {
      alert('Error requesting code: ' + err.message);
    } finally {
      setRequestLoading(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setPayoutSuccess('');
    setPayoutError('');
    
    const amount = Number(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      setPayoutError('Please enter a valid amount.');
      return;
    }

    if (!profile?.wallet || profile.wallet.balance < amount) {
      setPayoutError('Insufficient wallet balance.');
      return;
    }

    setPayoutLoading(true);

    try {
      // Simulate deduction
      const newBal = Number(profile.wallet.balance) - amount;
      const { error } = await supabase
        .from('wallets')
        .update({ balance: newBal })
        .eq('id', profile.wallet.id);

      if (error) throw error;

      setPayoutSuccess(`Payout request for $${amount.toFixed(2)} submitted successfully! Funds will arrive in your bank account in 2-3 business days.`);
      setPayoutAmount('');
      fetchData();
    } catch (err) {
      setPayoutError(err.message || 'Payout failed.');
    } finally {
      setPayoutLoading(false);
    }
  };

  const hasCodeForCampaign = (campaignId) => {
    return myCodes.find(code => code.campaign_id === campaignId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <DashboardLayout role="creator" activeSection={activeSection} setActiveSection={setActiveSection}>
      {activeSection === 'browse' && (
        <div className="space-y-8">
          {/* Header Description */}
          <div className="bg-gradient-to-br from-brand-950 to-brand-900 rounded-3xl p-6 md:p-8 text-white space-y-4 shadow-xl">
            <h2 className="text-2xl font-black">Monetize Your Influence</h2>
            <p className="text-brand-100 max-w-xl text-sm">
              Browse available campaigns launched by top brands, generate your exclusive creator discount code, and start earning up to 20% commission on every sale.
            </p>
          </div>

          {/* Campaigns Catalog Grid */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6">Available Campaigns</h3>
            {availableCampaigns.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500">
                No active brand campaigns available at the moment. Please check back later.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {availableCampaigns.map((camp) => {
                  const activeCodeObj = hasCodeForCampaign(camp.id);
                  const isClaimed = !!activeCodeObj;

                  return (
                    <div key={camp.id} className="bg-white rounded-3xl border border-slate-150 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                      <div>
                        {/* Product Image Banner */}
                        <div className="h-44 w-full bg-slate-100 relative">
                          {camp.image_url ? (
                            <img src={camp.image_url} alt={camp.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Compass className="w-12 h-12" />
                            </div>
                          )}
                          
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black text-slate-850 shadow-sm border border-slate-100 flex items-center space-x-1">
                            <span className="text-brand-600 font-bold">{camp.commission_rate}%</span>
                            <span className="text-slate-500 font-medium">Commission</span>
                          </div>
                        </div>

                        {/* Content details */}
                        <div className="p-6 space-y-4">
                          <div>
                            <span className="text-[10px] font-bold text-brand-650 uppercase bg-brand-50 px-2 py-0.5 rounded-md">
                              {camp.sellers?.company_name || 'Brand'}
                            </span>
                            <h4 className="font-extrabold text-slate-800 text-lg leading-tight mt-2">{camp.title}</h4>
                          </div>

                          <p className="text-slate-550 text-sm line-clamp-3">{camp.description}</p>
                          
                          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-450">
                            <span>Product: <strong className="text-slate-650 font-bold">{camp.product_name}</strong></span>
                            {camp.product_url && (
                              <a href={camp.product_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-bold flex items-center hover:underline">
                                <span>View Shop</span>
                                <ArrowRight className="w-3 h-3 ml-0.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="p-6 pt-0">
                        {isClaimed ? (
                          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">Your Promo Code</div>
                              <div className="font-mono font-black text-brand-600 text-sm mt-1">{activeCodeObj.code}</div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(activeCodeObj.code, camp.id)}
                              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-150 rounded-xl transition-colors"
                              title="Copy Promo Code"
                            >
                              {copiedId === camp.id ? (
                                <Check className="w-4.5 h-4.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-4.5 h-4.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequestPromoCode(camp.id)}
                            disabled={requestLoading[camp.id]}
                            className="w-full gradient-bg hover:opacity-95 text-white font-bold py-3 rounded-2xl flex items-center justify-center space-x-2 text-sm shadow-lg shadow-brand-500/10"
                          >
                            {requestLoading[camp.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <span>Claim Promo Code</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'my_codes' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">My Claimed Discount Codes</h2>
            <span className="text-xs font-bold text-brand-650 bg-brand-50 px-3 py-1.5 rounded-full">
              {myCodes.length} Active Codes
            </span>
          </div>

          {myCodes.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              You haven't claimed any promo codes yet. Go to the **Browse Campaigns** tab to request your first promo code.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCodes.map((code) => (
                <div key={code.id} className="border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-brand-300 transition-all">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-650 bg-brand-50 px-2 py-0.5 rounded-md">
                        {code.campaigns?.sellers?.company_name || 'Brand'}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(code.created_at).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-800">{code.campaigns?.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Product: {code.campaigns?.product_name}</p>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">Share Code</div>
                        <div className="font-mono font-black text-brand-600 text-lg mt-1">{code.code}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(code.code, code.id)}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-150 rounded-xl transition-colors"
                      >
                        {copiedId === code.id ? (
                          <Check className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-6 text-xs text-slate-500">
                    <div>
                      <span>Follower Discount:</span>
                      <div className="font-bold text-slate-700 mt-0.5">{code.discount_value}% Off</div>
                    </div>
                    <div>
                      <span>Your Commission:</span>
                      <div className="font-bold text-emerald-600 mt-0.5">{code.campaigns?.commission_rate}% per sale</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'earnings' && (
        <div className="space-y-8">
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">My Referred Sales</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">${creatorStats.totalSales.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-650 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Total Earned Commission</span>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">${creatorStats.totalCommission.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-650 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Orders log table */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800">My Sales Commission History</h3>
            
            {referredOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No commission transactions recorded yet. When buyers purchase using your promo codes, earnings appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                      <th className="py-4 px-2">Order ID</th>
                      <th className="py-4 px-2">Campaign</th>
                      <th className="py-4 px-2">Promo Code Used</th>
                      <th className="py-4 px-2">Order Total</th>
                      <th className="py-4 px-2">Your Earnings</th>
                      <th className="py-4 px-2">Status</th>
                      <th className="py-4 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {referredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-2 font-mono text-xs text-slate-400">#{ord.id.toString().substring(0,8)}</td>
                        <td className="py-4 px-2 font-bold text-slate-800">{ord.campaigns?.title}</td>
                        <td className="py-4 px-2 font-mono text-brand-600 font-bold">{ord.promo_codes?.code}</td>
                        <td className="py-4 px-2 font-bold text-slate-900">${Number(ord.order_amount).toFixed(2)}</td>
                        <td className="py-4 px-2 text-emerald-650 font-black">${Number(ord.commission_amount).toFixed(2)}</td>
                        <td className="py-4 px-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-slate-450">{new Date(ord.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Balance card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Earning Wallet</h2>

            <div className="p-6 bg-gradient-to-br from-brand-900 to-purple-950 rounded-2xl text-white space-y-6">
              <div>
                <span className="text-xs text-brand-200 font-bold uppercase tracking-wider">Available Balance</span>
                <h3 className="text-4xl font-black mt-1">${profile?.wallet?.balance?.toFixed(2) || '0.00'}</h3>
              </div>
              
              <div className="flex justify-between items-center border-t border-brand-800 pt-4 text-sm text-brand-100">
                <span>Verification State: Approved</span>
                <span>Promo Codes: {myCodes.length}</span>
              </div>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed">
              Earnings are credited to your Available Balance immediately after a buyer completes a purchase using your active referral code.
            </p>
          </div>

          {/* Request payout form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Withdraw Funds</h2>
            
            {payoutSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-start space-x-2.5 text-xs">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{payoutSuccess}</span>
              </div>
            )}

            {payoutError && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start space-x-2.5 text-xs">
                <HelpCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{payoutError}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Amount to Withdraw ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-850 font-bold outline-none transition-all"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={payoutLoading || !profile?.wallet?.balance || profile.wallet.balance <= 0}
                className="w-full gradient-bg hover:opacity-95 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {payoutLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Request Instant Payout</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
