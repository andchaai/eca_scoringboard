import React, { useState, useEffect, useRef } from "react";
import { CompetitionData, ContestantResult, Criterion, Judge, JudgeContestantScore } from "./types";
import { PRESET_TEMPLATES } from "./data/presets";
import { calculateTournamentResults, generateCSVExport } from "./utils/scoring";
import { Navbar } from "./components/Navbar";
import { StepNavRail } from "./components/StepNavRail";
import { StepEventSetup } from "./components/StepEventSetup";
import { StepContestantSetup } from "./components/StepContestantSetup";
import { StepCriteriaSetup } from "./components/StepCriteriaSetup";
import { StepScoringWorkbench } from "./components/StepScoringWorkbench";
import { StepLeaderboard } from "./components/StepLeaderboard";
import { PresentationModal } from "./components/PresentationModal";
import { RoomShareModal } from "./components/RoomShareModal";
import { JudgePortal } from "./components/JudgePortal";
import { JudgeEntryScreen } from "./components/JudgeEntryScreen";
import { db, doc, setDoc, onSnapshot, updateDoc } from "./lib/firebase";

const STORAGE_KEY = "judges_ledger_competition_data_v1";

const INITIAL_CRITERIA: Criterion[] = [
  { id: "crit_1", name: "語音與咬字", maxScore: 30, weight: 30, description: "發音準確度、聲調規範、吐字清晰度" },
  { id: "crit_2", name: "情感與感染力", maxScore: 35, weight: 35, description: "對文本意境的理解、情感起伏與共鳴表達" },
  { id: "crit_3", name: "語調與節奏", maxScore: 20, weight: 20, description: "抑揚頓挫、停頓適切、速度掌控" },
  { id: "crit_4", name: "颱風與儀態", maxScore: 15, weight: 15, description: "精神面貌、站姿、眼神接觸與專注度" }
];

const INITIAL_JUDGES: Judge[] = [
  { id: "j_1", name: "陳偉強 主任", title: "主評判", code: "J1" },
  { id: "j_2", name: "李嘉敏 老師", title: "專業評判", code: "J2" },
  { id: "j_3", name: "黃國強 教授", title: "嘉賓評判", code: "J3" }
];

const DEFAULT_DATA: CompetitionData = {
  id: "comp_default",
  name: "2026 年度校際比賽",
  subtitle: "決賽組別",
  date: new Date().toISOString().split("T")[0],
  venue: "大禮堂評判席",
  category: "recitation",
  scoringMethod: "weighted",
  decimalPlaces: 1,
  roomCode: "882190",
  judges: INITIAL_JUDGES,
  contestants: [
    { id: "c_1a", number: "1A", name: "1A 班", subText: "參賽曲目/作品: 《將進酒》", grade: "1", type: "class", order: 1 },
    { id: "c_1b", number: "1B", name: "1B 班", subText: "參賽曲目/作品: 《念奴嬌·赤壁懷古》", grade: "1", type: "class", order: 2 },
    { id: "c_1c", number: "1C", name: "1C 班", subText: "參賽曲目/作品: 《春江花月夜》", grade: "1", type: "class", order: 3 },
    { id: "c_1d", number: "1D", name: "1D 班", subText: "參賽曲目/作品: 《水調歌頭》", grade: "1", type: "class", order: 4 }
  ],
  criteria: INITIAL_CRITERIA,
  scores: {},
  organizer: "賽事評判席籌委會"
};

