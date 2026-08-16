import React from "react";
import {
  Settings,
  Users,
  Sliders,
  PenTool,
  Trophy,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { CompetitionData } from "../types";

interface StepNavRailProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  data: CompetitionData;
}

export const StepNavRail: React.FC<StepNavRailProps> = ({
  currentStep,
  onSelectStep,
  data
}) => {
  const steps = [
    {
      id: 1,
      name: "賽事與評判",
      sub: `${data.judges.length} 位評判`,
      icon: Settings,
      isValid: Boolean(data.name.trim() && data.judges.length > 0)
    },
    {
      id: 2,
      name: "參賽名單",
      sub: `${data.contestants.length} 個單位`,
      icon: Users,
      isValid: data.contestants.length > 0
    },
    {
      id: 3,
      name: "評分準則",
      sub: `${data.criteria.length} 項指標`,
      icon: Sliders,
      isValid: data.criteria.length > 0
    },
    {
      id: 4,
      name: "現場評分枱",
      sub: "評判給分與備註",
      icon: PenTool,
      isValid: true
    },
    {
      id: 5,
      name: "頒獎與結果榜",
      sub: "名次排名與明細",
      icon: Trophy,
      isValid: true
    }
  ];

  return (
    <>
      {/* Desktop Left Nav Rail */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#f8f5ee] border-r border-[#ded8c8] min-h-[calc(100vh-4rem)] p-4 shrink-0 select-none">
        <div className="text-xs font-bold uppercase tracking-wider text-[#6d6657] mb-3 px-3">
          賽事工作流程
        </div>

        <nav className="space-y-1.5 flex-1">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = step.isValid && currentStep > step.id;

            return (
              <button
                key={step.id}
                id={`step-nav-btn-${step.id}`}
                onClick={() => onSelectStep(step.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-left transition-all relative ${
                  isActive
                    ? "bg-[#183626] text-[#faf8f5] shadow-sm font-semibold"
                    : "text-[#494336] hover:bg-[#ece6d8] hover:text-[#183626]"
                }`}
              >
                {isActive && (
                  <div className="absolute -left-1 top-2 bottom-2 w-1.5 bg-[#e65100] rounded-r" />
                )}
                <div className="flex items-center space-x-3 truncate">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-sm font-bold ${
                      isActive
                        ? "bg-[#254d37] text-[#f59e0b]"
                        : isCompleted
                        ? "bg-[#e2dccf] text-[#2c533e]"
                        : "bg-[#e7e1d4] text-[#7c7362]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm leading-tight flex items-center space-x-1.5">
                      <span>{step.name}</span>
                    </div>
                    <div
                      className={`text-xs mt-0.5 truncate ${
                        isActive ? "text-[#a3c9b3]" : "text-[#7c7362]"
                      }`}
                    >
                      {step.sub}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : !step.isValid ? (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Ledger Note Box in Desktop Rail */}
        <div className="mt-auto bg-[#efeae0] rounded-lg p-3.5 border border-[#ded8c8] text-xs text-[#5f5746] space-y-1.5">
          <div className="font-bold text-[#1f3c2c] flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>即時同步狀態</span>
          </div>
          <p className="leading-relaxed">
            所有分數自動本機儲存，切換分頁或重新整理均不會遺失評分。
          </p>
        </div>
      </aside>

      {/* Mobile Top Step Navigation Ribbon */}
      <div className="lg:hidden bg-[#f4efe5] border-b border-[#ded8c8] px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1.5 min-w-max">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;

            return (
              <button
                key={step.id}
                id={`mobile-step-nav-btn-${step.id}`}
                onClick={() => onSelectStep(step.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  isActive
                    ? "bg-[#183626] text-white shadow-sm"
                    : "bg-[#e8e2d4] text-[#4d473a] hover:bg-[#ded7c7]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#f59e0b]" : "text-[#6b6250]"}`} />
                <span>
                  {step.id}. {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
