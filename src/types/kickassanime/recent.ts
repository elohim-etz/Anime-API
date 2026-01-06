import type { RecentAnime } from "./anime";

export interface ScrapedRecentPage {
  animes: RecentAnime[];
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
}
