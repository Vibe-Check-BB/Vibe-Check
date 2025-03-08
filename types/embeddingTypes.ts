export interface EmbedSongRequest {
  id: string;
  lyrics: string;
  artist?: string;
  genre?: string;
  song?: string;
  spotifyId?:string;
  imageURL?:string;
}
