import React from "react";
import {
  ClipboardList,
  RotateCcw,
  Sparkles,
  Tv,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Radio,
  Share2
} from "lucide-react";
import { CompetitionData, ContestantResult } from "../types";

interface NavbarProps {
  data: CompetitionData;
  results: ContestantResult[];
  activeStep: number;
  onSelectStep: (step: number) => void;
  onReset: () => void;
  onLoadSample: () => void;
  onOpenPresentation: () => void;
  onOpenRoomShare: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  data,
  results,
  activeStep,
  onSelectStep,
  onReset,
  onLoadSample,
  onOpenPresentation,
  onOpenRoomShare,
  onPrint,
  onExportCSV
}) => {
  // Calculate completion percentage
  const totalSlots = (data.contestants.length || 0) * (data.judges.length || 0);
  let completedSlots = 0;
  for (const judge of data.judges) {
    for (const contestant of data.contestants) {
      const key = `${judge.id}___${contestant.id}`;
      if (data.scores[key]?.completed) {
        completedSlots++;
      }
    }
  }
  const completionRate = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#14281f] text-[#f4efe6] border-b border-[#2d4b3b] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand & Tournament Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectStep(1)}>
            <div className="w-10 h-10 rounded-lg bg-[#e65100] text-white flex items-center justify-center shadow-inner font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#f59e0b] bg-[#233d2f] px-2 py-0.5 rounded border border-[#3b5e4b]">
                  裁判席記事簿
                </span>
                <span className="text-xs text-[#a3b899]">多評判雲端同步</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[#faf8f5] tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {data.name || "未命名賽事計分表"}
              </h1>
            </div>
          </div>

          {/* Center Completion Metric */}
          <div className="hidden md:flex items-center space-x-3 bg-[#1c362a] px-3.5 py-1.5 rounded-full border border-[#2d4d3c]">
            {completionRate === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            )}
            <div className="text-xs">
              <span className="text-[#c1d1be]">評分進度: </span>
              <span className="font-mono font-bold text-white ml-1">
                {completedSlots}/{totalSlots} ({completionRate}%)
              </span>
            </div>
            <div className="w-16 bg-[#11241a] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Multi-judge Mobile Room Link Button */}
            <button
              id="btn-nav-room-share"
              onClick={onOpenRoomShare}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 shadow-xs transition animate-pulse"
              title="評判手機/平板掃碼連線房間"
            >
              <Radio className="w-3.5 h-3.5 mr-1 text-amber-300" />
              <span>評判掃碼連線</span>
            </button>

            <button
              id="btn-load-sample"
              onClick={onLoadSample}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#244234] hover:bg-[#2e5241] text-[#e2eddc] transition border border-[#395e4b]"
              title="載入預設範例賽事（朗誦/社際比賽）"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#f59e0b]" />
              <span className="hidden sm:inline">範例賽事</span>
              <span className="sm:hidden">範例</span>
            </button>

            {activeStep === 5 && (
              <>
                <button
                  id="btn-nav-export-csv"
                  onClick={onExportCSV}
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#244234] hover:bg-[#2e5241] text-[#e2eddc] transition border border-[#395e4b]"
                  title="匯出 CSV 試算表"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>匯出 CSV</span>
                </button>
                <button
                  id="btn-nav-print"
                  onClick={onPrint}
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#244234] hover:bg-[#2e5241] text-[#e2eddc] transition border border-[#395e4b]"
                  title="列印 / 存為 PDF"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-sky-400" />
                  <span>列印</span>
                </button>
              </>
            )}

            <button
              id="btn-nav-presentation"
              onClick={onOpenPresentation}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#e65100] hover:bg-[#f57c00] text-white shadow-sm transition"
              title="開啟大螢幕頒獎 / 投影看板"
            >
              <Tv className="w-3.5 h-3.5 mr-1" />
              <span>大螢幕看板</span>
            </button>

            <button
              id="btn-nav-reset"
              onClick={onReset}
              className="p-1.5 text-xs rounded-md text-[#a3b899] hover:text-white hover:bg-[#244234] transition"
              title="重設/清空此比賽"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
