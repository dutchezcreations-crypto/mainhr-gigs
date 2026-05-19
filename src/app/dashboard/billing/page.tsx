"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  History,
  Plus,
  Loader2,
  DollarSign,
  TrendingUp,
  CreditCard,
  X,
  Check,
  ChevronRight,
  Download,
  Search,
  AlertCircle,
  HelpCircle,
  PiggyBank,
  ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Billing.module.css";
import AnalyticsChart from "@/components/analytics/AnalyticsChart";
import { exportToCSV } from "@/lib/utils/export";
import { motion, AnimatePresence } from "framer-motion";

export default function BillingPage() {
  const supabase = createClient();
  
  // Dashboard state
  const [balance, setBalance] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"employer" | "freelancer" | "admin">("freelancer");
  const [profileName, setProfileName] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Deposit Form state
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<"momo" | "card">("momo");
  const [momoProvider, setMomoProvider] = useState<"mtn" | "airtel">("mtn");
  const [momoPhone, setMomoPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [depositStep, setDepositStep] = useState(1); // 1 = Input, 2 = Processing, 3 = Success
  const [processingText, setProcessingText] = useState("");
  const [latestTxId, setLatestTxId] = useState("");

  // Withdraw Form state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"momo" | "bank">("momo");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawStep, setWithdrawStep] = useState(1); // 1 = Input, 2 = Processing, 3 = Success

  useEffect(() => {
    fetchBillingData();
  }, [supabase]);

  const fetchBillingData = async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    setUser(authUser);

    // Fetch Profile details (Balance, Role, Name)
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, role, full_name")
      .eq("id", authUser.id)
      .single();
    
    if (profile) {
      setBalance(profile.balance || 0);
      setUserRole(profile.role as "employer" | "freelancer" | "admin");
      setProfileName(profile.full_name || "");

      // Fetch escrow holdings dynamically based on role
      const escrowQuery = supabase.from("escrow_holdings").select("amount").eq("status", "held");
      if (profile.role === "employer") {
        escrowQuery.eq("employer_id", authUser.id);
      } else {
        escrowQuery.eq("freelancer_id", authUser.id);
      }
      
      const { data: escrows } = await escrowQuery;
      const totalEscrow = escrows ? escrows.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) : 0;
      setEscrowBalance(totalEscrow);
    }

    // Fetch Transactions
    const { data: txs } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });
    
    if (txs) setTransactions(txs);
    setLoading(false);
  };

  // Handle Deposit Flow
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    setDepositStep(2);
    setProcessingText("Initializing secure channel...");

    setTimeout(() => {
      setProcessingText(
        depositMethod === "momo" 
          ? `Sending push prompt to ${momoProvider.toUpperCase()} Money (${momoPhone})...`
          : "Authorizing credit card transaction..."
      );
    }, 1500);

    setTimeout(async () => {
      try {
        // 1. Create a unique transaction ID
        const generatedTxId = "TX-" + Math.floor(100000 + Math.random() * 900000);
        setLatestTxId(generatedTxId);

        // 2. Insert transaction record into Supabase
        const { error: txError } = await supabase.from("credit_transactions").insert({
          user_id: user.id,
          amount: amount,
          transaction_type: 'deposit',
          description: `Deposit via ${depositMethod === 'momo' ? momoProvider.toUpperCase() + ' Mobile Money' : 'Card'} (Ref: ${generatedTxId})`,
          status: 'completed'
        });

        if (txError) throw txError;

        // 3. Update profile balance
        const { error: balanceError } = await supabase.rpc('increment_balance', { 
          user_id: user.id, 
          amount: amount 
        });

        if (balanceError) throw balanceError;

        // 4. Trigger success screen
        setDepositStep(3);
      } catch (err: any) {
        alert(err.message || "Failed to process deposit.");
        setDepositStep(1);
      }
    }, 3500);
  };

  // Handle Withdraw Flow
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }
    if (amount > balance) {
      alert("Insufficient balance for this withdrawal.");
      return;
    }

    setWithdrawStep(2);
    setProcessingText("Verifying balance and account details...");

    setTimeout(async () => {
      try {
        const generatedTxId = "WD-" + Math.floor(100000 + Math.random() * 900000);
        setLatestTxId(generatedTxId);

        // 1. Insert payout transaction (marked completed or pending, here we simulate immediate payout)
        const { error: txError } = await supabase.from("credit_transactions").insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: 'payout',
          description: `Withdrawal to ${withdrawMethod === 'momo' ? 'Mobile Money (' + withdrawPhone + ')' : withdrawBank + ' (' + withdrawAccount + ')'}`,
          status: 'completed'
        });

        if (txError) throw txError;

        // 2. Deduct from balance
        const { error: balanceError } = await supabase.rpc('increment_balance', { 
          user_id: user.id, 
          amount: -amount 
        });

        if (balanceError) throw balanceError;

        setWithdrawStep(3);
      } catch (err: any) {
        alert(err.message || "Failed to process withdrawal.");
        setWithdrawStep(1);
      }
    }, 3000);
  };

  const closeDepositModal = () => {
    setIsDepositOpen(false);
    setDepositAmount("");
    setMomoPhone("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setDepositStep(1);
    fetchBillingData(); // refresh dashboard values
  };

  const closeWithdrawModal = () => {
    setIsWithdrawOpen(false);
    setWithdrawAmount("");
    setWithdrawPhone("");
    setWithdrawBank("");
    setWithdrawAccount("");
    setWithdrawStep(1);
    fetchBillingData(); // refresh dashboard values
  };

  // Filtering transactions
  const filteredTransactions = transactions.filter(tx => {
    // Type Filter
    if (filterType !== "all") {
      if (filterType === "deposit" && tx.transaction_type !== "deposit") return false;
      if (filterType === "payout" && tx.transaction_type !== "payout") return false;
      if (filterType === "escrow" && tx.transaction_type !== "escrow_lock" && tx.transaction_type !== "payment_received") return false;
    }
    // Search Query Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const desc = (tx.description || "").toLowerCase();
      const type = (tx.transaction_type || "").toLowerCase();
      const status = (tx.status || "").toLowerCase();
      return desc.includes(query) || type.includes(query) || status.includes(query);
    }
    return true;
  });

  // Calculate quick stats
  const totalDeposited = transactions
    .filter(tx => tx.transaction_type === 'deposit')
    .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

  const totalSpent = transactions
    .filter(tx => tx.transaction_type === 'escrow_lock')
    .reduce((sum: number, tx: any) => sum + Math.abs(parseFloat(tx.amount)), 0);

  const totalEarned = transactions
    .filter(tx => tx.transaction_type === 'payment_received')
    .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);

  if (loading && !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Financial Engine</h1>
          <p className="text-sm font-medium text-neutral-400 mt-1">
            Manage your wallet, track secure escrows, and view transaction records.
          </p>
        </div>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => exportToCSV(transactions, `transactions_${new Date().toISOString().split('T')[0]}`)}
          disabled={transactions.length === 0}
        >
          <Download size={16} className="mr-2" /> Export History
        </button>
      </header>

      {/* Main Stats Panel */}
      <section className={styles.statsPanel}>
        <div className={`${styles.statCard} ${styles.balanceCard}`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={styles.cardLabel}>Available Balance</span>
              <div className={styles.cardValue}>
                UGX {balance.toLocaleString()}
              </div>
            </div>
            <div className={styles.cardIcon}>
              <Wallet size={24} />
            </div>
          </div>
          <div className={styles.cardActions}>
            {userRole === "employer" ? (
              <button className={styles.actionBtnPrimary} onClick={() => setIsDepositOpen(true)}>
                <Plus size={16} /> Deposit Funds
              </button>
            ) : (
              <button className={styles.actionBtnPrimary} onClick={() => setIsWithdrawOpen(true)}>
                <ArrowUpRight size={16} /> Request Payout
              </button>
            )}
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.escrowCard}`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={styles.cardLabel}>
                {userRole === "employer" ? "Locked in Escrow" : "Pending Escrow Earning"}
              </span>
              <div className={styles.cardValue}>
                UGX {escrowBalance.toLocaleString()}
              </div>
            </div>
            <div className={styles.cardIcon}>
              <Lock size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-neutral-400">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure escrow guarantee active
          </div>
        </div>

        <div className={styles.statCard}>
          <div className="flex justify-between items-start">
            <div>
              <span className={styles.cardLabel}>
                {userRole === "employer" ? "Total Invested" : "Total Earned"}
              </span>
              <div className={styles.cardValue}>
                UGX {(userRole === "employer" ? totalSpent : totalEarned).toLocaleString()}
              </div>
            </div>
            <div className={styles.cardIcon}>
              {userRole === "employer" ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
            </div>
          </div>
          <div className="mt-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">
            {userRole === "employer" ? `${transactions.filter(t => t.transaction_type === 'escrow_lock').length} Active Contracts` : `${transactions.filter(t => t.transaction_type === 'payment_received').length} Jobs Paid`}
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <aside className={styles.sidebar}>
          {/* Chart Section */}
          <div className={styles.whiteCard}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Volume Trend</div>
                  <div className="text-sm font-extrabold text-neutral-900">Annual Activity</div>
                </div>
              </div>
            </div>
            <AnalyticsChart 
              data={[
                { label: "Jan", value: totalDeposited * 0.1 },
                { label: "Feb", value: totalDeposited * 0.2 },
                { label: "Mar", value: totalDeposited * 0.35 },
                { label: "Apr", value: totalDeposited * 0.6 },
                { label: "May", value: balance },
              ]} 
              height={180}
              color="var(--color-primary-600)"
            />
          </div>

          {/* Secure Escrow Guide */}
          <div className={`${styles.whiteCard} bg-neutral-900 text-white border-none`}>
            <div className="flex items-center gap-3 mb-4">
              <Lock size={20} className="text-primary-400" />
              <h4 className="font-extrabold text-white text-base">Escrow Protection</h4>
            </div>
            <p className="text-xs opacity-80 leading-relaxed font-semibold">
              MainHR Gigs processes payments using advanced escrow mechanics. Funding is held securely until deliverables are confirmed by the employer.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary-400">
              <HelpCircle size={14} /> Learn about disputes & refunds
            </div>
          </div>
        </aside>

        {/* Transactions Table & Controls */}
        <main className={styles.tableCard}>
          <div className={styles.tableControls}>
            <h2 className={styles.sectionTitle}>
              <History size={20} className="text-neutral-500" /> Ledger & Statements
            </h2>
            
            <div className={styles.filterBar}>
              <div className={styles.searchWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search ledger..." 
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                className={styles.filterSelect}
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="payout">Payouts</option>
                <option value="escrow">Escrow activity</option>
              </select>
            </div>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className={styles.empty}>
              <PiggyBank size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-neutral-500">No matching transactions found.</p>
              <span className="text-xs text-neutral-400">Try adjusting your filters or search query.</span>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Description / Details</th>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td>
                        <div className={styles.type}>
                          <div className={`${styles.iconBg} ${
                            tx.transaction_type === 'deposit' ? styles.bgIn : 
                            tx.transaction_type === 'payout' ? styles.bgOut : 
                            tx.transaction_type === 'escrow_lock' ? styles.bgLock : styles.bgUnlock
                          }`}>
                            {tx.transaction_type === 'deposit' && <ArrowDownLeft size={16} />}
                            {tx.transaction_type === 'payout' && <ArrowUpRight size={16} />}
                            {tx.transaction_type === 'escrow_lock' && <Lock size={16} />}
                            {tx.transaction_type === 'payment_received' && <Unlock size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-neutral-900 font-bold">
                              {(tx.transaction_type || 'Transaction').replace('_', ' ').charAt(0).toUpperCase() + (tx.transaction_type || '').replace('_', ' ').slice(1)}
                            </span>
                            <span className="text-xs text-neutral-400 font-semibold">{tx.description}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-neutral-500 font-semibold">
                          {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td>
                        <code className="text-xs bg-neutral-50 px-2 py-1 rounded font-bold text-neutral-500">
                          {tx.reference_id ? tx.reference_id.substring(0, 8).toUpperCase() : "N/A"}
                        </code>
                      </td>
                      <td>
                        <span className={`${styles.amount} ${tx.amount > 0 ? styles.amountPos : styles.amountNeg}`}>
                          {tx.amount > 0 ? '+' : ''} {tx.amount.toLocaleString()} UGX
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.status} ${
                          tx.status === 'completed' ? styles.statusSuccess : styles.statusPending
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositOpen && (
          <div className={styles.modalOverlay} onClick={closeDepositModal}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.modalContent} 
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <h3 className="font-extrabold text-xl text-neutral-900 flex items-center gap-2">
                    <Plus className="text-primary-600" /> Top Up Wallet
                  </h3>
                  <p className="text-xs text-neutral-400 font-semibold mt-1">Fund your account safely using Mobile Money or Card.</p>
                </div>
                <button onClick={closeDepositModal} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {depositStep === 1 && (
                <form onSubmit={handleDepositSubmit} className="space-y-6 mt-4">
                  {/* Amount Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Deposit Amount (UGX)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        placeholder="Min 5,000 UGX"
                        className={styles.modalInput} 
                        value={depositAmount} 
                        onChange={e => setDepositAmount(e.target.value)}
                      />
                    </div>
                    {/* Presets */}
                    <div className="flex gap-2 flex-wrap mt-2">
                      {["100000", "250000", "500000", "1000000"].map(preset => (
                        <button 
                          key={preset}
                          type="button"
                          className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold rounded-lg border border-neutral-200 transition text-neutral-600"
                          onClick={() => setDepositAmount(preset)}
                        >
                          UGX {parseInt(preset).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Method Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Payment Channel</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        className={`${styles.methodBtn} ${depositMethod === 'momo' ? styles.methodBtnActive : ''}`}
                        onClick={() => setDepositMethod('momo')}
                      >
                        <Plus size={16} /> Mobile Money
                      </button>
                      <button 
                        type="button"
                        className={`${styles.methodBtn} ${depositMethod === 'card' ? styles.methodBtnActive : ''}`}
                        onClick={() => setDepositMethod('card')}
                      >
                        <CreditCard size={16} /> Credit/Debit Card
                      </button>
                    </div>
                  </div>

                  {depositMethod === 'momo' ? (
                    <div className="space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className={`flex-1 py-2 text-xs font-extrabold rounded-lg border transition ${
                            momoProvider === 'mtn' ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-neutral-200 text-neutral-600'
                          }`}
                          onClick={() => setMomoProvider('mtn')}
                        >
                          MTN Mobile Money
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-2 text-xs font-extrabold rounded-lg border transition ${
                            momoProvider === 'airtel' ? 'bg-red-100 border-red-300 text-red-800' : 'bg-white border-neutral-200 text-neutral-600'
                          }`}
                          onClick={() => setMomoProvider('airtel')}
                        >
                          Airtel Money
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400">Mobile Money Number</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. 0772123456"
                          className={styles.modalInput} 
                          value={momoPhone}
                          onChange={e => setMomoPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400">Card Number</label>
                        <input 
                          type="text" 
                          required
                          placeholder="•••• •••• •••• ••••"
                          className={styles.modalInput} 
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-400">Expiry Date</label>
                          <input 
                            type="text" 
                            required
                            placeholder="MM/YY"
                            className={styles.modalInput} 
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-400">CVC</label>
                          <input 
                            type="password" 
                            required
                            placeholder="•••"
                            className={styles.modalInput} 
                            value={cardCvc}
                            maxLength={3}
                            onChange={e => setCardCvc(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button type="submit" className="btn btn-primary btn-lg w-full py-4 text-sm font-bold flex items-center justify-center gap-2">
                      Complete Deposit (UGX {parseFloat(depositAmount || "0").toLocaleString()}) <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {depositStep === 2 && (
                <div className="py-12 text-center space-y-4">
                  <Loader2 className="animate-spin text-primary-600 mx-auto" size={48} />
                  <h4 className="font-extrabold text-lg text-neutral-900">Secure Payment in Progress</h4>
                  <p className="text-sm font-medium text-neutral-500 max-w-xs mx-auto">{processingText}</p>
                </div>
              )}

              {depositStep === 3 && (
                <div className="py-10 text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100 shadow-sm">
                    <Check size={32} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-2xl text-neutral-900">Wallet Funded!</h4>
                    <p className="text-sm font-semibold text-neutral-500 mt-2">
                      UGX {parseFloat(depositAmount).toLocaleString()} has been successfully credited to your wallet.
                    </p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-left max-w-sm mx-auto space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-neutral-400">Reference:</span> <span className="font-bold font-mono">{latestTxId}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-400">Payment Channel:</span> <span className="font-bold">{depositMethod === 'momo' ? momoProvider.toUpperCase() + ' Momo' : 'Card'}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-400">Status:</span> <span className="font-bold text-emerald-600">SUCCESS</span></div>
                  </div>
                  <button onClick={closeDepositModal} className="btn btn-primary w-full py-4 max-w-sm mx-auto font-bold">
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <div className={styles.modalOverlay} onClick={closeWithdrawModal}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.modalContent} 
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <h3 className="font-extrabold text-xl text-neutral-900 flex items-center gap-2">
                    <ArrowUpRight className="text-primary-600" /> Withdraw Wallet Funds
                  </h3>
                  <p className="text-xs text-neutral-400 font-semibold mt-1">Payout directly to your Mobile Money or Bank.</p>
                </div>
                <button onClick={closeWithdrawModal} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {withdrawStep === 1 && (
                <form onSubmit={handleWithdrawSubmit} className="space-y-6 mt-4">
                  {/* Amount Field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Withdrawal Amount (UGX)</label>
                      <button 
                        type="button" 
                        className="text-xs font-extrabold text-primary-600 hover:text-primary-800"
                        onClick={() => setWithdrawAmount(balance.toString())}
                      >
                        Withdraw Max (UGX {balance.toLocaleString()})
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        placeholder="Max amount: UGX "
                        max={balance}
                        className={styles.modalInput} 
                        value={withdrawAmount} 
                        onChange={e => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Method Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Payout Channel</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        className={`${styles.methodBtn} ${withdrawMethod === 'momo' ? styles.methodBtnActive : ''}`}
                        onClick={() => setWithdrawMethod('momo')}
                      >
                        <Plus size={16} /> Mobile Money
                      </button>
                      <button 
                        type="button"
                        className={`${styles.methodBtn} ${withdrawMethod === 'bank' ? styles.methodBtnActive : ''}`}
                        onClick={() => setWithdrawMethod('bank')}
                      >
                        <Wallet size={16} /> Bank Transfer
                      </button>
                    </div>
                  </div>

                  {withdrawMethod === 'momo' ? (
                    <div className="space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400">Mobile Money Number</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. 0772123456"
                          className={styles.modalInput} 
                          value={withdrawPhone}
                          onChange={e => setWithdrawPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400">Bank Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Stanbic Bank"
                          className={styles.modalInput} 
                          value={withdrawBank}
                          onChange={e => setWithdrawBank(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400">Account Number</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Account Number"
                          className={styles.modalInput} 
                          value={withdrawAccount}
                          onChange={e => setWithdrawAccount(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button type="submit" className="btn btn-primary btn-lg w-full py-4 text-sm font-bold flex items-center justify-center gap-2">
                      Complete Payout (UGX {parseFloat(withdrawAmount || "0").toLocaleString()}) <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {withdrawStep === 2 && (
                <div className="py-12 text-center space-y-4">
                  <Loader2 className="animate-spin text-primary-600 mx-auto" size={48} />
                  <h4 className="font-extrabold text-lg text-neutral-900">Payout Processing</h4>
                  <p className="text-sm font-medium text-neutral-500 max-w-xs mx-auto">{processingText}</p>
                </div>
              )}

              {withdrawStep === 3 && (
                <div className="py-10 text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100 shadow-sm">
                    <Check size={32} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-2xl text-neutral-900">Payout Complete!</h4>
                    <p className="text-sm font-semibold text-neutral-500 mt-2">
                      UGX {parseFloat(withdrawAmount).toLocaleString()} has been dispatched. Funds will arrive shortly.
                    </p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-left max-w-sm mx-auto space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-neutral-400">Payout Ref:</span> <span className="font-bold font-mono">{latestTxId}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-400">Payout Method:</span> <span className="font-bold">{withdrawMethod === 'momo' ? 'Mobile Money (' + withdrawPhone + ')' : withdrawBank}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-400">Status:</span> <span className="font-bold text-emerald-600">DISPATCHED</span></div>
                  </div>
                  <button onClick={closeWithdrawModal} className="btn btn-primary w-full py-4 max-w-sm mx-auto font-bold">
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
