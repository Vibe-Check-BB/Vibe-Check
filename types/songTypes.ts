export interface FinalSongResponse {
  id: string;
  song: string;
  artist: string;
  reason: string;
  genre?: string;
  imageURL?: string | null;
  spotifyId?: string | null;
  score?: number;
}
