import React, { useState } from "react";
import {
  PenTool,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Users2,
  Sliders,
  Sparkles,
  Trophy,
  Table,
  MessageSquare,
  MinusCircle,
  HelpCircle,
  Search,
  Filter
} from "lucide-react";
import {
  CompetitionData,
  Contestant,
  Judge,
  JudgeContestantScore,
  ScoreMatrix
} from "../types";
import { calculateSingleJudgeScore } from "../utils/scoring";
import { QUICK_FEEDBACK_TAGS } from "../data/presets";

interface StepScoringWorkbenchProps {
  data: CompetitionData;
  onChange: (updated: Partial<CompetitionData>) => void;
  onGoToLeaderboard: () => void;
}

export const StepScoringWorkbench: React.FC<StepScoringWorkbenchProps> = ({
  data,
  onChange,
  onGoToLeaderboard
}) => {
  const [viewMode, setViewMode] = useState<"judge" | "contestant" | "matrix">("judge");
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>(
    data.judges[0]?.id || ""
  );
  const [selectedContestantId, setSelectedContestantId] = useState<string>(
    data.contestants[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (data.judges.length === 0 || data.contestants.length === 0) {
    return (
      <div className="text-center py-16 bg-[#fcfbf7] rounded-xl border border-[#ded8c8] p-8 max-w-xl mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#1a3828]">尚未完成基本資料設定</h3>
        <p className="text-xs text-[#665e4e] mt-1">
          請先在「賽事與評判」及「參賽名單」步驟中設定至少 1 位評判與 1 位參賽者。
        </p>
      </div>
    );
  }

  // Ensure valid selection
  const currentJudge =
    data.judges.find((j) => j.id === selectedJudgeId) || data.judges[0];
  const currentContestant =
    data.contestants.find((c) => c.id === selectedContestantId) ||
    data.contestants[0];

  const currentScoreKey = `${currentJudge.id}___${currentContestant.id}`;
  const currentJudgeScore: JudgeContestantScore = data.scores[currentScoreKey] || {
    criteriaScores: {},
    feedback: "",
    penalty: 0,
    completed: false
  };

  // Update a specific score
  const updateCriteriaScore = (
    judgeId: string,
    contestantId: string,
    criterionId: string,
    value: number
  ) => {
    const key = `${judgeId}___${contestantId}`;
    const existing = data.scores[key] || {
      criteriaScores: {},
      feedback: "",
      penalty: 0,
      completed: false
    };

    const updatedCriteria = {
      ...existing.criteriaScores,
      [criterionId]: value
    };

    // Auto mark completed if all criteria have valid scores
    const isAllFilled = data.criteria.every(
      (crit) => updatedCriteria[crit.id] !== undefined && !isNaN(updatedCriteria[crit.id])
    );

    const updatedMatrix: ScoreMatrix = {
      ...data.scores,
      [key]: {
        ...existing,
        criteriaScores: updatedCriteria,
        completed: isAllFilled,
        updatedAt: Date.now()
      }
    };

    onChange({ scores: updatedMatrix });
  };

  const updateFeedback = (judgeId: string, contestantId: string, feedback: string) => {
    const key = `${judgeId}___${contestantId}`;
    const existing = data.scores[key] || {
      criteriaScores: {},
      feedback: "",
      penalty: 0,
      completed: false
    };

    onChange({
      scores: {
        ...data.scores,
        [key]: {
          ...existing,
          feedback,
          updatedAt: Date.now()
        }
      }
    });
  };

  const updatePenalty = (judgeId: string, contestantId: string, penalty: number) => {
    const key = `${judgeId}___${contestantId}`;
    const existing = data.scores[key] || {
      criteriaScores: {},
      feedback: "",
      penalty: 0,
      completed: false
    };

    onChange({
      scores: {
        ...data.scores,
        [key]: {
          ...existing,
          penalty: Math.max(0, penalty),
          updatedAt: Date.now()
        }
      }
    });
  };

  const toggleCompleted = (judgeId: string, contestantId: string) => {
    const key = `${judgeId}___${contestantId}`;
    const existing = data.scores[key] || {
      criteriaScores: {},
      feedback: "",
      penalty: 0,
      completed: false
    };

    onChange({
      scores: {
        ...data.scores,
        [key]: {
          ...existing,
          completed: !existing.completed,
          updatedAt: Date.now()
        }
      }
    });
  };

  // Quick preset score button
  const setQuickScorePercentage = (
    judgeId: string,
    contestantId: string,
    percentage: number
  ) => {
    const key = `${judgeId}___${contestantId}`;
    const existing = data.scores[key] || {
      criteriaScores: {},
      feedback: "",
      penalty: 0,
      completed: false
    };

    const newCriteriaScores: Record<string, number> = {};
    for (const c of data.criteria) {
      const calculated = Math.round((c.maxScore * (percentage / 100)) * 10) / 10;
      newCriteriaScores[c.id] = calculated;
    }

    onChange({
      scores: {
        ...data.scores,
        [key]: {
          ...existing,
          criteriaScores: newCriteriaScores,
          completed: true,
          updatedAt: Date.now()
        }
      }
    });
  };

  // Append feedback tag
  const appendFeedbackTag = (tag: string) => {
    const current = currentJudgeScore.feedback || "";
    const updated = current ? `${current}、${tag}` : tag;
    updateFeedback(currentJudge.id, currentContestant.id, updated);
  };

  // Navigation helpers for contestant
  const currentContestantIndex = data.contestants.findIndex(
    (c) => c.id === currentContestant.id
  );

  const handlePrevContestant = () => {
    if (currentContestantIndex > 0) {
      setSelectedContestantId(data.contestants[currentContestantIndex - 1].id);
    }
  };

  const handleNextContestant = () => {
    if (currentContestantIndex < data.contestants.length - 1) {
      setSelectedContestantId(data.contestants[currentContestantIndex + 1].id);
    }
  };

  // Calculation for current active pair
  const activeCalc = calculateSingleJudgeScore(
    currentJudgeScore,
    data.criteria,
    data.scoringMethod
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner & Mode Bar */}
      <div className="bg-[#fcfbf7] p-4 sm:p-6 rounded-xl border border-[#ded8c8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#9a3412]">
              步驟 4 / 5 • 現場評分工作枱
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1a3828] mt-0.5">
            裁判席記事簿 • 評分登錄工作枱
          </h2>
          <p className="text-xs text-[#665e4e]">
            支援按評判、按參賽者、或矩陣總表即時填寫分數與評語。
          </p>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-[#eee7d7] rounded-lg border border-[#d8cfbc] shrink-0">
          <button
            type="button"
            id="workbench-mode-judge"
            onClick={() => setViewMode("judge")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === "judge"
                ? "bg-[#183626] text-white shadow-xs"
                : "text-[#554e3f] hover:text-[#183626]"
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>按評判專屬卷</span>
          </button>

          <button
            type="button"
            id="workbench-mode-contestant"
            onClick={() => setViewMode("contestant")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === "contestant"
                ? "bg-[#183626] text-white shadow-xs"
                : "text-[#554e3f] hover:text-[#183626]"
            }`}
          >
            <Users2 className="w-3.5 h-3.5 text-orange-400" />
            <span>按參賽者檢視</span>
          </button>

          <button
            type="button"
            id="workbench-mode-matrix"
            onClick={() => setViewMode("matrix")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === "matrix"
                ? "bg-[#183626] text-white shadow-xs"
                : "text-[#554e3f] hover:text-[#183626]"
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span>總表速填矩陣</span>
          </button>
        </div>
      </div>

      {/* MODE 1: BY JUDGE */}
      {viewMode === "judge" && (
        <div className="space-y-4">
          {/* Judge Selector Ribbon */}
          <div className="bg-[#f7f3e8] p-3 rounded-xl border border-[#ded8c8] flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-[#554d3d] shrink-0 pl-1">
              切換評判席：
            </span>
            {data.judges.map((judge, idx) => {
              const isSelected = judge.id === currentJudge.id;
              // Count completed for this judge
              let completedCount = 0;
              data.contestants.forEach((c) => {
                const k = `${judge.id}___${c.id}`;
                if (data.scores[k]?.completed) completedCount++;
              });
              const isAllDone = completedCount === data.contestants.length;

              return (
                <button
                  key={judge.id}
                  id={`judge-tab-${judge.id}`}
                  type="button"
                  onClick={() => setSelectedJudgeId(judge.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition border ${
                    isSelected
                      ? "bg-[#183626] text-[#faf8f5] border-[#183626] shadow-sm"
                      : "bg-white text-[#453e30] border-[#cfc7b4] hover:bg-[#faf7f0]"
                  }`}
                >
                  <span className="font-mono text-[11px] px-1 py-0.2 rounded bg-black/20">
                    J{idx + 1}
                  </span>
                  <span>{judge.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isAllDone
                        ? "bg-emerald-500 text-white"
                        : isSelected
                        ? "bg-amber-400 text-[#183626]"
                        : "bg-[#e5decb] text-[#554e3f]"
                    }`}
                  >
                    {completedCount}/{data.contestants.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Scoring Workbench Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Contestant List Carousel */}
            <div className="md:col-span-4 bg-[#fcfbf7] p-4 rounded-xl border border-[#ded8c8] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#eee8dc] pb-2">
                <span className="text-xs font-bold text-[#1a3828]">
                  參賽者列表 ({data.contestants.length})
                </span>
                <span className="text-[11px] text-[#706755]">點擊切換選手</span>
              </div>

              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {data.contestants.map((c, idx) => {
                  const isSelected = c.id === currentContestant.id;
                  const k = `${currentJudge.id}___${c.id}`;
                  const scoreObj = data.scores[k];
                  const isDone = Boolean(scoreObj?.completed);
                  const singleC = calculateSingleJudgeScore(
                    scoreObj,
                    data.criteria,
                    data.scoringMethod
                  );

                  return (
                    <button
                      key={c.id}
                      id={`contestant-select-btn-${c.id}`}
                      type="button"
                      onClick={() => setSelectedContestantId(c.id)}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between border ${
                        isSelected
                          ? "bg-[#183626] text-white border-[#183626] shadow-xs font-semibold"
                          : isDone
                          ? "bg-[#f2efe6] text-[#2c271e] border-[#d8d1be] hover:bg-[#e9e3d4]"
                          : "bg-white text-[#453e30] border-[#e2dcce] hover:bg-[#f6f2e8]"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[#e5decb] text-[#332e24]"
                          }`}
                        >
                          {c.number}
                        </span>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate leading-tight">
                            {c.name}
                          </div>
                          {c.subText && (
                            <div
                              className={`text-[10px] truncate ${
                                isSelected ? "text-[#b2d5c2]" : "text-[#7a715f]"
                              }`}
                            >
                              {c.subText}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right ml-2">
                        {isDone ? (
                          <div className="font-mono text-xs font-bold text-emerald-600 flex items-center">
                            <span className={isSelected ? "text-amber-300" : ""}>
                              {singleC.total}分
                            </span>
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ml-1 ${
                                isSelected ? "text-emerald-300" : "text-emerald-600"
                              }`}
                            />
                          </div>
                        ) : (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-white/10 text-[#f59e0b]"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            未完成
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Active Referee Score Sheet */}
            <div className="md:col-span-8 bg-[#fcfbf7] p-5 sm:p-6 rounded-xl border border-[#ded8c8] shadow-sm space-y-5">
              {/* Contestant Header */}
              <div className="flex items-center justify-between border-b border-[#eee8dc] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-[#183626] text-[#f59e0b] font-mono font-bold flex items-center justify-center text-sm shadow-xs">
                    {currentContestant.number}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold bg-[#e8e1d0] text-[#332e24] px-1.5 py-0.2 rounded">
                        #{currentContestantIndex + 1} / {data.contestants.length}
                      </span>
                      <span className="text-xs font-semibold text-[#183626]">
                        評審評判：{currentJudge.name} ({currentJudge.title || "評判"})
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1a3828]">
                      {currentContestant.name}
                    </h3>
                    {currentContestant.subText && (
                      <p className="text-xs text-[#706755]">{currentContestant.subText}</p>
                    )}
                  </div>
                </div>

                {/* Subtotal Pill */}
                <div className="text-right">
                  <div className="text-[11px] text-[#706755]">此評判給分小計</div>
                  <div className="font-mono text-2xl font-black text-[#e65100]">
                    {activeCalc.total}
                    <span className="text-xs font-sans text-[#706755] ml-1">分</span>
                  </div>
                </div>
              </div>

              {/* Quick Score Presets Bar */}
              <div className="flex items-center justify-between bg-[#f5efe3] p-2.5 rounded-lg border border-[#dfd8c7]">
                <span className="text-[11px] font-bold text-[#554d3d] flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  快捷基準分一鍵套用：
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "滿分 (100%)", pct: 100 },
                    { label: "特優 (90%)", pct: 90 },
                    { label: "優異 (85%)", pct: 85 },
                    { label: "良好 (80%)", pct: 80 },
                    { label: "中等 (70%)", pct: 70 }
                  ].map((p) => (
                    <button
                      key={p.pct}
                      type="button"
                      onClick={() =>
                        setQuickScorePercentage(
                          currentJudge.id,
                          currentContestant.id,
                          p.pct
                        )
                      }
                      className="px-2 py-1 rounded bg-white hover:bg-[#183626] hover:text-white text-[11px] font-semibold text-[#3a3428] border border-[#cfc7b4] transition shadow-xs"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Criteria Scoring Inputs */}
              <div className="space-y-3.5">
                {data.criteria.map((crit, cIdx) => {
                  const val = currentJudgeScore.criteriaScores[crit.id];
                  const currentVal = val !== undefined ? val : "";

                  return (
                    <div
                      key={crit.id || cIdx}
                      className="p-3.5 rounded-lg bg-white border border-[#dfd8c7] shadow-xs space-y-2 hover:border-[#183626] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-[#183626] text-white flex items-center justify-center font-mono text-[11px] font-bold">
                              {cIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-[#1a3828]">
                              {crit.name}
                            </span>
                            <span className="text-[11px] text-[#706755] font-mono">
                              (滿分 {crit.maxScore} 分 / 權重 {crit.weight}%)
                            </span>
                          </div>
                          {crit.description && (
                            <p className="text-[11px] text-[#7a715e] mt-0.5 pl-7">
                              {crit.description}
                            </p>
                          )}
                        </div>

                        {/* Input & Step Steppers */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const curr = Number(currentVal) || 0;
                              updateCriteriaScore(
                                currentJudge.id,
                                currentContestant.id,
                                crit.id,
                                Math.max(0, curr - 1)
                              );
                            }}
                            className="w-7 h-7 rounded bg-[#eee7d7] hover:bg-[#e4dcba] text-[#332e24] font-bold text-xs flex items-center justify-center"
                          >
                            -1
                          </button>

                          <input
                            type="number"
                            min="0"
                            max={crit.maxScore}
                            step="0.5"
                            id={`score-input-${currentJudge.id}-${currentContestant.id}-${crit.id}`}
                            value={currentVal}
                            onChange={(e) => {
                              const n = e.target.value === "" ? 0 : Number(e.target.value);
                              updateCriteriaScore(
                                currentJudge.id,
                                currentContestant.id,
                                crit.id,
                                Math.min(crit.maxScore, Math.max(0, n))
                              );
                            }}
                            placeholder="0"
                            className="w-16 font-mono text-center font-bold text-sm px-2 py-1 rounded bg-[#faf8f3] border border-[#cfc7b4] text-[#183626] focus:border-[#183626] outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const curr = Number(currentVal) || 0;
                              updateCriteriaScore(
                                currentJudge.id,
                                currentContestant.id,
                                crit.id,
                                Math.min(crit.maxScore, curr + 1)
                              );
                            }}
                            className="w-7 h-7 rounded bg-[#eee7d7] hover:bg-[#e4dcba] text-[#332e24] font-bold text-xs flex items-center justify-center"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Penalty / Deductions & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                {/* Penalty */}
                <div className="sm:col-span-4 bg-[#fff5f5] p-3 rounded-lg border border-red-200">
                  <label className="block text-[11px] font-bold text-red-900 mb-1 flex items-center">
                    <MinusCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
                    超時/違規扣分項 (分)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    id="input-penalty"
                    value={currentJudgeScore.penalty || ""}
                    onChange={(e) =>
                      updatePenalty(
                        currentJudge.id,
                        currentContestant.id,
                        Number(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded bg-white border border-red-300 text-red-700 outline-none"
                  />
                </div>

                {/* Feedback Tags & Written Notes */}
                <div className="sm:col-span-8 bg-white p-3 rounded-lg border border-[#ded7c5] space-y-2">
                  <label className="block text-[11px] font-bold text-[#453e30] flex items-center justify-between">
                    <span className="flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 mr-1 text-[#183626]" />
                      評判評語與備註（將匯整至總報告）
                    </span>
                  </label>

                  <div className="flex flex-wrap gap-1">
                    {QUICK_FEEDBACK_TAGS.slice(0, 6).map((tag, tIdx) => (
                      <button
                        key={tIdx}
                        type="button"
                        onClick={() => appendFeedbackTag(tag)}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#f2ece0] hover:bg-[#e4dcba] text-[#423b2e] border border-[#ded5bf] transition"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    id="input-feedback"
                    value={currentJudgeScore.feedback || ""}
                    onChange={(e) =>
                      updateFeedback(
                        currentJudge.id,
                        currentContestant.id,
                        e.target.value
                      )
                    }
                    placeholder="例如：台風沉著，發音標準，情感層次豐富"
                    className="w-full text-xs px-2.5 py-1.5 rounded bg-[#faf8f3] border border-[#cfc7b4] text-[#183626] outline-none"
                  />
                </div>
              </div>

              {/* Bottom Navigation & Done Button */}
              <div className="flex items-center justify-between pt-3 border-t border-[#eee8dc]">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrevContestant}
                    disabled={currentContestantIndex === 0}
                    className="px-3 py-1.5 rounded bg-[#eee7d7] hover:bg-[#e4dcba] text-[#332e24] font-bold text-xs flex items-center disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 mr-0.5" />
                    上一位選手
                  </button>

                  <button
                    type="button"
                    onClick={handleNextContestant}
                    disabled={currentContestantIndex === data.contestants.length - 1}
                    className="px-3 py-1.5 rounded bg-[#eee7d7] hover:bg-[#e4dcba] text-[#332e24] font-bold text-xs flex items-center disabled:opacity-40"
                  >
                    下一位選手
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-[#183626]">
                    <input
                      type="checkbox"
                      checked={Boolean(currentJudgeScore.completed)}
                      onChange={() =>
                        toggleCompleted(currentJudge.id, currentContestant.id)
                      }
                      className="w-4 h-4 rounded text-[#183626] focus:ring-[#183626]"
                    />
                    <span>確認此選手評分完成</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: BY CONTESTANT */}
      {viewMode === "contestant" && (
        <div className="space-y-4">
          {/* Contestant Ribbon */}
          <div className="bg-[#f7f3e8] p-3 rounded-xl border border-[#ded8c8] flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-[#554d3d] shrink-0 pl-1">
              當前登場選手：
            </span>
            {data.contestants.map((c, idx) => {
              const isSelected = c.id === currentContestant.id;
              // Count completed judges
              let doneCount = 0;
              data.judges.forEach((j) => {
                const k = `${j.id}___${c.id}`;
                if (data.scores[k]?.completed) doneCount++;
              });
              const isAllJudgesDone = doneCount === data.judges.length;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedContestantId(c.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition border ${
                    isSelected
                      ? "bg-[#183626] text-white border-[#183626] shadow-sm"
                      : "bg-white text-[#453e30] border-[#cfc7b4] hover:bg-[#faf7f0]"
                  }`}
                >
                  <span className="font-mono text-[11px] px-1 py-0.2 rounded bg-black/20">
                    {c.number}
                  </span>
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isAllJudgesDone
                        ? "bg-emerald-500 text-white"
                        : isSelected
                        ? "bg-amber-400 text-[#183626]"
                        : "bg-[#e5decb] text-[#554e3f]"
                    }`}
                  >
                    {doneCount}/{data.judges.length} 位評判
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cards for all judges on this contestant */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.judges.map((judge, jIdx) => {
              const k = `${judge.id}___${currentContestant.id}`;
              const jScore = data.scores[k] || {
                criteriaScores: {},
                feedback: "",
                penalty: 0,
                completed: false
              };
              const calc = calculateSingleJudgeScore(
                jScore,
                data.criteria,
                data.scoringMethod
              );

              return (
                <div
                  key={judge.id}
                  className="bg-[#fcfbf7] p-4 rounded-xl border border-[#ded8c8] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#eee8dc] pb-2">
                    <div>
                      <span className="text-xs font-bold text-[#183626]">
                        {judge.name}
                      </span>
                      <span className="text-[11px] text-[#706755] ml-1.5">
                        ({judge.title || `評判 ${jIdx + 1}`})
                      </span>
                    </div>
                    <div className="font-mono font-bold text-sm text-[#e65100]">
                      {calc.total} 分
                    </div>
                  </div>

                  <div className="space-y-2">
                    {data.criteria.map((crit) => {
                      const val = jScore.criteriaScores[crit.id];
                      return (
                        <div
                          key={crit.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-[#554e3f] truncate mr-2">
                            {crit.name} ({crit.maxScore}分):
                          </span>
                          <input
                            type="number"
                            min="0"
                            max={crit.maxScore}
                            step="0.5"
                            value={val !== undefined ? val : ""}
                            onChange={(e) => {
                              const n =
                                e.target.value === "" ? 0 : Number(e.target.value);
                              updateCriteriaScore(
                                judge.id,
                                currentContestant.id,
                                crit.id,
                                Math.min(crit.maxScore, Math.max(0, n))
                              );
                            }}
                            placeholder="0"
                            className="w-16 font-mono text-center font-bold px-1.5 py-1 rounded bg-white border border-[#cfc7b4] text-[#183626] outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  <input
                    type="text"
                    value={jScore.feedback || ""}
                    onChange={(e) =>
                      updateFeedback(judge.id, currentContestant.id, e.target.value)
                    }
                    placeholder="評判備註評語..."
                    className="w-full text-xs px-2 py-1 rounded bg-white border border-[#cfc7b4] text-[#183626] outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: MASTER MATRIX SPREADSHEET */}
      {viewMode === "matrix" && (
        <div className="bg-[#fcfbf7] p-4 sm:p-6 rounded-xl border border-[#ded8c8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#eee8dc] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1a3828]">
                評判席總控計分矩陣速填表
              </h3>
              <p className="text-xs text-[#665e4e]">
                點擊任何儲存格即可直接修改給分，實時自動重算所有總分。
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#887f6e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋選手編號或姓名..."
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#cfc7b4] text-[#183626] outline-none w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f0ebd9] text-[#4d4637] border-y border-[#dfd8c7]">
                  <th className="py-2.5 px-3 w-14 font-bold">編號</th>
                  <th className="py-2.5 px-3 font-bold min-w-[140px]">
                    參賽者 / 單位
                  </th>
                  {data.judges.map((j) => (
                    <th
                      key={j.id}
                      className="py-2.5 px-3 text-center font-bold min-w-[100px]"
                    >
                      {j.name}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center font-bold text-[#e65100] w-24">
                    目前均分
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece6d8]">
                {data.contestants
                  .filter(
                    (c) =>
                      !searchQuery ||
                      c.name.includes(searchQuery) ||
                      c.number.includes(searchQuery)
                  )
                  .map((contestant) => {
                    let totalSum = 0;
                    let count = 0;

                    return (
                      <tr
                        key={contestant.id}
                        className="hover:bg-[#f6f2e7] transition-colors"
                      >
                        <td className="py-2 px-3 font-mono font-bold text-[#183626]">
                          {contestant.number}
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#183626]">
                          <div>{contestant.name}</div>
                          {contestant.subText && (
                            <div className="text-[10px] text-[#706755] font-normal">
                              {contestant.subText}
                            </div>
                          )}
                        </td>

                        {data.judges.map((j) => {
                          const k = `${j.id}___${contestant.id}`;
                          const scoreObj = data.scores[k];
                          const calc = calculateSingleJudgeScore(
                            scoreObj,
                            data.criteria,
                            data.scoringMethod
                          );

                          if (calc.completed) {
                            totalSum += calc.total;
                            count++;
                          }

                          return (
                            <td key={j.id} className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedJudgeId(j.id);
                                  setSelectedContestantId(contestant.id);
                                  setViewMode("judge");
                                }}
                                className={`font-mono text-xs font-bold px-2 py-1 rounded transition ${
                                  calc.completed
                                    ? "bg-white border border-[#cfc7b4] text-[#183626] hover:bg-[#183626] hover:text-white"
                                    : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
                                }`}
                              >
                                {calc.completed ? calc.total : "未填"}
                              </button>
                            </td>
                          );
                        })}

                        <td className="py-2 px-3 text-center font-mono font-bold text-sm text-[#e65100]">
                          {count > 0 ? (totalSum / count).toFixed(1) : "-"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Floating Next Step Card */}
      <div className="bg-[#183626] text-white p-4 sm:p-5 rounded-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base text-[#faf8f5]">
              隨時檢視即時排名與精美頒獎榜單
            </h3>
          </div>
          <p className="text-xs text-[#b8d9c5] mt-0.5">
            計分引擎全程自動本機實時計算，毋須等待所有評判完成即可預覽即時排名。
          </p>
        </div>

        <button
          id="btn-goto-leaderboard"
          type="button"
          onClick={onGoToLeaderboard}
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#e65100] hover:bg-[#f57c00] text-white font-bold text-sm shadow-md transition transform active:scale-95 shrink-0"
        >
          <Trophy className="w-4 h-4 mr-2" />
          <span>查看最終結果與頒獎榜單</span>
        </button>
      </div>
    </div>
  );
};
