import {
  CompetitionData,
  ContestantResult,
  Criterion,
  HouseResult,
  JudgeContestantScore,
  ScoreMatrix
} from "../types";
import { HOUSE_PRESETS } from "../data/presets";

/**
 * Calculates a single judge's total score for a contestant based on criteria
 */
export function calculateSingleJudgeScore(
  judgeScore: JudgeContestantScore | undefined,
  criteria: Criterion[],
  scoringMethod: string = "weighted"
): { total: number; breakdown: Record<string, number>; completed: boolean; penalty: number } {
  if (!judgeScore || !judgeScore.criteriaScores) {
    return { total: 0, breakdown: {}, completed: false, penalty: 0 };
  }

  const breakdown: Record<string, number> = {};
  let total = 0;
  let hasAnyScore = false;
  const penalty = Number(judgeScore.penalty) || 0;

  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0) || 100;

  for (const criterion of criteria) {
    const rawVal = judgeScore.criteriaScores[criterion.id];
    const scoreVal = rawVal !== undefined ? Number(rawVal) : 0;
    breakdown[criterion.id] = scoreVal;
    if (rawVal !== undefined) hasAnyScore = true;

    if (scoringMethod === "weighted") {
      const maxScore = criterion.maxScore || 100;
      const weight = criterion.weight !== undefined ? criterion.weight : (100 / criteria.length);
      // Normalized to weight percentage
      const normalizedScore = (scoreVal / maxScore) * (weight / totalWeight) * 100;
      total += normalizedScore;
    } else if (scoringMethod === "sum") {
      total += scoreVal;
    } else {
      // Direct raw average percentage
      const maxScore = criterion.maxScore || 100;
      total += (scoreVal / maxScore) * (100 / criteria.length);
    }
  }

  total = Math.max(0, total - penalty);

  return {
    total: Number(total.toFixed(2)),
    breakdown,
    completed: Boolean(judgeScore.completed || (hasAnyScore && Object.keys(judgeScore.criteriaScores).length === criteria.length)),
    penalty
  };
}

/**
 * Calculates the complete tournament results and rankings
 */
export function calculateTournamentResults(data: CompetitionData): ContestantResult[] {
  const { contestants, judges, criteria, scores, scoringMethod, decimalPlaces = 2 } = data;

  if (!contestants || contestants.length === 0) return [];

  const rawResults: Omit<ContestantResult, "rank" | "isTie">[] = contestants.map((contestant) => {
    const judgeScoresList: ContestantResult["judgeScores"] = [];
    const criteriaSums: Record<string, number> = {};
    const criteriaCounts: Record<string, number> = {};

    let totalJudgeScoresSum = 0;
    let completedCount = 0;
    const validScoresOnly: number[] = [];

    for (const judge of judges) {
      const key = `${judge.id}___${contestant.id}`;
      const jScoreObj = scores[key];
      const singleCalc = calculateSingleJudgeScore(jScoreObj, criteria, scoringMethod);

      if (singleCalc.completed) {
        completedCount++;
        validScoresOnly.push(singleCalc.total);
        totalJudgeScoresSum += singleCalc.total;

        // Aggregate criteria
        for (const crit of criteria) {
          const val = singleCalc.breakdown[crit.id] || 0;
          criteriaSums[crit.id] = (criteriaSums[crit.id] || 0) + val;
          criteriaCounts[crit.id] = (criteriaCounts[crit.id] || 0) + 1;
        }
      }

      judgeScoresList.push({
        judgeId: judge.id,
        judgeName: judge.name,
        score: singleCalc.total,
        criteriaBreakdown: singleCalc.breakdown,
        feedback: jScoreObj?.feedback,
        penalty: singleCalc.penalty,
        completed: singleCalc.completed
      });
    }

    // Calculate final overall score
    let finalScore = 0;
    if (validScoresOnly.length > 0) {
      if (scoringMethod === "trimmed_mean" && validScoresOnly.length >= 3) {
        const sorted = [...validScoresOnly].sort((a, b) => a - b);
        // Exclude lowest and highest
        const trimmed = sorted.slice(1, sorted.length - 1);
        const sum = trimmed.reduce((acc, s) => acc + s, 0);
        finalScore = sum / trimmed.length;
      } else if (scoringMethod === "sum") {
        finalScore = totalJudgeScoresSum;
      } else {
        // Average of judges
        finalScore = totalJudgeScoresSum / validScoresOnly.length;
      }
    }

    // Criteria averages
    const criteriaAverages: Record<string, number> = {};
    for (const crit of criteria) {
      const count = criteriaCounts[crit.id] || 0;
      criteriaAverages[crit.id] = count > 0 ? Number((criteriaSums[crit.id] / count).toFixed(1)) : 0;
    }

    const rawAverage = validScoresOnly.length > 0 ? totalJudgeScoresSum / validScoresOnly.length : 0;

    return {
      contestant,
      totalScore: Number(finalScore.toFixed(decimalPlaces)),
      rawAverage: Number(rawAverage.toFixed(decimalPlaces)),
      judgeScores: judgeScoresList,
      criteriaAverages,
      completedJudgesCount: completedCount,
      totalJudgesCount: judges.length
    };
  });

  // Sort by totalScore descending
  rawResults.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // Tie-breaker: completed judges count or order
    if (b.completedJudgesCount !== a.completedJudgesCount) {
      return b.completedJudgesCount - a.completedJudgesCount;
    }
    return a.contestant.order - b.contestant.order;
  });

  // Assign standard competition ranks (1, 2, 2, 4)
  const resultsWithRanks: ContestantResult[] = [];
  for (let i = 0; i < rawResults.length; i++) {
    const item = rawResults[i];
    let rank = i + 1;
    let isTie = false;

    if (i > 0 && item.totalScore === rawResults[i - 1].totalScore && item.totalScore > 0) {
      rank = resultsWithRanks[i - 1].rank;
      isTie = true;
      resultsWithRanks[i - 1].isTie = true;
    }

    resultsWithRanks.push({
      ...item,
      rank,
      isTie
    });
  }

  return resultsWithRanks;
}

