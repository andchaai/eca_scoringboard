import { PresetTemplate } from "../types";

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "recitation",
    name: "校際詩詞/中文朗誦比賽",
    category: "recitation",
    description: "適用於個人及集體朗誦、經典古詩文或現代散文朗誦",
    defaultCriteria: [
      { name: "語音與咬字", maxScore: 30, weight: 30, description: "發音準確度、聲調規範、吐字清晰度" },
      { name: "情感與感染力", maxScore: 35, weight: 35, description: "對文本意境的理解、情感起伏與共鳴表達" },
      { name: "語調與節奏", maxScore: 20, weight: 20, description: "抑揚頓挫、停頓適切、速度掌控" },
      { name: "颱風與儀態", maxScore: 15, weight: 15, description: "精神面貌、站姿、眼神接觸與專注度" }
    ],
    scoringTips: "朗誦重在以聲傳情，建議評審留意選手對長短句韻律的掌握與眼神交流。"
  },
  {
    id: "singing",
    name: "歌唱 / 班際合唱比賽",
    category: "singing",
    description: "適用於流行獨唱、美聲合唱、校園民歌及班際合唱節",
    defaultCriteria: [
      { name: "音準與節奏", maxScore: 30, weight: 30, description: "音高準確性、拍子節奏穩定度" },
      { name: "音色與技巧", maxScore: 30, weight: 30, description: "共鳴氣息運用、真假音轉換、發聲技巧" },
      { name: "歌曲詮釋與情感", maxScore: 25, weight: 25, description: "情感投入度、層次感、歌詞意境傳遞" },
      { name: "舞台台風與表現力", maxScore: 15, weight: 15, description: "現場魅力、肢體協調、舞台風度" }
    ],
    scoringTips: "如為合唱比賽，可特別留意聲部平衡與和聲協調度。"
  },
  {
    id: "speech",
    name: "演講與即興演說比賽",
    category: "speech",
    description: "適用於三分鐘即席演講、主題演說、英語/普通話演講賽",
    defaultCriteria: [
      { name: "內容與立論", maxScore: 35, weight: 35, description: "論點新穎、論據充實、邏輯嚴密清晰" },
      { name: "語言與表達", maxScore: 25, weight: 25, description: "詞彙豐富度、修辭技巧、流暢度" },
      { name: "台風與肢體語言", maxScore: 25, weight: 25, description: "自信沉著、手勢適度、眼神互動" },
      { name: "時間掌控與應變", maxScore: 15, weight: 15, description: "是否在時限內完成、臨場應對自如" }
    ],
    scoringTips: "注意超時扣分規則，內容立論需扣緊主題。"
  },
  {
    id: "debate",
    name: "學界辯論常規賽 / 決賽",
    category: "debate",
    description: "適用於中學及大專辯論賽事，涵蓋主辯、結辯與自由辯論評分",
    defaultCriteria: [
      { name: "立論與邏輯架構", maxScore: 30, weight: 30, description: "主線清晰度、定義合理性、理論支撐" },
      { name: "駁論與臨場反應", maxScore: 30, weight: 30, description: "擊中對方弱點、拆解迅速、反應敏捷" },
      { name: "表達與辯風風度", maxScore: 25, weight: 25, description: "言辭得體、鏗鏘有力、展現儒雅辯風" },
      { name: "團隊配合與攻守", maxScore: 15, weight: 15, description: "前後呼應、默契協作、時間分配" }
    ],
    scoringTips: "強調駁論與立論的平衡，辯員語氣應堅定而有禮。"
  },
  {
    id: "talent",
    name: "社際才藝匯演 / 綜合表演賽",
    category: "talent",
    description: "適用於魔術、樂器演奏、小品、模仿秀、才藝達人秀",
    defaultCriteria: [
      { name: "才藝技巧難度", maxScore: 35, weight: 35, description: "技巧純熟度、難度挑戰、基本功" },
      { name: "創意與原創性", maxScore: 30, weight: 30, description: "編排新穎度、獨特構思、視覺效果" },
      { name: "現場娛樂與氣氛", maxScore: 20, weight: 20, description: "帶動全場氣氛、觀眾共鳴度" },
      { name: "團隊精神與準備", maxScore: 15, weight: 15, description: "道具服裝精美度、流暢銜接" }
    ],
    scoringTips: "鼓勵具備創新思維與舞台活力的作品。"
  },
  {
    id: "drama",
    name: "校園戲劇節 / 英語話劇比賽",
    category: "drama",
    description: "適用於短劇、微電影、音樂劇、廣播劇評審",
    defaultCriteria: [
      { name: "劇本與角色塑造", maxScore: 30, weight: 30, description: "角色鮮明度、內心戲刻畫、劇情起承轉合" },
      { name: "表演與台詞功底", maxScore: 35, weight: 35, description: "對白清晰有張力、肢體走位到位、情感爆發" },
      { name: "舞台美術與音效", maxScore: 20, weight: 20, description: "服裝道具、燈光音效搭配、空間運用" },
      { name: "整體節奏與完整性", maxScore: 15, weight: 15, description: "全劇節奏流暢度、高潮營造、思想主題" }
    ],
    scoringTips: "著重觀察演員之間的火花與角色內心信念感。"
  },
  {
    id: "stem",
    name: "創客發明 / STEM 專題研習評審",
    category: "stem",
    description: "適用於科學展覽、編程黑客松、工程設計原型評審",
    defaultCriteria: [
      { name: "創新性與實用價值", maxScore: 35, weight: 35, description: "解決現實問題、技術獨創性與商業/社會潛力" },
      { name: "技術難度與完成度", maxScore: 30, weight: 30, description: "原型運作穩定性、工程架構、編程質量" },
      { name: "簡報答辯與展示", maxScore: 20, weight: 20, description: "解說條理、海報/簡報視覺、即時答辯邏輯" },
      { name: "研習報告與數據分析", maxScore: 15, weight: 15, description: "實驗紀錄完整性、數據可信度" }
    ],
    scoringTips: "評審重點在於產品能否確實解決痛點及答辯時的科學思維。"
  },
  {
    id: "dance",
    name: "舞蹈 / 體育競技展示賽",
    category: "dance",
    description: "適用於街舞、現代舞、啦啦隊、武術套路競賽",
    defaultCriteria: [
      { name: "動作規範與技巧", maxScore: 35, weight: 35, description: "動作準確性、力量控制、柔韌性與難度動作" },
      { name: "編舞節奏與層次", maxScore: 30, weight: 30, description: "隊形變換、音樂卡點、空間層次感" },
      { name: "藝術表現與神態", maxScore: 20, weight: 20, description: "表情投入、精神氣魄、舞風特色" },
      { name: "服裝道具與整齊度", maxScore: 15, weight: 15, description: "齊舞同步率、視覺協調性" }
    ],
    scoringTips: "團體項目應著重評估動作一致性與力量爆發點。"
  },
  {
    id: "general",
    name: "通用綜合百搭評分表",
    category: "general",
    description: "適用於各類即興考核、作品評選、技能競賽",
    defaultCriteria: [
      { name: "主要表現與內容", maxScore: 40, weight: 40, description: "核心技能展示、完整度、專業水準" },
      { name: "技巧與熟練度", maxScore: 30, weight: 30, description: "執行細節、操作穩定度" },
      { name: "創意與亮點", maxScore: 20, weight: 20, description: "獨特風格、突破性嘗試" },
      { name: "態度與風度", maxScore: 10, weight: 10, description: "認真專注、遵守規則與時間" }
    ],
    scoringTips: "自由通用的 40/30/20/10 權重分配，適合各種即興比賽。"
  }
];

