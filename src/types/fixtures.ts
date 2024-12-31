export interface TeamFixture {
  result: string;
  score: string;
  against: string;
  datetime: string;
}

export interface TeamFixtureResponse {
  teamName: string;
  fixtures: TeamFixture[];
}
