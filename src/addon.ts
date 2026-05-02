import { addonBuilder, ContentType, Manifest, Stream } from "stremio-addon-sdk";
import { getStreamContent as getVidsrcStreams } from "./extractor";
import { getStreamContent as getPStreamStreams } from "./pstream";

const manifest: Manifest = {
  id: "xyz.theditor.stremsrc",
  version: "0.2.0",
  catalogs: [],
  resources: [
    {
      name: "stream",
      types: ["movie", "series"],
      idPrefixes: ["tt"],
    },
  ],
  types: ["movie", "series"],
  name: "stremsrc",
  description: "A VidSRC + PStream extractor for stremio",
};

const builder = new addonBuilder(manifest);

export const addonFn = async ({
  type,
  id
}: {
  type: ContentType;
  id: string;
}): Promise<{
  streams: Stream[];
}> => {
  try {
    // Get streams from both extractors concurrently
    const [vidsrcStreams, pStreamStreams] = await Promise.allSettled([
      getVidsrcStreams(id, type),
      getPStreamStreams(id, type),
    ]);

    const allStreams: Stream[] = [];

console.log("VidSrc result:", vidsrcStreams.status, vidsrcStreams.status === "rejected" ? vidsrcStreams.reason : vidsrcStreams.value?.length);
console.log("PStream result:", pStreamStreams.status, pStreamStreams.status === "rejected" ? pStreamStreams.reason : pStreamStreams.value?.length);

if (vidsrcStreams.status === "fulfilled" && vidsrcStreams.value) {
      allStreams.push(...vidsrcStreams.value);
    }
    if (pStreamStreams.status === "fulfilled" && pStreamStreams.value) {
      allStreams.push(...pStreamStreams.value);
    }
    return {
      streams: allStreams,
    };
  } catch (error) {
    console.error("Stream extraction failed:", error);
    return { streams: [] };
  }
};

builder.defineStreamHandler(addonFn);

export default builder.getInterface();
