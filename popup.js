// Function to update the popup with time spent data
function updatePopup() {
    console.log("popup.js is loaded"); // Debugging log

    chrome.storage.local.get(['totalTime', 'dailyTime'], (result) => {
        const totalTime = result['totalTime'] || {};
        const dailyTime = result['dailyTime'] || {};
        const timeList = document.getElementById('time-list');
        const dailyList = document.getElementById('daily-list');

        if (!timeList || !dailyList) {
            console.error('Required elements with IDs "time-list" or "daily-list" not found!');
            return;
        }

        // Clear the list items before appending new data
        timeList.innerHTML = '';
        dailyList.innerHTML = '';

        // Handle Total Time
        if (Object.keys(totalTime).length === 0) {
            const listItem = document.createElement('li');
            listItem.textContent = 'No total time recorded yet.';
            timeList.appendChild(listItem);
        } else {
            for (const domain in totalTime) {
                const timeSpentMs = totalTime[domain];
                const formattedTime = formatTime(timeSpentMs);

                const listItem = document.createElement('li');
                listItem.textContent = `${domain}: ${formattedTime}`;
                timeList.appendChild(listItem);
            }
        }

        // Handle Daily Time
        if (Object.keys(dailyTime).length === 0) {
            const listItem = document.createElement('li');
            listItem.textContent = 'No daily time recorded yet.';
            dailyList.appendChild(listItem);
        } else {
            for (const domain in dailyTime) {
                const timeSpentMs = dailyTime[domain];
                const formattedTime = formatTime(timeSpentMs);

                const listItem = document.createElement('li');
                listItem.textContent = `${domain}: ${formattedTime}`;
                dailyList.appendChild(listItem);
            }
        }
    });
}

// Function to format time from milliseconds to minutes and seconds
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
}

// Trigger the popup update when the DOM content is loaded
document.addEventListener('DOMContentLoaded', updatePopup);
