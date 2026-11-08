import type { MetadataRoute } from "next";

// Metadata routes are generated for whatever host serves them. Pin the
// canonical origin so loc values stay on https://letsgo.batleth.com.
const ORIGIN = "https://letsgo.batleth.com";

// Git committer timestamps for the latest commit that changed each page.
// Home is src/app/page.tsx (ede8b7f). Walks also renders WalkCard, last
// touched in a77f83b. These are not the build clock.
const HOME_LAST_MODIFIED = "2026-09-16T19:33:26+01:00";
const WALKS_LAST_MODIFIED = "2026-09-16T19:44:50+00:00";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${ORIGIN}/`,
      lastModified: HOME_LAST_MODIFIED,
    },
    {
      url: `${ORIGIN}/walks`,
      lastModified: WALKS_LAST_MODIFIED,
    },
  ];
}
