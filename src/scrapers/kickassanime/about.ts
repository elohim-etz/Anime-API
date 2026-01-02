import axios, { AxiosError } from "axios";
import { URL_fn } from "../../utils/kickassanime/constants";
import { headers } from "../../config/headers";
import createHttpError, { HttpError } from "http-errors";
import { ScrapedAboutPage } from "../../types/kickassanime/about";
import { Episode } from "../../types/kickassanime/anime";

const mapStatus = (status: string): string => {
  switch (status) {
    case "finished_airing":
      return "Completed";
    case "currently_airing":
      return "Ongoing";
    case "not_yet_aired":
      return "Not Yet Aired";
    default:
      return "Unknown";
  }
};

export const scrapeAboutPage = async (
  id: string
): Promise<ScrapedAboutPage | HttpError> => {
  try {
    const URLs = await URL_fn();

    const requestHeaders = {
      "User-Agent": headers.USER_AGENT_HEADER,
      "Accept-Encoding": headers.ACCEPT_ENCODEING_HEADER,
      Accept: "application/json, text/plain, */*",
      Host: new URL(URLs.BASE).host,
    };

    // Get anime info
    const infoResponse = await axios.get(`${URLs.SHOW}/${id}`, {
      headers: requestHeaders,
      timeout: 10000,
    });

    const animeData = infoResponse.data;

    // Get episodes
    const episodesResponse = await axios.get(
      `${URLs.SHOW}/${id}/episodes?page=1&lang=ja-JP`,
      {
        headers: requestHeaders,
        timeout: 10000,
      }
    );

    const episodes: Episode[] = episodesResponse.data.result.map((ep: any) => ({
      id: `${id}/episode/ep-${Math.floor(ep.episode_number)}-${ep.slug}`,
      title: ep.title || null,
      number: Math.floor(ep.episode_number),
      img: ep.thumbnail
        ? `${URLs.IMAGE}/${ep.thumbnail.hq}.${ep.thumbnail.formats[0]}`
        : null,
      url: `${URLs.SHOW}/${id}/episode/ep-${Math.floor(ep.episode_number)}-${ep.slug}`,
    }));

    const imgUrl = animeData.poster
      ? `${URLs.IMAGE}/${animeData.poster.hq}.${animeData.poster.formats[0]}`
      : null;

    const coverUrl = animeData.banner
      ? `${URLs.IMAGE}/${animeData.banner.hq}.${animeData.banner.formats[0]}`
      : null;

    const res: ScrapedAboutPage = {
      id: animeData.slug,
      title: animeData.title_en || animeData.title,
      url: `${URLs.BASE}/${animeData.slug}`,
      genres: animeData.genres || [],
      totalEpisodes: episodes.length,
      img: imgUrl,
      cover: coverUrl,
      description: animeData.synopsis || null,
      episodes: episodes,
      subOrDub: animeData.locales?.includes("en-US") ? "dub" : "sub",
      type: animeData.type?.toUpperCase() || null,
      status: mapStatus(animeData.status),
      otherName: animeData.title_original || null,
      releaseDate: animeData.year?.toString() || null,
    };

    return res;
  } catch (err) {
    console.error("Error in scrapeAboutPage :", err);

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