export const HOUSE_PRESETS = [
  {
    groupName: "傳統四大社 (忠、義、勤、儉)",
    houses: [
      { name: "忠社 (Red House)", shortName: "忠", color: "#dc2626", bg: "bg-red-500", border: "border-red-500" },
      { name: "義社 (Yellow House)", shortName: "義", color: "#eab308", bg: "bg-yellow-500", border: "border-yellow-500" },
      { name: "勤社 (Blue House)", shortName: "勤", color: "#2563eb", bg: "bg-blue-600", border: "border-blue-600" },
      { name: "儉社 (Green House)", shortName: "儉", color: "#16a34a", bg: "bg-green-600", border: "border-green-600" }
    ]
  },
  {
    groupName: "色彩四大社 (紅、黃、藍、綠)",
    houses: [
      { name: "紅社 (Ruby Red)", shortName: "紅", color: "#ef4444", bg: "bg-red-500", border: "border-red-500" },
      { name: "黃社 (Solar Yellow)", shortName: "黃", color: "#f59e0b", bg: "bg-amber-500", border: "border-amber-500" },
      { name: "藍社 (Ocean Blue)", shortName: "藍", color: "#3b82f6", bg: "bg-blue-500", border: "border-blue-500" },
      { name: "綠社 (Forest Green)", shortName: "綠", color: "#10b981", bg: "bg-emerald-500", border: "border-emerald-500" }
    ]
  },
  {
    groupName: "德育四大社 (仁、愛、信、望)",
    houses: [
      { name: "仁社 (Benevolence)", shortName: "仁", color: "#b91c1c", bg: "bg-red-700", border: "border-red-700" },
      { name: "愛社 (Love / Amber)", shortName: "愛", color: "#d97706", bg: "bg-amber-600", border: "border-amber-600" },
      { name: "信社 (Faith / Indigo)", shortName: "信", color: "#4f46e5", bg: "bg-indigo-600", border: "border-indigo-600" },
      { name: "望社 (Hope / Teal)", shortName: "望", color: "#0d9488", bg: "bg-teal-600", border: "border-teal-600" }
    ]
  },
  {
    groupName: "學術四社 (博學、審問、慎思、明辨)",
    houses: [
      { name: "博學社", shortName: "博", color: "#7c3aed", bg: "bg-purple-600", border: "border-purple-600" },
      { name: "審問社", shortName: "審", color: "#0284c7", bg: "bg-sky-600", border: "border-sky-600" },
      { name: "慎思社", shortName: "思", color: "#059669", bg: "bg-emerald-600", border: "border-emerald-600" },
      { name: "明辨社", shortName: "辨", color: "#ea580c", bg: "bg-orange-600", border: "border-orange-600" }
    ]
  }
];

export const GRADE_PRESETS = [
  { label: "中學 (中一 至 中六)", grades: ["1", "2", "3", "4", "5", "6"], prefix: "", suffix: "" },
  { label: "小學 (小一 至 小六)", grades: ["1", "2", "3", "4", "5", "6"], prefix: "P.", suffix: "" },
  { label: "Form (F.1 至 F.6)", grades: ["1", "2", "3", "4", "5", "6"], prefix: "F.", suffix: "" },
  { label: "Grade (G1 至 G12)", grades: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], prefix: "G", suffix: "" }
];

export const CLASS_LETTERS = ["A", "B", "C", "D", "E", "F"];

export const QUICK_FEEDBACK_TAGS = [
  "咬字清晰響亮",
  "情感細膩動人",
  "颱風穩健自然",
  "論據充實有力",
  "舞台爆發力強",
  "節奏掌握精準",
  "創意新穎獨特",
  "隊伍默契極佳",
  "音色圓潤優美",
  "肢體協調生動",
  "稍有超時請注意",
  "發音細節可再雕琢",
  "緊張致音準稍有不穩",
  "可增強眼神互動"
];
