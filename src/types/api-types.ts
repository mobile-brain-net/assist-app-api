export interface TeamResponse {
  team: {
    id: number;
    name: string;
    code?: string;
    country?: string;
    founded?: number;
    logo?: string;
    area?: {
      continent?: string;
    };
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
