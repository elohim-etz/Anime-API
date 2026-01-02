export interface Anime {
  id: string | null;
  title: string | null;
  img: string | null;
}

export interface SearchedAnime extends Anime {
  url: string | null;
  releaseDate: string | null;
  subOrDub: "sub" | "dub" | null;
  status: string | null;
  otherName: string | null;
  totalEpisodes: number | null;
}

export interface AnimeInfo extends Anime {
  url: string | null;
  genres: string[];
  totalEpisodes: number;
  cover: string | null;
  description: string | null;
  subOrDub: "sub" | "dub" | null;
  type: string | null;
  status: string | null;
  otherName: string | null;
  releaseDate: string | null;
}

export interface Episode {
  id: string;
  title: string | null;
  number: number;
  img: string | null;
  url: string;
}

export interface EpisodeServer {
  name: string;
  url: string;
}

export interface RecentAnime extends Anime {
  episodeId: string | null;
  episodeNo: number | null;
  subOrDub: "sub" | "dub" | null;
}
