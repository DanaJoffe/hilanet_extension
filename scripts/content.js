

// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "runScript") {
        main();
    }
});


// Listen for requests from `injected.js` to fetch `utils.py`
window.addEventListener("message", (event) => {
    if (event.data.action === "fetchUtils") {
        chrome.runtime.sendMessage({ action: "fetchUtils" }, (response) => {
            // Send `utils.py` content back to `injected.js` through DOM messaging
            window.postMessage({ action: "utilsContent", content: response.content }, "*");
        });
    }
});



// content.js
function injectScript(file) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file); // Get the extension URL for the injected file
    (document.head || document.documentElement).appendChild(script);
    script.onload = function() {
        script.remove(); // Clean up after the script has been injected and run
    };
}


function main() {
    console.log("content.js: main is executed!");

    // Add your content script logic here
    // Call the function to inject 'injected.js' into the web page
    injectScript('scripts/injected.js');
}








