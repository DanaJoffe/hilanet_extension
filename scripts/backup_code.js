



// LOAD PYODIDE
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js";
document.head.appendChild(script);
// Wait for the script to load
await new Promise((resolve) => {
	script.onload = resolve;
});
// Load Pyodide with the indexURL parameter
const pyodide = await loadPyodide({indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"});
// Load the pandas package
await pyodide.loadPackage("pandas");
// Confirm that Pyodide and Pandas are ready to use
console.log("Pyodide and Pandas are loaded and ready to use!");





///// save in JSON
// Convert to JSON
    const jsonData = JSON.stringify(tableData, null, 2); // Pretty print with 2-space indentation

    // Create a Blob from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a link to download the Blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tableData.json'; // Set the filename for download
    document.body.appendChild(a); // Append link to the body
    a.click(); // Programmatically click the link to trigger the download
    document.body.removeChild(a); // Remove the link from the document
    URL.revokeObjectURL(url); // Clean up the URL object
/////





// Run Python code with Pyodide
const result = pyodide.runPython(`
	import pandas as pd
	data = ${JSON.stringify(tableData)}
	df = pd.DataFrame(data[1:], columns=data[0])
	df.describe().to_json()
`);
console.log('Analysis result:', result);



const result = pyodide.runPython(`
	import pandas as pd
	data = ${JSON.stringify(tableData)}
	df = pd.DataFrame(data[1:], columns=data[0])
	df.describe().to_json()
`);
console.log('Analysis result:', result);



// Convert to JSON
const jsonData = JSON.stringify(tableData);

// Log the JSON output
console.log(jsonData);



// manifest
  "permissions": ["activeTab"],
  
  
  
  
  
  
  // background.js
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: myFunctionToRun
    });
});

function myFunctionToRun() {
    console.log("Script activated by icon click!");
    // Add any additional code you want to run here
}

// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchUtils") {
        fetch(chrome.runtime.getURL("scripts/utils.py"))
            .then(response => response.text())
            .then(data => {
                sendResponse({ content: data });
            })
            .catch(error => {
                console.error("Failed to fetch utils.py:", error);
                sendResponse({ error: "Failed to fetch utils.py" });
            });
        return true; // Keeps the message channel open for asynchronous response
    }
});

	// Request the content of utils.py from background.js
    const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "fetchUtils" }, (response) => {
            if (chrome.runtime.lastError || response.error) {
                reject("Error fetching utils.py");
            } else {
                resolve(response.content);
            }
        });
    });
	