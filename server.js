const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors()); // Allow extension to call this server
app.use(bodyParser.json());

app.post("/getActionDefs", async (req, res) => {
  const { cpqHost, processName, username, password ,transaction } = req.body;

  const url = `https://${cpqHost}/rest/v18/commerceProcesses/${processName}/documents/${transaction}/actionDefs`;

  try {
    const response = await fetch(url, { headers: {"Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64") } });
    const data = await response.json();
    // console.log("data from getActionDefs:", data);
    const item = data.items.find(i => i.type.lookupCode === "CmDisplayHistoryAction");
    console.log("Found item:", item.variableName);
    res.json({ success: true, item: { variableName: item.variableName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Example endpoint: POST /fetchHistory
app.post("/fetchHistory", async (req, res) => {
    console.log("Received request body:", req.body);
  const { cpqHost, processName, transactionId, displayHistoryActionVarName, criteria, username, password } = req.body;

  if (!cpqHost || !processName || !transactionId || !displayHistoryActionVarName || !criteria || !username || !password) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const postUrl = `https://${cpqHost}/rest/v18/commerceDocuments${processName}Transaction/${transactionId}/actions/${displayHistoryActionVarName}`;

  try {
    const response = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64")
      },
      body: JSON.stringify(criteria),
    });

    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CPQ proxy server running at http://localhost:${PORT}`);
});
