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
//const script = document.createElement("script");
//script.src = "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js";
//document.head.appendChild(script);

const pyodide_index_url = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/"

const script = document.createElement("script");
script.src = pyodide_index_url + "pyodide.js"; // Adjust version as needed
script.type = "text/javascript";
document.head.appendChild(script);


// injected.js
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
			
			// Load Pyodide
            //const pyodide = await loadPyodide({indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/"});
			await pyodide.loadPackage("pandas");
			console.log("Pyodide and Pandas are loaded and ready to use!");

            // Load and execute the `utils.py` code
            await pyodide.runPythonAsync(event.data.content);

            // Now you can call any function defined in `utils.py`
            const result = pyodide.runPython("parse()"); // Example function call from `utils.py`
            console.log("Result from Python:", result);
        }
    });
	
	
	//////

	

    //const result = pyodide.runPython("parse()");  // Replace with the actual function call
    //console.log(result);
}


loadAndUsePythonModule();

//(async () => {
	// Wait for the script to load
    //await new Promise((resolve) => {
    //    script.onload = resolve;
    //});
	//console.log("Script loaded successfully!");
	
	
	/////////////////////////////////////////////////////////////////////////////////////



	/////////////////////////////////////////////////////////////////////////////////////
	
	
	
	// Load Pyodide with the indexURL parameter
	//const pyodide = await loadPyodide({indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"});
	//console.log("pyodide loaded successfully!");
	
	// Load the pandas package
	//await pyodide.loadPackage("pandas");
	//console.log("Pyodide and Pandas are loaded and ready to use!");
	
	// Fetch and load the contents of utils.py
    //const response = await fetch("scripts/utils.py");
    //const utilsCode = await response.text();
    
	// Run the code in Pyodide, which makes `parse` accessible in the Python environment
    //await pyodide.runPythonAsync(utilsCode);
	
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

