import React, { useState, useMemo, useRef, useEffect } from "react";
import { submitReport, FacebookReport } from "../lib/firebase";
import { translations } from "../lib/translations";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  Link2, 
  HelpCircle,
  FileText,
  AlertCircle,
  Clock,
  Layers
} from "lucide-react";

interface ReportFormProps {
  onSuccessSubmit: () => void;
  reports?: FacebookReport[];
  lang: "bn" | "en";
}

// Simple Levenshtein implementation supporting multilingual comparison (Bangla & English)
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Custom similarity metric returning between 0.0 and 1.0
function getSimilarityScore(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  
  // Custom prefix / substring boost: if one includes the other, prioritize highly
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.7 + (Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length)) * 0.3;
  }
  
  const distance = getLevenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
}

export default function ReportForm({ onSuccessSubmit, reports = [], lang }: ReportFormProps) {
  const t = translations[lang];

  const [facebookLink, setFacebookLink] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSuggestionsMenu, setShowSuggestionsMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggests menu if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestionsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set default suggested campaign categories tags
  const defaultSuggestedCategories = lang === "bn" ? [
    "অপপ্রচার ও গুজব",
    "অশ্লীল ছবি/ভিডিও",
    "ঘৃণাসূচক বক্তব্য",
    "সহিংসতা ও উস্কানি",
    "স্প্যাম বা প্রতারণা",
    "অনলাইন হয়রানি"
  ] : [
    "Rumors & Slurs",
    "Inappropriate Media",
    "Hate Speech",
    "Provocative Speech",
    "Spam & Fraud",
    "Cyber Harassment"
  ];

  // Extract unique categories from previously submitted reports in DB
  const uniqueDBByQuery = useMemo(() => {
    const list = new Set<string>();
    reports.forEach(r => {
      if (r.category && r.category.trim()) {
        list.add(r.category.trim());
      }
    });
    return Array.from(list);
  }, [reports]);

  // Combined full category list index for active matching search suggestions
  const allCategoryOptions = useMemo(() => {
    const lowerMap = new Map<string, string>();
    
    // Seed defaults first
    defaultSuggestedCategories.forEach(cat => {
      const trimmed = cat.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !lowerMap.has(lower)) {
        lowerMap.set(lower, trimmed);
      }
    });

    // Then add dynamic categories from the database of previously flagged reports
    uniqueDBByQuery.forEach(cat => {
      const trimmed = cat.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed) {
        if (!lowerMap.has(lower)) {
          lowerMap.set(lower, trimmed);
        }
      }
    });

    return Array.from(lowerMap.values());
  }, [defaultSuggestedCategories, uniqueDBByQuery]);

  // Spell analysis & distance closeness ranking to suggest matched previous categories
  const categorySpellSuggestions = useMemo(() => {
    const queryTerm = category.trim();
    
    // If the input is empty or has only whitespace, show default suggestions as a list to let them click immediately
    if (!queryTerm) {
      return allCategoryOptions.map(cat => ({ 
        name: cat, 
        score: 1.0, 
        isDefaultList: true 
      })).slice(0, 8); // Show up to 8 nice options
    }
    
    return allCategoryOptions
      .map(cat => {
        const lowerCat = cat.toLowerCase();
        const lowerQuery = queryTerm.toLowerCase();
        
        let score = 0;
        if (lowerCat === lowerQuery) {
          score = 1.0;
        } else if (lowerCat.startsWith(lowerQuery)) {
          score = 0.9;
        } else if (lowerCat.includes(lowerQuery)) {
          score = 0.8;
        } else {
          score = getSimilarityScore(queryTerm, cat);
        }
        
        return { name: cat, score, isDefaultList: false };
      })
      // Keep only matches above a reasonable confidence threshold which do not exactly match what is typed
      .filter(item => item.score > 0.25 && item.name.toLowerCase() !== queryTerm.toLowerCase())
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Show top 8 related matches or scrollable
  }, [category, allCategoryOptions]);

  const validateInputs = () => {
    if (!facebookLink.trim()) {
      return lang === "bn" 
        ? "দয়া করে ফেসবুক পোস্টের লিংকটি প্রবেশ করান।" 
        : "Please enter the Facebook post URL.";
    }
    
    const lowerLink = facebookLink.toLowerCase();
    const isFB = lowerLink.includes("facebook.com") || 
                  lowerLink.includes("fb.watch") || 
                  lowerLink.includes("fb.com") || 
                  lowerLink.includes("facebook.share");
                  
    if (!isFB) {
      return lang === "bn"
        ? "এটি একটি সঠিক ফেসবুক লিংক নয়। অনুগ্রহ করে সঠিক Facebook বা fb.com লিংক দিন।"
        : "This doesn't look like a valid Facebook URL. Please check.";
    }

    if (!category.trim()) {
      return lang === "bn"
        ? "দয়া করে পোস্টের ক্যাটাগরি লিখুন বা নিচের পরামর্শ থেকে বেছে নিন।"
        : "Please specify or choose a category for this post.";
    }

    // description is strictly optional now!
    // But if they did type something, validate length slightly to prevent junk single characters, otherwise it is allowed to be empty.
    if (description.trim() && description.trim().length < 3) {
      return lang === "bn"
        ? "রিপোর্টের বিবরণ লিখলে সেটি অন্তত ৩টি অক্ষরের হতে হবে (অথবা খালি রাখতে পারেন)।"
        : "Listed notes must contain at least 3 characters or be left completely empty.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Notes is optional now, so if empty, we write a friendly placeholder or clear empty string
      const finalNotes = description.trim() || "";
      await submitReport(facebookLink.trim(), category.trim(), finalNotes);
      setSuccess(true);
      setFacebookLink("");
      setCategory("");
      setDescription("");
      onSuccessSubmit();
      
      setTimeout(() => setSuccess(false), 6000);
    } catch (err: any) {
      setError(lang === "bn" 
        ? "ডেটাবেসে রিপোর্ট জমা দেওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।" 
        : "Could not save report to the Firestore database. Please retry.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 border-l-8 border-l-emerald-500 p-6 sm:p-8 shadow-sm transition-all">
      
      {/* Header containing positive civic tone */}
      <div className="flex items-start gap-3.5 mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {t.formHeaderTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {t.formHeaderDesc}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Facebook Link field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1" htmlFor="fb-link">
            {t.linkInputLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              <Link2 className="w-4.5 h-4.5" />
            </span>
            <input
              id="fb-link"
              type="text"
              required
              placeholder={t.linkInputPlaceholder}
              value={facebookLink}
              onChange={(e) => setFacebookLink(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm text-slate-800 bg-slate-50/20"
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {t.linkInputHelp}
          </p>
        </div>

        {/* Dynamic Category with Spell checking matching suggestion */}
        <div className="space-y-1.5 relative" ref={containerRef}>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1" htmlFor="fb-category">
            {t.categoryInputLabel} <span className="text-rose-500">*</span>
          </label>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              <Layers className="w-4 h-4" />
            </span>
            <input
              id="fb-category"
              type="text"
              required
              autoComplete="off"
              onFocus={() => setShowSuggestionsMenu(true)}
              placeholder={t.categoryInputPlaceholder}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setShowSuggestionsMenu(true);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm text-slate-800 bg-slate-50/20"
            />
          </div>

          {/* Spell checker matches dropdown popover */}
          <AnimatePresence>
            {showSuggestionsMenu && categorySpellSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute z-30 left-0 right-0 mt-1 bg-slate-950 text-slate-100 rounded-xl p-3.5 shadow-2xl border border-slate-800 text-xs text-left"
              >
                <span className="font-bold text-amber-400 block mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  {category.trim() === "" 
                    ? (lang === "bn" ? "সরাসরি নির্বাচন করুন বা টাইপ করুন (ক্যাটাগরি তালিকা):" : "Select or search categories (Dynamic list):") 
                    : t.categorySearchSuggestions}
                </span>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {categorySpellSuggestions.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setCategory(item.name);
                        setShowSuggestionsMenu(false);
                      }}
                      className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-800 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold text-white">{item.name}</span>
                      {item.isDefaultList ? (
                        <span className="text-[9px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                          {lang === "bn" ? "ডাটাবেজ" : "Active"}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {(item.score * 100).toFixed(0)}% match
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Capsulated default options */}
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
              {t.categoryManualTip}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {defaultSuggestedCategories.map((name, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCategory(name);
                    setShowSuggestionsMenu(false);
                  }}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition ${
                    category === name
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes (Marked specifically Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1" htmlFor="fb-description">
            <span>{t.notesInputLabel}</span>
            <span className="text-slate-400 font-normal lowercase italic text-[11px]">
              {t.notesOptionalLabel}
            </span>
          </label>
          <div className="relative">
            <textarea
              id="fb-description"
              rows={3}
              placeholder={t.notesInputPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm text-slate-800 resize-none font-sans leading-relaxed bg-slate-50/20"
            />
          </div>
        </div>

        {/* Feedback Alert Status */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-start gap-1.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex gap-2.5 items-start leading-normal"
            >
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm mb-0.5">{t.submitSuccessTitle}</span>
                {t.submitSuccessDesc}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit action */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 hover:shadow-md active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-sm shadow-xs"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t.submittingBtnText}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              {t.submitBtnText}
              <span>☘️</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
