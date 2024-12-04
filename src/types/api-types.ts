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
