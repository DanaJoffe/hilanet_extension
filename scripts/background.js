


// background.js
chrome.action.onClicked.addListener((tab) => {
    console.log("background.js: click!");
    chrome.tabs.sendMessage(tab.id, { action: "runScript" });
});
