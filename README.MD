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

### Get Matches

Retrieves matches with their associated stats and odds.

```http
GET /api/matches
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

### Fetch Match Data

Fetches new match data from external API and stores it.

```http
POST /api/fetch-matches
```

#### Response 200 (application/json)

```json
{
  "message": "Match data fetched and saved successfully",
  "matches": 10
}
```

#### Error Responses 500 (application/json)

```json
{
  "error": "Failed to fetch/save data",
  "message": "Error details"
}
```

#### Notes

- Requires valid API key in environment variables
- Updates existing records based on match ID
- Includes match statistics and odds data
