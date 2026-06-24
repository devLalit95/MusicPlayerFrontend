# Models and DTOs

## Models

- Playlist: {
  - id: Long
  - name: String
  - description: String
  - createdAt: LocalDateTime
  - user: User
  - songs: List<Song>
}

- PlaylistSongId: {
  - playlist: Long
  - song: Long
}

- PlaylistSong: {
  - playlist: Playlist
  - song: Song
  - addedAt: LocalDateTime
}

- Song: {
  - id: Long
  - title: String
  - artist: String
  - album: String
  - fileUrl: String
  - durationSeconds: Integer
  - createdAt: LocalDateTime
  - playlists: List<Playlist>
  - likedByUsers: Set<User>
  - playHistories: List<SongPlayHistory>
}

- SongPlayHistory: {
  - id: Long
  - user: User
  - song: Song
  - playCount: Long
  - lastPlayedAt: LocalDateTime
}

- User: {
  - id: Long
  - username: String
  - email: String
  - password: String
  - createdAt: LocalDateTime
  - role: Role (USER | ADMIN)
  - playlists: List<Playlist>
  - likedSongs: Set<Song>
  - playHistories: List<SongPlayHistory>
}

## DTOs

- RegisterRequest: {
  - username: String
  - email: String
  - password: String
}

- PlaylistRequest: {
  - name: String
  - description: String
}

- JwtResponse: {
  - token: String
  - type: String (default: "Bearer")
  - id: Long
  - username: String
  - email: String
  - role: String
}

- LoginRequest: {
  - username: String
  - password: String
}

- SongRequest: {
  - title: String
  - artist: String
  - album: String
  - fileUrl: String
  - durationSeconds: Integer
}

- UserProfileUpdateRequest: {
  - username: String
  - email: String
  - password: String
}

- UserProfileResponse: {
  - id: Long
  - username: String
  - email: String
  - role: String
  - createdAt: LocalDateTime
}

# API Endpoints (return type — purpose)

## Song endpoints (`/api/songs`)

- `GET /api/songs` — `ResponseEntity<List<Song>>` — Returns all songs.
- `GET /api/songs/{id}` — `ResponseEntity<Song>` — Returns a single song by id.
- `GET /api/songs/search/title?title=` — `ResponseEntity<List<Song>>` — Searches songs by title.
- `GET /api/songs/search/artist?artist=` — `ResponseEntity<List<Song>>` — Searches songs by artist.
- `POST /api/songs/{id}/like` — `ResponseEntity<Void>` — Likes the song for the current user.
- `POST /api/songs/{id}/dislike` — `ResponseEntity<Void>` — Removes like (dislike) for the current user.
- `GET /api/songs/liked` — `ResponseEntity<List<Song>>` — Returns the current user's liked songs.

## User endpoints (`/api/user`)

- `GET /api/user/ping` — `String` — Simple health/ping endpoint.
- `GET /api/user/profile` — `ResponseEntity<UserProfileResponse>` — Returns current user's profile.
- `PUT /api/user/profile` — `ResponseEntity<UserProfileResponse>` — Updates current user's profile.
- `GET /api/user/profile/liked-songs` — `ResponseEntity<List<Song>>` — Returns liked songs for current user.
- `GET /api/user/profile/frequent-songs` — `ResponseEntity<List<Song>>` — Returns frequently played songs for current user.
- `POST /api/user/songs/{songId}/like` — `ResponseEntity<Void>` — Likes a song for the current user.
- `DELETE /api/user/songs/{songId}/like` — `ResponseEntity<Void>` — Removes like for the current user.
- `POST /api/user/songs/{songId}/listen` — `ResponseEntity<Song>` — Records a play for the user and returns the song.
- `GET /api/user/playlists` — `ResponseEntity<List<Playlist>>` — Returns current user's playlists.
- `GET /api/user/playlists/{id}` — `ResponseEntity<Playlist>` — Returns a playlist by id.
- `POST /api/user/playlists` — `ResponseEntity<Playlist>` — Creates a new playlist.
- `PUT /api/user/playlists/{id}` — `ResponseEntity<Playlist>` — Updates a playlist.
- `DELETE /api/user/playlists/{id}` — `ResponseEntity<Void>` — Deletes a playlist.
- `POST /api/user/playlists/{playlistId}/songs/{songId}` — `ResponseEntity<Playlist>` — Adds a song to a playlist.
- `DELETE /api/user/playlists/{playlistId}/songs/{songId}` — `ResponseEntity<Playlist>` — Removes a song from a playlist.
- `GET /api/user/playlists/search?name=` — `ResponseEntity<List<Playlist>>` — Searches playlists by name.

## Auth endpoints (`/api/auth`)

- `POST /api/auth/register` — `ResponseEntity<String>` — Registers a new user.
- `GET /api/auth/ping` — `String` — Simple health/ping endpoint.
- `POST /api/auth/login` — `ResponseEntity<JwtResponse>` — Authenticates user and returns JWT.

## Admin endpoints (`/api/admin`) — requires ADMIN role

- `GET /api/admin/users` — `List<User>` — Returns all users (admin).
- `DELETE /api/admin/users/{id}` — `ResponseEntity<String>` — Deletes a user (admin).
- `POST /api/admin/upload` — `ResponseEntity<?>` — Uploads a song file and creates a song (multipart form).
- `GET /api/admin/songs` — `ResponseEntity<List<Song>>` — Returns all songs (admin view).
- `GET /api/admin/songs/{id}` — `ResponseEntity<Song>` — Returns song by id (admin).
- `POST /api/admin/songs` — `ResponseEntity<Song>` — Creates a new song (admin).
- `PUT /api/admin/songs/{id}` — `ResponseEntity<Song>` — Updates a song (admin).
- `DELETE /api/admin/songs/{id}` — `ResponseEntity<Void>` — Deletes a song (admin).

## Test endpoints (`/api/test`)

- `GET /api/test/public` — `ResponseEntity<Map<String,String>>` — Public test/health endpoint.
- `GET /api/test/protected` — `ResponseEntity<Map<String,Object>>` — Protected test endpoint returning auth info.
- `GET /api/test/users` — `ResponseEntity<List<User>>` — Returns all users (test).
- `GET /api/test/songs/count` — `ResponseEntity<Map<String,Object>>` — Returns total song count.
- `GET /api/test/songs/random` — `ResponseEntity<List<Song>>` — Returns a sample list of songs.
- `POST /api/test/create-song` — `ResponseEntity<Map<String,Object>>` — Creates a sample song (test).
- `GET /api/test/user-info` — `ResponseEntity<Map<String,Object>>` — Returns current authenticated user info.

# Notes

- Endpoints that operate on the "current user" require authentication and use the authenticated principal.
- There are two places exposing like/dislike endpoints: `/api/songs/{id}/like` and `/api/user/songs/{songId}/like` — both call `songService.likeSong` / `dislikeSong`.
- Use `GET /api/songs/liked` or `GET /api/user/profile/liked-songs` to retrieve liked songs for the frontend.

