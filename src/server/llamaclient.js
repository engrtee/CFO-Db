// server/llamaClient.js
import axios from "axios";

export async function getAISummary(kpis) {
  const prompt = `
You are a financial AI assistant. 
Based on these KPIs, write a short performance summary for the CFO:
- Interest Income: ${kpis.interestIncome}
- Loan Portfolio: ${kpis.loanPortfolio}
- Credit Risk: ${kpis.creditRisk}
- Liquidity Ratio: ${kpis.liquidityRatio}

Write in a professional but concise tone, 3 short paragraphs maximum.
  `;

  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.1", // Change to your installed model name
      prompt,
      stream: false,
    });

    // Ollama returns text in `response.data.response`
    return response.data.response || "No AI response received.";
  } catch (error) {
    console.error("Error calling Ollama:", error.message);
    return "Error generating AI summary.";
  }
}
