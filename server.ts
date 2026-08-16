import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Criteria Suggestion Endpoint
  app.post("/api/suggest-criteria", async (req, res) => {
    try {
      const { competitionName, competitionType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback default suggestions if no key
        return res.json({
          criteria: [
            { id: "c1", name: "內容與結構", maxScore: 30, weight: 30, description: "主題契合度、內容深度及條理邏輯" },
            { id: "c2", name: "表現與技巧", maxScore: 40, weight: 40, description: "技巧純熟度、藝術感染力或表達流暢性" },
            { id: "c3", name: "颱風與儀態", maxScore: 20, weight: 20, description: "自信度、儀容體態、現場互動" },
            { id: "c4", name: "時間掌握與創意", maxScore: 10, weight: 10, description: "守時、獨特性與臨場應變" }
          ],
          tips: "此為標準推薦評分準則，權重總和為 100%。"
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `請為以下比賽推薦 3 到 5 個專業評分準則（Scoring Criteria）：
比賽名稱：「${competitionName || "綜合比賽"}」
比賽類型/描述：「${competitionType || "一般競賽"}」

請以繁體中文 (Traditional Chinese) 回傳純 JSON 格式，不要包含任何 markdown 標記或反引號：
{
  "criteria": [
    {
      "name": "準則名稱（例如：發音咬字 / 技巧難度 / 創意設計）",
      "maxScore": 滿分（建議20、30、40或50等數值，總和可自由調整）",
      "weight": 權重百分比整數（所有 criteria 的 weight 加總必須等於 100）",
      "description": "簡短的評分要點或裁判提醒（15-30字）"
    }
  ],
  "tips": "給裁判席的整體評審建議或賽事注意事項（20-40字）"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      const criteriaWithIds = (parsed.criteria || []).map((c: any, index: number) => ({
        id: `c_${Date.now()}_${index}`,
        name: c.name || `評審項目 ${index + 1}`,
        maxScore: Number(c.maxScore) || 25,
        weight: Number(c.weight) || 25,
        description: c.description || ""
      }));

      res.json({
        criteria: criteriaWithIds,
        tips: parsed.tips || "已為您生成客製化評審準則建議。"
      });
    } catch (error: any) {
      console.error("AI Criteria Suggestion Error:", error);
      res.status(500).json({
        error: "無法生成建議，請使用內建範本",
        fallback: true
      });
    }
  });

  // Vite middleware for development or static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Judges Ledger Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
