import React, { useState, useEffect } from "react";
import {
  Smartphone,
  CheckCircle2,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  Award,
  Clock,
  Radio,
  FileCheck,
  AlertCircle,
  MessageSquare,
  LogOut,
  RefreshCw
} from "lucide-react";
import {
  CompetitionData,
  Judge,
  Contestant,
  JudgeContestantScore
} from "../types";
import { doc, updateDoc, db } from "../lib/firebase";

interface JudgePortalProps {
  data: CompetitionData;
  judgeId: string;
  onExit: () => void;
  onUpdateScore: (scoreKey: string, scoreData: JudgeContestantScore) => void;
}

export const JudgePortal: React.FC<JudgePortalProps> = ({
  data,
  judgeId,
  onExit,
  onUpdateScore
}) => {
  const currentJudge = data.judges.find((j) => j.id === judgeId) || data.judges[0];
  const [selectedContestantId, setSelectedContestantId] = useState<string>(
    data.currentContestantId || data.contestants[0]?.id || ""
  );

  const currentContestant =
    data.contestants.find((c) => c.id === selectedContestantId) ||
    data.contestants[0];

  const scoreKey = `${currentJudge.id}___${currentContestant?.id}`;
  const existingScore: JudgeContestantScore = data.scores[scoreKey] || {
    criteriaScores: {},
    feedback: "",
    penalty: 0,
    completed: false
  };

  const [localScores, setLocalScores] = useState<Record<string, number>>(
    existingScore.criteriaScores || {}
  );
  const [localFeedback, setLocalFeedback] = useState<string>(
    existingScore.feedback || ""
  );
  const [localPenalty, setLocalPenalty] = useState<number>(
    existingScore.penalty || 0
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessModal, setSubmitSuccessModal] = useState<{
    show: boolean;
    contestantName: string;
    contestantNumber: string;
    score: number;
    nextContestantId?: string;
    nextContestantName?: string;
  } | null>(null);

  // Sync when selected contestant changes
  useEffect(() => {
    const key = `${currentJudge.id}___${currentContestant?.id}`;
    const sc = data.scores[key] || {
      criteriaScores: {},
      feedback: "",
      penalty: 0,
      completed: false
    };
    setLocalScores(sc.criteriaScores || {});
    setLocalFeedback(sc.feedback || "");
    setLocalPenalty(sc.penalty || 0);
  }, [selectedContestantId, currentJudge.id, data.scores, currentContestant?.id]);

  // Quick feedback phrase tags
  const feedbackChips = [
    "咬字清晰標準",
    "情感充沛感染力強",
    "節奏抑揚頓挫得宜",
    "颱風穩健自然",
    "聲音洪亮有氣勢",
    "眼神交流生動",
    "意境表達深刻",
    "音色優美有層次"
  ];

  // Calculate current total for this contestant
  const totalMax = data.criteria.reduce((acc, c) => acc + c.maxScore, 0);
  const rawTotal = Object.values(localScores).reduce((acc: number, v: number) => acc + (Number(v) || 0), 0);
  const finalCalc = Math.max(0, Number(rawTotal) - (Number(localPenalty) || 0));

  // Change individual score
  const handleScoreChange = (critId: string, val: number, max: number) => {
    const valid = Math.max(0, Math.min(max, val));
    const nextScores = {
      ...localScores,
      [critId]: valid
    };
    setLocalScores(nextScores);

    // Auto-save draft in background
    if (currentContestant) {
      const draft: JudgeContestantScore = {
        criteriaScores: nextScores,
        feedback: localFeedback,
        penalty: localPenalty,
        completed: existingScore.completed || false,
        updatedAt: Date.now()
      };
      onUpdateScore(scoreKey, draft);
    }
  };

  // Quick percentage presets for criterion
  const applyPreset = (critId: string, maxScore: number, percent: number) => {
    const calculated = Math.round(maxScore * percent);
    handleScoreChange(critId, calculated, maxScore);
  };

  // Contestant navigation
  const currentIndex = data.contestants.findIndex(
    (c) => c.id === selectedContestantId
  );
  const prevContestant = data.contestants[currentIndex - 1];
  const nextContestant = data.contestants[currentIndex + 1];

  // Submit score to cloud
  const handleSubmitScore = async () => {
    if (!currentContestant) return;
    setIsSubmitting(true);

    const scoreData: JudgeContestantScore = {
      criteriaScores: localScores,
      feedback: localFeedback.trim(),
      penalty: localPenalty,
      completed: true,
      updatedAt: Date.now()
    };

    try {
      // 1. Update local & state
      onUpdateScore(scoreKey, scoreData);

      // 2. Direct Firestore update for zero-latency sync
      if (data.id && db) {
        const compRef = doc(db, "competitions", data.id);
        await updateDoc(compRef, {
          [`scores.${scoreKey}`]: scoreData,
          updatedAt: Date.now()
        });
      }

      // 3. Show instant confirmation modal with next contestant action
      setSubmitSuccessModal({
        show: true,
        contestantName: currentContestant.name,
        contestantNumber: currentContestant.number,
        score: finalCalc,
        nextContestantId: nextContestant?.id,
        nextContestantName: nextContestant ? `#${nextContestant.number} ${nextContestant.name}` : undefined
      });
    } catch (e) {
      console.error("Failed to sync score to Firestore", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Completed contestants count for this judge
  const completedCount = data.contestants.filter((c) => {
    const k = `${currentJudge.id}___${c.id}`;
    return data.scores[k]?.completed;
  }).length;

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#2c2820] flex flex-col font-sans max-w-2xl mx-auto shadow-2xl border-x border-[#ded8c8]">
      {/* Top Mobile App Bar */}
      <header className="bg-[#183626] text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-[#183626] flex items-center justify-center font-bold text-sm shadow-xs">
              ⚖️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-black/20 px-1.5 py-0.5 rounded">
                  評判專屬評分席
                </span>
                <span className="inline-flex items-center text-[10px] text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  已連線
                </span>
              </div>
              <h1 className="text-sm font-bold text-white truncate">
                {currentJudge.name} {currentJudge.title && `(${currentJudge.title})`}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="text-xs bg-[#244b36] hover:bg-[#2e5e44] text-amber-200 px-3 py-1.5 rounded-lg border border-[#396d51] flex items-center transition"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span>返回總席</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 pt-2 border-t border-[#264e38] flex items-center justify-between text-xs text-[#b8d4c5]">
          <span>
            評分進度：<strong>{completedCount}</strong> / {data.contestants.length} 單位
          </span>
          <span className="font-mono text-amber-300">
            {Math.round((completedCount / (data.contestants.length || 1)) * 100)}%
          </span>
        </div>
      </header>

      {/* Contestant Selector Carousel */}
      <div className="bg-[#ebd9c5]/40 border-b border-[#dfd8c7] p-3 overflow-x-auto no-scrollbar flex items-center space-x-2">
        {data.contestants.map((c, idx) => {
          const isSelected = c.id === selectedContestantId;
          const isDone = data.scores[`${currentJudge.id}___${c.id}`]?.completed;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedContestantId(c.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-left border transition relative ${
                isSelected
                  ? "bg-[#183626] text-white border-[#183626] shadow-sm ring-2 ring-amber-400/40"
                  : isDone
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                  : "bg-white text-[#4d4637] border-[#dfd8c7] hover:bg-[#faf7f0]"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-xs">
                  {c.number}
                </span>
                {isDone && (
                  <CheckCircle2
                    className={`w-3 h-3 ${
                      isSelected ? "text-amber-300" : "text-emerald-600"
                    }`}
                  />
                )}
              </div>
              <div
                className={`text-xs font-semibold truncate max-w-[90px] ${
                  isSelected ? "text-white" : "text-[#1a3828]"
                }`}
              >
                {c.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Scoring Sheet Form */}
      {currentContestant ? (
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          {/* Current Contestant Highlight Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#ded8c8] shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#e65100] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                目前評分中單位
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={!prevContestant}
                  onClick={() => prevContestant && setSelectedContestantId(prevContestant.id)}
                  className="p-1 rounded-lg border border-[#dfd8c7] disabled:opacity-30 hover:bg-[#faf7f0]"
                  title="上一位"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={!nextContestant}
                  onClick={() => nextContestant && setSelectedContestantId(nextContestant.id)}
                  className="p-1 rounded-lg border border-[#dfd8c7] disabled:opacity-30 hover:bg-[#faf7f0]"
                  title="下一位"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-baseline space-x-3">
              <span className="font-mono text-2xl font-black text-[#183626]">
                #{currentContestant.number}
              </span>
              <h2 className="text-xl font-black text-[#183626] truncate">
                {currentContestant.name}
              </h2>
            </div>

            {currentContestant.subText && (
              <p className="text-xs text-[#706755] mt-1 font-medium">
                {currentContestant.subText}
              </p>
            )}

            {/* Current status ribbon */}
            <div className="mt-3 pt-3 border-t border-[#f0ebd9] flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {existingScore.completed ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    已完成評分 (已即時同步)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    評分填寫中 (草稿自動暫存)
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#706755] mr-1.5">給予總分：</span>
                <span className="font-mono text-2xl font-black text-[#e65100]">
                  {finalCalc}{" "}
                  <span className="text-xs font-sans font-normal text-[#8e8574]">
                    / {totalMax} 分
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Criteria Cards */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-[#554d3d] uppercase tracking-wider">
              各細項準則評分：
            </div>

            {data.criteria.map((crit) => {
              const currentVal = localScores[crit.id] ?? "";
              const max = crit.maxScore;

              return (
                <div
                  key={crit.id}
                  className="bg-white p-4 rounded-xl border border-[#ded8c8] shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-[#183626]">
                          {crit.name}
                        </h3>
                        <span className="text-[10px] font-mono bg-[#eee7d7] text-[#554d3c] px-1.5 py-0.5 rounded">
                          佔比 {crit.weight}%
                        </span>
                      </div>
                      {crit.description && (
                        <p className="text-[11px] text-[#706755] mt-0.5">
                          {crit.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-lg font-black text-[#183626]">
                        {currentVal !== "" ? currentVal : "-"}
                      </span>
                      <span className="text-xs text-[#706755] font-mono">
                        {" "}
                        / {max}
                      </span>
                    </div>
                  </div>

                  {/* Quick percentage shortcuts */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-[#8e8574]">快捷：</span>
                    {[
                      { label: "滿分", p: 1.0 },
                      { label: "90%", p: 0.9 },
                      { label: "80%", p: 0.8 },
                      { label: "70%", p: 0.7 }
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => applyPreset(crit.id, max, btn.p)}
                        className="px-2 py-0.5 rounded bg-[#f6f2e8] hover:bg-[#ede5d3] text-[11px] font-medium text-[#4d4637] border border-[#dfd8c7] transition"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Stepper + slider */}
                  <div className="flex items-center space-x-3 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleScoreChange(
                          crit.id,
                          Number(currentVal || 0) - 1,
                          max
                        )
                      }
                      className="w-10 h-10 rounded-xl bg-[#eee8dc] hover:bg-[#e4dcba] text-[#183626] font-bold text-lg flex items-center justify-center transition shrink-0"
                    >
                      -
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={max}
                      step={1}
                      value={currentVal || 0}
                      onChange={(e) =>
                        handleScoreChange(crit.id, Number(e.target.value), max)
                      }
                      className="flex-1 accent-[#183626] h-2 bg-[#ece5d5] rounded-lg cursor-pointer"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleScoreChange(
                          crit.id,
                          Number(currentVal || 0) + 1,
                          max
                        )
                      }
                      className="w-10 h-10 rounded-xl bg-[#eee8dc] hover:bg-[#e4dcba] text-[#183626] font-bold text-lg flex items-center justify-center transition shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback and Deductions */}
          <div className="bg-white p-4 rounded-xl border border-[#ded8c8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#183626] flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-[#e65100]" />
                評判評語與現場回饋（選填）：
              </label>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {feedbackChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setLocalFeedback((prev) =>
                      prev ? `${prev}，${chip}` : chip
                    );
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#f8f5ee] hover:bg-amber-100 hover:text-amber-900 border border-[#dfd8c7] text-[#554e3f] transition"
                >
                  +{chip}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={localFeedback}
              onChange={(e) => setLocalFeedback(e.target.value)}
              placeholder="輸入給參賽者的評語或改進建議..."
              className="w-full text-xs p-3 rounded-lg border border-[#cfc7b4] bg-[#faf8f3] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#183626]"
            />

            {/* Deductions */}
            <div className="pt-2 border-t border-[#f0ebd9] flex items-center justify-between text-xs">
              <span className="text-[#706755]">違規/逾時扣分：</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={localPenalty || ""}
                  onChange={(e) => setLocalPenalty(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 p-1.5 text-center font-mono text-xs font-bold rounded border border-[#cfc7b4] bg-[#faf8f3]"
                />
                <span className="text-[#706755]">分</span>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="sticky bottom-4 z-20">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitScore}
              className="w-full py-3.5 px-4 rounded-xl bg-[#e65100] hover:bg-[#f57c00] text-white font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition transform active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>實時提交評分至裁判席...</span>
                </>
              ) : existingScore.completed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>重新確認並更新評分 ({finalCalc} 分)</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>確認並提交本單位評分 ({finalCalc} 分)</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-[#706755]">
          尚未加入參賽者名單。
        </div>
      )}

      {/* Instant Submission Success Confirmation Modal */}
      {submitSuccessModal && submitSuccessModal.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#fcfbf7] border-2 border-[#ded8c8] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center relative animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                評分已即時送達主席台
              </span>
              <h3 className="text-lg font-black text-[#183626] pt-1">
                #{submitSuccessModal.contestantNumber} {submitSuccessModal.contestantName}
              </h3>
              <div className="text-xs text-[#554e3d]">
                給予總分：
                <span className="font-mono text-xl font-black text-[#e65100] ml-1">
                  {submitSuccessModal.score} 分
                </span>
              </div>
              <p className="text-[11px] text-[#706755] pt-1">
                此單位已標記為<strong>【已完成評分 (Complete Unit)】</strong>，大會主機與名次榜單已即時同步更新！
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {submitSuccessModal.nextContestantId ? (
                <button
                  type="button"
                  onClick={() => {
                    if (submitSuccessModal.nextContestantId) {
                      setSelectedContestantId(submitSuccessModal.nextContestantId);
                    }
                    setSubmitSuccessModal(null);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#183626] hover:bg-[#234b35] text-amber-300 font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition"
                >
                  <span>繼續評分下一位 ({submitSuccessModal.nextContestantName})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs font-bold text-amber-900">
                  🎉 已完成所有參賽單位的評分！
                </div>
              )}

              <button
                type="button"
                onClick={() => setSubmitSuccessModal(null)}
                className="w-full py-2 text-xs text-[#706755] hover:text-[#183626] font-medium"
              >
                留在本頁查看或修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
