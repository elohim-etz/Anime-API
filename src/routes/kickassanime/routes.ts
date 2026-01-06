import { Router, type IRouter } from "express";
import {
  getSearchPageInfo,
  getAboutPageInfo,
  getEpisodeServers,
  getRecentReleases,
} from "../../controllers/kickassanime/controllers";
import { cacheManager } from "../../middlewares/cache";

const kickassanime_router: IRouter = Router();

// /kickassanime/
kickassanime_router.get("/", (_req, res) => {
  res.redirect("/");
});

// /kickassanime/search?keyword=${query}&page=${page}
kickassanime_router.get(
  "/search",
  cacheManager.middleware({
    duration: 3600, // 1 hour cache
    keyParams: ["keyword", "page"],
  }),
  getSearchPageInfo
);

// /kickassanime/anime/:id
kickassanime_router.get("/anime/:id", cacheManager.middleware(), getAboutPageInfo);

// /kickassanime/recent?page=${page}
kickassanime_router.get(
  "/recent",
  cacheManager.middleware({
    duration: 3600 * 24, // 1 day cache
    keyParams: ["page"],
  }),
  getRecentReleases
);

// /kickassanime/servers/:animeId/episode/:episodeId
// Episode ID format: anime-slug/episode/ep-1-abcd
kickassanime_router.get("/servers/*", cacheManager.middleware(), getEpisodeServers);

export default kickassanime_router;