export default function App() {
  const [data, setData] = useState<CompetitionData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse saved data", e);
    }
    return DEFAULT_DATA;
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [showPresentation, setShowPresentation] = useState<boolean>(false);
  const [showRoomShare, setShowRoomShare] = useState<boolean>(false);
  const [activeJudgePortalId, setActiveJudgePortalId] = useState<string | null>(null);
  const [joiningRoomCode, setJoiningRoomCode] = useState<string | null>(null);

  const isRemoteSyncingRef = useRef(false);

  // Check URL params for ?room=XXXXXX or ?judge=j_1 on startup
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlJudge = params.get("judge");
      const urlRoom = params.get("room");
      if (urlJudge) {
        setActiveJudgePortalId(urlJudge);
      } else if (urlRoom) {
        setJoiningRoomCode(urlRoom);
      }
    } catch (e) {
      console.error("URL parse error", e);
    }
  }, []);

  // Sync to Firestore and listen to real-time changes
  useEffect(() => {
    if (!data.id) return;

    // 1. Initial push if needed or subscribe
    const compDocRef = doc(db, "competitions", data.id);

    // Initial write to ensure document exists
    setDoc(
      compDocRef,
      {
        ...data,
        updatedAt: Date.now()
      },
      { merge: true }
    ).catch((err) => {
      console.warn("Initial Firestore write sync note:", err);
    });

    // 2. Real-time snapshot subscription
    const unsubscribe = onSnapshot(
      compDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as CompetitionData;
          isRemoteSyncingRef.current = true;
          setData((prev) => ({
            ...prev,
            ...remoteData,
            // Keep local scores if they have more recent updates or merge
            scores: {
              ...prev.scores,
              ...(remoteData.scores || {})
            }
          }));
          setTimeout(() => {
            isRemoteSyncingRef.current = false;
          }, 100);
        }
      },
      (error) => {
        console.warn("Firestore snapshot listen error:", error);
      }
    );

    return () => unsubscribe();
  }, [data.id]);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }, [data]);

  // Push local changes to Firestore (unless coming from snapshot)
  const handleDataChange = (updated: Partial<CompetitionData>) => {
    setData((prev) => {
      const next = { ...prev, ...updated, updatedAt: Date.now() };
      if (!isRemoteSyncingRef.current && next.id) {
        const compRef = doc(db, "competitions", next.id);
        updateDoc(compRef, { ...updated, updatedAt: Date.now() }).catch((err) => {
          // If doc doesn't exist, setDoc
          setDoc(compRef, next, { merge: true }).catch(() => {});
        });
      }
      return next;
    });
  };

  // Specific score update handler (zero conflict per judge-contestant pair)
  const handleSingleScoreUpdate = (scoreKey: string, scoreData: JudgeContestantScore) => {
    setData((prev) => {
      const nextScores = {
        ...prev.scores,
        [scoreKey]: scoreData
      };
      const next = { ...prev, scores: nextScores, updatedAt: Date.now() };

      if (next.id) {
        const compRef = doc(db, "competitions", next.id);
        updateDoc(compRef, {
          [`scores.${scoreKey}`]: scoreData,
          updatedAt: Date.now()
        }).catch((err) => {
          setDoc(compRef, next, { merge: true }).catch(() => {});
        });
      }

      return next;
    });
  };

  // Calculate live results
  const results: ContestantResult[] = calculateTournamentResults(data);

  // Apply a preset template
  const handleApplyPreset = (presetId: string) => {
    const tpl = PRESET_TEMPLATES.find((t) => t.id === presetId);
    if (!tpl) return;

    const newCriteria: Criterion[] = tpl.defaultCriteria.map((c, idx) => ({
      id: `crit_${Date.now()}_${idx}`,
      name: c.name,
      maxScore: c.maxScore,
      weight: c.weight,
      description: c.description
    }));

    handleDataChange({
      name: data.name.includes("2026") ? data.name : `2026 年度${tpl.name}`,
      category: tpl.category,
      criteria: newCriteria,
      notes: tpl.scoringTips
    });
  };

  // Reset all data
  const handleReset = () => {
    if (window.confirm("確定要重設當前比賽紀錄嗎？現有計分表將被清空。")) {
      const newId = `comp_${Date.now()}`;
      const newRoom = Math.floor(100000 + Math.random() * 900000).toString();
      const resetData: CompetitionData = {
        ...DEFAULT_DATA,
        id: newId,
        roomCode: newRoom,
        date: new Date().toISOString().split("T")[0],
        scores: {}
      };
      setData(resetData);
      setActiveStep(1);

      if (db) {
        setDoc(doc(db, "competitions", newId), resetData).catch(() => {});
      }
    }
  };

  // Load rich realistic sample tournament
  const handleLoadSample = () => {
    const sampleJudges: Judge[] = [
      { id: "sj_1", name: "陳志明 教授", title: "主審評判", code: "J1" },
      { id: "sj_2", name: "林嘉慧 老師", title: "語文科主任", code: "J2" },
      { id: "sj_3", name: "黃國強 博士", title: "客席評判", code: "J3" }
    ];

    const sampleContestants = [
      { id: "sc_1", number: "1A", name: "1A 班", subText: "作品：《將進酒》", grade: "1", type: "class" as const, order: 1 },
      { id: "sc_2", number: "1B", name: "1B 班", subText: "作品：《念奴嬌·赤壁懷古》", grade: "1", type: "class" as const, order: 2 },
      { id: "sc_3", number: "2A", name: "2A 班", subText: "作品：《春江花月夜》", grade: "2", type: "class" as const, order: 3 },
      { id: "sc_4", number: "2B", name: "2B 班", subText: "作品：《木蘭辭》", grade: "2", type: "class" as const, order: 4 },
      { id: "sc_5", number: "H01", name: "忠社 (Red House)", subText: "代表：《沁園春·雪》", house: "忠", type: "house" as const, order: 5 },
      { id: "sc_6", number: "H02", name: "義社 (Yellow House)", subText: "代表：《滿江紅》", house: "義", type: "house" as const, order: 6 },
      { id: "sc_7", number: "H03", name: "勤社 (Blue House)", subText: "代表：《水調歌頭》", house: "勤", type: "house" as const, order: 7 },
      { id: "sc_8", number: "H04", name: "儉社 (Green House)", subText: "代表：《短歌行》", house: "儉", type: "house" as const, order: 8 }
    ];

    const sampleCriteria: Criterion[] = [
      { id: "scrit_1", name: "語音與咬字", maxScore: 30, weight: 30, description: "發音準確度、聲調規範、吐字清晰度" },
      { id: "scrit_2", name: "情感與感染力", maxScore: 35, weight: 35, description: "對文本意境的理解、情感起伏與共鳴表達" },
      { id: "scrit_3", name: "語調與節奏", maxScore: 20, weight: 20, description: "抑揚頓挫、停頓適切、速度掌控" },
      { id: "scrit_4", name: "颱風與儀態", maxScore: 15, weight: 15, description: "精神面貌、站姿、眼神接觸與專注度" }
    ];

    // Seed realistic scores
    const sampleScores: Record<string, any> = {};
    const feedbackList = [
      "咬字清晰響亮，節奏掌握得宜",
      "情感真摯動人，高潮處理震撼",
      "台風穩健自信，眼神交流豐富",
      "聲線洪亮有氣勢，意境營造出色",
      "音韻起伏分明，發音標準規範",
      "肢體協調自然，極具感染力"
    ];

    const scoreTemplates = [
      { s1: [28, 33, 19, 14], s2: [27, 32, 18, 14], s3: [29, 34, 19, 15] }, // High (Champion level)
      { s1: [27, 31, 18, 13], s2: [26, 30, 17, 13], s3: [28, 32, 18, 14] },
      { s1: [25, 29, 17, 13], s2: [26, 28, 16, 12], s3: [25, 30, 17, 13] },
      { s1: [24, 27, 16, 12], s2: [25, 28, 16, 12], s3: [24, 26, 15, 11] },
      { s1: [29, 34, 19, 15], s2: [28, 33, 18, 14], s3: [29, 35, 19, 15] }, // House High
      { s1: [26, 30, 17, 13], s2: [25, 29, 16, 12], s3: [27, 31, 18, 13] },
      { s1: [27, 32, 18, 14], s2: [28, 31, 17, 13], s3: [27, 32, 18, 14] },
      { s1: [25, 28, 16, 12], s2: [24, 27, 15, 12], s3: [25, 29, 16, 13] }
    ];

    sampleContestants.forEach((c, cIdx) => {
      const template = scoreTemplates[cIdx];
      sampleJudges.forEach((j, jIdx) => {
        const key = `${j.id}___${c.id}`;
        const sArr = jIdx === 0 ? template.s1 : jIdx === 1 ? template.s2 : template.s3;

        sampleScores[key] = {
          criteriaScores: {
            scrit_1: sArr[0],
            scrit_2: sArr[1],
            scrit_3: sArr[2],
            scrit_4: sArr[3]
          },
          feedback: feedbackList[(cIdx + jIdx) % feedbackList.length],
          penalty: 0,
          completed: true,
          updatedAt: Date.now()
        };
      });
    });

    const sampleTourney: CompetitionData = {
      id: `sample_${Date.now()}`,
      name: "2026 年度全港校際朗誦節 (中學組) 決賽",
      subtitle: "中學甲組 (全港總決賽)",
      date: new Date().toISOString().split("T")[0],
      venue: "大禮堂評判席",
      category: "recitation",
      scoringMethod: "weighted",
      decimalPlaces: 1,
      roomCode: "991823",
      judges: sampleJudges,
      contestants: sampleContestants,
      criteria: sampleCriteria,
      scores: sampleScores,
      organizer: "全港朗誦教育協會 & 評判席委員會"
    };

    setData(sampleTourney);
    if (db) {
      setDoc(doc(db, "competitions", sampleTourney.id), sampleTourney).catch(() => {});
    }
    setActiveStep(5); // Jump straight to leaderboard
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = generateCSVExport(data, results);
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${data.name || "賽事計分表"}_結算結果.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF
  const handlePrint = () => {
    window.print();
  };

  // If in dedicated Judge Portal View (e.g., from mobile / QR code or preview)
  if (activeJudgePortalId) {
    return (
      <JudgePortal
        data={data}
        judgeId={activeJudgePortalId}
        onExit={() => {
          setActiveJudgePortalId(null);
          // Clean URL params without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
        onUpdateScore={handleSingleScoreUpdate}
      />
    );
  }

  // If entering via QR Code room URL without specific judge pre-selected
  if (joiningRoomCode) {
    return (
      <JudgeEntryScreen
        data={data}
        roomCodeFromUrl={joiningRoomCode}
        onSelectJudge={(jId) => setActiveJudgePortalId(jId)}
        onBackToHost={() => {
          setJoiningRoomCode(null);
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2c2820] flex flex-col font-sans selection:bg-[#183626] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        data={data}
        results={results}
        activeStep={activeStep}
        onSelectStep={setActiveStep}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        onOpenPresentation={() => setShowPresentation(true)}
        onOpenRoomShare={() => setShowRoomShare(true)}
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
      />

      {/* Main Workspace with Left Rail (Desktop) & Step Ribbon (Mobile) */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Navigation Guide Rail */}
        <StepNavRail
          currentStep={activeStep}
          onSelectStep={setActiveStep}
          data={data}
        />

        {/* Center Scoring Workbench Canvas */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          {activeStep === 1 && (
            <StepEventSetup
              data={data}
              onChange={handleDataChange}
              onNext={() => setActiveStep(2)}
              onApplyPreset={handleApplyPreset}
            />
          )}

          {activeStep === 2 && (
            <StepContestantSetup
              data={data}
              onChange={handleDataChange}
              onNext={() => setActiveStep(3)}
              onPrev={() => setActiveStep(1)}
            />
          )}

          {activeStep === 3 && (
            <StepCriteriaSetup
              data={data}
              onChange={handleDataChange}
              onNext={() => setActiveStep(4)}
              onPrev={() => setActiveStep(2)}
              onApplyPreset={handleApplyPreset}
            />
          )}

          {activeStep === 4 && (
            <StepScoringWorkbench
              data={data}
              onChange={handleDataChange}
              onGoToLeaderboard={() => setActiveStep(5)}
            />
          )}

          {activeStep === 5 && (
            <StepLeaderboard
              data={data}
              results={results}
              onOpenPresentation={() => setShowPresentation(true)}
              onPrint={handlePrint}
              onExportCSV={handleExportCSV}
            />
          )}
        </main>
      </div>

      {/* Fullscreen Big Screen Presentation / Award Ceremony Modal */}
      {showPresentation && (
        <PresentationModal
          data={data}
          results={results}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {/* Multi-Judge Mobile QR Code & Link Sharing Modal */}
      {showRoomShare && (
        <RoomShareModal
          data={data}
          onClose={() => setShowRoomShare(false)}
          onGenerateNewCode={() => {
            const newRoom = Math.floor(100000 + Math.random() * 900000).toString();
            handleDataChange({ roomCode: newRoom });
          }}
          onSelectJudgePreview={(jId) => setActiveJudgePortalId(jId)}
        />
      )}
    </div>
  );
}

