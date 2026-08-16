import React, { useState } from "react";
import {
  Users,
  GraduationCap,
  Flag,
  User,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ClipboardPaste,
  ChevronUp,
  ChevronDown,
  Check
} from "lucide-react";
import { CompetitionData, Contestant, ContestantType } from "../types";
import { HOUSE_PRESETS, CLASS_LETTERS } from "../data/presets";

interface StepContestantSetupProps {
  data: CompetitionData;
  onChange: (updated: Partial<CompetitionData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepContestantSetup: React.FC<StepContestantSetupProps> = ({
  data,
  onChange,
  onNext,
  onPrev
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ContestantType>("class");

  // Class generator state
  const [selectedGrades, setSelectedGrades] = useState<string[]>(["1", "2"]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["A", "B", "C", "D"]);
  const [gradePrefix, setGradePrefix] = useState<string>(""); // e.g. "F." or "P." or ""

  // Individual contestant form
  const [singleNumber, setSingleNumber] = useState<string>(
    String(data.contestants.length + 1).padStart(2, "0")
  );
  const [singleName, setSingleName] = useState<string>("");
  const [singleSubtext, setSingleSubtext] = useState<string>("");

  // Batch paste state
  const [batchText, setBatchText] = useState<string>("");
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Add individual contestant
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) return;

    const newContestant: Contestant = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      number: singleNumber.trim() || String(data.contestants.length + 1).padStart(2, "0"),
      name: singleName.trim(),
      subText: singleSubtext.trim() || undefined,
      type: "individual",
      order: data.contestants.length + 1
    };

    const updated = [...data.contestants, newContestant];
    onChange({ contestants: updated });
    setSingleName("");
    setSingleSubtext("");
    setSingleNumber(String(updated.length + 1).padStart(2, "0"));
  };

  // Generate Class-based contestants
  const handleGenerateClasses = (customGrades?: string[], customClasses?: string[]) => {
    const gradesToUse = customGrades || selectedGrades;
    const classesToUse = customClasses || selectedClasses;

    const newContestants: Contestant[] = [];
    let counter = data.contestants.length + 1;

    for (const g of gradesToUse) {
      for (const c of classesToUse) {
        const className = `${gradePrefix}${g}${c}`;
        newContestants.push({
          id: `c_class_${Date.now()}_${g}${c}`,
          number: className,
          name: `${className} 班`,
          grade: `${gradePrefix}${g}`,
          type: "class",
          order: counter++
        });
      }
    }

    onChange({ contestants: [...data.contestants, ...newContestants] });
  };

  // Quick preset class sets
  const handleQuickClassSet = (type: "all" | "junior" | "senior" | "single_g1" | "single_g2") => {
    let grades: string[] = [];
    if (type === "all") grades = ["1", "2", "3", "4", "5", "6"];
    if (type === "junior") grades = ["1", "2", "3"];
    if (type === "senior") grades = ["4", "5", "6"];
    if (type === "single_g1") grades = ["1"];
    if (type === "single_g2") grades = ["2"];

    const classes = ["A", "B", "C", "D"];
    const generated: Contestant[] = [];
    let counter = 1;

    for (const g of grades) {
      for (const c of classes) {
        const className = `${gradePrefix}${g}${c}`;
        generated.push({
          id: `c_class_${Date.now()}_${g}${c}_${counter}`,
          number: className,
          name: `${className} 班`,
          grade: `${gradePrefix}${g}`,
          type: "class",
          order: counter++
        });
      }
    }

    onChange({ contestants: generated });
  };

  // Generate House-based contestants
  const handleApplyHousePreset = (presetIndex: number) => {
    const preset = HOUSE_PRESETS[presetIndex];
    if (!preset) return;

    const newContestants: Contestant[] = preset.houses.map((h, idx) => ({
      id: `c_house_${Date.now()}_${idx}`,
      number: `H0${idx + 1}`,
      name: h.name,
      house: h.shortName,
      type: "house",
      order: idx + 1
    }));

    onChange({ contestants: newContestants });
  };

