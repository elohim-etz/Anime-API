import axios, { AxiosError } from "axios";
import { URL_fn } from "../../utils/kickassanime/constants";
import { headers } from "../../config/headers";
import createHttpError, { HttpError } from "http-errors";
import { ScrapedRecentPage } from "../../types/kickassanime/recent";
import { RecentAnime } from "../../types/kickassanime/anime";

export const scrapeRecentPage = async (
  page: number = 1
): Promise<ScrapedRecentPage | HttpError> => {
  const res: ScrapedRecentPage = {
    animes: [],
    currentPage: Number(page),
    hasNextPage: false,
    totalPages: 1,
  };

  try {
    const URLs = await URL_fn();

    const response = await axios.get(`${URLs.RECENT}?page=${page}`, {
      headers: {
        "User-Agent": headers.USER_AGENT_HEADER,
        "Accept-Encoding": headers.ACCEPT_ENCODEING_HEADER,
        Accept: "application/json, text/plain, */*",
        Host: new URL(URLs.BASE).host,
      },
      timeout: 10000,
    });

    const recentAnimes: RecentAnime[] = response.data.result.map(
      (anime: any) => {
        const imgUrl = anime.poster
          ? `${URLs.IMAGE}/${anime.poster.hq}.${anime.poster.formats[0]}`
          : null;

        return {
          id: anime.slug,
          title: anime.title,
          img: imgUrl,
          episodeId: anime.episode?.slug || null,
          episodeNo: anime.episode?.episode_number
            ? Math.floor(anime.episode.episode_number)
            : null,
          subOrDub: anime.locales?.includes("en-US") ? "dub" : "sub",
        };
      }
    );

    res.animes = recentAnimes;
    res.hasNextPage = page < (response.data.maxPage || 1);
    res.totalPages = response.data.maxPage || 1;

    return res;
  } catch (err) {
    console.error("Error in scrapeRecentPage :", err);

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
