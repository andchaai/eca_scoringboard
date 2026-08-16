import React from "react";
import {
  Calendar,
  MapPin,
  Users2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Plus,
  Trash2
} from "lucide-react";
import { CompetitionData, Judge, ScoringMethod } from "../types";
import { PRESET_TEMPLATES } from "../data/presets";

interface StepEventSetupProps {
  data: CompetitionData;
  onChange: (updated: Partial<CompetitionData>) => void;
  onNext: () => void;
  onApplyPreset: (presetId: string) => void;
}

const QUICK_TITLES = [
  "2026 年度全港校際朗誦節 決賽",
  "年度社際歌唱大賽 (四社爭霸)",
  "中學部班際合唱與音樂節",
  "英語即興演講與辯論總決賽",
  "校園才藝匯演與綜合達人秀",
  "創客發明與 STEM 專題研習評審"
];

export const StepEventSetup: React.FC<StepEventSetupProps> = ({
  data,
  onChange,
  onNext,
  onApplyPreset
}) => {
  const handleJudgesCountChange = (count: number) => {
    const clampedCount = Math.max(1, Math.min(12, count));
    const currentJudges = [...data.judges];

    if (clampedCount > currentJudges.length) {
      for (let i = currentJudges.length + 1; i <= clampedCount; i++) {
        currentJudges.push({
          id: `j_${Date.now()}_${i}`,
          name: `評判 ${i}`,
          title: i === 1 ? "主評判" : "評審委員",
          code: `J${i}`
        });
      }
    } else if (clampedCount < currentJudges.length) {
      currentJudges.splice(clampedCount);
    }

    onChange({ judges: currentJudges });
  };

  const handleJudgeNameChange = (index: number, name: string) => {
    const updated = [...data.judges];
    updated[index] = { ...updated[index], name };
    onChange({ judges: updated });
  };

  const handleJudgeTitleChange = (index: number, title: string) => {
    const updated = [...data.judges];
    updated[index] = { ...updated[index], title };
    onChange({ judges: updated });
  };

  const autoFillJudges = () => {
    const titles = ["主審評判", "客席評判", "專業評判", "資深評判", "嘉賓評判", "評審委員"];
    const updated = data.judges.map((j, idx) => ({
      ...j,
      name: `評判 ${idx + 1}`,
      title: titles[idx % titles.length]
    }));
    onChange({ judges: updated });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Banner Card */}
      <div className="bg-[#fcfbf7] p-5 sm:p-7 rounded-xl border border-[#ded8c8] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ece6d8] pb-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#9a3412]">
                步驟 1 / 5
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a3828] mt-1">
              賽事基本資料與評判席設定
            </h2>
            <p className="text-xs sm:text-sm text-[#665e4e] mt-0.5">
              設定賽事名稱、日期、計分規則，並指派 1 至 12 位現場評判名單。
            </p>
          </div>

          {/* Quick preset dropdown button */}
          <div className="shrink-0">
            <div className="text-xs text-[#786f5c] mb-1 font-medium">快速套用賽事範本：</div>
            <select
              id="select-preset-template"
              className="text-xs font-medium bg-[#f2ecde] text-[#183626] border border-[#cfc7b4] rounded-md px-3 py-2 focus:ring-2 focus:ring-[#204933] outline-none cursor-pointer"
              onChange={(e) => {
                if (e.target.value) {
                  onApplyPreset(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                -- 選擇推薦比賽範本 --
              </option>
              {PRESET_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  ✨ {tpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Competition Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#494233] mb-1.5">
              比賽名稱 <span className="text-red-500">*</span>
            </label>
            <input
              id="input-competition-name"
              type="text"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="例如：2026 年度全港校際朗誦節 決賽"
              className="w-full text-base font-semibold px-3.5 py-2.5 rounded-lg bg-white border border-[#cfc7b4] text-[#193627] placeholder-[#a8a192] focus:border-[#193627] focus:ring-2 focus:ring-[#193627]/10 outline-none transition"
            />
            {/* Quick title suggestion chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-[#7d7463] flex items-center mr-1">
                <Sparkles className="w-3 h-3 mr-0.5 text-amber-600" />
                常用名稱：
              </span>
              {QUICK_TITLES.map((title, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange({ name: title })}
                  className="text-[11px] bg-[#f0ebd9] hover:bg-[#e4ddc8] text-[#3e382b] px-2 py-0.5 rounded border border-[#ded5bf] transition"
                >
                  {title.slice(0, 10)}...
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle / Session */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#494233] mb-1.5">
              組別 / 副標題
            </label>
            <input
              id="input-competition-subtitle"
              type="text"
              value={data.subtitle || ""}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="例如：中學甲組 (中四至中六) / 決賽組"
              className="w-full text-sm px-3.5 py-2 rounded-lg bg-white border border-[#cfc7b4] text-[#193627] placeholder-[#a8a192] focus:border-[#193627] focus:ring-1 focus:ring-[#193627] outline-none"
            />
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#494233] mb-1.5">
              主辦機構 / 統籌單位
            </label>
            <input
              id="input-competition-organizer"
              type="text"
              value={data.organizer || ""}
              onChange={(e) => onChange({ organizer: e.target.value })}
              placeholder="例如：中文科組及評判席聯委會"
              className="w-full text-sm px-3.5 py-2 rounded-lg bg-white border border-[#cfc7b4] text-[#193627] placeholder-[#a8a192] focus:border-[#193627] focus:ring-1 focus:ring-[#193627] outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#494233] mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#6b6250]" />
              比賽日期
            </label>
            <input
              id="input-competition-date"
              type="date"
              value={data.date}
              onChange={(e) => onChange({ date: e.target.value })}
              className="w-full text-sm px-3.5 py-2 rounded-lg bg-white border border-[#cfc7b4] text-[#193627] focus:border-[#193627] focus:ring-1 focus:ring-[#193627] outline-none"
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#494233] mb-1.5 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#6b6250]" />
              比賽場地 / 地點
            </label>
            <input
              id="input-competition-venue"
              type="text"
              value={data.venue}
              onChange={(e) => onChange({ venue: e.target.value })}
              placeholder="例如：學校大禮堂 / 主演講廳"
              className="w-full text-sm px-3.5 py-2 rounded-lg bg-white border border-[#cfc7b4] text-[#193627] placeholder-[#a8a192] focus:border-[#193627] focus:ring-1 focus:ring-[#193627] outline-none"
            />
          </div>

          {/* Scoring System & Decimals */}
          <div className="md:col-span-2 bg-[#f4eee1] p-4 rounded-lg border border-[#ded7c5] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#1f3d2d]">
              <Calculator className="w-4 h-4 text-[#e65100]" />
              <span>計分公式與排名規則</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  id: "weighted",
                  name: "加權百分制 (推薦)",
                  desc: "各準則按自訂權重 (合共100%) 計算各評判給分後取均分"
                },
                {
                  id: "trimmed_mean",
                  name: "去掉最高最低分",
                  desc: "奧運/體育賽制，剔除最高與最低評判分後取均分 (需 ≥3 位評判)"
                },
                {
                  id: "average",
                  name: "評判算術平均分",
                  desc: "將所有有效評判的給分直接進行算術平均"
                },
                {
                  id: "sum",
                  name: "評判總分直接加總",
                  desc: "將每位評判的所有項目直接加總合計"
                }
              ].map((method) => (
                <button
                  key={method.id}
                  id={`scoring-method-${method.id}`}
                  type="button"
                  onClick={() => onChange({ scoringMethod: method.id as ScoringMethod })}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    data.scoringMethod === method.id
                      ? "bg-white border-[#183626] ring-2 ring-[#183626]/20 shadow-sm"
                      : "bg-[#ece5d5] border-[#d8d0bd] text-[#554e3f] hover:bg-[#e7dfce]"
                  }`}
                >
                  <div className="text-xs font-bold text-[#1a3828] flex items-center justify-between">
                    <span>{method.name}</span>
                    {data.scoringMethod === method.id && (
                      <span className="w-2 h-2 rounded-full bg-[#e65100]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#6d6452] mt-1 leading-snug">
                    {method.desc}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#ded7c5] text-xs text-[#5a5241]">
              <div className="flex items-center space-x-2">
                <span>小數位精度：</span>
                {[0, 1, 2].map((dp) => (
                  <button
                    key={dp}
                    type="button"
                    onClick={() => onChange({ decimalPlaces: dp })}
                    className={`px-2.5 py-0.5 rounded font-mono font-medium ${
                      data.decimalPlaces === dp
                        ? "bg-[#183626] text-white"
                        : "bg-[#e2d9c6] text-[#423c2f] hover:bg-[#d8ceb9]"
                    }`}
                  >
                    {dp === 0 ? "整數" : `${dp} 位小數`}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[#7a715e]">
                同分時自動依據標準規程進行並列排名
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Judges Setup Section */}
      <div className="bg-[#fcfbf7] p-5 sm:p-7 rounded-xl border border-[#ded8c8] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ece6d8] pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#204933] text-[#f59e0b] flex items-center justify-center font-bold">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a3828]">
                評判名單設定 (1 – 12 位)
              </h3>
              <p className="text-xs text-[#665e4e]">
                目前共設 <span className="font-bold text-[#e65100]">{data.judges.length}</span> 位評判，可在下方填寫每位評判姓名與稱謂。
              </p>
            </div>
          </div>

          {/* Stepper controls */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={autoFillJudges}
              className="text-xs px-2.5 py-1.5 rounded-md bg-[#eee7d7] hover:bg-[#e4dcba] text-[#423c2f] border border-[#d8ceb9] transition font-medium"
            >
              一鍵重置評判名稱
            </button>
            <div className="flex items-center bg-[#f0ebd9] rounded-lg border border-[#cfc7b4] p-1">
              <button
                type="button"
                id="btn-decrease-judges"
                onClick={() => handleJudgesCountChange(data.judges.length - 1)}
                disabled={data.judges.length <= 1}
                className="w-7 h-7 flex items-center justify-center rounded bg-white text-[#193627] font-bold shadow-xs hover:bg-[#faf7f0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-9 text-center font-mono font-bold text-sm text-[#193627]">
                {data.judges.length}
              </span>
              <button
                type="button"
                id="btn-increase-judges"
                onClick={() => handleJudgesCountChange(data.judges.length + 1)}
                disabled={data.judges.length >= 12}
                className="w-7 h-7 flex items-center justify-center rounded bg-white text-[#193627] font-bold shadow-xs hover:bg-[#faf7f0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Judges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {data.judges.map((judge, index) => (
            <div
              key={judge.id || index}
              className="p-3.5 rounded-lg bg-[#f7f3e9] border border-[#dfd8c7] space-y-2 relative focus-within:border-[#1a3828] focus-within:bg-white transition"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-[#183626] text-white text-[11px]">
                  J{index + 1}
                </span>
                <span className="text-[#7c7362] text-[11px]">評判 #{index + 1}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5a5240] mb-0.5">
                  評判姓名
                </label>
                <input
                  type="text"
                  id={`input-judge-name-${index}`}
                  value={judge.name}
                  onChange={(e) => handleJudgeNameChange(index, e.target.value)}
                  placeholder={`評判 ${index + 1}`}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded bg-white border border-[#cfc7b4] text-[#1a3828] focus:ring-1 focus:ring-[#1a3828] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5a5240] mb-0.5">
                  職銜 / 身份
                </label>
                <input
                  type="text"
                  id={`input-judge-title-${index}`}
                  value={judge.title || ""}
                  onChange={(e) => handleJudgeTitleChange(index, e.target.value)}
                  placeholder="例如：主評判 / 高級顧問"
                  className="w-full text-xs px-2.5 py-1.5 rounded bg-white border border-[#cfc7b4] text-[#1a3828] focus:ring-1 focus:ring-[#1a3828] outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Step Action Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-[#706755]">
          已設定 <span className="font-bold text-[#1a3828]">{data.judges.length}</span> 位評判席名額
        </div>
        <button
          id="btn-step1-next"
          type="button"
          onClick={onNext}
          className="inline-flex items-center px-6 py-3 rounded-lg bg-[#183626] hover:bg-[#204933] text-white font-bold text-sm shadow-md transition transform active:scale-95"
        >
          <span>下一步：設定參賽單位與名單</span>
          <ArrowRight className="w-4 h-4 ml-2 text-[#f59e0b]" />
        </button>
      </div>
    </div>
  );
};