  // Parse batch paste
  const handleProcessBatch = () => {
    if (!batchText.trim()) return;
    const lines = batchText.split("\n").filter((l) => l.trim().length > 0);
    const parsed: Contestant[] = [];
    let counter = data.contestants.length + 1;

    for (const line of lines) {
      // Formats: "01 張三 - 《念奴嬌》" or "張三 - 《念奴嬌》" or "張三"
      const clean = line.trim();
      let num = String(counter).padStart(2, "0");
      let name = clean;
      let sub = "";

      // Check if starts with number
      const numMatch = clean.match(/^([0-9A-Za-z\-_.]+)\s*[\.\、\:\-\s]\s*(.*)$/);
      if (numMatch) {
        num = numMatch[1];
        const rest = numMatch[2];
        if (rest.includes("-") || rest.includes("—") || rest.includes(":")) {
          const parts = rest.split(/[-—:]/);
          name = parts[0].trim();
          sub = parts.slice(1).join("-").trim();
        } else {
          name = rest.trim();
        }
      } else if (clean.includes("-") || clean.includes("—") || clean.includes(":")) {
        const parts = clean.split(/[-—:]/);
        name = parts[0].trim();
        sub = parts.slice(1).join("-").trim();
      }

      parsed.push({
        id: `c_batch_${Date.now()}_${counter}`,
        number: num,
        name: name,
        subText: sub || undefined,
        type: "individual",
        order: counter++
      });
    }

    onChange({ contestants: [...data.contestants, ...parsed] });
    setBatchText("");
    setShowBatchModal(false);
  };

  // Reorder / Delete / Update contestant
  const handleDeleteContestant = (id: string) => {
    const updated = data.contestants.filter((c) => c.id !== id);
    onChange({ contestants: updated });
  };

