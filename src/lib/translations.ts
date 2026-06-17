export interface TranslationSchema {
  appTitle: string;
  appSubtitle: string;
  connected: string;
  adminPanel: string;
  howItWorksTitle: string;
  howItWorksDesc: string;
  autoRefreshText: string;
  secondsText: string;
  formHeaderTitle: string;
  formHeaderDesc: string;
  linkInputLabel: string;
  linkInputPlaceholder: string;
  linkInputHelp: string;
  categoryInputLabel: string;
  categoryInputPlaceholder: string;
  categorySearchSuggestions: string;
  categoryManualTip: string;
  notesInputLabel: string;
  notesInputPlaceholder: string;
  notesOptionalLabel: string;
  submitBtnText: string;
  submittingBtnText: string;
  submitSuccessTitle: string;
  submitSuccessDesc: string;
  rulesTitle: string;
  rulesDesc1: string;
  rulesDesc2: string;
  rulesDesc3: string;
  rulesDesc4: string;
  latestUpdate: string;
  refreshBtn: string;
  refreshingBtn: string;
  newsfeedTitle: string;
  newsfeedDesc: string;
  emptyNewsfeedTitle: string;
  emptyNewsfeedDesc: string;
  reportCountUnit: string;
  visitCountUnit: string;
  serialLabel: string;
  timeAgoLabel: string;
  descriptionLabel: string;
  visitCounterText: string;
  copyBtn: string;
  copiedSuccess: string;
  visitBtn: string;
  adminPortalActive: string;
  adminLoginBtn: string;
  adminLogoutBtn: string;
  adminModalTitle: string;
  adminModalDesc: string;
  adminEmailLabel: string;
  adminPasswordLabel: string;
  adminCredsHint: string;
  adminSubmitBtn: string;
  adminLoginError: string;
  adminConfirmDelete: string;
  adminDeleteError: string;
  footerCopyright: string;
  footerVibeSignature: string;
  adminManageSectionTitle: string;
  adminManageSectionDesc: string;
  adminManageEmailPlaceholder: string;
  adminManageAddBtn: string;
  adminManageListTitle: string;
  adminManageRevokeBtn: string;
  adminManageSuccessAdd: string;
  adminManageSuccessDelete: string;
  adminManageEmptyList: string;
  adminManageChiefLabel: string;
  companyName: string;
  
  // Analytics
  totalReports: string;
  totalClicksAcrossAll: string;
  uniqueCategoriesText: string;
  analyticsTitle: string;
  analyticsNoData: string;
  categoryCol: string;
  reportsColHeader: string;
  visitorsColHeader: string;
  actionsColHeader: string;
  allCategoriesFilter: string;
  filterByCat: string;
  searchPlaceholder: string;
  deleteReportText: string;
  backToPublicView: string;
  viewPostLabel: string;
}

