import { isSiteReachable } from "../../lib/isSiteReachable";
import { websites_collection, AnimeWebsiteConfig } from "../../config/websites";

type KickAssAnimeConfig = {
  BASE: string;
  SEARCH: string;
  SHOW: string;
  RECENT: string;
  IMAGE: string;
};

const kickassanime: AnimeWebsiteConfig = websites_collection["KickAssAnime"];
// storing initial base link
let kickassanime_base = kickassanime.BASE;
// array of clones
let clones_array: string[] = [];
clones_array.push(kickassanime_base);

if (kickassanime.CLONES) {
  const kickassanime_clones: Record<string, string[]> = kickassanime.CLONES;

  for (const key in kickassanime_clones) {
    if (Object.prototype.hasOwnProperty.call(kickassanime_clones, key)) {
      const values: string[] = kickassanime_clones[key];
      clones_array.push(...values);
    }
  }
}

// make new kickassanime obj using new kickassanime_base
const makeKickAssAnimeObj = (kickassanime_base: string): KickAssAnimeConfig => {
  return {
    BASE: kickassanime_base,
    SEARCH: `${kickassanime_base}/api/fsearch`,
    SHOW: `${kickassanime_base}/api/show`,
    RECENT: `${kickassanime_base}/api/recent`,
    IMAGE: `${kickassanime_base}/image`,
  };
};

// return fn
const URL_fn = async (): Promise<KickAssAnimeConfig> => {
  try {
    for (const url of clones_array) {
      if (await isSiteReachable(url as string)) {
        kickassanime_base = url;
        break;
      }
    }
    return makeKickAssAnimeObj(kickassanime_base as string);
  } catch (error) {
    console.error("Error occurred in both sites:", error);
    throw error;
  }
};

export { URL_fn };
