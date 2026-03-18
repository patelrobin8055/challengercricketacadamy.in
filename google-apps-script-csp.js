// Google Apps Script for handling Challenger Cricket Academy registration form
// Deploy as Web App: Deploy > New Deployment > Web App > Execute as: Me > Who has access: Anyone

function doGet(e) {
  try {
    // Handle GET requests (for CSP-compliant image pixel method)
    if (e.parameter.id && e.parameter.name) {
      return handleGetRequest(e);
    }
    
    // Default response
    return HtmlService.createHtmlOutput("Challenger Cricket Academy Form Handler")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "GET request failed: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Handle POST requests (original method)
    return handlePostRequest(e);
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    return output.setContent(JSON.stringify({
      status: "error",
      message: "Failed to submit registration: " + error.toString()
    }));
  }
}

function handleGetRequest(e) {
  // Handle CSP-compliant GET requests from image pixel method
  const sheet = SpreadsheetApp.openById("1Mfnu7PcdCJB6ESwZrDX3mgKo_8JBZbRYq-ZNoINPeTI").getSheetByName("Registrations");
  
  // If sheet doesn't exist, create it
  if (!sheet) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const newSheet = spreadsheet.insertSheet("Registrations");
    setupSheet(newSheet);
    return handleGetRequest(e); // Retry with the new sheet
  }
  
  // Parse parameters from GET request
  const timestamp = e.parameter.timestamp ? new Date(e.parameter.timestamp).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  
  // Prepare row data from GET parameters
  const rowData = [
    timestamp,
    e.parameter.name || "",
    e.parameter.dob || "",
    e.parameter.place || "",
    e.parameter.gender || "",
    e.parameter.contact || "",
    e.parameter.address || "",
    e.parameter.batch || "",
    e.parameter.applicant_signature || "",
    e.parameter.guardian_signature || "",
    e.parameter.declaration === 'true' ? "Yes" : "No"
  ];
  
  // Append new row
  sheet.appendRow(rowData);
  
  // Return 1x1 transparent pixel for image requests
  return ContentService.createTextOutput(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  ).setMimeType(ContentService.MimeType.PNG);
}

function handlePostRequest(e) {
  // Set CORS headers for production
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Get the spreadsheet
  const sheet = SpreadsheetApp.openById("1Mfnu7PcdCJB6ESwZrDX3mgKo_8JBZbRYq-ZNoINPeTI").getSheetByName("Registrations");
  
  // If sheet doesn't exist, create it
  if (!sheet) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const newSheet = spreadsheet.insertSheet("Registrations");
    setupSheet(newSheet);
    return handlePostRequest(e); // Retry with the new sheet
  }
  
  // Get form data
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (parseError) {
    return output.setContent(JSON.stringify({
      status: "error",
      message: "Invalid JSON data received"
    }));
  }
  
  // Add timestamp
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  
  // Prepare row data
  const rowData = [
    timestamp,
    data.name || "",
    data.dob || "",
    data.place || "",
    data.gender || "",
    data.contact || "",
    data.address || "",
    data.batch || "",
    data.applicant_signature || "",
    data.guardian_signature || "",
    data.declaration ? "Yes" : "No"
  ];
  
  // Append new row
  sheet.appendRow(rowData);
  
  // Return success response with CORS headers
  return output.setContent(JSON.stringify({
    status: "success",
    message: "Registration submitted successfully",
    timestamp: timestamp
  }));
}

function setupSheet(sheet) {
  // Set up headers
  const headers = [
    "Timestamp",
    "Full Name",
    "Date of Birth",
    "Place of Birth",
    "Gender",
    "Contact Number",
    "Residential Address",
    "Preferred Batch",
    "Applicant Signature",
    "Guardian Signature",
    "Declaration Agreement"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#f4b21f");
  headerRange.setFontColor("#050a12");
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Set specific column widths
  sheet.setColumnWidths([
    20,  // Timestamp
    25,  // Full Name
    15,  // Date of Birth
    20,  // Place of Birth
    10,  // Gender
    15,  // Contact Number
    30,  // Residential Address
    20,  // Preferred Batch
    25,  // Applicant Signature
    25,  // Guardian Signature
    15   // Declaration Agreement
  ]);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Protect the header row
  const protection = sheet.protect().setDescription("Header row protection");
  const range = sheet.getRange("A1:K1");
  protection.addEditor(range);
  protection.removeEditors(protection.getEditors());
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}
