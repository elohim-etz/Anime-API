import axios, { AxiosError } from "axios";
import { URL_fn } from "../../utils/kickassanime/constants";
import { mapStatus } from "../../utils/kickassanime/helpers";
import { puppeteerPost } from "../../utils/kickassanime/browser";
import { headers } from "../../config/headers";
import createHttpError, { HttpError } from "http-errors";
import { ScrapedSearchPage } from "../../types/kickassanime/search";
import { SearchedAnime } from "../../types/kickassanime/anime";

export const scrapeSearchPage = async (
  query: string,
  page: number
): Promise<ScrapedSearchPage | HttpError> => {
  const res: ScrapedSearchPage = {
    animes: [],
    currentPage: Number(page),
    hasNextPage: false,
    totalPages: 1,
  };

  try {
    const URLs = await URL_fn();
    let responseData: any;

    try {
      // First try with axios (faster)
      const response = await axios.post(
        URLs.SEARCH,
        {
          page: page,
          query: query,
        },
        {
          headers: {
            "User-Agent": headers.USER_AGENT_HEADER,
            "Accept-Encoding": headers.ACCEPT_ENCODEING_HEADER,
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            Referer: `${URLs.BASE}/anime`,
          },
          timeout: 10000,
        }
      );
      responseData = response.data;
    } catch (axiosErr) {
      // If axios fails (likely Cloudflare), fallback to Puppeteer
      console.log("Axios failed, trying Puppeteer for search...");
      responseData = await puppeteerPost(URLs.SEARCH, {
        page: page,
        query: query,
      });
    }

    const searchResults: SearchedAnime[] = responseData.result.map(
      (anime: any) => {
        const imgUrl = anime.poster
          ? `${URLs.IMAGE}/${anime.poster.hq}.${anime.poster.formats[0]}`
          : null;

        return {
          id: anime.slug,
          title: anime.title,
          url: anime.watch_uri
            ? `${URLs.BASE}${anime.watch_uri}`
            : `${URLs.BASE}/${anime.slug}`,
          img: imgUrl,
          releaseDate: anime.year?.toString() || null,
          subOrDub: anime.locales?.includes("en-US") ? "dub" : "sub",
          status: mapStatus(anime.status),
          otherName: anime.title_en || null,
          totalEpisodes: anime.episode_count || null,
        };
      }
    );

    res.animes = searchResults;
    res.hasNextPage = page < responseData.maxPage;
    res.totalPages = responseData.maxPage || 1;

    return res;
  } catch (err) {
    console.error("Error in scrapeSearchPage :", err);

    if (err instanceof AxiosError) {
      throw createHttpError(
        err?.response?.status || 500,
        err?.response?.statusText || "Something went wrong"
      );
    } else {
      throw createHttpError.InternalServerError("Internal server error");
    }
  }
};
