import ogs from "open-graph-scraper";

export async function getOgData(url: string) {
  try {
    const { result } = await ogs({ url });
    return {
      title: result.ogTitle || result.twitterTitle || "",
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || "",
    };
  } catch (error) {
    console.error("Error fetching OG data:", error);
    return {
      title: "",
      image: "",
    };
  }
}
