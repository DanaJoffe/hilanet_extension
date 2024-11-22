// runs in the html web page


// Create the data
t1 = document.getElementById('calendar_container')
__doMonthClick(t1);
button = document.getElementById('ctl00_mp_RefreshSelectedDays');
button.click()


// Extract table data
divElement = document.getElementById('MainDiv');
table1 = divElement.querySelector('table'); // Find the first table within the div
tableId = table1.id+'_innerBody'; // Get the ID of the table
console.log("Table ID:", tableId); // Log the table ID
//const table = document.getElementById('ctl00_mp_RG_Days_394219301_2024_10_reportsGrid_innerBody');


pyodide_index_url = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/"
script = document.createElement("script");
script.src = pyodide_index_url + "pyodide.js"; // Adjust version as needed
script.type = "text/javascript";
document.head.appendChild(script);


// Define a global flag
if (!window.__scriptInjected) {
    window.__scriptInjected = true; // Mark the script as injected

    // Your code that should run only once
    console.log("__scriptInjected: Injected script is running");

    // Add your logic here
	// LOAD PYODIDE

}


function parseNestedTableToListOfLists(tableElement) {
    const data = [];
    const rows = tableElement.rows; // Get all rows of the table

    for (const row of rows) {
        const rowData = [];
        const cells = row.cells; // Get all cells in the row

        for (const cell of cells) {
            // Check if the cell contains a nested table
            const nestedTable = cell.querySelector("table");
            if (nestedTable) {
                // Recursively parse the nested table
                rowData.push(parseNestedTableToListOfLists(nestedTable));
            } else {
                rowData.push(cell.innerText.trim()); // Extract cell content
            }
        }

        data.push(rowData); // Add the row data to the main list
    }

    return data;
}







function download_json(param) {
	// Convert to JSON
	const jsonData = JSON.stringify(param, null, 4); // Pretty print with 2-space indentation
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
}

//download_json(tableData)


// async injected.js
async function loadAndUsePythonModule() {
	// Wait for the script to load
	await new Promise((resolve) => {
		script.onload = resolve;
	});
	console.log("Pyodide library loaded.");
	
	
	const pyodide = await loadPyodide({
        indexURL: pyodide_index_url // Replace with local path if needed
    });
	console.log("Pyodide loaded:", pyodide);
	
	// Request `utils.py` content via the content script
    window.postMessage({ action: "fetchUtils" }, "*");

    // Listen for the response with the content of `utils.py`
    window.addEventListener("message", async (event) => {
        if (event.data.action === "utilsContent" && event.data.content) {
            
			console.log("injected.js: utilsContent!");
			
			// parse table
			const table = document.getElementById(tableId);
			const parsedData = parseNestedTableToListOfLists(table);
			const tableData = Array.from(table.rows).map(row => 
			Array.from(row.cells).map(cell => cell.innerText)
			);
			console.log("table.rows.length:", table.rows.length);
			
			// prep params
			// Pass JavaScript variables to Python
			//const jsonData = JSON.stringify(tableData, null, 2);
			const jsonData = JSON.stringify(parsedData);
			//const param1 = "Parameter 1";
			pyodide.globals.set("js_jsonData", jsonData);
			
			await pyodide.loadPackage("pandas");
			console.log("Pyodide and Pandas are loaded and ready to use!");

            // Load and execute the `utils.py` code
            await pyodide.runPythonAsync(event.data.content);

            // Now you can call any function defined in `utils.py`
            const result = pyodide.runPython("parse(js_jsonData)"); // Example function call from `utils.py`
            console.log("Result from Python:", result);
        }
    });
	
	 
    
    
    

    // Call the Python function
    //const result = pyodide.runPython(`
    //    parse(js_param1)
    //`);

}

loadAndUsePythonModule();


	// run python
	// Now you can use `parse` directly
    //const result = pyodide.runPython("parse()");  // Adjust as needed
	//console.log("Result from Python:", result);
	
	//const result = pyodide.runPython(`
	//	import pandas as pd
	//	#data = ${JSON.stringify(tableData)}
	//	#df = pd.DataFrame(data[1:], columns=data[0])
	//	#df.describe().to_json()
	//	"dana"
	//`);
	
	//console.log('Analysis result:', result);
//})();

