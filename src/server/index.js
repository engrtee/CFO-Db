import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Server is alive and running!");
});

// ✅ AI Report route
app.post("/api/ai-report", async (req, res) => {
  try {
    const { kpis } = req.body;

    // Build prompt for Ollama
    const prompt = `
    You are a financial AI assistant.
    Generate a concise CFO performance summary based on the following KPIs:

    - Interest Income: ${kpis.interestIncome}
    - Loan Portfolio: ${kpis.loanPortfolio}
    - Credit Risk: ${kpis.creditRisk}
    - Liquidity Ratio: ${kpis.liquidityRatio}

    Write it professionally, 3 short paragraphs maximum, under 150 words.
    `;

    // ✅ Call Ollama's API
    const response = await axios.post(
      "http://127.0.0.1:11434/api/generate",
      {
        model: "llama3", // use 'llama3' (not 'llama3:latest')
        prompt: prompt,
      },
      { responseType: "json" }
    );

    // Ollama returns a JSON with 'response' field
    const text = response.data.response || response.data;

    // Save report as .txt (you can replace this with PDF generation later)
    const fileName = "AI_Summary_Report.txt";
    const filePath = path.join(process.cwd(), fileName);
    fs.writeFileSync(filePath, text);

    // Send the text file as response
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(text);

  } catch (err) {
    console.error("❌ Error generating report:");

    // Log detailed error information
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else if (err.request) {
      console.error("No response received from Ollama:", err.request);
    } else {
      console.error("Error message:", err.message);
    }

    res.status(500).json({ error: "Failed to generate AI report" });
  }
});

// ✅ Start backend
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
