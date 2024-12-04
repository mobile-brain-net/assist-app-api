export interface TeamResponse {
  team: {
    id: number;
    name: string;
    code?: string;
    country?: string;
    founded?: number;
    logo?: string;
    flag?: string;
    website?: string;
    full_name?: string;
    alternative_names?: string[];
  };
  season?: {
    current?: string;
    format?: string;
  };
  statistics?: {
    rank?: number;
    performance_rank?: number;
  };
  league?: {
    id: number;
  };
  risk?: number;
}

export interface PredictionResponse {
  fixture_id: number;
  predictions: {
    winner: {
      id: number;
      name: string;
      comment: string;
    };
    win_or_draw: boolean | null;
    under_over: string;
    goals: {
      home: string;
      away: string;
    };
    advice: string;
    percent: {
      home: string;
      draw: string;
      away: string;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      last_5: {
        form: string;
        att: string;
        def: string;
        goals: {
          for: {
            total: string;
          };
          against: {
            total: string;
          };
        };
      };
    };
    away: {
      id: number;
      name: string;
      logo: string;
      last_5: {
        form: string;
        att: string;
        def: string;
        goals: {
          for: {
            total: string;
          };
          against: {
            total: string;
          };
        };
      };
    };
  };
  comparison: {
    form: {
      home: string;
      away: string;
    };
    att: {
      home: string;
      away: string;
    };
    def: {
      home: string;
      away: string;
    };
    poisson_distribution: {
      home: string;
      away: string;
    };
    h2h: {
      home: string;
      away: string;
    };
  };
}

export interface GetMatchesResponse {
  competition: string;
  matches: [
    {
      date: string;
      home: {
        name: string;
        icon: string;
        kits: string;
      };
      away: {
        name: string;
        icon: string;
        kits: string;
      };
      result: {
        status: string;
        homegoals: number | null;
        awaygoals: number | null;
      };
      odds: {
        away_win: number;
        draw: number;
        home_win: number;
      };
      prediction: {
        fixture_id: number;
        predictions_winner_id: number;
        predictions_winner_name: string;
        predictions_winner_comment: string;
        predictions_win_or_draw: boolean | null;
        predictions_under_over: string | null;
        predictions_goals_home: string;
        predictions_goals_away: string;
        predictions_advice: string;
        predictions_percent_home: string;
        predictions_percent_draw: string;
        predictions_percent_away: string;
        league_id: number;
        league_name: string;
        league_country: string;
        league_logo: string;
        league_flag: string;
        league_season: number;
        teams_home_id: number;
        teams_home_name: string;
        teams_home_logo: string;
        teams_away_id: number;
        teams_away_name: string;
        teams_away_logo: string;
      };
    }
  ];
}
