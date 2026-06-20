import { recordBotVisit, recordRealVisit, updateUserHeartbeat } from "./firebase";

// Robust regex pattern of popular search engine bots, crawlers, scrapers, social preview agents, and AI chatbots
const BOT_REGEX = /(googlebot|bingbot|yandexbot|baiduspider|duckduckbot|slurp|yahoo|twitterbot|facebookexternalhit|linkedinbot|embedly|quorabot|pinterest|slackbot|vkshare|wget|curl|postman|webcrawler|headless|scrape|lighthouse|screaming\s+frog|gptbot|chatgpt-user|anthropic-ai|claudebot|cohere-ai|omgilibot|perplexitybot|google-extended|applebot|meta-externalagent)/i;

export interface TrackResult {
  isBot: boolean;
  botName: string;
  visitorId: string;
}

export async function detectAndTrackVisitor(currentCategoryName: string = "None"): Promise<TrackResult> {
  const userAgent = navigator.userAgent || "";
  const isBot = BOT_REGEX.test(userAgent);
  let botName = "";

  if (isBot) {
    // Extract bot name cleanly for professional visual listing
    const match = userAgent.match(BOT_REGEX);
    botName = match ? match[0].toUpperCase() : "Search Crawler / Automated Bot";
    
    // Non-blocking log to Firestore
    recordBotVisit(botName, userAgent, window.location.href, currentCategoryName);
    
    return {
      isBot: true,
      botName,
      visitorId: ""
    };
  }

  // Generate or retrieve persistent visitor ID for real unique tracking
  let visitorId = localStorage.getItem("civic_visitor_unique_token");
  let isUnique = false;
  
  if (!visitorId) {
    visitorId = "rc_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("civic_visitor_unique_token", visitorId);
    isUnique = true;
  }

  // Generate or retrieve session level tracking token for total session count
  const sessionToken = sessionStorage.getItem("civic_visitor_session_token");
  let isNewSession = false;

  if (!sessionToken) {
    const freshSession = "s_" + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("civic_visitor_session_token", freshSession);
    isNewSession = true;
  }

  // Submit visit logs asynchronously to ensure fast page loads
  recordRealVisit(isUnique, isNewSession, visitorId);

  // Instantly dispatch initial heartbeat
  updateUserHeartbeat(visitorId);

  // Setup periodic recursive heartbeat while the user is actively browsing
  const heartbeatTimer = setInterval(() => {
    if (visitorId) {
      updateUserHeartbeat(visitorId);
    }
  }, 45 * 1000);

  // Clear timers on window close just as a clean memory practice
  window.addEventListener("beforeunload", () => {
    clearInterval(heartbeatTimer);
  });

  return {
    isBot: false,
    botName: "",
    visitorId
  };
}
