export enum NormalizedPlTeam {
  "AFC Bournemouth" = "Bournemouth",
  "Arsenal FC" = "Arsenal",
  "Aston Villa FC" = "Aston Villa",
  "Brentford FC" = "Brentford",
  "Brighton & Hove Albion FC" = "Brighton",
  "Chelsea FC" = "Chelsea",
  "Crystal Palace FC" = "Crystal Palace",
  "Everton FC" = "Everton",
  "Fulham FC" = "Fulham",
  "Huddersfield Town FC" = "Huddersfield",
  "Ipswich Town FC" = "Ipswich Town",
  "Leeds United FC" = "Leeds United",
  "Leicester City FC" = "Leicester City",
  "Liverpool FC" = "Liverpool",
  "Luton Town FC" = "Luton",
  "Manchester City FC" = "Manchester City",
  "Manchester United FC" = "Manchester United",
  "Newcastle United FC" = "Newcastle",
  "Norwich City FC" = "Norwich City",
  "Nottingham Forest FC" = "Nottingham Forest",
  "Sheffield United FC" = "Sheffield Utd",
  "Southampton FC" = "Southampton",
  "Tottenham Hotspur FC" = "Tottenham",
  "Watford FC" = "Watford",
  "West Bromwich Albion FC" = "West Bromwich Albion",
  "West Ham United FC" = "West Ham",
  "Wolverhampton Wanderers FC" = "Wolves",
}

export interface TeamStats {
  id: number;
  table_position: number | string;
  wins: string;
  draws: string;
  losses: string;
  points: string;
  goalsScored: string;
  goalsScoredHome: string;
  goalsScoredAway: string;
  goalsConceded: string;
  goalsConcededHome: string;
  goalsConcededAway: string;
  cornersWonAvg: string;
  BTTS: string;
  xG: string;
  dxG: string;
  shotsTaken: string;
  shotsConceded: string;
  shotsOnTarget: string;
  shotsOnTargetHome: string;
  shotsOnTargetAway: string;
  possessionAvg: string;
  possessionHome: string;
  possessionAway: string;
  cleanSheets: string;
  cleanSheetsHome: string;
  cleanSheetsAway: string;
  totalFoulsCommitted: string;
  totalFoulsCommittedAgainst: string;
  dangerousAttacks: string;
  dangerousAttacksHome: string;
  dangerousAttacksAway: string;
  ppgHome: string;
  ppgAway: string;
  homeXg: string;
  awayXg: string;
  cornersWonOver1_5: string;
  cornersWonHighest: string;
  BTTSOver0_5: string;
  BTTSOver1_5: string;
  BTTSHighest: string;
  shotsTakenHome: string;
  shotsTakenAway: string;
  shotsConcededHome: string;
  shotsConcededAway: string;
  possessionAvgHome: string;
  possessionAvgAway: string;
  games: any[];
  position?: number;
}

export interface TeamData {
  id: number;
  name: string;
  table_position: number;
  normalized_name: string;
  dataValues: {
    id: number;
    name: string;
    table_position: number;
    normalized_name: string;
    name_from_fixtures: string;
  };
}