  const handleUpdateContestant = (id: string, updates: Partial<Contestant>) => {
    const updated = data.contestants.map((c) => (c.id === id ? { ...c, ...updates } : c));
    onChange({ contestants: updated });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= data.contestants.length) return;
    const clone = [...data.contestants];
    const temp = clone[index];
    clone[index] = clone[targetIdx];
    clone[targetIdx] = temp;
    clone.forEach((item, idx) => {
      item.order = idx + 1;
    });
    onChange({ contestants: clone });
  };

  const handleClearAll = () => {
    if (data.contestants.length === 0) return;
    if (window.confirm("確定要清空目前所有參賽者名單嗎？")) {
      onChange({ contestants: [] });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-[#fcfbf7] p-5 sm:p-7 rounded-xl border border-[#ded8c8] shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#9a3412]">
            步驟 2 / 5
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a3828] mt-1">
          設定參賽單位與選手名單
        </h2>
        <p className="text-xs sm:text-sm text-[#665e4e] mt-0.5">
          提供三大快捷生成選項：<strong>(1) 班制比賽</strong>（1A–2D等各級班別）、
          <strong>(2) 社制比賽</strong>（忠義勤儉四社）、<strong>(3) 個人/自訂項目</strong>。
        </p>

        {/* 3 Main Presets Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-5 p-1 bg-[#efe9dc] rounded-lg border border-[#d8d1bf]">
          <button
            type="button"
            id="tab-btn-class"
            onClick={() => setActiveSubTab("class")}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === "class"
                ? "bg-[#183626] text-[#faf8f5] shadow-sm"
                : "text-[#534c3e] hover:bg-[#e4ddcc] hover:text-[#183626]"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>(1) 班制比賽</span>
          </button>

          <button
            type="button"
            id="tab-btn-house"
            onClick={() => setActiveSubTab("house")}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === "house"
                ? "bg-[#183626] text-[#faf8f5] shadow-sm"
                : "text-[#534c3e] hover:bg-[#e4ddcc] hover:text-[#183626]"
            }`}
          >
            <Flag className="w-4 h-4 text-orange-400" />
            <span>(2) 社制比賽</span>
          </button>

          <button
            type="button"
            id="tab-btn-individual"
            onClick={() => setActiveSubTab("individual")}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === "individual"
                ? "bg-[#183626] text-[#faf8f5] shadow-sm"
                : "text-[#534c3e] hover:bg-[#e4ddcc] hover:text-[#183626]"
            }`}
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>(3) 個人/自訂項目</span>
          </button>
        </div>

        {/* Generator Panel: Class */}
        {activeSubTab === "class" && (
          <div className="mt-4 p-4 rounded-lg bg-[#f6f2e8] border border-[#ded8c8] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1a3828] flex items-center">
                <GraduationCap className="w-4 h-4 mr-1 text-[#e65100]" />
                班制比賽快速產生工具 (1A、1B、1C、1D 等)
              </span>
              <div className="text-[11px] text-[#706755]">
                可自選年級與ABCD班別
              </div>
            </div>

            {/* Quick 1-Click Common Set Buttons */}
            <div>
              <div className="text-[11px] font-bold text-[#554d3d] mb-1.5">
                常用一鍵套用組合：
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  id="btn-quick-1a-1d"
                  onClick={() => handleQuickClassSet("single_g1")}
                  className="px-3 py-1.5 rounded-md bg-white border border-[#cfc7b4] text-xs font-semibold text-[#183626] hover:bg-[#183626] hover:text-white transition shadow-xs"
                >
                  🏫 1A、1B、1C、1D (中一/小一)
                </button>
                <button
                  type="button"
                  id="btn-quick-2a-2d"
                  onClick={() => handleQuickClassSet("single_g2")}
                  className="px-3 py-1.5 rounded-md bg-white border border-[#cfc7b4] text-xs font-semibold text-[#183626] hover:bg-[#183626] hover:text-white transition shadow-xs"
                >
                  🏫 2A、2B、2C、2D (中二/小二)
                </button>
                <button
                  type="button"
                  id="btn-quick-junior"
                  onClick={() => handleQuickClassSet("junior")}
                  className="px-3 py-1.5 rounded-md bg-white border border-[#cfc7b4] text-xs font-semibold text-[#183626] hover:bg-[#183626] hover:text-white transition shadow-xs"
                >
                  📚 初級組 1A–3D (共12班)
                </button>
                <button
                  type="button"
                  id="btn-quick-all"
                  onClick={() => handleQuickClassSet("all")}
                  className="px-3 py-1.5 rounded-md bg-white border border-[#cfc7b4] text-xs font-semibold text-[#183626] hover:bg-[#183626] hover:text-white transition shadow-xs"
                >
                  🏆 全校 1A–6D (共24班)
                </button>
              </div>
            </div>

            {/* Custom Multi-Grade & Multi-Class Picker */}
            <div className="bg-white p-3.5 rounded-lg border border-[#ded7c5] space-y-3">
              <div className="text-xs font-bold text-[#3d372a]">
                或自選年級與班別自由組合：
              </div>

              {/* Grades selection */}
              <div>
                <span className="text-[11px] text-[#6d6452] block mb-1">
                  選擇年級（可複選）：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["1", "2", "3", "4", "5", "6"].map((g) => {
                    const isSelected = selectedGrades.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGrades(selectedGrades.filter((x) => x !== g));
                          } else {
                            setSelectedGrades([...selectedGrades, g].sort());
                          }
                        }}
                        className={`px-3 py-1 rounded text-xs font-bold transition ${
                          isSelected
                            ? "bg-[#183626] text-white"
                            : "bg-[#eee8dc] text-[#554d3d] hover:bg-[#e4ddcc]"
                        }`}
                      >
                        {g} 年級 (Form {g})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Class letters selection */}
              <div>
                <span className="text-[11px] text-[#6d6452] block mb-1">
                  選擇班別代號（可複選）：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CLASS_LETTERS.map((c) => {
                    const isSelected = selectedClasses.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedClasses(selectedClasses.filter((x) => x !== c));
                          } else {
                            setSelectedClasses([...selectedClasses, c]);
                          }
                        }}
                        className={`w-9 h-8 rounded text-xs font-bold transition flex items-center justify-center ${
                          isSelected
                            ? "bg-[#e65100] text-white"
                            : "bg-[#eee8dc] text-[#554d3d] hover:bg-[#e4ddcc]"
                        }`}
                      >
                        {c} 班
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#eee8dc]">
                <div className="text-xs text-[#6e6553]">
                  將生成：{" "}
                  <span className="font-mono font-bold text-[#183626]">
                    {selectedGrades.length * selectedClasses.length}
                  </span>{" "}
                  個班級單位
                </div>
                <button
                  type="button"
                  id="btn-generate-custom-classes"
                  onClick={() => handleGenerateClasses()}
                  disabled={selectedGrades.length === 0 || selectedClasses.length === 0}
                  className="px-4 py-1.5 rounded-md bg-[#183626] hover:bg-[#204933] text-white font-bold text-xs shadow-xs disabled:opacity-40 transition"
                >
                  + 加入所選班級
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generator Panel: House */}
        {activeSubTab === "house" && (
          <div className="mt-4 p-4 rounded-lg bg-[#f6f2e8] border border-[#ded8c8] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1a3828] flex items-center">
                <Flag className="w-4 h-4 mr-1 text-[#e65100]" />
                社制比賽快速產生工具 (「忠」、「義」、「勤」、「儉」四社)
              </span>
              <div className="text-[11px] text-[#706755]">
                自動載入四社配色與名稱
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HOUSE_PRESETS.map((preset, pIdx) => (
                <div
                  key={pIdx}
                  className="bg-white p-3.5 rounded-lg border border-[#ded7c5] space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1a3828]">
                      {preset.groupName}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {preset.houses.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-center space-x-2 px-2 py-1.5 rounded bg-[#faf8f3] border border-[#eae4d5]"
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: h.color }}
                          />
                          <span className="text-xs font-semibold text-[#28241b] truncate">
                            {h.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    id={`btn-apply-house-${pIdx}`}
                    onClick={() => handleApplyHousePreset(pIdx)}
                    className="w-full py-1.5 px-3 rounded bg-[#183626] hover:bg-[#224d36] text-white text-xs font-bold shadow-xs transition"
                  >
                    一鍵套用此四社名單
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generator Panel: Individual */}
        {activeSubTab === "individual" && (
          <div className="mt-4 p-4 rounded-lg bg-[#f6f2e8] border border-[#ded8c8] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1a3828] flex items-center">
                <User className="w-4 h-4 mr-1 text-[#e65100]" />
                個人/自訂項目選手新增
              </span>
              <button
                type="button"
                id="btn-open-batch-paste"
                onClick={() => setShowBatchModal(true)}
                className="text-xs text-[#183626] hover:underline font-semibold flex items-center"
              >
                <ClipboardPaste className="w-3.5 h-3.5 mr-1" />
                批次文字貼上多位選手
              </button>
            </div>

            <form onSubmit={handleAddSingle} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#554d3d] mb-1">
                  出場編號
                </label>
                <input
                  type="text"
                  id="input-single-contestant-num"
                  value={singleNumber}
                  onChange={(e) => setSingleNumber(e.target.value)}
                  placeholder="01"
                  className="w-full text-xs font-mono font-bold px-2.5 py-2 rounded bg-white border border-[#cfc7b4] text-[#1a3828] outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-[#554d3d] mb-1">
                  參賽者姓名 / 單位隊名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-single-contestant-name"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="例如：陳志豪 / 弦樂四重奏"
                  className="w-full text-xs font-semibold px-2.5 py-2 rounded bg-white border border-[#cfc7b4] text-[#1a3828] outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-[#554d3d] mb-1">
                  參賽作品 / 曲目 / 講題
                </label>
                <input
                  type="text"
                  id="input-single-contestant-subtext"
                  value={singleSubtext}
                  onChange={(e) => setSingleSubtext(e.target.value)}
                  placeholder="例如：《將進酒》"
                  className="w-full text-xs px-2.5 py-2 rounded bg-white border border-[#cfc7b4] text-[#1a3828] outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  id="btn-add-single-contestant"
                  className="w-full py-2 px-3 rounded bg-[#183626] hover:bg-[#204933] text-white text-xs font-bold shadow-xs transition flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  新增
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Contestants Table Ledger */}
      <div className="bg-[#fcfbf7] p-5 sm:p-7 rounded-xl border border-[#ded8c8] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#ece6d8] pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-[#1a3828]">
              目前參賽名單總覽
            </h3>
            <span className="text-xs font-mono font-bold bg-[#183626] text-white px-2 py-0.5 rounded-full">
              共 {data.contestants.length} 個單位
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="btn-clear-all-contestants"
              onClick={handleClearAll}
              disabled={data.contestants.length === 0}
              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-40 flex items-center font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              清空名單
            </button>
          </div>
        </div>

        {data.contestants.length === 0 ? (
          <div className="py-12 text-center text-[#847b6a] bg-[#faf7f0] rounded-lg border border-dashed border-[#ded7c5]">
            <Users className="w-10 h-10 mx-auto text-[#b0a796] mb-2 opacity-70" />
            <div className="text-sm font-semibold text-[#4e4738]">
              目前尚未加入任何參賽者
            </div>
            <p className="text-xs text-[#847b6a] mt-1 max-w-sm mx-auto">
              請從上方選擇「班制比賽」、「社制比賽」或「個人項目」快速新增參賽單位。
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f0ebd9] text-[#4d4637] border-y border-[#dfd8c7]">
                  <th className="py-2.5 px-3 w-12 text-center font-bold">序號</th>
                  <th className="py-2.5 px-3 w-20 font-bold">出場編號</th>
                  <th className="py-2.5 px-3 font-bold">參賽者 / 單位名稱</th>
                  <th className="py-2.5 px-3 font-bold">參賽作品 / 附註說明</th>
                  <th className="py-2.5 px-3 w-24 text-center font-bold">排序調整</th>
                  <th className="py-2.5 px-3 w-16 text-center font-bold">刪除</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece6d8]">
                {data.contestants.map((contestant, index) => (
                  <tr
                    key={contestant.id || index}
                    className="hover:bg-[#f5f0e4] transition-colors"
                  >
                    <td className="py-2 px-3 text-center font-mono font-bold text-[#7d7463]">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={contestant.number}
                        onChange={(e) =>
                          handleUpdateContestant(contestant.id, { number: e.target.value })
                        }
                        className="w-16 font-mono font-bold text-xs px-2 py-1 rounded bg-white border border-[#cfc7b4] text-[#1a3828] outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={contestant.name}
                          onChange={(e) =>
                            handleUpdateContestant(contestant.id, { name: e.target.value })
                          }
                          className="w-full font-semibold text-xs px-2.5 py-1 rounded bg-white border border-[#cfc7b4] text-[#1a3828] outline-none"
                        />
                        {contestant.house && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            {contestant.house}社
                          </span>
                        )}
                        {contestant.grade && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                            {contestant.grade}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={contestant.subText || ""}
                        onChange={(e) =>
                          handleUpdateContestant(contestant.id, { subText: e.target.value })
                        }
                        placeholder="例如：參賽篇目 / 曲目"
                        className="w-full text-xs px-2 py-1 rounded bg-white border border-[#cfc7b4] text-[#4d4637] placeholder-[#a69e8f] outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded bg-[#eee8dc] hover:bg-[#e2dac8] disabled:opacity-30"
                          title="上移"
                        >
                          <ChevronUp className="w-3.5 h-3.5 text-[#3a3428]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === data.contestants.length - 1}
                          className="p-1 rounded bg-[#eee8dc] hover:bg-[#e2dac8] disabled:opacity-30"
                          title="下移"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-[#3a3428]" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteContestant(contestant.id)}
                        className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50 transition"
                        title="刪除此選手"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch Paste Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-[#ded8c8] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ece6d8] pb-3">
              <h3 className="text-base font-bold text-[#1a3828] flex items-center">
                <ClipboardPaste className="w-4 h-4 mr-1.5 text-[#e65100]" />
                批次貼上參賽名單
              </h3>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="text-xs text-[#7d7463] hover:text-black font-bold"
              >
                ✕ 關閉
              </button>
            </div>

            <p className="text-xs text-[#6e6553]">
              每行輸入一位參賽者。支援自動解析編號與作品，例如：
              <br />
              <code className="text-[11px] bg-[#f2ecde] p-1 rounded block mt-1 text-[#224430] font-mono">
                01 陳志豪 - 《將進酒》
                <br />
                02 林美華 - 《木蘭辭》
                <br />
                03 梁家輝
              </code>
            </p>

            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              rows={8}
              placeholder="在此貼上名單..."
              className="w-full p-3 text-xs font-mono rounded-lg border border-[#cfc7b4] text-[#1a3828] focus:ring-1 focus:ring-[#1a3828] outline-none"
            />

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-md bg-[#eee8dc] text-xs font-bold text-[#443e31]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleProcessBatch}
                className="px-4 py-2 rounded-md bg-[#183626] hover:bg-[#204933] text-white text-xs font-bold shadow-sm"
              >
                確認並匯入名單
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next / Prev Step Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#eee8dc] hover:bg-[#e4dcba] text-[#3d372b] font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>上一步：賽事基本與評判</span>
        </button>

        <button
          id="btn-step2-next"
          type="button"
          onClick={onNext}
          disabled={data.contestants.length === 0}
          className="inline-flex items-center px-6 py-3 rounded-lg bg-[#183626] hover:bg-[#204933] text-white font-bold text-sm shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>下一步：設定評分準則與權重</span>
          <ArrowRight className="w-4 h-4 ml-2 text-[#f59e0b]" />
        </button>
      </div>
    </div>
  );
};
