import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Plus, Play, Pause, ChevronRight, ShoppingBag, 
  Users, DollarSign, ExternalLink, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, Target
} from 'lucide-react';
export default function SellerDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('campaigns');
  const [loading, setLoading] = useState(true);

  // States
  const [campaigns, setCampaigns] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerStats, setSellerStats] = useState({
    totalSales: 0,
    totalCommission: 0,
    activePromoCodes: 0
  });

  // Simulator Form State
  const [simCode, setSimCode] = useState('');
  const [simAmount, setSimAmount] = useState('100.00');
  const [simCustomer, setSimCustomer] = useState('Simulated Buyer');
  const [simLoading, setSimLoading] = useState(false);
  const [simSuccess, setSimSuccess] = useState('');
  const [simError, setSimError] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch campaigns
      const { data: campaignData, error: campErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('seller_id', profile?.details?.id)
        .order('created_at', { ascending: false });

      if (campErr) throw campErr;
      setCampaigns(campaignData || []);

      // 2. Fetch promo codes for campaigns created by this seller
      const { data: codeData, error: codeErr } = await supabase
        .from('promo_codes')
        .select('*, campaigns!inner(*), creators(*)')
        .eq('campaigns.seller_id', user.id);

      if (codeErr) throw codeErr;
      setPromoCodes(codeData || []);

      // 3. Fetch orders for campaigns created by this seller
      const { data: orderData, error: ordErr } = await supabase
        .from('orders')
        .select('*, campaigns!inner(*), creators(*), promo_codes(*)')
        .eq('campaigns.seller_id', user.id)
        .order('created_at', { ascending: false });

      if (ordErr) throw ordErr;
      setOrders(orderData || []);

      // Calculate Stats
      const totalSales = (orderData || []).reduce((acc, curr) => acc + Number(curr.order_amount), 0);
      const totalCommission = (orderData || []).reduce((acc, curr) => acc + Number(curr.commission_due), 0);
      
      setSellerStats({
        totalSales,
        totalCommission,
        activePromoCodes: (codeData || []).length
      });

      await refreshProfile();
    } catch (err) {
      console.error('Error fetching seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const toggleCampaignStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert('Error updating campaign status: ' + err.message);
    }
  };

  // Run a client-side simulated transaction to test integration
  const handleSimulateOrder = async (e) => {
    e.preventDefault();
    setSimSuccess('');
    setSimError('');
    setSimLoading(true);

    try {
      // 1. Validate promo code
      const { data: codeData, error: codeErr } = await supabase
        .from('promo_codes')
        .select('*, campaigns(*), creators(*)')
        .eq('code', simCode.trim().toUpperCase())
        .single();

      if (codeErr || !codeData) {
        throw new Error('Invalid Promo Code. Ensure the creator has generated this code first.');
      }

      const campaign = codeData.campaigns;
      const creator = codeData.creators;
      const amount = Number(simAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Order Amount must be positive');
      }

      // Calculate commission based on rate (assume campaign.commission_rate is percentage, e.g. 10%)
      const commissionRate = Number(campaign.commission_rate) || 10;
      const commissionAmount = (amount * commissionRate) / 100;

      // Check seller balance: Wallet should have enough money
      if (!profile?.wallet || profile.wallet.balance < commissionAmount) {
        throw new Error(`Insufficient wallet funds. You need at least $${commissionAmount.toFixed(2)} in your wallet to cover the creator commission.`);
      }

      // Create simulated order
      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          campaign_id: campaign.id,
          promo_code_id: codeData.id,
          creator_id: creator.id,
          seller_id: user.id,
          customer_name: simCustomer,
          order_amount: amount,
          commission_amount: commissionAmount,
          status: 'paid'
        }])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Update wallets:
      // A: Deduct commission from seller wallet
      const sellerNewBal = Number(profile.wallet.balance) - commissionAmount;
      const { error: wSellerErr } = await supabase
        .from('wallets')
        .update({ balance: sellerNewBal })
        .eq('id', profile.wallet.id);

      if (wSellerErr) console.error('Seller wallet update failed', wSellerErr);

      // B: Get Creator wallet and credit pending or balance
      const { data: creatorWallet, error: getCreWalletErr } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', creator.id)
        .single();

      if (!getCreWalletErr && creatorWallet) {
        const creatorNewBal = Number(creatorWallet.balance) + commissionAmount;
        await supabase
          .from('wallets')
          .update({ balance: creatorNewBal })
          .eq('id', creatorWallet.id);
      }

      setSimSuccess(`Order Simulated successfully! $${commissionAmount.toFixed(2)} commission awarded to Creator (${creator.full_name || creator.id})`);
      setSimCode('');
      fetchData();
    } catch (err) {
      console.error(err);
      setSimError(err.message || 'Simulation failed.');
    } finally {
      setSimLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!profile?.wallet) return;
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance: Number(profile.wallet.balance) + 500 })
        .eq('id', profile.wallet.id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <DashboardLayout role="seller" activeSection={activeSection} setActiveSection={setActiveSection}>
      {activeSection === 'campaigns' && (
        <div className="space-y-8">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Total Sales Generated</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">${sellerStats.totalSales.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-650 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Total Commission Paid</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">${sellerStats.totalCommission.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Promo Codes Issued</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{sellerStats.activePromoCodes}</h3>
              </div>
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Your Active Campaigns</h2>
              <Link 
                to="/dashboard/seller/create-campaign" 
                className="gradient-bg text-white px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/10 hover:opacity-95 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Create Campaign</span>
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-650 flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No campaigns launched yet</h3>
                <p className="text-slate-500 text-sm">
                  Create a campaign to list products, define commission rates, and let creators promote them.
                </p>
                <Link to="/dashboard/seller/create-campaign" className="inline-block gradient-bg text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 hover:opacity-95 transition-all">
                  Launch Your First Campaign
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {camp.image_url ? (
                            <img src={camp.image_url} alt={camp.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          camp.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-slate-800 text-lg leading-tight mb-2">{camp.title}</h3>
                      <p className="text-slate-550 text-sm line-clamp-2 mb-4">{camp.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-6">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Commission Rate</span>
                          <div className="text-lg font-black text-slate-800 mt-0.5">{camp.commission_rate}%</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Product Name</span>
                          <div className="text-slate-750 font-bold truncate text-sm mt-1 flex items-center space-x-1">
                            <span>{camp.product_name}</span>
                            {camp.product_url && (
                              <a href={camp.product_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-600">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleCampaignStatus(camp.id, camp.status)}
                        className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all ${
                          camp.status === 'active'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {camp.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Pause Campaign</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Activate Campaign</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'promo_codes' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Active Creator Promo Codes</h2>
            <span className="text-xs font-bold text-brand-650 bg-brand-50 px-3 py-1.5 rounded-full">
              {promoCodes.length} Total Codes
            </span>
          </div>

          {promoCodes.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No promo codes have been claimed by creators yet. Creators can request codes from their dashboards.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <th className="py-4 px-2">Promo Code</th>
                    <th className="py-4 px-2">Campaign</th>
                    <th className="py-4 px-2">Creator</th>
                    <th className="py-4 px-2">Discount Value</th>
                    <th className="py-4 px-2">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {promoCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-2 font-mono font-black text-brand-600">{code.code}</td>
                      <td className="py-4 px-2 font-bold text-slate-800">{code.campaigns?.title}</td>
                      <td className="py-4 px-2">
                        <div className="font-bold text-slate-700">{code.creators?.full_name || 'Creator'}</div>
                        <div className="text-xs text-slate-400 font-mono">{code.creators?.handle || '@handle'}</div>
                      </td>
                      <td className="py-4 px-2 font-semibold text-slate-600">{code.discount_value || '10'}% Off</td>
                      <td className="py-4 px-2 text-slate-400">{new Date(code.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSection === 'orders' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Referred Customer Orders</h2>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No orders registered yet. You can use the Order Simulator in the **Wallet** section to generate mock orders.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <th className="py-4 px-2">Order ID</th>
                    <th className="py-4 px-2">Campaign</th>
                    <th className="py-4 px-2">Promo Code</th>
                    <th className="py-4 px-2">Creator</th>
                    <th className="py-4 px-2">Order Amount</th>
                    <th className="py-4 px-2">Commission</th>
                    <th className="py-4 px-2">Status</th>
                    <th className="py-4 px-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-2 font-mono text-xs text-slate-500">#{ord.id.toString().substring(0,8)}</td>
                      <td className="py-4 px-2 font-bold text-slate-800">{ord.campaigns?.title}</td>
                      <td className="py-4 px-2 font-mono text-brand-600 font-bold">{ord.promo_codes?.code || 'N/A'}</td>
                      <td className="py-4 px-2 font-medium text-slate-600">{ord.creators?.full_name || 'Creator'}</td>
                      <td className="py-4 px-2 font-bold text-slate-950">${Number(ord.order_amount).toFixed(2)}</td>
                      <td className="py-4 px-2 text-emerald-650 font-bold">${Number(ord.commission_amount).toFixed(2)}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ord.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-slate-400">{new Date(ord.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSection === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Balance details */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Wallet Management</h2>

            <div className="p-6 bg-gradient-to-br from-brand-900 to-purple-950 rounded-2xl text-white space-y-6">
              <div>
                <span className="text-xs text-brand-200 font-bold uppercase tracking-wider">Available Funds</span>
                <h3 className="text-4xl font-black mt-1">${profile?.wallet?.balance?.toFixed(2) || '0.00'}</h3>
              </div>

              <div className="flex justify-between items-center border-t border-brand-800 pt-4 text-sm text-brand-100">
                <span>Account Tier: Premium Brand</span>
                <span>Active Campaigns: {campaigns.length}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={handleAddFunds}
                className="flex-1 gradient-bg text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-500/10 hover:opacity-95 transition-all text-center flex items-center justify-center space-x-2"
              >
                <ArrowUpRight className="w-5 h-5" />
                <span>Simulate Adding $500.00</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-400">
              * Note: Commission amounts are automatically deducted from this wallet when an order is referred using a creator's code. Make sure your balance stays topped up!
            </p>
          </div>

          {/* Interactive Checkout Order Simulator */}
          <div className="bg-white border border-slate-105 rounded-3xl p-6 shadow-md border-brand-100 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full filter blur-xl"></div>
            
            <div>
              <h2 className="text-xl font-bold text-slate-900">E-Commerce Checkout Simulator</h2>
              <p className="text-xs text-slate-500 mt-1">
                Simulate a customer purchase checkout using a creator's promo code to instantly test wallet commission logic.
              </p>
            </div>

            {simSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-start space-x-2.5 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{simSuccess}</span>
              </div>
            )}

            {simError && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start space-x-2.5 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{simError}</span>
              </div>
            )}

            <form onSubmit={handleSimulateOrder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Creator Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HANDLE10"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-slate-800 text-sm outline-none font-mono uppercase"
                  value={simCode}
                  onChange={(e) => setSimCode(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Order Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-slate-800 text-sm outline-none font-bold"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Customer Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-slate-800 text-sm outline-none"
                    value={simCustomer}
                    onChange={(e) => setSimCustomer(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={simLoading}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors text-sm disabled:opacity-50"
              >
                {simLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Checkout...</span>
                  </>
                ) : (
                  <span>Place Referred Order</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
