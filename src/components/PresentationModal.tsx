import React, { useState } from "react";
import {
  X,
  Trophy,
  Sparkles,
  Maximize2,
  Minimize2,
  Tv,
  Flag,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";
import { CompetitionData, ContestantResult } from "../types";
import { calculateHouseResults } from "../utils/scoring";

interface PresentationModalProps {
  data: CompetitionData;
  results: ContestantResult[];
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  data,
  results,
  onClose
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const houseResults = calculateHouseResults(results);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const blastCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });
  };

  const top3 = results.slice(0, 3);
  const others = results.slice(3);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1f17] text-[#faf7f2] flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#213f30] bg-[#14291f] shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#e65100] text-white flex items-center justify-center font-bold shadow-md">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-[#f59e0b] uppercase tracking-wider bg-[#1f3c2d] px-2 py-0.5 rounded border border-[#2f5540]">
                裁判席即時看板 • 頒獎投影模式
              </span>
              <span className="text-xs text-[#a2bdae]">現場即時公佈</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {data.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={blastCelebration}
            className="px-3.5 py-1.5 rounded-lg bg-[#244b36] hover:bg-[#2f5f45] text-amber-300 border border-[#396c50] text-xs font-bold transition flex items-center shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>頒獎禮炮</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#1f3c2d] hover:bg-[#2a4e3b] text-white transition text-xs"
            title="全螢幕切換"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1f3c2d] hover:bg-red-900/80 text-white transition text-xs"
            title="關閉投影模式"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-8 flex flex-col justify-between">
        {/* Top 3 Podium Cards */}
        <div>
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest bg-[#183626] px-3 py-1 rounded-full border border-[#2c533e]">
              OFFICIAL WINNERS 頒獎台得獎榜
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="order-2 md:order-1 bg-[#1a3327] border-2 border-slate-400 p-6 rounded-2xl text-center shadow-xl relative transform hover:-translate-y-1 transition">
                <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black text-lg mx-auto -mt-10 shadow-lg border-4 border-[#14291f]">
                  2
                </div>
                <div className="text-xs font-extrabold text-slate-300 tracking-wider uppercase mt-2">
                  🥈 亞軍 (1st Runner-up)
                </div>
                <div className="font-mono text-sm font-bold text-amber-400 mt-1">
                  #{top3[1].contestant.number}
                </div>
                <div className="text-xl font-bold text-white mt-0.5 truncate">
                  {top3[1].contestant.name}
                </div>
                {top3[1].contestant.subText && (
                  <div className="text-xs text-slate-300 truncate mt-1">
                    {top3[1].contestant.subText}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-[#2a4d3b] font-mono text-3xl font-black text-slate-200">
                  {top3[1].totalScore}{" "}
                  <span className="text-sm font-sans font-normal text-slate-400">
                    分
                  </span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-[#244b36] to-[#1a3929] border-2 border-[#f59e0b] p-7 rounded-2xl text-center shadow-2xl relative transform md:-translate-y-4 hover:-translate-y-5 transition">
                <div className="w-16 h-16 rounded-full bg-[#f59e0b] text-[#78350f] flex items-center justify-center font-black text-2xl mx-auto -mt-14 shadow-2xl border-4 border-[#14291f]">
                  👑
                </div>
                <div className="text-sm font-black text-[#f59e0b] tracking-widest uppercase mt-3">
                  🥇 冠軍 (Champion)
                </div>
                <div className="font-mono text-base font-bold text-amber-300 mt-1">
                  #{top3[0].contestant.number}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1 truncate">
                  {top3[0].contestant.name}
                </div>
                {top3[0].contestant.subText && (
                  <div className="text-xs text-[#a2d1b7] truncate mt-1 font-medium">
                    {top3[0].contestant.subText}
                  </div>
                )}
                <div className="mt-5 pt-3 border-t border-[#346249] font-mono text-4xl font-black text-[#f59e0b]">
                  {top3[0].totalScore}{" "}
                  <span className="text-sm font-sans font-normal text-[#a2d1b7]">
                    分
                  </span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="order-3 md:order-3 bg-[#1a3327] border-2 border-[#ea580c] p-6 rounded-2xl text-center shadow-xl relative transform hover:-translate-y-1 transition">
                <div className="w-12 h-12 rounded-full bg-[#ea580c] text-white flex items-center justify-center font-black text-lg mx-auto -mt-10 shadow-lg border-4 border-[#14291f]">
                  3
                </div>
                <div className="text-xs font-extrabold text-orange-300 tracking-wider uppercase mt-2">
                  🥉 季軍 (2nd Runner-up)
                </div>
                <div className="font-mono text-sm font-bold text-amber-400 mt-1">
                  #{top3[2].contestant.number}
                </div>
                <div className="text-xl font-bold text-white mt-0.5 truncate">
                  {top3[2].contestant.name}
                </div>
                {top3[2].contestant.subText && (
                  <div className="text-xs text-orange-200 truncate mt-1">
                    {top3[2].contestant.subText}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-[#2a4d3b] font-mono text-3xl font-black text-orange-300">
                  {top3[2].totalScore}{" "}
                  <span className="text-sm font-sans font-normal text-orange-400">
                    分
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* House standings or Merit ranks ticker */}
        {houseResults.length > 0 ? (
          <div className="bg-[#14281f] p-5 rounded-2xl border border-[#234533]">
            <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
              <Flag className="w-4 h-4" />
              <span>社際爭霸總錦標排名</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {houseResults.map((h) => (
                <div
                  key={h.houseName}
                  className="bg-[#1c382b] p-3 rounded-xl border border-[#2e5740] flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: h.color }}
                    />
                    <span className="text-xs font-bold text-white truncate">
                      {h.houseName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8cb89f] block">
                      第 {h.rank} 名
                    </span>
                    <span className="font-mono font-bold text-sm text-[#f59e0b]">
                      {h.totalScore}分
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : others.length > 0 ? (
          <div className="bg-[#14281f] p-5 rounded-2xl border border-[#234533]">
            <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>殿軍及優異獎排名 (Merit Standings)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {others.slice(0, 6).map((r) => (
                <div
                  key={r.contestant.id}
                  className="bg-[#1c382b] p-2.5 rounded-xl border border-[#2e5740] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-mono font-bold text-[#a2d1b7] px-1.5 py-0.5 rounded bg-black/30">
                      第 {r.rank} 名
                    </span>
                    <span className="text-white font-bold truncate">
                      {r.contestant.number} {r.contestant.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#f59e0b] ml-2 shrink-0">
                    {r.totalScore} 分
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Footer info */}
        <div className="text-center text-xs text-[#719983] border-t border-[#1d3d2c] pt-4">
          裁判席計分紀錄簿 • 即時自動結算認證 • {data.venue}
        </div>
      </div>
    </div>
  );
};
