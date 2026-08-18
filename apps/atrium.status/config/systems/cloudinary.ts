import type { SystemDefinition } from "@/lib/health/types"

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "zqisihyg"

export const cloudinary: SystemDefinition = {
  id: "cloudinary",
  name: "Cloudinary",
  category: "third-party",
  criticality: "high",
  summary: "Legacy media delivery for the case studies that have no CDN override.",
  overview: `The original home for case-study media. Three of the ten studies still resolve their
images and video through it, down from six. Delivery URLs are built by \`next-cloudinary\` helpers in
\`lib/cloudinary.ts\`; the Admin API is only touched by a build-time sync script.

The account is currently answering **401 to every request**, including the stock sample asset,
which means this is an account-level problem rather than a bad public ID.`,
  sections: [
    {
      title: "Blast radius",
      body: `Unaffected (media served from the CDN instead): **aahaa, chick-in-waffle, don-chuys,
jerusalem-cafe, old-shawnee-pizza, taco-naco, taha** — seven of the ten.

Affected, falling back to placeholder media: **grand-coffee, hotel-kc, town-company**. All three
also still carry a Cloudinary \`coverImageId\`, so their cards on the work index and the homepage
are dead as well, not just their galleries.

\`farm-fresh\` used to be listed here. It has assets in the generated map but no case study of its
own, so it was never affected.

The components degrade on purpose — a missing asset renders a filler rather than an empty box, so
the failure is quiet. That is good for visitors and bad for detection, which is why it is monitored
here.`,
    },
    {
      title: "The version-segment trap",
      body: `\`next-cloudinary\` prepends its own \`v1/\` segment. A public ID that already carries a
version produces a doubled path and a 404 that looks identical to a permissions error. The helpers
in \`lib/cloudinary.ts\` strip the version defensively for this reason.`,
    },
    {
      title: "Getting off it",
      body: `The exit is already built: adding a slug to \`lib/case-assets.overrides.ts\` with
absolute \`cdn.atriumad.com\` URLs makes the override win, and Cloudinary stops being consulted for
that study. \`bun run manifest\` in the CDN workspace prints the URLs to paste.`,
    },
  ],
  runbook: [
    {
      symptom: "All Cloudinary assets 401",
      check: "Cloudinary console — billing, account suspension, and whether the cloud name still exists.",
      fix: "Restore the account. If it will not be restored, upload the three affected studies to the CDN and add overrides.",
    },
    {
      symptom: "One asset 404s while the rest work",
      check: "Whether the public ID carries a version segment.",
      fix: "Re-run bun run sync:assets --write in the website workspace to regenerate the map.",
    },
  ],
  links: [{ label: "Console", href: "https://console.cloudinary.com" }],
  monitors: [
    {
      id: "cloudinary-delivery",
      label: "Delivery",
      meaning: "Three case studies lose their photography, video and cover image.",
      url: `https://res.cloudinary.com/${CLOUD}/image/upload/sample.jpg`,
      expectStatus: [200],
      degradedAboveMs: 2000,
    },
  ],
  tags: ["media", "cdn"],
}
