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
            // Sort domains by total time spent
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

// Function to format time as hours, minutes, and seconds
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Update the popup when it's opened
document.addEventListener('DOMContentLoaded', () => {
    updatePopup();

    // Ensure the time is updated in real-time every second while the popup is open
    setInterval(updatePopup, 1000);
});
