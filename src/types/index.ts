export interface Song {
  videoId: string;
  title: string;
  artist?: string;  // APIから取得できない場合はundefined
  album?: string;   // APIから取得できない場合はundefined
  thumbnail: string;
}