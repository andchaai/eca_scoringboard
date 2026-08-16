import React, { useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  Printer,
  FileSpreadsheet,
  Copy,
  Check,
  Tv,
  Share2,
  ChevronDown,
  ChevronUp,
  Download,
  Flame,
  Flag,
  GraduationCap,
  MessageSquare
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  CompetitionData,
  ContestantResult,
  HouseResult
} from "../types";
import { calculateHouseResults, generateCSVExport } from "../utils/scoring";

interface StepLeaderboardProps {
  data: CompetitionData;
  results: ContestantResult[];
  onOpenPresentation: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
}

export const StepLeaderboard: React.FC<StepLeaderboardProps> = ({
  data,
  results,
  onOpenPresentation,
  onPrint,
  onExportCSV
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"all" | "house" | "grade">("all");

  const houseResults: HouseResult[] = calculateHouseResults(results);
  const hasHouses = houseResults.length > 0;

  // Grade groupings
  const gradeMap: Record<string, ContestantResult[]> = {};
  results.forEach((r) => {
    const g = r.contestant.grade || (r.contestant.name.match(/^[0-9PFG]+/)?.[0]) || "未分類";
    if (!gradeMap[g]) gradeMap[g] = [];
    gradeMap[g].push(r);
  });
  const hasGrades = Object.keys(gradeMap).length > 1;

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Copy textual winner announcement
  const copyAnnouncementText = () => {
    if (results.length === 0) return;

    let text = `🏆【${data.name}】官方賽事計分結果公佈 🏆\n`;
    text += `📅 比賽日期：${data.date} | 📍 地點：${data.venue}\n\n`;

    const top3 = results.slice(0, 3);
    const medals = ["🥇【冠軍】", "🥈【亞軍】", "🥉【季軍】"];

    top3.forEach((r, idx) => {
      text += `${medals[idx]} ${r.contestant.number} ${r.contestant.name} —— 總分：${r.totalScore} 分\n`;
      if (r.contestant.subText) text += `   作品/備註: ${r.contestant.subText}\n`;
    });

    if (results.length > 3) {
      text += `\n🎖️【殿軍 / 優異獎名單】\n`;
      results.slice(3, 8).forEach((r) => {
        text += `• 第 ${r.rank} 名: ${r.contestant.number} ${r.contestant.name} (${r.totalScore} 分)\n`;
      });
    }

    if (hasHouses) {
      text += `\n🚩【社際總錦標積分榜】\n`;
      houseResults.forEach((h) => {
        text += `• 第 ${h.rank} 名: ${h.houseName} —— 總積分：${h.totalScore} 分 (參賽數: ${h.contestantCount})\n`;
      });
    }

    text += `\n裁判席總結算完畢。恭喜所有得獎及參賽單位！`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (results.length === 0) {
    return (
      <div className="py-16 text-center bg-[#fcfbf7] rounded-xl border border-[#ded8c8] max-w-lg mx-auto">
        <Trophy className="w-12 h-12 text-[#b0a796] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#1a3828]">尚無參賽結果</h3>
        <p className="text-xs text-[#706755] mt-1">
          請先於前述步驟設定參賽者名單並進行評分。
        </p>
      </div>
    );
  }

  const champion = results[0];
  const runnerUp = results[1];
  const secondRunnerUp = results[2];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner with Official Stamp look */}
      <div className="bg-[#fcfbf7] p-5 sm:p-7 rounded-xl border border-[#ded8c8] shadow-sm relative overflow-hidden">
        {/* Decorative referee seal stamp */}
        <div className="absolute right-4 -top-3 transform rotate-12 opacity-15 pointer-events-none hidden sm:block">
          <div className="w-28 h-28 rounded-full border-4 border-dashed border-[#183626] flex items-center justify-center text-center p-2">
            <span className="font-bold text-xs uppercase tracking-widest text-[#183626]">
              OFFICIAL RESULT 裁判席認證
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ece6d8] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                裁判席核准 • 正式成績總榜
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1a3828] mt-1 tracking-tight">
              {data.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#665e4e] mt-1">
              <span>📅 {data.date || "當日賽事"}</span>
              <span>📍 {data.venue || "主場地"}</span>
              <span className="font-mono">
                ⚖️ {data.judges.length} 位評判評分 • {data.contestants.length} 個單位
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-celebrate-confetti"
              onClick={triggerConfetti}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
              <span>彩帶祝賀</span>
            </button>

            <button
              type="button"
              id="btn-copy-announcement"
              onClick={copyAnnouncementText}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-white hover:bg-[#faf7f0] text-[#183626] border border-[#cfc7b4] text-xs font-bold transition shadow-xs"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>已複製得獎通告</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>複製得獎名單</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-open-presentation-mode"
              onClick={onOpenPresentation}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#e65100] hover:bg-[#f57c00] text-white text-xs font-bold shadow-md transition"
            >
              <Tv className="w-3.5 h-3.5 mr-1.5" />
              <span>大螢幕頒獎投影</span>
            </button>
          </div>
        </div>

        {/* Podium Display (Top 3) */}
        <div className="mt-6 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#554e3f] mb-3 text-center">
            冠、亞、季軍榮譽殿堂
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
            {/* 2nd Place (Silver) */}
            {runnerUp && (
              <div className="order-2 md:order-1 bg-gradient-to-b from-[#f5f5f7] to-[#e8e8ed] p-4 rounded-xl border border-[#d1d1d6] shadow-xs text-center relative group hover:border-[#183626] transition">
                <div className="w-9 h-9 rounded-full bg-[#8e8e93] text-white flex items-center justify-center font-bold mx-auto -mt-7 shadow-sm border-2 border-white">
                  2
                </div>
                <div className="text-xs font-bold text-[#636366] uppercase mt-2">
                  🥈 亞軍 (1st Runner-up)
                </div>
                <div className="text-sm font-mono font-bold text-[#1c1c1e] mt-1">
                  #{runnerUp.contestant.number}
                </div>
                <div className="text-base font-bold text-[#1c1c1e] truncate mt-0.5">
                  {runnerUp.contestant.name}
                </div>
                {runnerUp.contestant.subText && (
                  <div className="text-[11px] text-[#636366] truncate mt-0.5">
                    {runnerUp.contestant.subText}
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-[#d1d1d6] font-mono text-xl font-black text-[#1c1c1e]">
                  {runnerUp.totalScore}{" "}
                  <span className="text-xs font-sans text-[#636366]">分</span>
                </div>
              </div>
            )}

            {/* 1st Place (Gold / Champion) */}
            {champion && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-[#fffbeb] to-[#fef3c7] p-5 rounded-xl border-2 border-[#f59e0b] shadow-md text-center relative group transform md:-translate-y-2">
                <div className="w-12 h-12 rounded-full bg-[#f59e0b] text-[#78350f] flex items-center justify-center font-black text-lg mx-auto -mt-9 shadow-md border-2 border-white">
                  👑
                </div>
                <div className="text-xs font-extrabold text-[#b45309] uppercase tracking-wider mt-2">
                  🥇 冠軍 (Champion)
                </div>
                <div className="text-sm font-mono font-bold text-[#78350f] mt-1">
                  #{champion.contestant.number}
                </div>
                <div className="text-lg font-black text-[#78350f] truncate mt-0.5">
                  {champion.contestant.name}
                </div>
                {champion.contestant.subText && (
                  <div className="text-xs text-[#92400e] font-medium truncate mt-0.5">
                    {champion.contestant.subText}
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-[#fcd34d] font-mono text-2xl font-black text-[#b45309]">
                  {champion.totalScore}{" "}
                  <span className="text-xs font-sans text-[#92400e]">分</span>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {secondRunnerUp && (
              <div className="order-3 md:order-3 bg-gradient-to-b from-[#fff7ed] to-[#fed7aa]/40 p-4 rounded-xl border border-[#fdba74] shadow-xs text-center relative group hover:border-[#183626] transition">
                <div className="w-9 h-9 rounded-full bg-[#b45309] text-white flex items-center justify-center font-bold mx-auto -mt-7 shadow-sm border-2 border-white">
                  3
                </div>
                <div className="text-xs font-bold text-[#9a3412] uppercase mt-2">
                  🥉 季軍 (2nd Runner-up)
                </div>
                <div className="text-sm font-mono font-bold text-[#7c2d12] mt-1">
                  #{secondRunnerUp.contestant.number}
                </div>
                <div className="text-base font-bold text-[#7c2d12] truncate mt-0.5">
                  {secondRunnerUp.contestant.name}
                </div>
                {secondRunnerUp.contestant.subText && (
                  <div className="text-[11px] text-[#9a3412] truncate mt-0.5">
                    {secondRunnerUp.contestant.subText}
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-[#fdba74] font-mono text-xl font-black text-[#7c2d12]">
                  {secondRunnerUp.totalScore}{" "}
                  <span className="text-xs font-sans text-[#9a3412]">分</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* House Champions Standings (If house-based) */}
      {hasHouses && (
        <div className="bg-[#fcfbf7] p-5 sm:p-6 rounded-xl border border-[#ded8c8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#ece6d8] pb-3">
            <div className="flex items-center space-x-2">
              <Flag className="w-5 h-5 text-[#e65100]" />
              <h3 className="text-base font-bold text-[#1a3828]">
                社際爭霸總錦標積分榜 (House Standings)
              </h3>
            </div>
            <span className="text-xs text-[#706755]">
              依社制參賽選手得分自動加總結算
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {houseResults.map((house) => {
              const isFirst = house.rank === 1;
              return (
                <div
                  key={house.houseName}
                  className={`p-4 rounded-xl border transition-all ${
                    isFirst
                      ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30 shadow-sm"
                      : "bg-white border-[#dfd8c7]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: house.color }}
                      />
                      <span className="font-bold text-xs text-[#1a3828]">
                        {house.houseName}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                        isFirst
                          ? "bg-amber-200 text-amber-900"
                          : "bg-[#eee7d7] text-[#4d4637]"
                      }`}
                    >
                      第 {house.rank} 名
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] text-[#706755]">總積分合計</div>
                    <div className="font-mono text-2xl font-black text-[#183626]">
                      {house.totalScore}{" "}
                      <span className="text-xs font-sans font-normal text-[#706755]">
                        分
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#eee8dc] flex items-center justify-between text-[11px] text-[#706755]">
                    <span>參賽項目數: {house.contestantCount}</span>
                    <span>平均: {house.averageScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Complete Official Master Scoring Ledger Table */}
      <div className="bg-[#fcfbf7] p-5 sm:p-7 rounded-xl border border-[#ded8c8] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ece6d8] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#1a3828] flex items-center">
              <Award className="w-4 h-4 mr-1.5 text-[#e65100]" />
              全體參賽選手計分明細總表
            </h3>
            <p className="text-xs text-[#665e4e]">
              點擊任何選手即可展開各評判評分細項與評語備註。
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="btn-export-csv-bottom"
              onClick={onExportCSV}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#eee8dc] hover:bg-[#e4dcba] text-[#332e24] text-xs font-bold border border-[#cfc7b4] transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>匯出 CSV</span>
            </button>
            <button
              type="button"
              id="btn-print-bottom"
              onClick={onPrint}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#eee8dc] hover:bg-[#e4dcba] text-[#332e24] text-xs font-bold border border-[#cfc7b4] transition"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-sky-600" />
              <span>列印 / 存為 PDF</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f0ebd9] text-[#4d4637] border-y border-[#dfd8c7]">
                <th className="py-2.5 px-3 w-14 text-center font-bold">名次</th>
                <th className="py-2.5 px-3 w-16 font-bold">編號</th>
                <th className="py-2.5 px-3 font-bold min-w-[160px]">
                  參賽者 / 單位名稱
                </th>
                <th className="py-2.5 px-3 font-bold text-center text-[#e65100] w-24">
                  最終總分
                </th>
                {data.judges.map((j) => (
                  <th
                    key={j.id}
                    className="py-2.5 px-3 text-center font-bold min-w-[80px]"
                  >
                    {j.name}
                  </th>
                ))}
                <th className="py-2.5 px-3 w-20 text-center font-bold">明細</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece6d8]">
              {results.map((result) => {
                const isExpanded = expandedId === result.contestant.id;
                const isTop3 = result.rank <= 3;
                const medalEmojis = ["🥇", "🥈", "🥉"];

                return (
                  <React.Fragment key={result.contestant.id}>
                    <tr
                      onClick={() =>
                        setExpandedId(isExpanded ? null : result.contestant.id)
                      }
                      className={`hover:bg-[#f6f1e6] cursor-pointer transition-colors ${
                        isTop3 ? "bg-[#fffdf8]" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        {isTop3 ? (
                          <span className="font-bold text-sm">
                            {medalEmojis[result.rank - 1]}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-xs text-[#6e6553]">
                            {result.rank}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[#183626]">
                        {result.contestant.number}
                      </td>

                      <td className="py-3 px-3 font-semibold text-[#183626]">
                        <div className="flex items-center space-x-1.5">
                          <span>{result.contestant.name}</span>
                          {result.isTie && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                              並列
                            </span>
                          )}
                        </div>
                        {result.contestant.subText && (
                          <div className="text-[11px] text-[#706755] font-normal">
                            {result.contestant.subText}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-black text-sm text-[#e65100]">
                        {result.totalScore}
                      </td>

                      {data.judges.map((j) => {
                        const jScore = result.judgeScores.find(
                          (js) => js.judgeId === j.id
                        );
                        return (
                          <td
                            key={j.id}
                            className="py-3 px-3 text-center font-mono text-xs text-[#3d372b]"
                          >
                            {jScore?.completed ? jScore.score : "-"}
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          className="text-[#6d6452] hover:text-black font-semibold text-xs inline-flex items-center"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Breakdown Drawer */}
                    {isExpanded && (
                      <tr className="bg-[#f7f2e7] border-b border-[#dfd8c7]">
                        <td colSpan={5 + data.judges.length} className="p-4 sm:p-5">
                          <div className="space-y-4 bg-white p-4 rounded-xl border border-[#ded7c5]">
                            <div className="flex items-center justify-between border-b border-[#eee8dc] pb-2">
                              <span className="text-xs font-bold text-[#183626]">
                                【{result.contestant.number} {result.contestant.name}】詳細評分與評判評語
                              </span>
                              <span className="text-xs text-[#706755]">
                                共有 {result.completedJudgesCount} / {result.totalJudgesCount} 位評判完成給分
                              </span>
                            </div>

                            {/* Criteria averages */}
                            <div>
                              <div className="text-[11px] font-bold text-[#554d3d] mb-1.5">
                                各準則項目平均得分：
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {data.criteria.map((c) => (
                                  <div
                                    key={c.id}
                                    className="p-2 rounded bg-[#faf8f3] border border-[#e4ddcc] text-center"
                                  >
                                    <div className="text-[11px] text-[#706755] truncate">
                                      {c.name}
                                    </div>
                                    <div className="font-mono font-bold text-sm text-[#183626] mt-0.5">
                                      {result.criteriaAverages[c.id] || 0}{" "}
                                      <span className="text-[10px] text-[#8e8574]">
                                        / {c.maxScore}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Individual Judge remarks */}
                            <div>
                              <div className="text-[11px] font-bold text-[#554d3d] mb-1.5 flex items-center">
                                <MessageSquare className="w-3.5 h-3.5 mr-1 text-[#183626]" />
                                各評判備註評語匯整：
                              </div>
                              <div className="space-y-1.5">
                                {result.judgeScores.map((js) => (
                                  <div
                                    key={js.judgeId}
                                    className="text-xs p-2 rounded bg-[#faf8f3] border border-[#e4ddcc] flex items-start justify-between"
                                  >
                                    <span className="font-bold text-[#183626] shrink-0 mr-2">
                                      {js.judgeName} ({js.score}分):
                                    </span>
                                    <span className="text-[#554e3f] flex-1">
                                      {js.feedback || "無特別備註"}
                                    </span>
                                    {js.penalty ? (
                                      <span className="text-[10px] text-red-600 ml-2 font-mono">
                                        扣分: -{js.penalty}
                                      </span>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
