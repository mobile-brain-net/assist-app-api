import Match from "./match";
import MatchStats from "./match-stats";
import MatchOdds from "./match-odds";
import LeagueTeam from "./league-team";

// Match associations
Match.hasOne(MatchStats, {
  foreignKey: "match_id",
  as: "stats",
});

Match.hasOne(MatchOdds, {
  foreignKey: "match_id",
  as: "odds",
});

Match.belongsTo(LeagueTeam, {
  foreignKey: "home_team_id",
  as: "home",
});

Match.belongsTo(LeagueTeam, {
  foreignKey: "away_team_id",
  as: "away",
});

// MatchStats associations
MatchStats.belongsTo(Match, {
  foreignKey: "match_id",
  as: "match",
});

// MatchOdds associations
MatchOdds.belongsTo(Match, {
  foreignKey: "match_id",
  as: "match",
});

export { Match, MatchStats, MatchOdds, LeagueTeam };
