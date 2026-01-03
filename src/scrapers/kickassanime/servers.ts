import axios, { AxiosError } from "axios";
import { URL_fn } from "../../utils/kickassanime/constants";
import { puppeteerGet } from "../../utils/kickassanime/browser";
import { headers } from "../../config/headers";
import createHttpError, { HttpError } from "http-errors";
import { ScrapedEpisodePage } from "../../types/kickassanime/about";
import { EpisodeServer } from "../../types/kickassanime/anime";

export const scrapeEpisodeServers = async (
  episodeId: string
): Promise<ScrapedEpisodePage | HttpError> => {
  try {
    const URLs = await URL_fn();

    const requestHeaders = {
      "User-Agent": headers.USER_AGENT_HEADER,
      "Accept-Encoding": headers.ACCEPT_ENCODEING_HEADER,
      Accept: "application/json, text/plain, */*",
      Host: new URL(URLs.BASE).host,
    };

    const episodeUrl = `${URLs.SHOW}/${episodeId}`;

    let responseData: any;
    try {
      const response = await axios.get(episodeUrl, {
        headers: requestHeaders,
        timeout: 10000,
      });
      responseData = response.data;
    } catch (axiosErr) {
      console.log("Axios failed, trying Puppeteer for servers...");
      responseData = await puppeteerGet(episodeUrl);
    }

    const servers: EpisodeServer[] = (responseData.servers || []).map(
      (server: any) => ({
        name: server.name,
        url: server.src,
      })
    );

    const res: ScrapedEpisodePage = {
      episodeId: episodeId,
      servers: servers,
    };

    return res;
  } catch (err) {
    console.error("Error in scrapeEpisodeServers :", err);

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
