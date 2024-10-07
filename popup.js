function updatePopup() {
    chrome.storage.local.get([STORAGE_KEY_TOTAL_TIME], (result) => {
        const totalTime = result[STORAGE_KEY_TOTAL_TIME] || {};
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
            for (const domain in totalTime) {
                const timeSpentMs = totalTime[domain];
                const formattedTime = formatTime(timeSpentMs);

                const listItem = document.createElement('li');
                listItem.textContent = `${domain}: ${formattedTime}`;
                timeList.appendChild(listItem);
            }
        }
    });
}
