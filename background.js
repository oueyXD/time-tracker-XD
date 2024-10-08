let activeDomain = null;
let lastUpdate = Date.now();
let totalTime = {};
let dailyTime = {};
let dailyStart = {};

// Initialize storage on startup
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['totalTime', 'dailyTime'], (result) => {
        totalTime = result.totalTime || {}; // Load total time
        dailyTime = result.dailyTime || {};   // Load daily time
    });
});

// Update the daily time if needed
function resetDailyTimeIfNeeded() {
    const currentDate = new Date().toDateString();
    chrome.storage.local.get(['dailyStartDate'], (result) => {
        if (result.dailyStartDate !== currentDate) {
            dailyTime = {}; // Reset daily time for a new day
            chrome.storage.local.set({ dailyTime, dailyStartDate: currentDate }); // Save new daily time
        }
    });
}

// Format time in a readable format
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
}

// Update time spent for the given domain
function updateTimeSpent(domain, timeSpentMs) {
    if (!domain || timeSpentMs <= 0) return;

    // Update total time
    totalTime[domain] = (totalTime[domain] || 0) + timeSpentMs;

    // Update daily time
    dailyTime[domain] = (dailyTime[domain] || 0) + timeSpentMs;

    // Save to storage
    chrome.storage.local.set({ totalTime, dailyTime }, () => {
        console.log(`Updated time for ${domain}: Total: ${formatTime(totalTime[domain])}, Daily: ${formatTime(dailyTime[domain])}`);
    });
}

// Track time for all active and audible tabs
function handleTabs() {
    const currentTime = Date.now();

    // Query all tabs to track time
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            const url = tab.url || '';
            // Skip internal Chrome pages
            if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;

            const domain = new URL(url).hostname.replace(/^www\./, '').split('.')[0]; // Clean domain name

            // Check if the tab is audible or active
            if (tab.audible || tab.active) {
                if (activeDomain && lastUpdate) {
                    const timeSpentMs = currentTime - lastUpdate;
                    updateTimeSpent(activeDomain, timeSpentMs);
                }
                activeDomain = domain; // Update active domain
            }
        });
        lastUpdate = currentTime; // Update lastUpdate after checking all tabs
    });
}

// Update every second
setInterval(() => {
    resetDailyTimeIfNeeded();
    handleTabs(); // Track all tabs, including audible ones
}, 1000); // Update every second
