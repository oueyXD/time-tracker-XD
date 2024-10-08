function updatePopup() {
    console.log("popup.js is loaded"); // debug!!!!!!!!

    chrome.storage.local.get(['totalTime', 'dailyTime'], (result) => {
        const totalTime = result['totalTime'] || {};
        const dailyTime = result['dailyTime'] || {};
        const timeList = document.getElementById('time-list');

        if (!timeList) {
            console.error('Element with ID "time-list" not found!');
            return;
        }

        timeList.innerHTML = ''; 
        if (Object.keys(totalTime).length === 0) {
            const listItem = document.createElement('li');
            listItem.textContent = 'No time recorded yet.';
            timeList.appendChild(listItem);
        } else {
            const domains = Object.keys(totalTime).sort((a, b) => totalTime[b] - totalTime[a]);
            for (const domain of domains) {
                const totalSpentMs = totalTime[domain];
                const dailySpentMs = dailyTime[domain] || 0;
                const formattedTotal = formatTime(totalSpentMs);
                const formattedDaily = formatTime(dailySpentMs);

                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${domain}:</strong><br>Daily: ${formattedDaily}<br>Total: ${formattedTotal}`;
                timeList.appendChild(listItem);
            }
        }
    });
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

document.addEventListener('DOMContentLoaded', () => {
    updatePopup();

    setInterval(updatePopup, 1000);
});
