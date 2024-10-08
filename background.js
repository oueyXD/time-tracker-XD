let activeDomain = null;
let lastUpdate = Date.now();
let totalTime = {};
let dailyTime = {};
let dailyStart = {};

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['totalTime', 'dailyTime'], (result) => {
        totalTime = result.totalTime || {};
        dailyTime = result.dailyTime || {}; 
    });
});

function resetDailyTimeIfNeeded() {
    const currentDate = new Date().toDateString();
    chrome.storage.local.get(['dailyStartDate'], (result) => {
        if (result.dailyStartDate !== currentDate) {
            dailyTime = {};
            chrome.storage.local.set({ dailyTime, dailyStartDate: currentDate });
        }
    });
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
}

function updateTimeSpent(domain, timeSpentMs) {
    if (!domain || timeSpentMs <= 0) return;


    totalTime[domain] = (totalTime[domain] || 0) + timeSpentMs;

    dailyTime[domain] = (dailyTime[domain] || 0) + timeSpentMs;

    chrome.storage.local.set({ totalTime, dailyTime }, () => {
        console.log(`Updated time for ${domain}: Total: ${formatTime(totalTime[domain])}, Daily: ${formatTime(dailyTime[domain])}`);
    });
}

function handleTabs() {
    const currentTime = Date.now();

    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            const url = tab.url || '';

            if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;

            const domain = new URL(url).hostname.replace(/^www\./, '').split('.')[0]; // Clean domain name

            if (tab.audible || tab.active) {
                if (activeDomain && lastUpdate) {
                    const timeSpentMs = currentTime - lastUpdate;
                    updateTimeSpent(activeDomain, timeSpentMs);
                }
                activeDomain = domain; 
            }
        });
        lastUpdate = currentTime; 
    });
}

setInterval(() => {
    resetDailyTimeIfNeeded();
    handleTabs();
}, 1000);