export const translations: Record<"bn" | "en", TranslationSchema> = {
  bn: {
    appTitle: "সচেতন সোশ্যাল মিডিয়া ক্যাম্পেইন ও রিপোর্টার",
    appSubtitle: "FACEBOOK CONTENT SAFETY & POSITIVE CIVIC INITIATIVE",
    connected: "সংযুক্ত রয়েছে",
    adminPanel: "এডমিন প্যানেল",
    howItWorksTitle: "এটি কীভাবে কাজ করে এবং কেন করা হচ্ছে?",
    howItWorksDesc: "সুরুচিপূর্ণ, গঠনমূলক ও পজিটিভ সোশ্যাল মিডিয়া নেটওয়ার্ক গড়ে তোলার লক্ষে আমাদের এই নাগরিক সচেতনতা প্ল্যাটফর্ম। ফেসবুকে অপপ্রচার, অশ্লীলতা বা বিদ্বেষমূলক পোস্টের লিংক এখানে ডিলিট করতে সাহায্য করতে রিপোর্টিং তালিকায় যুক্ত করুন। ২ মিনিট পরপর স্বয়ংক্রিয়ভাবে আপডেট করা হয়।",
    autoRefreshText: "স্বয়ংক্রিয় ব্যাকগ্রাউন্ড আপডেট হতে বাকি:",
    secondsText: "সেকেন্ড",
    formHeaderTitle: "সচেতন রিপোর্ট ফরম",
    formHeaderDesc: "অনলাইন পরিবেশ সুন্দর রাখতে আপনার ভূমিকা অপরিসীম। অনুগ্রহ করে সঠিক ফেসবুক পোস্টের ওয়েব লিংক সাবমিট করুন।",
    linkInputLabel: "ফেসবুক পোস্টের লিংক",
    linkInputPlaceholder: "https://www.facebook.com/posts/... অথবা fb.com/ভিডিও...",
    linkInputHelp: "সরাসরি ফেসবুক পোস্ট বা ভিডিওর সঠিক ওয়েব লিংকটি নিচে কপি করে দিন।",
    categoryInputLabel: "পোস্টের ক্যাটাগরি",
    categoryInputPlaceholder: "যেমন: অপপ্রচার, সাম্প্রদায়িক উস্কানি, অর্থহীন ট্রোল, অশ্লীলতা ইত্যাদি",
    categorySearchSuggestions: "পূর্ববর্তী বা মিলসম্পন্ন ক্যাটাগরি পরামর্শ (মেনু থেকে বেছে নিন):",
    categoryManualTip: "দ্রুত পরামর্শ (ক্যাপসুল ক্যাটাগরি):",
    notesInputLabel: "রিপোর্টের বিবরণ ও নোট",
    notesOptionalLabel: "(ঐচ্ছিক / না লিখলেও চলবে)",
    notesInputPlaceholder: "এটি সম্পর্কে অতিরিক্ত কোনো তথ্য দিতে চাইলে লিখতে পারেন (এটি সম্পূর্ণরূপে আপনার ইচ্ছার ওপর নির্ভর করে)...",
    submitBtnText: "লিস্টে রিপোর্ট যুক্ত করুন",
    submittingBtnText: "জমা হচ্ছে...",
    submitSuccessTitle: "রিপোর্ট লিপিবদ্ধ হয়েছে!",
    submitSuccessDesc: "আপনার সচেতনতা উদ্যোগটি সফলভাবে তালিকাভুক্ত হলো। সবার সম্মিলিত প্রয়াসে অনলাইন জগত আরও সুন্দর হবে।",
    rulesTitle: "ক্যাম্পেইন নীতি ও নাগরিক শিষ্টাচার:",
    rulesDesc1: "পোস্টের সঠিক লিংক কপি করা নিশ্চিত করুন যাতে অন্য নাগরিকরা সহজেই পর্যবেক্ষণ করতে পারে।",
    rulesDesc2: "কোনোভাবেই ব্যক্তিগত আক্রোশ চরিতার্থ করার উদ্দেশ্যে কাউকে হয়রানি করার জন্য রিপোর্ট দিবেন না।",
    rulesDesc3: "ক্যাটাগরি লেখার সুবিধার্থে ক্যাপিটালাইজেশন বা বাংলা-ইংরেজি মিশ্রণ এড়িয়ে স্পষ্ট শব্দ ব্যবহারে গুরুত্ব দিন।",
    rulesDesc4: "নোট বা বিবরণ ক্ষেত্রটি সম্পূর্ণ ঐচ্ছিক, প্রয়োজনে এটি ফাঁকা রেখে সহজে ও দ্রুত রিপোর্ট সাবমিট করা যাবে।",
    latestUpdate: "সর্বশেষ লাইভ আপডেট:",
    refreshBtn: "ম্যানুয়ালি রিফ্রেশ",
    refreshingBtn: "লোড হচ্ছে...",
    newsfeedTitle: "ক্যাটাগরিভিত্তিক নাগরিক পর্যবেক্ষণ লিস্ট",
    newsfeedDesc: "নিচের তালিকায় সাজানো ক্যাটাগরিগুলোতে ক্লিক করে সংশ্লিষ্ট ক্ষতিকর পোস্টগুলো সিরিয়াল অনুযায়ী দেখুন এবং প্রয়োজনে যথাযথ প্ল্যাটফর্মে রিপোর্ট করার প্রস্তুতি নিন।",
    emptyNewsfeedTitle: "এখনো কোনো রিপোর্ট জমা পড়েনি",
    emptyNewsfeedDesc: "সমস্ত অপপ্রচার পেরিয়ে সুন্দর সমাজ গড়তে এগিয়ে আসুন। বাম পাশের সহজ ফরম ব্যবহার করে প্রথম রিপোর্টটি ক্যাম্পেইন তালিকাভুক্ত করুন।",
    reportCountUnit: "টি রিপোর্ট",
    visitCountUnit: "বার পর্যবেক্ষণ",
    serialLabel: "সিরিয়াল নং:",
    timeAgoLabel: "যুক্ত হয়েছে:",
    descriptionLabel: "রিপোর্টের বিবরণ:",
    visitCounterText: "বার ভিজিট করা হয়েছে",
    copyBtn: "কপি লিংক",
    copiedSuccess: "কপি হয়েছে!",
    visitBtn: "ফেসবুক লিংকে যান",
    adminPortalActive: "এডমিন সিকিউর প্যানেল সক্রিয় রয়েছে",
    adminLoginBtn: "এডমিন লগইন",
    adminLogoutBtn: "লগআউট এডমিন",
    adminModalTitle: "এডমিন প্যানেলে লগইন করুন",
    adminModalDesc: "অনুগ্রহ করে ক্যাম্পেইন ড্যাশবোর্ড মডারেশনের জন্য নিজস্ব ক্রেডেনশিয়াল দিন।",
    adminEmailLabel: "এডমিন ইমেইল",
    adminPasswordLabel: "এডমিন পাসওয়ার্ড",
    adminCredsHint: "পরীক্ষার সুবিধার্থে ক্রেডেনশিয়াল:",
    adminSubmitBtn: "প্রবেশ করুন",
    adminLoginError: "ভুল ইমেইল অথবা পাসওয়ার্ড! দয়া করে সঠিক তথ্য দিন।",
    adminConfirmDelete: "আপনি কি নিশ্চিতভাবে এই রিপোর্টটি ডিলিট করতে চান?",
    adminDeleteError: "রিপোর্ট ডিলিট করতে গিয়ে সমস্যা হয়েছে।",
    footerCopyright: "কপিরাইট © ২০২৬ ST WEB & ADS STUDIO। সর্বস্বত্ব সংরক্ষিত।",
    footerVibeSignature: "ST WEB & ADS STUDIO দ্বারা পরিচালিত সোশ্যাল ক্যাম্পেইন",
    adminManageSectionTitle: "সার্ভার এডমিন সেটিংস",
    adminManageSectionDesc: "প্রধান এডমিন হিসেবে আপনি নতুন এডমিন ইমেইল যুক্ত বা পর্যালোচনা করতে পারবেন। এডমিনরা পাসওয়ার্ড 'again123' ব্যবহার করে লগইন করতে পারবেন।",
    adminManageEmailPlaceholder: "যেমন: member@domain.com",
    adminManageAddBtn: "নতুন এডমিন যুক্ত করুন",
    adminManageListTitle: "অনুমোদিত ইমেইল তালিকা",
    adminManageRevokeBtn: "অ্যাক্সেস বাতিল করুন",
    adminManageSuccessAdd: "এডমিন ইমেইল সফলভাবে যুক্ত করা হয়েছে!",
    adminManageSuccessDelete: "এডমিন ইমেইল নিষ্ক্রিয় করা হয়েছে।",
    adminManageEmptyList: "এখনো কোনো অতিরিক্ত এডমিন ইমেইল যুক্ত করা হয়নি।",
    adminManageChiefLabel: "প্রধান এডমিন (তত্ত্বাবধায়ক)",
    companyName: "ST WEB & ADS STUDIO",
    totalReports: "মোট অ্যাক্টিভ লিংকসমূহ",
    totalClicksAcrossAll: "মোট সচেতন ভিজিট কাউন্ট",
    uniqueCategoriesText: "অ্যাক্টিভ ক্যাটাগরি",
    analyticsTitle: "অ্যাক্টিভিটি ডাটা অ্যানালিটিক্স",
    analyticsNoData: "অ্যানালিটিক্স দেখানোর পর্যাপ্ত ডাটা উপলব্ধ নেই",
    categoryCol: "ক্যাটাগরি",
    reportsColHeader: "রিপোর্ট সংখ্যা",
    visitorsColHeader: "পরিদর্শন সংখ্যা",
    actionsColHeader: "ব্যবস্থাপনা / অ্যাকশন",
    allCategoriesFilter: "সব ক্যাটাগরি ফিল্টার",
    filterByCat: "ক্যাটাগরি বাছাই করুন",
    searchPlaceholder: "লিংক বা বিবরণ অনুসন্ধান করুন...",
    deleteReportText: "মুছে ফেলুন",
    backToPublicView: "পাবলিক ভিউতে ফিরে যান",
    viewPostLabel: "পোস্ট দেখুন"
  },
  en: {
    appTitle: "Civic Social Media Campaign & Safety Hub",
    appSubtitle: "FACEBOOK CONTENT SAFETY & POSITIVE CIVIC INITIATIVE",
    connected: "CONNECTED ONLINE",
    adminPanel: "Admin Panel",
    howItWorksTitle: "How This Works & Project Objective",
    howItWorksDesc: "This civic campaign database lists flagged social media posts spreading fake-news, harassment, or negative speech. By creating visibility, citizens can easily track and take active reporting steps. Refresh happens automatically every 2 minutes or whenever requested.",
    autoRefreshText: "Automatic background refresh in:",
    secondsText: "seconds",
    formHeaderTitle: "Flag Content Form",
    formHeaderDesc: "Your active vigilance fosters online decency. Please share the Facebook post web-link below with context.",
    linkInputLabel: "Facebook Post link",
    linkInputPlaceholder: "https://www.facebook.com/posts/... or fb.com/videos...",
    linkInputHelp: "Copy and paste the exact full URL of the post or video here.",
    categoryInputLabel: "Post Category",
    categoryInputPlaceholder: "e.g., Rumor/Fake News, Hate Speech, Extreme Harassment, Spams",
    categorySearchSuggestions: "Suggested matches from previous categories (Click to select):",
    categoryManualTip: "Quick suggestions (click to use):",
    notesInputLabel: "Details & Notes of Report",
    notesOptionalLabel: "(Optional - can be left blank)",
    notesInputPlaceholder: "Enter extra comments about what makes this post problematic (this is completely optional and can be skipped)...",
    submitBtnText: "List on Campaign Board",
    submittingBtnText: "Submitting...",
    submitSuccessTitle: "Report Listed Successfully!",
    submitSuccessDesc: "Your submission has been cataloged. Collectively, our awareness fosters a safe, helpful social environment.",
    rulesTitle: "Campaign Guidance & Civic Courtesy:",
    rulesDesc1: "Ensure you provide accurate URLs so other viewers can verify on location.",
    rulesDesc2: "Do not abuse this platform to target innocent individuals; false spamming is discouraged.",
    rulesDesc3: "Keep categories clear and concise for better clustering and readability.",
    rulesDesc4: "The description/notes field is fully optional, so you can submit reports quickly.",
    latestUpdate: "Latest Live Sync:",
    refreshBtn: "Manual SyncNow",
    refreshingBtn: "Syncing...",
    newsfeedTitle: "Community Categorized Safety Feed",
    newsfeedDesc: "Explore reports arranged by categorized tabs, review their active tracking serials, visit, and take civic action to build decency.",
    emptyNewsfeedTitle: "No reports compiled yet",
    emptyNewsfeedDesc: "Let's pioneer a safer digital ecosystem together. Use the left form to list the first report on the dashboard.",
    reportCountUnit: "reports",
    visitCountUnit: "visits",
    serialLabel: "Serial #:",
    timeAgoLabel: "Submitted:",
    descriptionLabel: "Report Notes:",
    visitCounterText: "visits accrued",
    copyBtn: "Copy Link",
    copiedSuccess: "Copied!",
    visitBtn: "See Facebook Post",
    adminPortalActive: "Secure Admin Panel Active",
    adminLoginBtn: "Admin Access",
    adminLogoutBtn: "Sign Out Admin",
    adminModalTitle: "Sign In as Admin User",
    adminModalDesc: "Provide authorized email and password keys to manage listings.",
    adminEmailLabel: "Admin Email",
    adminPasswordLabel: "Admin Password",
    adminCredsHint: "Evaluation Credentials Hint:",
    adminSubmitBtn: "Authorize",
    adminLoginError: "Incorrect email or password credentials. Please try again.",
    adminConfirmDelete: "Are you sure you want to delete this flagged report?",
    adminDeleteError: "Failed to delete from the cloud Firestore.",
    footerCopyright: "Copyright © 2026 ST WEB & ADS STUDIO. All rights reserved.",
    footerVibeSignature: "Social campaign managed by ST WEB & ADS STUDIO",
    adminManageSectionTitle: "Server Admin Configuration",
    adminManageSectionDesc: "As the Chief Admin, you can add new authorized email addresses below. Registered admins can log in using their own email and password 'again123'.",
    adminManageEmailPlaceholder: "e.g., administrator@domain.com",
    adminManageAddBtn: "Add Admin Email",
    adminManageListTitle: "Authorized Email Database",
    adminManageRevokeBtn: "Revoke Access",
    adminManageSuccessAdd: "Admin login address successfully added to database!",
    adminManageSuccessDelete: "Admin address access has been revoked successfully.",
    adminManageEmptyList: "No custom secondary administrators added yet.",
    adminManageChiefLabel: "Chief Administrator (Owner)",
    companyName: "ST WEB & ADS STUDIO",
    totalReports: "Total Shared Flags",
    totalClicksAcrossAll: "Cumulative Visit Tracks",
    uniqueCategoriesText: "Categories Active",
    analyticsTitle: "Vigilance Activity Analytics",
    analyticsNoData: "Insufficient records to plot metric charts.",
    categoryCol: "Category Name",
    reportsColHeader: "Report Count",
    visitorsColHeader: "Active Visitors",
    actionsColHeader: "Moderation Actions",
    allCategoriesFilter: "All Categories Filter",
    filterByCat: "Choose Category Group",
    searchPlaceholder: "Search links, categories, or notes...",
    deleteReportText: "Remove flag",
    backToPublicView: "Switch back to Visitor board",
    viewPostLabel: "Explore Post"
  }
};
