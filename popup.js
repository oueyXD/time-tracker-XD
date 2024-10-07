function updatePopup() {
    console.log("popup.js is loaded"); // debug!!!!!!!!

    chrome.storage.local.get(['totalTime'], (result) => {
        const totalTime = result['totalTime'] || {};
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

// test from background.js function
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
}

document.addEventListener('DOMContentLoaded', updatePopup);