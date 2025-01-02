# server is hosted on ec2 on mobile-brain-aws account in london

#### In order to deploy this on ec2 nned to :

1. pull changes from main branch

2. Build the project! W'ONT WORK IF YOU MISS THIS STEP :
   ```bash
   npm run build
   ```
3. restart PM2:
   ```bash
   pm2 restart 0
   ```

# API Endpoints

## Teams

### Fetch League Teams

Fetches teams from external API and stores them in the database.

```http
POST /api/fetch-league-teams
```

#### Description

Fetches team data from the football API and stores it in the local database. Updates existing teams if they already exist.
db table 'league_teams'

#### Response 200 (application/json)

```json
{
  "message": "League teams fetched successfully",
  "count": 20,
  "success": true,
  "status": 200
}
```

#### Error Response 500 (application/json)

```json
{
  "error": "Failed to fetch teams",
  "message": "Error details"
}
```

#### Notes

- Requires valid API key in environment variables
- Updates existing teams based on team ID
- Cleans and normalizes team names automatically

## Matches

### Fetch Match Data

Fetches new match data from external API and stores it.

```http
POST /api/fetch-matches
```

#### Response 200 (application/json)

```json
{
  "message": "Match data fetched and saved successfully",
  "status": 200,
  "success": true,
  "matches": 380,
  "data": [
    {
      "id": 7466677,
      "homeID": 149,
      "awayID": 162
    }
  ]
}
```

there are more properties returned on this endpoint

#### Error Responses 500 (application/json)

```json
{
  "error": "Failed to fetch/save data",
  "message": "Error details"
}
```

### Fixtures

## fetch fixtures data

Fetches new match data from external API and stores it.

```http
POST /api/fetch-fixtures
```

#### Response 200 (application/json)

```json
{
  "message": "Fixtures data fetched and saved successfully",
  "data": [],
  "status": 200,
  "success": true,
  "matches": 0
}
```

there are more properties returned on this endpoint

#### Error Responses 500 (application/json)

```json
{
  "error": "Failed to fetch/save data",
  "message": "Error details"
}
```

#### There are 2 main end points the app uses

### 1

### Get Matches

Retrieves matches with their associated stats and odds.

```http
GET /api/get-matches
```

#### Query Parameters

- `date` (required) - Match date in YYYY-MM-DD format
- `league_name` (required) - Name of the league

#### Response 200 (application/json)

```json
{
  "matches": [
    {
      "id": 123,
      "homeTeamId": 1,
      "awayTeamId": 2,
      "season": "2023/24",
      "status": "FINISHED",
      "date_unix": 1679529600,
      "stats": {
        "home_goals": 2,
        "away_goals": 1,
        "home_corners": 5,
        "away_corners": 3
      },
      "odds": {
        "odds_ft_1": 1.95,
        "odds_ft_x": 3.4,
        "odds_ft_2": 4.2
      }
    }
  ]
}
```

#### Notes

- Requires valid API key in environment variables
- Updates existing records based on match ID
- Includes match statistics and odds data

### 2

### Aggregate Matches

Retrieves aggregated match statistics for a specific year and league.

### Get Matches

Retrieves matches with their associated stats and odds.

```http
GET /api/aggregate-matches
```

#### Query Parameters

- `year` (required) - Match date in YYYY format
- `league_name` (required) - Name of the league

#### Response 200 (application/json)

