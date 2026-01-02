import { scrapeAboutPage } from "../../scrapers/kickassanime/scrappers";
import type { RequestHandler } from "express";

const getAboutPageInfo: RequestHandler = async (req, res) => {
  try {
    const id: string = req.params.id;
    const data = await scrapeAboutPage(id);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export { getAboutPageInfo };
