import React, { useState } from "react";
import { CompetitionData, Judge } from "../types";
import { Radio, Users, ChevronRight, ShieldCheck, Sparkles, LogIn, ArrowLeft } from "lucide-react";

interface JudgeEntryScreenProps {
  data: CompetitionData;
  onSelectJudge: (judgeId: string) => void;
  onBackToHost: () => void;
  roomCodeFromUrl?: string;
}

export const JudgeEntryScreen: React.FC<JudgeEntryScreenProps> = ({
  data,
  onSelectJudge,
  onBackToHost,
  roomCodeFromUrl
}) => {
  const [selectedId, setSelectedId] = useState<string>("");

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2c2820] flex items-center justify-center p-4">
      <div className="bg-[#fcfbf7] border-2 border-[#ded8c8] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top badge */}
        <div className="flex items-center justify-between border-b border-[#ece6d8] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#183626] text-amber-300 flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                即時雲端連線房間 #{roomCodeFromUrl || data.roomCode}
              </span>
              <h1 className="text-base font-black text-[#183626] mt-1">
                {data.name || "校際賽事計分"}
              </h1>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4d4637] block">
            請選擇您的評判姓名 / 席位：
          </label>
          <div className="space-y-2">
            {data.judges.map((judge, idx) => (
              <button
                key={judge.id}
                type="button"
                onClick={() => setSelectedId(judge.id)}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  selectedId === judge.id
                    ? "bg-[#183626] text-white border-[#183626] shadow-sm ring-2 ring-amber-400/40"
                    : "bg-white text-[#2c2820] border-[#ded8c8] hover:bg-[#faf7f0]"
                }`}
              >
                <div>
                  <div
                    className={`text-[10px] font-mono ${
                      selectedId === judge.id ? "text-amber-300" : "text-[#706755]"
                    }`}
                  >
                    席位 {idx + 1} ({judge.code || `J${idx + 1}`})
                  </div>
                  <div className="text-sm font-bold truncate">
                    {judge.name} {judge.title && `(${judge.title})`}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    selectedId === judge.id
                      ? "border-amber-300 bg-amber-300 text-[#183626]"
                      : "border-[#cfc7b4] text-transparent"
                  }`}
                >
                  ✓
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => selectedId && onSelectJudge(selectedId)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#e65100] hover:bg-[#f57c00] text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-40"
          >
            <LogIn className="w-4 h-4" />
            <span>進入專屬評分卡</span>
          </button>

          <button
            type="button"
            onClick={onBackToHost}
            className="w-full py-2 text-xs text-[#706755] hover:text-[#183626] font-medium flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回大會裁判席總控視角</span>
          </button>
        </div>

        <div className="p-3 bg-[#f2ede2] rounded-xl border border-[#ded7c5] text-[11px] text-[#554e3d] flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong>獨立頻道：</strong>您在此手機或平板提交的分數將實時推播至大會主席台，與其他評判評分互不干擾。
          </span>
        </div>
      </div>
    </div>
  );
};
