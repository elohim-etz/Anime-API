import { scrapeEpisodeServers } from "../../scrapers/kickassanime/scrappers";
import type { RequestHandler } from "express";

const getEpisodeServers: RequestHandler = async (req, res) => {
  try {
    // episodeId will be a path like "anime-slug/episode/ep-1-abcd"
    const episodeId: string = req.params[0] || req.params.episodeId;
    const data = await scrapeEpisodeServers(episodeId);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export { getEpisodeServers };
