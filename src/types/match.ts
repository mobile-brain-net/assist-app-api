export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  league: string;
  status: MatchStatus;
  score?: {
    home: number;
    away: number;
  };
}

export enum MatchStatus {
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED",
}
