import React, { useEffect, useState } from "react";
import { 
  fetchReports, 
  FacebookReport, 
  fetchAdminEmails, 
  addAdminEmail, 
  deleteAdminEmail 
} from "./lib/firebase";
import { translations } from "./lib/translations";
import ReportForm from "./components/ReportForm";
import ReportDashboard from "./components/ReportDashboard";
import { 
  ShieldAlert, 
  Info, 
  Sparkles, 
  Heart, 
  LogIn, 
  LogOut, 
  UserCheck, 
  X, 
  AlertCircle,
  Database,
  Lock,
  RefreshCw,
  Globe,
  Languages,
  CheckCircle2,
  Mail,
  Plus,
  Trash2,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [reports, setReports] = useState<FacebookReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Custom language switcher state: English default
  const [lang, setLang] = useState<"bn" | "en">("en");
  const t = translations[lang];

  // Custom admin login state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Countdown timer to regular 2-minute updates
  const [secondsUntilUpdate, setSecondsUntilUpdate] = useState(120);

  // Custom admin email state variables
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminActionError, setAdminActionError] = useState("");
  const [adminActionSuccess, setAdminActionSuccess] = useState("");
  const [confirmRevokeEmail, setConfirmRevokeEmail] = useState<string | null>(null);

  // Helper function to easily load data from firestore on demand 
  const loadReportsData = async (silent = false) => {
    if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const data = await fetchReports();
      setReports(data);
      const emails = await fetchAdminEmails();
      setAdminEmails(emails);
    } catch (err) {
      console.error("Error loading reports: ", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setSecondsUntilUpdate(120); // Reset the 2 minute polling countdown
    }
  };

  // 1. On Mount: Fetch initial data
  useEffect(() => {
    loadReportsData();
  }, []);

  // 2. Continuous Background Polling: updates every 2 minutes (120 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilUpdate((prev) => {
        if (prev <= 1) {
          loadReportsData(true); // background silent reload
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Admin login flow
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const emailInput = loginEmail.trim().toLowerCase();
    const isOwner = emailInput === "sonjoyseo@gmail.com";
    const isPermittedAdmin = adminEmails.includes(emailInput);

    if ((isOwner || isPermittedAdmin) && loginPassword === "again123") {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setLoginError(t.adminLoginError);
    }
  };

  const handleAddAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminActionError("");
    setAdminActionSuccess("");

    const emailToInsert = newAdminEmail.trim().toLowerCase();
    if (!emailToInsert) return;

    // Check if valid email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToInsert)) {
      setAdminActionError(lang === "bn" ? "অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন।" : "Please enter a valid email address.");
      return;
    }

    if (emailToInsert === "sonjoyseo@gmail.com" || adminEmails.includes(emailToInsert)) {
      setAdminActionError(lang === "bn" ? "এই ইমেইলটি ইতিমধ্যে এডমিন তালিকায় রয়েছে।" : "This email address is already added to the admin list.");
      return;
    }

    try {
      await addAdminEmail(emailToInsert);
      setAdminEmails(prev => [...prev, emailToInsert]);
      setNewAdminEmail("");
      setAdminActionSuccess(t.adminManageSuccessAdd);
      setTimeout(() => setAdminActionSuccess(""), 4000);
    } catch (error) {
      setAdminActionError(lang === "bn" ? "যুক্ত করা যায়নি। পুনরায় চেষ্টা করুন।" : "Failed to add email. Please try again.");
    }
  };

  const handleDeleteAdminEmail = async (email: string) => {
    if (email === "sonjoyseo@gmail.com") return;
    setAdminActionError("");
    setAdminActionSuccess("");
    try {
      await deleteAdminEmail(email);
      setAdminEmails(prev => prev.filter(e => e !== email));
      setAdminActionSuccess(t.adminManageSuccessDelete);
      setConfirmRevokeEmail(null);
      setTimeout(() => setAdminActionSuccess(""), 4000);
    } catch (error) {
      setAdminActionError(lang === "bn" ? "বাতিল করা যায়নি।" : "Failed to revoke access.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  // Localized digit/number converter for UI
  const formatNumber = (num: number | string): string => {
    if (lang === "en") return num.toString();
    const banglaDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().split('').map(digit => banglaDigits[digit] || digit).join('');
  };

  // Formatter for auto refresh timer
  const formatCountdown = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const paddedSecs = String(secs).padStart(2, '0');
    return `${formatNumber(mins)}:${formatNumber(paddedSecs)} ${t.secondsText}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between relative">
      
      {/* 1. Header Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              ST
            </div>
            <div>
              <h1 className="text-xs sm:text-sm md:text-md font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                {t.appTitle}
              </h1>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block mt-1 tracking-wider uppercase">
                {t.companyName} • {t.appSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch Button */}
            <button
              onClick={() => setLang(prev => prev === "bn" ? "en" : "bn")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 shadow-2xs"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === "bn" ? "English" : "বাংলা"}</span>
            </button>

            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                <UserCheck className="w-3.5 h-3.5" />
                {t.adminPanel}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.connected}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 2. Admin Quick Sticky Control Bar */}
      {isAdmin && (
        <div className="bg-slate-900 text-white py-3 px-4 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-300">
                {lang === "bn" ? "আপনি বর্তমানে এডমিন মোডে আছেন (sonjoyseo@gmail.com)" : "You are currently in Admin Mode (sonjoyseo@gmail.com)"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.adminLogoutBtn}
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Layout Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Real-time Content Loading indicator */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {lang === "bn" ? "ডাটাবেজ থেকে তথ্য লোড করা হচ্ছে..." : "Fetching latest records from Firestore..."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Split Section 1: Form Column (Span 5) - INFORMATION INPUT SYSTEM with thick left border */}
              <div className="lg:col-span-5 space-y-6">
                {/* ReportForm automatically updates states right away on success submit! */}
                <ReportForm reports={reports} lang={lang} onSuccessSubmit={() => loadReportsData(true)} />
                
                {/* Admin-only email authorization panel */}
                {isAdmin && (
                  <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <div className="p-2 bg-slate-900 text-white rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 leading-none">
                          {t.adminManageSectionTitle}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {t.adminManageSectionDesc}
                        </p>
                      </div>
                    </div>

                    {/* Add action form */}
                    <form onSubmit={handleAddAdminEmail} className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder={t.adminManageEmailPlaceholder}
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-slate-800"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-slate-950 hover:bg-slate-800 text-white p-2.5 rounded-xl transition cursor-pointer text-xs font-bold shrink-0 flex items-center justify-center"
                        title={t.adminManageAddBtn}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Feedback alerts */}
                    {adminActionError && (
                      <div className="p-2 bg-red-50 text-red-600 text-[11px] rounded-lg">
                        {adminActionError}
                      </div>
                    )}
                    {adminActionSuccess && (
                      <div className="p-2 bg-emerald-50 text-emerald-600 text-[11px] rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{adminActionSuccess}</span>
                      </div>
                    )}

                    {/* Authorized administrators list */}
                    <div className="space-y-2 pt-1">
                      <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        {t.adminManageListTitle}
                      </h4>

                      <div className="max-h-52 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                        {/* 1. Chief Administrator (cannot delete) */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span className="font-semibold text-slate-700">sonjoyseo@gmail.com</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-sm uppercase tracking-tight">
                            {t.adminManageChiefLabel}
                          </span>
                        </div>

                        {/* 2. Secondary Custom Admins */}
                        {adminEmails.filter(email => email !== "sonjoyseo@gmail.com").map((email) => (
                          <div key={email} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className="font-medium text-slate-600 truncate max-w-[130px] sm:max-w-[200px]" title={email}>{email}</span>
                            </div>
                            
                            {confirmRevokeEmail === email ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdminEmail(email)}
                                  className="px-2 py-0.5 text-[9px] font-bold bg-rose-600 hover:bg-rose-750 text-white rounded-md transition cursor-pointer"
                                >
                                  {lang === "bn" ? "নিশ্চিত" : "Revoke"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmRevokeEmail(null)}
                                  className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition cursor-pointer"
                                >
                                  {lang === "bn" ? "বাদ" : "X"}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmRevokeEmail(email)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 transition cursor-pointer shrink-0"
                                title={t.adminManageRevokeBtn}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}

                        {adminEmails.filter(email => email !== "sonjoyseo@gmail.com").length === 0 && (
                          <p className="text-[10px] text-slate-400 text-center py-2 italic font-medium">
                            {t.adminManageEmptyList}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Campaign instructions guidelines card */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-sm border border-slate-800 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-4xl pointer-events-none font-bold select-none">
                    ⚖️
                  </div>
                  <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-400" />
                    {t.rulesTitle}
                  </h3>
                  <ul className="text-xs space-y-2.5 text-slate-300 list-inside leading-relaxed list-decimal">
                    <li>{t.rulesDesc1}</li>
                    <li>{t.rulesDesc2}</li>
                    <li>{t.rulesDesc3}</li>
                    <li>{t.rulesDesc4}</li>
                  </ul>
                </div>
              </div>

              {/* Split Section 2: Dashboard/Newsfeed listings and Analytics Column (Span 7) */}
              <div className="lg:col-span-7">
                <ReportDashboard 
                  reports={reports} 
                  isAdmin={isAdmin} 
                  onRefresh={loadReportsData} 
                  isRefreshing={isRefreshing}
                  lang={lang}
                />
              </div>

            </div>

            {/* Banner with explanations and automated interval countdown representation - Relocated to the bottom */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-500/0 rounded-2xl border border-emerald-500/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-8">
              <div className="flex items-start gap-3.5">
                <span className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 mt-0.5 shrink-0">
                  <Info className="w-5 h-5" />
                </span>
                <div className="space-y-1">
                  <h2 className="text-sm font-black text-slate-800">{t.howItWorksTitle}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {t.howItWorksDesc}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end justify-center shrink-0 bg-white/40 md:bg-transparent p-3 md:p-0 rounded-xl border border-dotted border-slate-200 md:border-0">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  {t.autoRefreshText}
                </div>
                <span className="text-[12px] font-black text-emerald-600 font-mono mt-0.5">
                  {formatCountdown(secondsUntilUpdate)}
                </span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* 4. Global Footer with Admin Login Action Toggle */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 font-medium">
            <span>{t.footerCopyright}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!isAdmin ? (
              <button
                id="footer-admin-login-btn"
                onClick={() => {
                  setLoginError("");
                  setShowLoginModal(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all font-bold cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                {t.adminLoginBtn}
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 transition-all font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.adminLogoutBtn}
              </button>
            )}
            
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{t.footerVibeSignature}</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse shrink-0" />
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Sleek Admin Modal Presentation (Popup form) */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 border border-slate-100 shadow-2xl relative overflow-hidden text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-100">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800">{t.adminModalTitle}</h3>
                <p className="text-xs text-slate-500">{t.adminModalDesc}</p>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                
                {/* Field 1: Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">{t.adminEmailLabel}</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sonjoyseo@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-800"
                  />
                </div>

                {/* Field 2: Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">{t.adminPasswordLabel}</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-800"
                  />
                </div>

                {/* Notification error warnings */}
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-start gap-1.5 leading-normal">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Login triggers */}
                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition cursor-pointer text-sm"
                >
                  {t.adminSubmitBtn}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