/**
 * Calculates House-based aggregated tournament table
 */
export function calculateHouseResults(results: ContestantResult[]): HouseResult[] {
  const houseMap: Record<string, { total: number; count: number; members: ContestantResult[] }> = {};

  for (const res of results) {
    const houseKey = res.contestant.house || (res.contestant.name.includes("社") ? res.contestant.name.slice(0, 1) : null);
    if (!houseKey) continue;

    if (!houseMap[houseKey]) {
      houseMap[houseKey] = { total: 0, count: 0, members: [] };
    }
    houseMap[houseKey].total += res.totalScore;
    houseMap[houseKey].count += 1;
    houseMap[houseKey].members.push(res);
  }

  const allHousePresets = HOUSE_PRESETS.flatMap(p => p.houses);

  const houseResults: HouseResult[] = Object.keys(houseMap).map(hKey => {
    const info = houseMap[hKey];
    const preset = allHousePresets.find(p => p.shortName === hKey || p.name.startsWith(hKey));
    return {
      houseName: preset ? preset.name : `${hKey} 社`,
      color: preset ? preset.color : "#4b5563",
      totalScore: Number(info.total.toFixed(2)),
      averageScore: info.count > 0 ? Number((info.total / info.count).toFixed(2)) : 0,
      contestantCount: info.count,
      rank: 1,
      members: info.members
    };
  });

  houseResults.sort((a, b) => b.totalScore - a.totalScore);
  houseResults.forEach((h, idx) => {
    h.rank = idx + 1;
  });

  return houseResults;
}

/**
 * Generates CSV Export Content
 */
export function generateCSVExport(data: CompetitionData, results: ContestantResult[]): string {
  const headers = [
    "名次",
    "編號",
    "參賽者/單位",
    "附註/項目",
    "總分",
    ...data.judges.map(j => `評判: ${j.name}`),
    ...data.criteria.map(c => `準則均分: ${c.name} (${c.weight}%)`)
  ];

  const rows = results.map(r => {
    const judgeScoreCells = data.judges.map(j => {
      const found = r.judgeScores.find(js => js.judgeId === j.id);
      return found ? found.score.toString() : "-";
    });

    const criteriaAvgCells = data.criteria.map(c => {
      return (r.criteriaAverages[c.id] || 0).toString();
    });

    return [
      r.rank.toString(),
      `"${r.contestant.number}"`,
      `"${r.contestant.name}"`,
      `"${r.contestant.subText || ""}"`,
      r.totalScore.toString(),
      ...judgeScoreCells,
      ...criteriaAvgCells
    ];
  });

  const titleRow = [`"【${data.name}】裁判席計分結算表"`, `"日期: ${data.date}"`, `"地點: ${data.venue}"`];
  return [titleRow.join(","), headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}
