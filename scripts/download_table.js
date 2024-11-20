// backup code


// Create the data
const t1 = document.getElementById('calendar_container')
//const t2 = $get('calendar_container')

"ScriptResource.axd?d=WjYF7OdbTjyi3X3XLVf2LRbvj3vBkvGl08ZI2ypmCzwn2IzBXRTZ0dDWmANss22PzN91lwnqdUByrr…"

__doMonthClick(t1);
const button = document.getElementById('ctl00_mp_RefreshSelectedDays');
button.click()

// Extract table data
const divElement = document.getElementById('MainDiv');
const table1 = divElement.querySelector('table'); // Find the first table within the div
const tableId = table1.id+'_innerBody'; // Get the ID of the table
console.log("Table ID:", tableId); // Log the table ID
//
//const table = document.getElementById('ctl00_mp_RG_Days_394219301_2024_10_reportsGrid_innerBody');
const table = document.getElementById(tableId);
const tableData = Array.from(table.rows).map(row => 
Array.from(row.cells).map(cell => cell.innerText)
);



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
