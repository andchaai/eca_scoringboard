import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Lightbulb,
  Info,
  Loader2
} from "lucide-react";
import { CompetitionData, Criterion } from "../types";
import { PRESET_TEMPLATES } from "../data/presets";

interface StepCriteriaSetupProps {
  data: CompetitionData;
  onChange: (updated: Partial<CompetitionData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onApplyPreset: (presetId: string) => void;
}

export const StepCriteriaSetup: React.FC<StepCriteriaSetupProps> = ({
  data,
  onChange,
  onNext,
  onPrev,
  onApplyPreset
}) => {
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Total weight calculation
  const totalWeight = data.criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const isWeightValid = totalWeight === 100 || data.scoringMethod !== "weighted";

  // Add new blank criterion
  const handleAddCriterion = () => {
    const newCrit: Criterion = {
      id: `crit_${Date.now()}_${data.criteria.length + 1}`,
      name: `評分準則 ${data.criteria.length + 1}`,
      maxScore: 30,
      weight: Math.max(0, 100 - totalWeight) || 20,
      description: "請輸入此評分項目的具體標準或評判指引"
    };
    onChange({ criteria: [...data.criteria, newCrit] });
  };

  const handleUpdateCriterion = (id: string, updates: Partial<Criterion>) => {
    const updated = data.criteria.map((c) => (c.id === id ? { ...c, ...updates } : c));
    onChange({ criteria: updated });
  };

  const handleDeleteCriterion = (id: string) => {
    if (data.criteria.length <= 1) return;
    const updated = data.criteria.filter((c) => c.id !== id);
    onChange({ criteria: updated });
  };

  // Balance weights equally
  const handleEqualizeWeights = () => {
    if (data.criteria.length === 0) return;
    const count = data.criteria.length;
    const base = Math.floor(100 / count);
    const remainder = 100 % count;

    const updated = data.criteria.map((c, idx) => ({
      ...c,
      weight: idx === 0 ? base + remainder : base
    }));
    onChange({ criteria: updated });
  };

  // Proportional normalize to 100
  const handleNormalizeWeights = () => {
    if (data.criteria.length === 0 || totalWeight === 0) return;
    let accumulated = 0;
    const updated = data.criteria.map((c, idx) => {
      if (idx === data.criteria.length - 1) {
        return { ...c, weight: Math.max(0, 100 - accumulated) };
      }
      const rawPct = Math.round((c.weight / totalWeight) * 100);
      accumulated += rawPct;
      return { ...c, weight: rawPct };
    });
    onChange({ criteria: updated });
  };

  // AI Smart Suggestion Trigger
  const handleAiSuggestCriteria = async () => {
    setIsAiLoading(true);
    setAiMessage(null);

    try {
      const res = await fetch("/api/suggest-criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionName: data.name || "綜合才藝與演講比賽",
          competitionType: data.category
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.criteria && json.criteria.length > 0) {
          onChange({ criteria: json.criteria });
          setAiMessage(json.tips || "已為您生成客製化評分準則！");
        }
      } else {
        // Fallback: match closest local template
        const fallbackTpl = PRESET_TEMPLATES[0];
        const crits = fallbackTpl.defaultCriteria.map((c, i) => ({
          id: `crit_fb_${i}`,
          ...c
        }));
        onChange({ criteria: crits });
        setAiMessage("已為您套用推薦賽事準則。");
      }
    } catch (err) {
      console.error(err);
      // Fallback local
      const fb = PRESET_TEMPLATES.find((p) => data.name.includes(p.name.slice(0, 2))) || PRESET_TEMPLATES[0];
      const crits = fb.defaultCriteria.map((c, i) => ({
        id: `crit_local_${i}`,
        ...c
      }));
      onChange({ criteria: crits });
      setAiMessage("已套用專業賽事推薦準則。");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-[#fcfbf7] p-5 sm:p-7 rounded-xl border border-[#ded8c8] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ece6d8] pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#9a3412]">
                步驟 3 / 5
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a3828] mt-1">
              設定評分準則、滿分與比重
            </h2>
            <p className="text-xs sm:text-sm text-[#665e4e] mt-0.5">
              依據賽事類型自訂各項評審標準（如咬字、台風、技巧等），並分配滿分與權重百分比。
            </p>
          </div>

          {/* AI Suggestion Button */}
          <div className="shrink-0 flex items-center space-x-2">
            <button
              type="button"
              id="btn-ai-suggest-criteria"
              onClick={handleAiSuggestCriteria}
              disabled={isAiLoading}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#183626] to-[#25523b] hover:from-[#204933] hover:to-[#2e6348] text-white text-xs font-bold shadow-md transition transform active:scale-95 disabled:opacity-50"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#f59e0b]" />
                  <span>智能推算中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#f59e0b]" />
                  <span>AI 智能推薦準則</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Category Templates Bar */}
        <div>
          <div className="text-xs font-bold text-[#574f3e] mb-2 flex items-center">
            <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-600" />
            或直接點選專家推薦準則：
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                id={`btn-preset-crit-${tpl.id}`}
                onClick={() => onApplyPreset(tpl.id)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-[#eee7d6] hover:bg-[#e2d9c4] text-[#2d281f] border border-[#d8d0bd] transition"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {aiMessage && (
          <div className="mt-3 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{aiMessage}</span>
          </div>
        )}

        {/* Weight Allocation Status Bar */}
        {data.scoringMethod === "weighted" && (
          <div className="mt-5 p-4 rounded-lg bg-[#f5efe3] border border-[#dfd8c7] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 font-bold text-[#2d281f]">
                <Scale className="w-4 h-4 text-[#e65100]" />
                <span>權重百分比分配校驗：</span>
                <span
                  className={`font-mono px-2 py-0.5 rounded text-xs ${
                    totalWeight === 100
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
                      : "bg-red-100 text-red-800 border border-red-300 font-bold"
                  }`}
                >
                  目前總計: {totalWeight}% {totalWeight === 100 ? "✓ 完美" : "≠ 100%"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-equalize-weights"
                  onClick={handleEqualizeWeights}
                  className="text-[11px] px-2 py-1 rounded bg-white hover:bg-[#eee8dc] text-[#3b3529] border border-[#cfc7b4] transition"
                >
                  均分權重
                </button>
                {totalWeight !== 100 && (
                  <button
                    type="button"
                    id="btn-normalize-weights"
                    onClick={handleNormalizeWeights}
                    className="text-[11px] px-2 py-1 rounded bg-[#183626] hover:bg-[#204933] text-white font-bold transition shadow-xs"
                  >
                    一鍵按比例平衡為 100%
                  </button>
                )}
              </div>
            </div>

            {/* Visual Bar */}
            <div className="h-3 w-full bg-[#ded6c3] rounded-full overflow-hidden flex">
              {data.criteria.map((c, i) => {
                const colors = [
                  "bg-emerald-600",
                  "bg-amber-500",
                  "bg-blue-600",
                  "bg-rose-500",
                  "bg-purple-600",
                  "bg-teal-600"
                ];
                const color = colors[i % colors.length];
                const pct = Math.max(0, Math.min(100, Number(c.weight) || 0));
                return (
                  <div
                    key={c.id || i}
                    className={`${color} h-full transition-all duration-300 relative group`}
                    style={{ width: `${(pct / Math.max(100, totalWeight)) * 100}%` }}
                    title={`${c.name}: ${c.weight}%`}
                  />
                );
              })}
            </div>

            {totalWeight !== 100 && (
              <div className="flex items-center space-x-1 text-[11px] text-red-700 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  提示：加權計分制要求所有評分準則權重總和為 100%（目前差{" "}
                  {100 - totalWeight > 0 ? `+${100 - totalWeight}%` : `${100 - totalWeight}%`}）。
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Criteria Cards List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#1a3828] flex items-center">
            <Sliders className="w-4 h-4 mr-1.5 text-[#e65100]" />
            各項評分準則明細 ({data.criteria.length} 項)
          </h3>
          <button
            type="button"
            id="btn-add-criterion"
            onClick={handleAddCriterion}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#183626] hover:bg-[#204933] text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            新增評分項目
          </button>
        </div>

        {data.criteria.map((crit, index) => (
          <div
            key={crit.id || index}
            className="bg-[#fcfbf7] p-4 sm:p-5 rounded-xl border border-[#ded8c8] shadow-xs space-y-3 relative group hover:border-[#1a3828] transition"
          >
            <div className="flex items-center justify-between border-b border-[#eee8dc] pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#183626] text-white flex items-center justify-center font-mono font-bold text-xs">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-[#504838]">
                  準則項目 #{index + 1}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDeleteCriterion(crit.id)}
                  disabled={data.criteria.length <= 1}
                  className="p-1 text-red-600 hover:text-red-800 disabled:opacity-30 rounded hover:bg-red-50 transition"
                  title="刪除此準則"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Criterion Name */}
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-[#4e4636] mb-1">
                  準則名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id={`input-crit-name-${index}`}
                  value={crit.name}
                  onChange={(e) => handleUpdateCriterion(crit.id, { name: e.target.value })}
                  placeholder="例如：語音與咬字 / 音準與節奏"
                  className="w-full text-xs font-bold px-3 py-2 rounded bg-white border border-[#cfc7b4] text-[#1a3828] focus:ring-1 focus:ring-[#1a3828] outline-none"
                />
              </div>

              {/* Max Score */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-[#4e4636] mb-1">
                  項目滿分值
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    id={`input-crit-max-${index}`}
                    value={crit.maxScore}
                    onChange={(e) =>
                      handleUpdateCriterion(crit.id, {
                        maxScore: Math.max(1, Number(e.target.value) || 1)
                      })
                    }
                    className="w-full font-mono font-bold text-xs px-2.5 py-2 rounded bg-white border border-[#cfc7b4] text-[#1a3828] outline-none text-center"
                  />
                  <span className="text-xs text-[#706755] font-semibold">分</span>
                </div>
              </div>

              {/* Weight % */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-[#4e4636] mb-1">
                  佔比權重 (%)
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    id={`input-crit-weight-${index}`}
                    value={crit.weight}
                    onChange={(e) =>
                      handleUpdateCriterion(crit.id, {
                        weight: Math.max(0, Math.min(100, Number(e.target.value) || 0))
                      })
                    }
                    className="w-full font-mono font-bold text-xs px-2.5 py-2 rounded bg-white border border-[#cfc7b4] text-[#1a3828] outline-none text-center"
                  />
                  <span className="text-xs text-[#706755] font-semibold">%</span>
                </div>
              </div>

              {/* Description / Judge Guidelines */}
              <div className="sm:col-span-12">
                <label className="block text-[11px] font-semibold text-[#665e4e] mb-1 flex items-center">
                  <Info className="w-3 h-3 mr-1 text-[#8b816d]" />
                  評判指引 / 扣分重點說明（將直接顯示於評判評分工作枱）
                </label>
                <input
                  type="text"
                  id={`input-crit-desc-${index}`}
                  value={crit.description || ""}
                  onChange={(e) => handleUpdateCriterion(crit.id, { description: e.target.value })}
                  placeholder="例如：發音準確度、聲調規範、吐字清晰度；超時每10秒扣1分"
                  className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#cfc7b4] text-[#554d3d] placeholder-[#a69e8f] outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#eee8dc] hover:bg-[#e4dcba] text-[#3d372b] font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>上一步：參賽名單</span>
        </button>

        <button
          id="btn-step3-next"
          type="button"
          onClick={onNext}
          className="inline-flex items-center px-6 py-3 rounded-lg bg-[#183626] hover:bg-[#204933] text-white font-bold text-sm shadow-md transition transform active:scale-95"
        >
          <span>下一步：進入現場評分工作枱</span>
          <ArrowRight className="w-4 h-4 ml-2 text-[#f59e0b]" />
        </button>
      </div>
    </div>
  );
};
