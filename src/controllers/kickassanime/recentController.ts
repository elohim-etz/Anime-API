import { scrapeRecentPage } from "../../scrapers/kickassanime/scrappers";
import type { RequestHandler } from "express";

const getRecentReleases: RequestHandler = async (req, res) => {
  try {
    const page: number = req.query.page
      ? Number(decodeURIComponent(req.query?.page as string))
      : 1;

    const data = await scrapeRecentPage(page);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export { getRecentReleases };
