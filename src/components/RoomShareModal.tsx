import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Wifi,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Users,
  Radio,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  X
} from "lucide-react";
import { CompetitionData, Judge } from "../types";

interface RoomShareModalProps {
  data: CompetitionData;
  onClose: () => void;
  onGenerateNewCode: () => void;
  onSelectJudgePreview: (judgeId: string) => void;
}

export const RoomShareModal: React.FC<RoomShareModalProps> = ({
  data,
  onClose,
  onGenerateNewCode,
  onSelectJudgePreview
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const roomCode = data.roomCode || "778899";
  // Create direct URL with hash or search param
  const baseUrl = window.location.origin + window.location.pathname;
  const judgeJoinUrl = `${baseUrl}?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(judgeJoinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#fcfbf7] border-2 border-[#ded8c8] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#ece6d8] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#183626] text-amber-300 flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Firebase 雲端即時連線中
                </span>
                <span className="text-xs text-[#706755]">獨立評分席分發</span>
              </div>
              <h2 className="text-lg font-black text-[#1a3828] mt-0.5">
                評判專屬手機/平板掃碼連線
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#706755] hover:text-[#183626] hover:bg-[#eee7d7] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Room Code & QR Code display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center bg-white p-5 rounded-xl border border-[#ded8c8]">
          {/* Left: QR Code */}
          <div className="flex flex-col items-center justify-center p-3 bg-[#faf8f3] rounded-lg border border-[#e5dfce] shadow-inner">
            <QRCodeSVG
              value={judgeJoinUrl}
              size={150}
              level="M"
              includeMargin={true}
              bgColor="#faf8f3"
              fgColor="#183626"
            />
            <span className="text-[11px] font-bold text-[#554d3c] mt-2 flex items-center">
              <Smartphone className="w-3.5 h-3.5 mr-1 text-[#e65100]" />
              手機相機直接掃碼登入
            </span>
          </div>

          {/* Right: Room Details */}
          <div className="space-y-3">
            <div>
              <div className="text-xs text-[#706755] font-semibold">賽事房間號 (Room PIN)</div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="font-mono text-3xl font-black tracking-widest text-[#183626] bg-[#faf8f3] px-3 py-1 rounded-lg border border-[#e2dcce]">
                  {roomCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-[#eee8dc] hover:bg-[#e4dcba] text-[#183626] text-xs font-bold transition"
                  title="複製房間號"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-[#5c5443] leading-relaxed">
              評判以手機或平板打開連結後，只需在選單選擇自己的評判姓名即可進入專屬打分介面，系統將實時向主席台推送分數。
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full inline-flex items-center justify-center py-2 px-3 rounded-lg bg-[#183626] hover:bg-[#234b35] text-white text-xs font-bold transition shadow-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                  <span>已複製評判專屬連結</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span>複製手機端專屬連結</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Judge quick switcher buttons for testing on this device */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1a3828] flex items-center">
              <Users className="w-4 h-4 mr-1 text-[#e65100]" />
              本機快速預覽評判端視角（共 {data.judges.length} 位評判席）：
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {data.judges.map((judge, idx) => (
              <button
                key={judge.id}
                type="button"
                onClick={() => {
                  onSelectJudgePreview(judge.id);
                  onClose();
                }}
                className="p-2.5 rounded-lg bg-white hover:bg-amber-50/70 border border-[#ded8c8] hover:border-amber-400 text-left transition flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <div className="font-mono text-[10px] text-[#706755] group-hover:text-amber-800">
                    評判 {idx + 1}
                  </div>
                  <div className="text-xs font-bold text-[#183626] truncate">
                    {judge.name}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#a8a190] group-hover:text-amber-700" />
              </button>
            ))}
          </div>
        </div>

        {/* Features note */}
        <div className="p-3 bg-[#f2ede2] rounded-xl border border-[#ded7c5] text-[11px] text-[#554e3d] flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong>零衝突保證：</strong>每位評判擁有專屬寫入通道，多位評判同時打分時絕不會互相覆蓋或衝突，主席台總控實時秒級同步。
          </span>
        </div>
      </div>
    </div>
  );
};
