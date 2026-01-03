export const mapStatus = (status: string): string => {
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
