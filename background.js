let activeDomain = null;
let lastUpdate = null;
let totalTime = {};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
}

function updateTimeSpent(domain, timeSpentMs) {
    if (!domain || timeSpentMs <= 0) return;
    totalTime[domain] = (totalTime[domain] || 0) + timeSpentMs;

    chrome.storage.local.set({ totalTime }, () => {
        console.log(`Updated time for ${domain}: ${formatTime(totalTime[domain])}`);
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
    if (activeDomain && lastUpdate) {
        const currentTime = Date.now();
        const timeSpentMs = currentTime - lastUpdate;
        updateTimeSpent(activeDomain, timeSpentMs);
        lastUpdate = currentTime;
    }
    handleAudibleTabs();
}, 60000);

function updateTimeSpent(domain, timeSpentMs) {
    if (timeSpentMs > 0) {
        totalTime[domain] = (totalTime[domain] || 0) + timeSpentMs;
        chrome.storage.local.set({ totalTime }, () => {
            const formattedTime = formatTime(totalTime[domain]);
            console.log(`Updated time for ${domain}: ${formattedTime}`);
            console.log(totalTime); // Add this line to check stored values
        });
    }
}
