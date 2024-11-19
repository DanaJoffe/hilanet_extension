// runs in the html web page


// Create the data
const t1 = document.getElementById('calendar_container')
__doMonthClick(t1);
const button = document.getElementById('ctl00_mp_RefreshSelectedDays');
button.click()


// Extract table data
const divElement = document.getElementById('MainDiv');
const table1 = divElement.querySelector('table'); // Find the first table within the div
const tableId = table1.id+'_innerBody'; // Get the ID of the table
console.log("Table ID:", tableId); // Log the table ID
//const table = document.getElementById('ctl00_mp_RG_Days_394219301_2024_10_reportsGrid_innerBody');
const table = document.getElementById(tableId);
const tableData = Array.from(table.rows).map(row => 
Array.from(row.cells).map(cell => cell.innerText)
);


// LOAD PYODIDE
const pyodide_index_url = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/"
const script = document.createElement("script");
script.src = pyodide_index_url + "pyodide.js"; // Adjust version as needed
script.type = "text/javascript";
document.head.appendChild(script);


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
			
			// prep params
			// Pass JavaScript variables to Python
			const jsonData = JSON.stringify(tableData, null, 2);
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

