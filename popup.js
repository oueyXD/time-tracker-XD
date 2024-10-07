function updatePopup() {
    console.log("popup.js is loaded");

    chrome.storage.local.get(['totalTime', 'dailyTime'], (result) => {
        const totalTime = result['totalTime'] || {};
        const dailyTime = result['dailyTime'] || {};
        const timeList = document.getElementById('time-list');
        const dailyList = document.getElementById('daily-list');

        if (!timeList || !dailyList) {
            console.error('Required elements with IDs "time-list" or "daily-list" not found!');
            return;
        }

        timeList.innerHTML = '';
        dailyList.innerHTML = '';

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

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
}

document.addEventListener('DOMContentLoaded', updatePopup);
