import React, { useState, useMemo } from "react";
import { FacebookReport, incrementClickCount, deleteReport, updateReport, updateCategoryGlobally } from "../lib/firebase";
import { translations } from "../lib/translations";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  Search, 
  Copy, 
  ExternalLink, 
  MousePointer, 
  BarChart3, 
  Calendar, 
  ClipboardCheck, 
  AlertCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Activity,
  Award,
  Globe,
  Filter,
  ShieldCheck,
  CheckCircle,
  Hash,
  Sliders,
  Tag,
  Settings,
  Download,
  Wrench,
  Sparkles,
  Edit2,
  Plus
} from "lucide-react";

interface ReportDashboardProps {
  reports: FacebookReport[];
  isAdmin: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  lang: "bn" | "en";
}

// Warm, hopeful positive campaign matching colors
const COLORS = [
  "#10b981", // Emerald green
  "#0ea5e9", // Sky blue
  "#ca8a04", // Darkened gold
  "#f59e0b", // Warm amber
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6"  // Teal
];

export default function ReportDashboard({ reports, isAdmin, onRefresh, isRefreshing, lang }: ReportDashboardProps) {
  const t = translations[lang];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<"table" | "newsfeed" | "categories" | "maintenance">("table");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Category manager states
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isProcessingCategoryAction, setIsProcessingCategoryAction] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState("");
  const [categoryActionSuccess, setCategoryActionSuccess] = useState("");
  
  // Maintenance states
  const [maintenanceSuccess, setMaintenanceSuccess] = useState<string | null>(null);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);
  const [isProcessingMaintenance, setIsProcessingMaintenance] = useState(false);
  
  // Toggle states for visible categorised report lists in newsfeed
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [activeCategoryFeedTab, setActiveCategoryFeedTab] = useState<string | null>(null);

  // Localized numerals formatter
  const fmtNum = (num: number | string): string => {
    if (lang === "en") return num.toString();
    const banglaDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().split('').map(digit => banglaDigits[digit] || digit).join('');
  };

  // Group by category for charts
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((report) => {
      const cat = report.category || (lang === "bn" ? "অন্যান্য" : "Other");
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [reports, lang]);

  // Unique categories for filtering dropdown list
  const uniqueCategories = useMemo(() => {
    const catSet = new Set<string>();
    reports.forEach(r => {
      if (r.category && r.category.trim()) {
        catSet.add(r.category.trim());
      }
    });
    return Array.from(catSet);
  }, [reports]);

  // Aggregate stats
  const totalClicksAcrossAll = useMemo(() => {
    return reports.reduce((sum, r) => sum + (r.clickCount || 0), 0);
  }, [reports]);

  const uniqueCategoriesCount = useMemo(() => {
    return uniqueCategories.length;
  }, [uniqueCategories]);

  // Aggregate category stats list for custom global category management
  const categoryStatsList = useMemo(() => {
    const stats: Record<string, { count: number; clicks: number }> = {};
    reports.forEach(r => {
      const cat = (r.category || "").trim() || (lang === "bn" ? "অন্যান্য" : "Other");
      if (!stats[cat]) {
        stats[cat] = { count: 0, clicks: 0 };
      }
      stats[cat].count += 1;
      stats[cat].clicks += (r.clickCount || 0);
    });
    return Object.entries(stats).map(([name, data]) => ({
      name,
      count: data.count,
      clicks: data.clicks
    })).sort((a, b) => b.count - a.count);
  }, [reports, lang]);

  // Group reports by category for the primary layout list
  const groupedReports = useMemo(() => {
    const groups: Record<string, FacebookReport[]> = {};
    reports.forEach(report => {
      const cat = report.category || (lang === "bn" ? "অন্যান্য" : "Other");
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(report);
    });
    
    // Sort items under each category by its original timestamp desc
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => b.timestamp - a.timestamp);
    });
    
    return groups;
  }, [reports, lang]);

  // Filtered reports for general admin tables
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = 
        report.facebookLink.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedCategory ? report.category === selectedCategory : true;
      
      return matchesSearch && matchesFilter;
    });
  }, [reports, searchTerm, selectedCategory]);

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLinkClick = async (reportId: string) => {
    if (reportId) {
      await incrementClickCount(reportId);
      // Wait a fraction of a second and trigger manual UI sync
      setTimeout(() => {
        onRefresh();
      }, 700);
    }
  };

  const triggerDelete = async (reportId: string) => {
    setDeletingId(reportId);
    try {
      await deleteReport(reportId);
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err) {
      console.error("Error deleting report: ", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Administrative command for renaming and merging duplicate category spellings
  const handleMergeCategory = async (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    setIsProcessingCategoryAction(true);
    setCategoryActionError("");
    setCategoryActionSuccess("");
    try {
      await updateCategoryGlobally(oldName, newName.trim());
      setCategoryActionSuccess(
        lang === "bn"
          ? `"${oldName}" ক্যাটাগরি সফলভাবে পরিবর্তন করে "${newName.trim()}"-এ মার্জ করা হয়েছে!`
          : `Successfully renamed and merged all "${oldName}" reports into "${newName.trim()}"!`
      );
      setEditingCategory(null);
      setNewCategoryName("");
      onRefresh();
      // Auto dismiss success alert
      setTimeout(() => setCategoryActionSuccess(""), 5000);
    } catch (err) {
      console.error("Error merging category globally:", err);
      setCategoryActionError(
        lang === "bn" 
          ? "ক্যাটাগরি মার্জ করার প্রক্রিয়া ব্যর্থ হয়েছে।" 
          : "Could not complete global category merge."
      );
    } finally {
      setIsProcessingCategoryAction(false);
    }
  };

  // Automated batch routines for system cleanup and deduplication
  const runMaintenanceAction = async (actionType: "clean_tests" | "deduplicate" | "reset_clicks") => {
    setIsProcessingMaintenance(true);
    setMaintenanceSuccess(null);
    setMaintenanceError(null);
    try {
      let deletedCount = 0;
      let resetCount = 0;

      if (actionType === "clean_tests") {
        // Scan for test words
        const testKeywords = ["test", "demo", "checking", "empty link", "পরীক্ষা", "ঢাকুর", "টেস্ট"];
        for (const report of reports) {
          if (!report.id) continue;
          const linkStr = (report.facebookLink || "").toLowerCase();
          const catStr = (report.category || "").toLowerCase();
          const descStr = (report.description || "").toLowerCase();
          
          const isTest = testKeywords.some(keyword => 
            linkStr.includes(keyword) || 
            catStr.includes(keyword) || 
            descStr.includes(keyword)
          ) || linkStr === "https://facebook.com" || linkStr === "" || catStr === "";

          if (isTest) {
            await deleteReport(report.id);
            deletedCount++;
          }
        }
        setMaintenanceSuccess(
          lang === "bn"
            ? `রক্ষণাবেক্ষণ সম্পন্ন! মোট ${fmtNum(deletedCount)}টি টেস্ট/পরীক্ষামূলক রিপোর্ট মুছে ফেলা হয়েছে।`
            : `Maintenance success! Deleted ${deletedCount} test or placeholder submissions.`
        );
      } else if (actionType === "deduplicate") {
        const seenLinks = new Set<string>();
        // Iterate backwards or sorted so oldest is preferred
        const sortedReports = [...reports].sort((a, b) => a.timestamp - b.timestamp);
        for (const report of sortedReports) {
          if (!report.id) continue;
          const normalizedLink = report.facebookLink.trim().toLowerCase();
          if (seenLinks.has(normalizedLink)) {
            await deleteReport(report.id);
            deletedCount++;
          } else {
            seenLinks.add(normalizedLink);
          }
        }
        setMaintenanceSuccess(
          lang === "bn"
            ? `ডুপ্লিকেট রিমুভ সম্পন্ন! ডাটাবেজ থেকে ${fmtNum(deletedCount)}টি ডুপ্লিকেট লিঙ্ক অপসারিত হয়েছে।`
            : `Deduplication success! Extracted and deleted ${deletedCount} duplicate link reports.`
        );
      } else if (actionType === "reset_clicks") {
        for (const report of reports) {
          if (!report.id) continue;
          if ((report.clickCount || 0) > 0) {
            await updateReport(report.id, { clickCount: 0 });
            resetCount++;
          }
        }
        setMaintenanceSuccess(
          lang === "bn"
            ? `ভিজিটর কাউন্টার সফলভাবে রিসেট করা হয়েছে! ${fmtNum(resetCount)}টি রিপোর্টে কাউন্টার ০ তে সেট করা হয়েছে।`
            : `Successfully reset all counters! Cleared visitor views for ${resetCount} reports.`
        );
      }
      onRefresh();
    } catch (err) {
      console.error("Maintenance failed:", err);
      setMaintenanceError(
        lang === "bn" ? "অপারেশন প্রক্রিয়া সম্পন্ন করা যায়নি।" : "Failed to run automated systems maintenance."
      );
    } finally {
      setIsProcessingMaintenance(false);
    }
  };

  const toggleCategoryExpand = (catName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: prev[catName] === false ? true : false // default is expanded/true unless explicitly clicked off false
    }));
  };

  // Human-friendly localized Relative time converter
  const formatTimeAgo = (timestampNum: number) => {
    if (!timestampNum) return lang === "bn" ? "এইমাত্র" : "Just now";
    const now = Date.now();
    const difference = now - timestampNum;

    const mins = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (lang === "bn") {
      if (mins < 1) return "এইমাত্র";
      if (mins < 60) return `${fmtNum(mins)} মিনিট আগে`;
      if (hours < 24) return `${fmtNum(hours)} ঘণ্টা আগে`;
      return `${fmtNum(days)} দিন আগে`;
    } else {
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with updated Positive Sync Info bar */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-bold text-slate-500">
            {t.latestUpdate} <span className="text-slate-800 font-bold">{new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 rounded-xl px-4 py-2 transition cursor-pointer select-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : ""}`} />
          {isRefreshing ? t.refreshingBtn : t.refreshBtn}
        </button>
      </div>

      {/* Admin Mode Switcher Toggle Bar */}
      {isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></div>
            <span className="text-xs font-bold text-slate-300">
              {lang === "bn"
                ? "এডমিন কন্ট্রোল সেন্টার: ক্যাটাগরি মার্জ/ডিলেট করা, ব্যাকআপ ডাউনলোড এবং বাল্ক ওয়ান-ক্লিক ক্লিনআপ সুবিধা।"
                : "Admin Control Center: Instantly merge misspelled categories, clean up test entries, reset counters, and download database backups."}
            </span>
          </div>
          <div className="flex flex-wrap bg-slate-850 rounded-xl p-1 gap-1 shrink-0 border border-slate-800 justify-center">
            <button
              onClick={() => setAdminTab("table")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                adminTab === "table"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "ডাটাবেস টেবিল" : "Database Table"}</span>
            </button>
            <button
              onClick={() => setAdminTab("newsfeed")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                adminTab === "newsfeed"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "নিউজফিড মোড" : "Newsfeed View"}</span>
            </button>
            <button
              onClick={() => setAdminTab("categories")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                adminTab === "categories"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "ক্যাটাগরি কন্ট্রোল" : "Category Manager"}</span>
            </button>
            <button
              onClick={() => setAdminTab("maintenance")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                adminTab === "maintenance"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "রক্ষণাবেক্ষণ ও ব্যাকআপ" : "Maintenance & Tools"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================== GUEST BOARD / ADMIN LIVE NEWSFEED ===================== */}
      {(!isAdmin || adminTab === "newsfeed") ? (
        <div className="space-y-8">
          
          {/* 1. Public newsfeed heading list - MOVED TO THE TOP */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-md sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                {t.newsfeedTitle}
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                {t.newsfeedDesc}
              </p>
            </div>

            {Object.keys(groupedReports).length === 0 ? (
              <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-3xs">
                <CheckCircle className="w-14 h-14 mx-auto mb-4 opacity-50 text-emerald-500" />
                <p className="text-sm font-bold text-slate-700">{t.emptyNewsfeedTitle}</p>
                <p className="text-xs mt-1 text-slate-400">{t.emptyNewsfeedDesc}</p>
              </div>
            ) : (() => {
              const activeTabName = activeCategoryFeedTab || (categoryStatsList[0]?.name || null);
              const activeCategoryReports = groupedReports[activeTabName || ""] || [];
              const activeCategoryIndex = categoryStatsList.findIndex(c => c.name === activeTabName);
              const activeColor = COLORS[activeCategoryIndex !== -1 ? activeCategoryIndex % COLORS.length : 0];

              return (
                <div className="space-y-5">
                  {/* Category Buttons Row */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 select-none no-scrollbar custom-scrollbar">
                    {categoryStatsList.map((cat, idx) => {
                      const isActive = activeTabName === cat.name;
                      const dotColor = COLORS[idx % COLORS.length];
                      return (
                        <button
                          key={cat.name}
                          onClick={() => setActiveCategoryFeedTab(cat.name)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 border shadow-2xs ${
                            isActive 
                              ? "bg-slate-900 border-slate-900 text-white font-black scale-[1.01] ring-2 ring-emerald-500/20" 
                              : "bg-white hover:bg-slate-550/10 text-slate-600 hover:text-slate-900 border-slate-200/80 hover:border-slate-300"
                          }`}
                          style={{ contentVisibility: "auto" }}
                        >
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: isActive ? "#10b981" : dotColor }} 
                          />
                          <span className="truncate max-w-[140px] sm:max-w-none">{cat.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                            isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            {fmtNum(cat.count)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Category Listing Area */}
                  {activeCategoryReports.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-3xs">
                      <p className="text-xs font-bold text-slate-500">{lang === "bn" ? "কোনো পোস্ট পাওয়া যায়নি" : "No posts found"}</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-3xs hover:border-slate-200/80 transition-all duration-300">
                      
                      {/* Active category details banner */}
                      <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeColor }} />
                          <span className="font-bold text-slate-800 text-sm sm:text-md">
                            {activeTabName}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-lg">
                          {lang === "bn" ? "মোট পোস্ট:" : "Total posts:"} <span className="text-emerald-700 font-extrabold">{fmtNum(activeCategoryReports.length)}</span>
                        </div>
                      </div>

                      {/* Active category's actual lists */}
                      <div className="divide-y divide-slate-100">
                        {activeCategoryReports.map((report, idx) => (
                          <div 
                            key={report.id}
                            className="p-5 hover:bg-slate-50/30 transition flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
                          >
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-100 text-[10px] font-black font-mono">
                                  {fmtNum(idx + 1)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wide">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {t.timeAgoLabel} {formatTimeAgo(report.timestamp)}
                                </span>
                              </div>

                              {/* Notes section */}
                              {report.description && report.description.trim() ? (
                                <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100/50 max-w-2xl">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                                    {t.descriptionLabel}
                                  </span>
                                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                                    {report.description}
                                  </p>
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-400 italic font-medium">
                                  {lang === "bn" ? "• কোনো অতিরিক্ত ডেসক্রিপশন দেওয়া হয়নি।" : "• No additional notes provided."}
                                </div>
                              )}

                              {/* Cutout facebook post link */}
                              <div className="text-[11px] text-slate-400 truncate font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 max-w-full inline-block select-all" title="Source link">
                                {report.facebookLink}
                              </div>
                            </div>

                            {/* Click actions block */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100 gap-3">
                              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 text-emerald-700 font-bold text-xs">
                                <MousePointer className="w-3.5 h-3.5 shrink-0" />
                                <span>{fmtNum(report.clickCount || 0)} {t.visitCounterText}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Copy Link */}
                                <button
                                  onClick={() => report.id && handleCopyLink(report.facebookLink, report.id)}
                                  className="p-2 text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-100/30 border border-slate-200/50 rounded-xl transition cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                                >
                                  {copiedId === report.id ? (
                                    <>
                                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-600 font-bold">{t.copiedSuccess}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>{t.copyBtn}</span>
                                    </>
                                  )}
                                </button>

                                {/* Facebook Visit direct link */}
                                <a
                                  href={report.facebookLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => report.id && handleLinkClick(report.id)}
                                  className="px-3 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition inline-flex items-center gap-1 cursor-pointer text-xs font-bold shadow-xs flex-nowrap"
                                >
                                  <span className="whitespace-nowrap">{t.viewPostLabel}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>

                                {/* Admin Delete */}
                                {isAdmin && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {confirmDeleteId === report.id ? (
                                      <>
                                        <button
                                          onClick={() => report.id && triggerDelete(report.id)}
                                          disabled={deletingId === report.id}
                                          className="px-2.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-750 text-white rounded-xl transition cursor-pointer"
                                        >
                                          {deletingId === report.id ? "..." : (lang === "bn" ? "নিশ্চিত" : "Sure?")}
                                        </button>
                                        <button
                                          onClick={() => setConfirmDeleteId(null)}
                                          className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                                        >
                                          {lang === "bn" ? "না" : "x"}
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => report.id && setConfirmDeleteId(report.id)}
                                        className="px-3 py-2 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition cursor-pointer inline-flex items-center gap-1 text-xs font-bold shrink-0 shadow-3xs duration-200"
                                        title={lang === "bn" ? "পোস্টটি মুছে ফেলুন" : "Remove post"}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>{lang === "bn" ? "ডিলিট" : "Delete"}</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="border-t border-slate-100 my-6 pt-6"></div>

          {/* 2. Quick positive campaign campaign-wide high contrast metrics cards - MOVED TO THE BOTTOM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 border border-slate-100 rounded-2xl p-5 shadow-3xs relative overflow-hidden flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">{t.totalReports}</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block">
                  {fmtNum(reports.length)}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-500/5 to-sky-500/0 border border-slate-100 rounded-2xl p-5 shadow-3xs relative overflow-hidden flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                <MousePointer className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">{t.totalClicksAcrossAll}</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block">
                  {fmtNum(totalClicksAcrossAll)}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/0 border border-slate-100 rounded-2xl p-5 shadow-3xs relative overflow-hidden flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">{t.uniqueCategoriesText}</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block">
                  {fmtNum(uniqueCategoriesCount)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Interactive Live Activity Charts section - MOVED TO THE BOTTOM */}
          {reports.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-3xs">
              <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                {t.analyticsTitle}
              </h4>
              <div className="h-56 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(v) => fmtNum(v)}
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(v: any) => [fmtNum(v), t.reportsColHeader]}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      ) : (
        // ===================== ADMIN CONSOLE AREA =====================
        // ===================== ADMIN CONSOLE AREA =====================
        <div className="space-y-6">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-full bg-rose-600 text-white flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-800 leading-tight">
                  {t.adminPortalActive}
                </h4>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  {lang === "bn"
                    ? "অনুমোদিত এডমিন প্যানেল: ডাটাবেস টেবিল কন্ট্রোল, ক্যাটাগরি স্পেলিং মার্জ এবং সিস্টেম মেইনটেন্যান্স।"
                    : "Authorized Admin Actions, deletion, category mergers and cross-database systems maintenance."}
                </p>
              </div>
            </div>
          </div>

          {/* Render views according to selected category tab */}
          {adminTab === "table" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-4">
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search label */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Search className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-xs text-slate-800"
                  />
                </div>

                {/* Filtering dropdown selections */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase">
                    <Filter className="w-3.5 h-3.5" />
                    Filter:
                  </span>
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white cursor-pointer"
                  >
                    <option value="">{t.allCategoriesFilter}</option>
                    {uniqueCategories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* List Table of records */}
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">SN</th>
                      <th className="px-4 py-3">{t.categoryCol}</th>
                      <th className="px-4 py-3">Link Preview</th>
                      <th className="px-4 py-3 text-center">{t.visitorsColHeader}</th>
                      <th className="px-4 py-3 text-center">Added</th>
                      <th className="px-4 py-3 text-center w-28">{t.actionsColHeader}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-bold">
                          No matching reports found with active parameters.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report, idx) => (
                        <tr key={report.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3 font-bold text-center text-slate-400">
                            {fmtNum(idx + 1)}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-950">
                            {report.category}
                          </td>
                          <td className="px-4 py-3 max-w-xs sm:max-w-md">
                            <div className="truncate font-mono text-slate-400 select-all mb-1 hover:text-rose-600 transition" title={report.facebookLink}>
                              {report.facebookLink}
                            </div>
                            {report.description ? (
                              <p className="text-slate-600 truncate max-w-xs">{report.description}</p>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No notes</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-600 text-sm">
                            {fmtNum(report.clickCount || 0)}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-400 whitespace-nowrap">
                            {formatTimeAgo(report.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {confirmDeleteId === report.id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => report.id && triggerDelete(report.id)}
                                  disabled={deletingId === report.id}
                                  className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-750 transition cursor-pointer"
                                >
                                  {deletingId === report.id ? "..." : (lang === "bn" ? "নিশ্চিত" : "Sure?")}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                                >
                                  {lang === "bn" ? "না" : "x"}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => report.id && setConfirmDeleteId(report.id)}
                                className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg px-2.5 py-1.5 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{t.deleteReportText}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === "categories" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-4.5 h-4.5 text-rose-500" />
                    <span>{lang === "bn" ? "ক্যাটাগরি বানান ঠিক করা ও মার্জিং টুল" : "Category Correctness & Global Mergers"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === "bn" 
                      ? "বানান ভুল থাকা ক্যাটাগরিগুলোকে সহজেই সঠিক বানানে মার্জ করুন। এটি ডাটাবেসের সবগুলো পোস্টকে এক গ্রুপে নিয়ে আসবে।" 
                      : "Easily merge close spelling variants (like 'politicss' and 'Politics') globally. All matching posts inside Firestore automatically update."}
                  </p>
                </div>
                <span className="text-[11px] bg-rose-50 text-rose-700 rounded-full px-3 py-1 font-black shrink-0 self-start">
                  {lang === "bn" ? `মোট ${fmtNum(categoryStatsList.length)}টি ক্যাটাগরি সচল` : `${categoryStatsList.length} Categories`}
                </span>
              </div>

              {categoryActionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-bold animate-pulse">
                  {categoryActionSuccess}
                </div>
              )}
              {categoryActionError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl font-bold">
                  {categoryActionError}
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">{lang === "bn" ? "ক্যাটাগরি নাম" : "Category Name"}</th>
                      <th className="px-4 py-3 text-center">{lang === "bn" ? "মোট পোস্ট" : "Total Posts"}</th>
                      <th className="px-4 py-3 text-center">{lang === "bn" ? "ভিজিটর ভিউ" : "Total Visitor's View"}</th>
                      <th className="px-4 py-3 text-right">{lang === "bn" ? "কন্ট্রোল অ্যাকশন" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {categoryStatsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-slate-400 font-bold">
                          {lang === "bn" ? "ডাটাবেজে কোনো ক্যাটাগরি তৈরি হয়নি।" : "No categories in active database records matches."}
                        </td>
                      </tr>
                    ) : (
                      categoryStatsList.map((cat, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 transition">
                          <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                            {editingCategory === cat.name ? (
                              <div className="flex items-center gap-1.5 max-w-sm">
                                <input
                                  type="text"
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  placeholder={lang === "bn" ? "সঠিক নামটি লিখুন" : "Enter Correct Name"}
                                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white w-full"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleMergeCategory(cat.name, newCategoryName)}
                                  disabled={isProcessingCategoryAction}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition shrink-0"
                                >
                                  {isProcessingCategoryAction ? "..." : (lang === "bn" ? "গ্রুপ মার্জ" : "Merge")}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCategory(null);
                                    setNewCategoryName("");
                                  }}
                                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold cursor-pointer transition shrink-0"
                                >
                                  {lang === "bn" ? "বাদ" : "Cancel"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{cat.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700 text-xs text-slate-700">
                            {fmtNum(cat.count)}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-600 text-xs">
                            {fmtNum(cat.clicks)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingCategory !== cat.name && (
                              <button
                                onClick={() => {
                                  setEditingCategory(cat.name);
                                  setNewCategoryName(cat.name);
                                }}
                                className="inline-flex items-center gap-1.5 font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-100 hover:border-rose-600 rounded-lg px-2.5 py-1.5 transition cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>{lang === "bn" ? "বানান ঠিক / মার্জ করুন" : "Rename / Merge"}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === "maintenance" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4.5 h-4.5 text-rose-500" />
                  <span>{lang === "bn" ? "রক্ষণাবেক্ষণ, বাল্ক স্ক্রিপ্ট ও ব্যাকআপ রিকভারি" : "Database Maintenance & Backup Recovery"}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === "bn" 
                    ? "আপনার ডাটাবেজ সুরক্ষিত ও পরিষ্কার রাখতে রোবোটিক স্ক্রিপ্টগুলো ওয়ান-ক্লিকে ট্রিগার করুন এবং ব্যাকআপ নিন।" 
                    : "Instantly clean database submissions, merge duplicated items, reset metrics, or download raw formats."}
                </p>
              </div>

              {maintenanceSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{maintenanceSuccess}</span>
                </div>
              )}
              {maintenanceError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{maintenanceError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Maintenance action 1 */}
                <div className="p-4 border border-slate-100 rounded-xl hover:border-rose-100 transition space-y-3 bg-slate-50/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{lang === "bn" ? "টেস্ট বা ফালতু তথ্য মোছা" : "Bulk Test Data Cleanup"}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {lang === "bn" 
                          ? "যে সব রিপোর্টে 'test', 'demo', 'পরীক্ষা', 'টেস্ট' ইত্যাদি শব্দ আছে তা স্বয়ংক্রিয়ভাবে মুছে ফেলুন।" 
                          : "Deletes listings filled with testing keywords (test, demo, checking) or empty URLs in Firestore."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে সকল টেস্ট বা ডেমো রিপোর্ট মুছে ফেলতে চান? এটি ডাটাবেস থেকে স্থায়িভাবে রিমুভ হবে।" : "Confirm test database cleanup? This will permanently delete matches.")) {
                        runMaintenanceAction("clean_tests");
                      }
                    }}
                    disabled={isProcessingMaintenance}
                    className="w-full text-center bg-white hover:bg-rose-50 hover:text-rose-700 font-bold border border-slate-200 hover:border-rose-200 transition text-[11px] py-2 rounded-lg cursor-pointer"
                  >
                    {isProcessingMaintenance ? "..." : (lang === "bn" ? "টেস্ট ক্লিনআপ স্ক্রিপ্ট রান করুন" : "Wipe Test Submissions")}
                  </button>
                </div>

                {/* Maintenance action 2 */}
                <div className="p-4 border border-slate-100 rounded-xl hover:border-rose-100 transition space-y-3 bg-slate-50/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{lang === "bn" ? "ডুপ্লিকেট লিঙ্ক অপসারন" : "Link-Based Deduplication"}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {lang === "bn" 
                          ? "একই ফেসবুক পোস্ট যদি ভুলবশত একাধিকবার যোগ করা হয়ে থাকে তবে ডুপ্লিকেটগুলো মুছে দিয়ে ডাটা সুরক্ষিত রাখবে।" 
                          : "Auto-scans full listings, groups records with identical Facebook URLs, keeping only the earliest entry."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(lang === "bn" ? "আপনি কি লিঙ্ক ডুপ্লিকেট রিমুভ করার স্ক্রিপ্ট রান করতে চান? এটি একাধিক সাবমিশন হওয়া লিঙ্ক মুছে ফেলবে।" : "Execute duplicate link cleanup loop?")) {
                        runMaintenanceAction("deduplicate");
                      }
                    }}
                    disabled={isProcessingMaintenance}
                    className="w-full text-center bg-white hover:bg-amber-50 hover:text-amber-700 font-bold border border-slate-200 hover:border-amber-200 transition text-[11px] py-2 rounded-lg cursor-pointer"
                  >
                    {isProcessingMaintenance ? "..." : (lang === "bn" ? "ডুপ্লিকেট রিমুভার রান করুন" : "Find & Wipe Duplicates")}
                  </button>
                </div>

                {/* Maintenance action 3 */}
                <div className="p-4 border border-slate-100 rounded-xl hover:border-rose-100 transition space-y-3 bg-slate-50/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{lang === "bn" ? "ভিজিটর ক্লিক কাউন্টার রিসেট" : "Reset Click Counters"}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {lang === "bn" 
                          ? "সব রিপোর্টের ফেসবুক ভিজিটর ক্লিক করার সংখ্যা পুনরায় ০ তে রিসেট করতে পারবেন।" 
                          : "Sets click counts back to 0 for all reported links in the database of campaign targets."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে সকল ক্লিক কাউন্টার শূন্য (০) করতে চান? এটি রিভার্ট করতে পারবেন না।" : "Reset visitor clicks across all listings? This will wipe the click statistics metrics back to 0.")) {
                        runMaintenanceAction("reset_clicks");
                      }
                    }}
                    disabled={isProcessingMaintenance}
                    className="w-full text-center bg-white hover:bg-emerald-50 hover:text-emerald-700 font-bold border border-slate-200 hover:border-emerald-250 transition text-[11px] py-2 rounded-lg cursor-pointer"
                  >
                    {isProcessingMaintenance ? "..." : (lang === "bn" ? "সকিল ক্লিক কাউন্টার রিসেট করুন" : "Reset All click views")}
                  </button>
                </div>

                {/* Maintenance action 4 */}
                <div className="p-4 border border-slate-100 rounded-xl hover:border-rose-100 transition space-y-3 bg-slate-50/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{lang === "bn" ? "ডাটা এক্সপোর্ট ও ব্যাকআপ (JSON / CSV)" : "Export & Backup Payload"}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {lang === "bn" 
                          ? "ডাটাবেজে যুক্ত সব রিপোর্টের মেটাডাটা সরাসরি সিএসভি (CSV/Excel) অথবা JSON ফাইল হিসেবে ডাউনলোড করুন।" 
                          : "Instantly exports active database collections in excel-compatible CSV or structured JSON format."}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const headers = ["ID", "Facebook Link", "Category", "Description", "Clicks", "Added Time"];
                        const rows = reports.map(r => [
                          r.id || "",
                          (r.facebookLink || "").replace(/"/g, '""'),
                          (r.category || "").replace(/"/g, '""'),
                          (r.description || "").replace(/"/g, '""'),
                          r.clickCount || 0,
                          new Date(r.timestamp).toISOString()
                        ]);
                        const csvContent = "\ufeff" + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                        const encodedUri = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `database_backup_${new Date().toISOString().slice(0,10)}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-center bg-white hover:bg-sky-50 hover:text-sky-700 font-bold border border-slate-200 hover:border-sky-200 transition text-[11px] py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV (Excel)</span>
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json;charset=utf-8;" });
                        const jsonString = URL.createObjectURL(blob);
                        const downloadAnchor = document.createElement("a");
                        downloadAnchor.setAttribute("href", jsonString);
                        downloadAnchor.setAttribute("download", `database_backup_${new Date().toISOString().slice(0,10)}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        document.body.removeChild(downloadAnchor);
                      }}
                      className="text-center bg-white hover:bg-slate-50 hover:text-slate-800 font-bold border border-slate-200 transition text-[11px] py-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JSON Backup</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