```json
{
  "teams": [
    {
      "name": "Wolves",
      "logo": "Wolves",
      "home_kits": "/api/images/home/Wolves.svg",
      "away_kits": "/api/images/away/Wolves.svg",
      "overall": {
        "position": 17,
        "matchesPlayed": 19,
        "wins": 4,
        "draws": 4,
        "losses": 11,
        "points": 16,
        "goalsScored": 31,
        "goalsScoredHome": 14,
        "goalsScoredAway": 17,
        "goalsConceded": 42,
        "goalsConcededHome": 20,
        "goalsConcededAway": 22,
        "chance2score": 2.32,
        "chance2scoreHome": 2.16,
        "chance2scoreAway": 1.86,
        "cornersWonAvg": 3.26,
        "cornersWonOver0_5": 0,
        "cornersWonOver1_5": 0,
        "cornersWonHighest": 7,
        "BTTS": 14,
        "BTTSOver0.5": null,
        "BTTSOver1.5": null,
        "BTTSHighest": null,
        "xG": 22.8,
        "dxG": 30.13,
        "shotsTaken": 5.1579,
        "shotsTakenFirstHalf": 2.58,
        "shotsTakenSecondHalf": 2.58,
        "shotsConceded": 6.5789,
        "shotsConcededFirstHalf": 3.29,
        "shotsConcededSecondHalf": 3.29,
        "shotsCR": 0.28,
        "shotsConcededCR": 3.29,
        "shotsOnTarget": 5.16,
        "shotsOnTargetHome": 2.42,
        "shotsOnTargetAway": 2.74,
        "possessionAvg": 46.95,
        "possessionHome": 21.32,
        "possessionAway": 25.63,
        "cleanSheets": 3,
        "cleanSheetsHome": 2,
        "cleanSheetsAway": 1,
        "totalFoulsCommitted": 246,
        "totalFoulsCommittedAgainst": 208,
        "dangerousAttacks": 711,
        "dangerousAttacksHome": 325,
        "dangerousAttacksAway": 386,
        "dangerousAttacksConceded": 355.5,
        "dangerousAttacksConcededHome": 325,
        "dangerousAttacksConcededAway": 386,
        "ppgHome": 0.78,
        "ppgAway": 0.9,
        "cornersWonOver0.5": 0,
        "cornersWonOver1.5": 0
      },
      "last5": {
        "position": 8,
        "matchesPlayed": 5,
        "wins": 2,
        "draws": 1,
        "losses": 2,
        "points": 7,
        "goalsScored": 9,
        "goalsScoredHome": 3,
        "goalsScoredAway": 6,
        "goalsConceded": 6,
        "goalsConcededHome": 2,
        "goalsConcededAway": 4,
        "chance2score": 2.06,
        "chance2scoreHome": 2.43,
        "chance2scoreAway": 1.7,
        "cornersWonAvg": 3.6,
        "cornersWonOver0_5": 0,
        "cornersWonOver1_5": 0,
        "cornersWonHighest": 7,
        "BTTS": 3,
        "BTTSOver0.5": null,
        "BTTSOver1.5": null,
        "BTTSHighest": null,
        "xG": 6.25,
        "dxG": 6.64,
        "shotsTaken": 5.4,
        "shotsTakenFirstHalf": 2.7,
        "shotsTakenSecondHalf": 2.7,
        "shotsConceded": 5.4,
        "shotsConcededFirstHalf": 2.7,
        "shotsConcededSecondHalf": 2.7,
        "shotsCR": 0,
        "shotsConcededCR": 2.7,
        "shotsOnTarget": 5.4,
        "shotsOnTargetHome": 2.4,
        "shotsOnTargetAway": 3,
        "possessionAvg": 49.8,
        "possessionHome": 21,
        "possessionAway": 28.8,
        "cleanSheets": 2,
        "cleanSheetsHome": 1,
        "cleanSheetsAway": 1,
        "totalFoulsCommitted": 68,
        "totalFoulsCommittedAgainst": 57,
        "dangerousAttacks": 187,
        "dangerousAttacksHome": 79,
        "dangerousAttacksAway": 108,
        "dangerousAttacksConceded": 93.5,
        "dangerousAttacksConcededHome": 79,
        "dangerousAttacksConcededAway": 108,
        "ppgHome": 1.5,
        "ppgAway": 1.33,
        "games": [
          {
            "result": "d",
            "score": "2-2",
            "against": "Tottenham",
            "datetime": "2024-12-29 15:00:00"
          },
          {
            "result": "w",
            "score": "2-0",
            "against": "Manchester United",
            "datetime": "2024-12-26 17:30:00"
          },
          {
            "result": "w",
            "score": "3-0",
            "against": "Leicester City",
            "datetime": "2024-12-22 14:00:00"
          },
          {
            "result": "l",
            "score": "1-2",
            "against": "Ipswich Town",
            "datetime": "2024-12-14 15:00:00"
          },
          {
            "result": "l",
            "score": "1-2",
            "against": "West Ham",
            "datetime": "2024-12-09 20:00:00"
          }
        ],
        "cornersWonOver0.5": 0,
        "cornersWonOver1.5": 0
      },
      "last5Home": {
        "position": 9,
        "matchesPlayed": 5,
        "wins": 2,
        "draws": 1,
        "losses": 2,
        "points": 7,
        "goalsScored": 9,
        "goalsScoredHome": 9,
        "goalsScoredAway": 0,
        "goalsConceded": 8,
        "goalsConcededHome": 8,
        "goalsConcededAway": 0,
        "chance2score": 2.13,
        "chance2scoreHome": 1,
        "chance2scoreAway": null,
        "cornersWonAvg": 3.8,
        "cornersWonOver0_5": 0,
        "cornersWonOver1_5": 0,
        "cornersWonHighest": 7,
        "BTTS": 3,
        "BTTSOver0.5": null,
        "BTTSOver1.5": null,
        "BTTSHighest": null,
        "xG": 6.14,
        "dxG": 6.92,
        "shotsTaken": 5.6,
        "shotsTakenFirstHalf": 2.8,
        "shotsTakenSecondHalf": 2.8,
        "shotsConceded": 6,
        "shotsConcededFirstHalf": 3,
        "shotsConcededSecondHalf": 3,
        "shotsCR": 0.07,
        "shotsConcededCR": 3,
        "shotsOnTarget": 5.6,
        "shotsOnTargetHome": 5.6,
        "shotsOnTargetAway": 0,
        "possessionAvg": 50.2,
        "possessionHome": 50.2,
        "possessionAway": 0,
        "cleanSheets": 2,
        "cleanSheetsHome": 2,
        "cleanSheetsAway": 0,
        "totalFoulsCommitted": 59,
        "totalFoulsCommittedAgainst": 53,
        "dangerousAttacks": 188,
        "dangerousAttacksHome": 188,
        "dangerousAttacksAway": 0,
        "dangerousAttacksConceded": 0,
        "dangerousAttacksConcededHome": 188,
        "dangerousAttacksConcededAway": 0,
        "ppgHome": 1.4,
        "ppgAway": 0,
        "games": [
          {
            "result": "w",
            "score": "2-0",
            "against": "Manchester United",
            "datetime": "2024-12-26 17:30:00"
          },
          {
            "result": "l",
            "score": "1-2",
            "against": "Ipswich Town",
            "datetime": "2024-12-14 15:00:00"
          },
          {
            "result": "l",
            "score": "2-4",
            "against": "Bournemouth",
            "datetime": "2024-11-30 15:00:00"
          },
          {
            "result": "w",
            "score": "2-0",
            "against": "Southampton",
            "datetime": "2024-11-09 15:00:00"
          },
          {
            "result": "d",
            "score": "2-2",
            "against": "Crystal Palace",
            "datetime": "2024-11-02 17:30:00"
          }
        ],
        "cornersWonOver0.5": 0,
        "cornersWonOver1.5": 0
      },
      "last5Away": {
        "position": 9,
        "matchesPlayed": 5,
        "wins": 2,
        "draws": 1,
        "losses": 2,
        "points": 7,
        "goalsScored": 10,
        "goalsScoredHome": 0,
        "goalsScoredAway": 10,
        "goalsConceded": 9,
        "goalsConcededHome": 0,
        "goalsConcededAway": 9,
        "chance2score": 2.2,
        "chance2scoreHome": 0,
        "chance2scoreAway": 1,
        "cornersWonAvg": 2.4,
        "cornersWonOver0_5": 0,
        "cornersWonOver1_5": 0,
        "cornersWonHighest": 5,
        "BTTS": 3,
        "BTTSOver0.5": null,
        "BTTSOver1.5": null,
        "BTTSHighest": null,
        "xG": 5.69,
        "dxG": 6.8,
        "shotsTaken": 4.8,
        "shotsTakenFirstHalf": null,
        "shotsTakenSecondHalf": null,
        "shotsConceded": 5,
        "shotsConcededFirstHalf": null,
        "shotsConcededSecondHalf": null,
        "shotsCR": 0.04,
        "shotsConcededCR": 0,
        "shotsOnTarget": 4.8,
        "shotsOnTargetHome": 0,
        "shotsOnTargetAway": 4.8,
        "possessionAvg": 48.2,
        "possessionHome": 0,
        "possessionAway": 48.2,
        "cleanSheets": 1,
        "cleanSheetsHome": 0,
        "cleanSheetsAway": 1,
        "totalFoulsCommitted": 65,
        "totalFoulsCommittedAgainst": 60,
        "dangerousAttacks": 183,
        "dangerousAttacksHome": 0,
        "dangerousAttacksAway": 183,
        "dangerousAttacksConceded": 0,
        "dangerousAttacksConcededHome": 0,
        "dangerousAttacksConcededAway": 183,
        "ppgHome": 0,
        "ppgAway": 1.4,
        "games": [
          {
            "result": "d",
            "score": "2-2",
            "against": "Tottenham",
            "datetime": "2024-12-29 15:00:00"
          },
          {
            "result": "w",
            "score": "3-0",
            "against": "Leicester City",
            "datetime": "2024-12-22 14:00:00"
          },
          {
            "result": "l",
            "score": "1-2",
            "against": "West Ham",
            "datetime": "2024-12-09 20:00:00"
          },
          {
            "result": "l",
            "score": "0-4",
            "against": "Everton",
            "datetime": "2024-12-04 19:30:00"
          },
          {
            "result": "w",
            "score": "4-1",
            "against": "Fulham",
            "datetime": "2024-11-23 15:00:00"
          }
        ],
        "cornersWonOver0.5": 0,
        "cornersWonOver1.5": 0
      }
    }
  ]
}
```
