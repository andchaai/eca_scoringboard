export type CompetitionCategory =
  | "speech"
  | "singing"
  | "recitation"
  | "debate"
  | "talent"
  | "drama"
  | "stem"
  | "dance"
  | "general";

export type ScoringMethod = "weighted" | "average" | "sum" | "trimmed_mean";

export type ContestantType = "class" | "house" | "individual";

export interface Criterion {
  id: string;
  name: string;
  maxScore: number;
  weight: number; // 0 - 100 (%)
  description?: string;
}

export interface Judge {
  id: string;
  name: string;
  title?: string; // e.g. "主評判", "評審委員", "資深評判"
  code?: string;
}

export interface Contestant {
  id: string;
  number: string; // e.g. "01", "1A", "忠社"
  name: string; // e.g. "1A 班", "陳美怡", "忠社 - 醒獅隊"
  subText?: string; // e.g. "曲目: 《追尋》", "講題: 《誠信之光》"
  grade?: string; // e.g. "中一", "小三"
  house?: string; // e.g. "忠", "義", "勤", "儉"
  type: ContestantType;
  order: number;
}

export interface JudgeContestantScore {
  criteriaScores: Record<string, number>; // criterionId -> score (0 to maxScore)
  feedback?: string;
  penalty?: number; // deductions, e.g. overtime
  completed: boolean;
  updatedAt?: number;
}

// Map key: `${judgeId}___${contestantId}`
export type ScoreMatrix = Record<string, JudgeContestantScore>;

export interface CompetitionData {
  id: string;
  name: string;
  subtitle?: string;
  date: string;
  venue: string;
  category: CompetitionCategory;
  scoringMethod: ScoringMethod;
  decimalPlaces: number; // 0, 1, 2
  judges: Judge[];
  contestants: Contestant[];
  criteria: Criterion[];
  scores: ScoreMatrix;
  organizer?: string;
  notes?: string;
  roomCode?: string; // 6-digit room code for multi-judge sync (e.g. "882190")
  currentContestantId?: string; // Current contestant on stage (for live sync spotlight)
  isLiveSync?: boolean; // Whether live cloud sync is enabled
  updatedAt?: number;
}

export interface ContestantResult {
  contestant: Contestant;
  rank: number;
  isTie: boolean;
  totalScore: number; // Final weighted or calculated score
  rawAverage: number;
  judgeScores: {
    judgeId: string;
    judgeName: string;
    score: number; // calculated according to criteria weights for this judge
    criteriaBreakdown: Record<string, number>;
    feedback?: string;
    penalty?: number;
    completed: boolean;
  }[];
  criteriaAverages: Record<string, number>; // criterionId -> average across all judges
  completedJudgesCount: number;
  totalJudgesCount: number;
}

export interface HouseResult {
  houseName: string;
  color: string;
  totalScore: number;
  averageScore: number;
  contestantCount: number;
  rank: number;
  members: ContestantResult[];
}

export interface PresetTemplate {
  id: string;
  name: string;
  category: CompetitionCategory;
  description: string;
  defaultCriteria: Omit<Criterion, "id">[];
  sampleContestants?: { name: string; number: string; subText?: string }[];
  scoringTips?: string;
}
