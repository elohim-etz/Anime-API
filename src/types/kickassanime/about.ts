import type { AnimeInfo, Episode, EpisodeServer } from "./anime";

export interface ScrapedAboutPage extends AnimeInfo {
  episodes: Episode[];
}

export interface ScrapedEpisodePage {
  episodeId: string;
  servers: EpisodeServer[];
}
