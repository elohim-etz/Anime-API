import type { SearchedAnime } from "./anime";

export interface ScrapedSearchPage {
  animes: SearchedAnime[];
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
}
