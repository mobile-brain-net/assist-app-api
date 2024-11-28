# API Endpoints

## Teams

### Fetch League Teams

Fetches teams from external API and stores them in the database.

```http
GET /api/fetch-league-teams
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
