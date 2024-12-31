import { TeamStats } from "../types/teams";

export const calculateChance2score = (teamStats: TeamStats): number => {
  const xg = parseFloat(teamStats.xG);
  const dxg = parseFloat(teamStats.dxG);
  if (xg === 0 || isNaN(xg) || isNaN(dxg)) return 0;
  return Number(((xg + dxg) / xg).toFixed(2));
};

export const calculateChance2scoreHome = (teamStats: TeamStats): number => {
  const homeXg = parseFloat(teamStats.homeXg);
  const homeOpponentXg = parseFloat(teamStats.awayXg);
  if (homeXg === 0 || isNaN(homeXg) || isNaN(homeOpponentXg)) return 0;
  return Number(((homeXg + homeOpponentXg) / homeXg).toFixed(2));
};

export const calculateChance2scoreAway = (teamStats: TeamStats): number => {
  const awayXg = parseFloat(teamStats.awayXg);
  const awayOpponentXg = parseFloat(teamStats.homeXg);
  return Number(((awayXg + awayOpponentXg) / awayXg).toFixed(2));
};

export const calculateCornersWonOver0_5 = (teamStats: TeamStats): number => {
  const cornersWonAvg = parseFloat(teamStats.cornersWonAvg);
  const cornersWonOver1_5 = parseFloat(teamStats.cornersWonOver1_5);
  const cornersWonHighest = parseInt(teamStats.cornersWonHighest);

  if (
    cornersWonAvg === 0 ||
    isNaN(cornersWonAvg) ||
    isNaN(cornersWonOver1_5) ||
    isNaN(cornersWonHighest)
  )
    return 0;
  return Number(
    ((cornersWonAvg + cornersWonOver1_5 + cornersWonHighest) / 3).toFixed(2)
  );
};

export const calculateCornersWonOver1_5 = (teamStats: TeamStats): number => {
  const cornersWonOver1_5 = parseFloat(teamStats.cornersWonOver1_5);
  const cornersWonHighest = parseInt(teamStats.cornersWonHighest);

  if (
    cornersWonOver1_5 === 0 ||
    isNaN(cornersWonOver1_5) ||
    isNaN(cornersWonHighest)
  )
    return 0;
  return Number(((cornersWonOver1_5 + cornersWonHighest) / 2).toFixed(2));
};

export const calculateBTTSMetrics = {
  over0_5: (teamStats: TeamStats): number | null => {
    const BTTSOver0_5 = parseFloat(teamStats.BTTSOver0_5);
    return BTTSOver0_5 === 0 || isNaN(BTTSOver0_5) ? null : BTTSOver0_5;
  },
  over1_5: (teamStats: TeamStats): number | null => {
    const BTTSOver1_5 = parseFloat(teamStats.BTTSOver1_5);
    return BTTSOver1_5 === 0 || isNaN(BTTSOver1_5) ? null : BTTSOver1_5;
  },
  highest: (teamStats: TeamStats): number | null => {
    const BTTSHighest = parseFloat(teamStats.BTTSHighest);
    return BTTSHighest === 0 || isNaN(BTTSHighest) ? null : BTTSHighest;
  },
};

export const calculateShotsMetrics = {
  takenFirstHalf: (teamStats: TeamStats): number | null => {
    const { shotsTaken, shotsTakenHome, shotsTakenAway } = teamStats;
    if (shotsTaken === "0" || !shotsTaken || !shotsTakenHome || !shotsTakenAway)
      return null;
    return Number(
      ((parseFloat(shotsTakenHome) + parseFloat(shotsTakenAway)) / 2).toFixed(2)
    );
  },
  takenSecondHalf: (teamStats: TeamStats): number | null => {
    const { shotsTaken, shotsTakenHome, shotsTakenAway } = teamStats;
    if (shotsTaken === "0" || !shotsTaken || !shotsTakenHome || !shotsTakenAway)
      return null;
    return Number(
      ((parseFloat(shotsTakenHome) + parseFloat(shotsTakenAway)) / 2).toFixed(2)
    );
  },
  concededFirstHalf: (teamStats: TeamStats): number | null => {
    const { shotsConceded, shotsConcededHome, shotsConcededAway } = teamStats;
    if (
      shotsConceded === "0" ||
      !shotsConceded ||
      !shotsConcededHome ||
      !shotsConcededAway
    )
      return null;
    return Number(
      (
        (parseFloat(shotsConcededHome) + parseFloat(shotsConcededAway)) /
        2
      ).toFixed(2)
    );
  },
  concededSecondHalf: (teamStats: TeamStats): number | null => {
    const { shotsConceded, shotsConcededHome, shotsConcededAway } = teamStats;
    if (
      shotsConceded === "0" ||
      !shotsConceded ||
      !shotsConcededHome ||
      !shotsConcededAway
    )
      return null;
    return Number(
      (
        (parseFloat(shotsConcededHome) + parseFloat(shotsConcededAway)) /
        2
      ).toFixed(2)
    );
  },
  CR: (teamStats: TeamStats): number => {
    const shotsTaken = parseFloat(teamStats.shotsTaken);
    const shotsConceded = parseFloat(teamStats.shotsConceded);
    if (shotsTaken === 0 || isNaN(shotsTaken) || isNaN(shotsConceded)) return 0;
    return Number(((shotsTaken - shotsConceded) / shotsTaken).toFixed(2));
  },
  concededCR: (teamStats: TeamStats): number => {
    const { shotsConceded, shotsConcededHome, shotsConcededAway } = teamStats;
    if (
      shotsConceded === "0" ||
      !shotsConceded ||
      !shotsConcededHome ||
      !shotsConcededAway
    )
      return 0;
    return Number(
      (
        (parseFloat(shotsConcededHome) + parseFloat(shotsConcededAway)) /
        2
      ).toFixed(2)
    );
  },
};

export const calculateDangerousAttacks = {
  conceded: (teamStats: TeamStats): number => {
    const { dangerousAttacks, dangerousAttacksHome, dangerousAttacksAway } =
      teamStats;
    if (!dangerousAttacks || !dangerousAttacksHome || !dangerousAttacksAway)
      return 0;
    return Number(
      (
        (parseInt(dangerousAttacksHome) + parseInt(dangerousAttacksAway)) /
        2
      ).toFixed(2)
    );
  },
  concededHome: (teamStats: TeamStats): number => {
    const dangerousAttacksHome = parseInt(teamStats.dangerousAttacksHome);
    return dangerousAttacksHome === 0 || isNaN(dangerousAttacksHome)
      ? 0
      : dangerousAttacksHome;
  },
  concededAway: (teamStats: TeamStats): number => {
    const dangerousAttacksAway = parseInt(teamStats.dangerousAttacksAway);
    return dangerousAttacksAway === 0 || isNaN(dangerousAttacksAway)
      ? 0
      : dangerousAttacksAway;
  },
};

export const calculateTeamPositions = (teams: TeamStats[]): TeamStats[] => {
  let currentPosition = 1;
  let previousPoints: number | null = null;
  let teamsAtCurrentPosition = 0;

  return teams.map((team, index) => {
    const points = parseInt(team.points);
    if (previousPoints !== points) {
      currentPosition = index + 1;
      teamsAtCurrentPosition = 1;
    } else {
      teamsAtCurrentPosition++;
    }
    previousPoints = points;

    return {
      ...team,
      position: currentPosition,
    };
  });
};
