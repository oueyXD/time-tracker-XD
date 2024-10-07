let activeDomain = null;
let lastUpdate = null;
let totalTime = {};
let dailyTime = {};
let lastSavedDate = null;

chrome.storage.local.get(['totalTime', 'dailyTime', 'lastSavedDate'], (data) => {
    if (data.totalTime) totalTime = data.totalTime;
    if (data.dailyTime) dailyTime = data.dailyTime;
    if (data.lastSavedDate) lastSavedDate = new Date(data.lastSavedDate);
});

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

function resetDailyTimeIfNeeded() {
    const currentDate = new Date();
    if (!lastSavedDate || currentDate.toDateString() !== lastSavedDate.toDateString()) {
        dailyTime = {}; // Reset daily time
        lastSavedDate = currentDate;
        chrome.storage.local.set({ dailyTime, lastSavedDate });
    }
}

function updateTimeSpent(domain, timeSpentMs) {
    if (!domain || timeSpentMs <= 0) return;

    totalTime[domain] = (totalTime[domain] || 0) + timeSpentMs;
    dailyTime[domain] = (dailyTime[domain] || 0) + timeSpentMs;

    chrome.storage.local.set({ totalTime, dailyTime }, () => {
        console.log(`Updated time for ${domain}: Total - ${formatTime(totalTime[domain])}, Daily - ${formatTime(dailyTime[domain])}`);
    });
}

function handleActiveTabChange() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0 || !tabs[0].url) return;

        const currentTab = tabs[0];
        const domain = new URL(currentTab.url).hostname;
        const currentTime = Date.now();

        if (activeDomain && lastUpdate) {
            const timeSpentMs = currentTime - lastUpdate;
            updateTimeSpent(activeDomain, timeSpentMs);
        }

        activeDomain = domain;
        lastUpdate = currentTime;

        console.log(`Active domain: ${activeDomain}, Time: ${new Date(lastUpdate)}`);
    });
}

function handleAudibleTabs() {
    const currentTime = Date.now();
    chrome.tabs.query({ audible: true }, (tabs) => {
        tabs.forEach((tab) => {
            const domain = new URL(tab.url).hostname;
            if (lastUpdate) {
                const timeSpentMs = currentTime - lastUpdate;
                updateTimeSpent(domain, timeSpentMs);
            }
        });
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' || tab.audible) {
        handleActiveTabChange();
    }
});

chrome.tabs.onActivated.addListener(handleActiveTabChange);
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE && activeDomain) {
        const currentTime = Date.now();
        const timeSpentMs = currentTime - lastUpdate;
        updateTimeSpent(activeDomain, timeSpentMs);
        activeDomain = null;
        lastUpdate = null;
    } else {
        handleActiveTabChange();
    }
});

setInterval(() => {
    resetDailyTimeIfNeeded();

    if (activeDomain && lastUpdate) {
        const currentTime = Date.now();
        const timeSpentMs = currentTime - lastUpdate;
        updateTimeSpent(activeDomain, timeSpentMs);
        lastUpdate = currentTime;
    }

    handleAudibleTabs();
}, 60000);
