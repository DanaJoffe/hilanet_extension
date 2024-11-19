


// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchUtils") {
		console.log("background.js: fetchUtils!");
        // Fetch `utils.py` content
        fetch(chrome.runtime.getURL("scripts/utils.py"))
            .then(response => response.text())
            .then(data => {
                sendResponse({ content: data });
            })
            .catch(error => {
                console.error("Error fetching utils.py:", error);
                sendResponse({ error: "Failed to fetch utils.py" });
            });
        return true; // Keep the message channel open for asynchronous response
    }
});



// background.js
chrome.action.onClicked.addListener((tab) => {
    console.log("background.js: click!");
    chrome.tabs.sendMessage(tab.id, { action: "runScript" });
});


