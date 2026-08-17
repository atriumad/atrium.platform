import type { SystemDefinition } from "@/lib/health/types"

export const atriumCdn: SystemDefinition = {
  id: "atrium-cdn",
  name: "Asset CDN",
  category: "infrastructure",
  criticality: "critical",
  owner: "Atrium",
  workspace: "@atrium/cdn",
  summary: "cdn.atriumad.com — client photos and reels on Hostinger shared hosting.",
  overview: `Not a server we run: a document root on Hostinger that we publish to over SSH. The
workspace is three Node scripts and a hardened \`.htaccess\`. Every case study that renders real
media pulls it from here, which makes this the single most load-bearing piece of infrastructure in
the estate — the website is static and can survive most things, but not this.`,
  sections: [
    {
      title: "The three scripts",
      body: `- \`scripts/build.mjs\` — walks \`public/\`, warns on filenames with spaces, parens or percent signs, **hard-fails** on \`.php/.cgi/.pl/.sh/.py\`, then wipes and re-stages \`dist/\`, dropping hidden files except \`.htaccess\` and \`robots.txt\`.
- \`scripts/deploy.mjs\` — refuses to push if \`dist/.htaccess\` is missing, then \`rsync -az --delete --exclude clients/\`. The exclusion is the safety rail: client media on the server is never wiped by a deploy.
- \`scripts/manifest.ts\` — read-only. Enumerates \`public/clients/<CODE>/{photos,reels}\` and prints delivery URLs; \`--snippet\` emits a paste-ready \`cdnAssets\` record for the website's overrides file.`,
    },
    {
      title: "Why filenames are a recurring failure",
      body: `Client media arrives with spaces, non-breaking spaces and parentheses in the filenames.
Those survive rsync but need exactly one round of percent-encoding in the URL. Encoding twice
produces a 404 that looks like a missing file; not encoding at all produces a 403. The build script
warns about these names precisely because the failure appears later, in the browser, far from the
upload.`,
    },
    {
      title: "Server hardening",
      body: `\`public/.htaccess\` removes PHP handlers, disables directory indexes, 404s every
dotfile, sets \`X-Robots-Tag: noindex\`, sends HSTS, caches media immutably for a year, restricts
CORS to \`(www.)atriumad.com\`, and blocks hotlinking while deliberately allowing an empty Referer so
\`next/image\` server-side fetches keep working.

A 403 on a directory URL is therefore **correct behaviour**, not an outage — indexes are off. Only
asset URLs are meaningful to monitor.`,
    },
    {
      title: "Credentials",
      body: `None in the repo, by design. Auth is the \`atrium-cdn\` entry in \`~/.ssh/config\`
(HostName / User / Port / IdentityFile) with the public key registered in hPanel → SSH Access.
That means deploys only work from a machine that has been set up; CI cannot publish today.`,
    },
  ],
  runbook: [
    {
      symptom: "A specific asset 404s but the host is up",
      check: "Compare the URL against `bun run manifest` output for that client code.",
      fix: "Almost always double-encoding, or a non-breaking space in the filename. Re-run the manifest and paste the fresh URLs into lib/case-assets.overrides.ts.",
    },
    {
      symptom: "Everything on the host is unreachable",
      check: "Hostinger status and the hPanel file manager for the domain.",
      fix: "Nothing to redeploy — the files are already there. This is a hosting incident; the website will show placeholders until it clears.",
    },
    {
      symptom: "A deploy wiped something",
      check: "Whether the path was under clients/ — that folder is excluded from --delete.",
      fix: "Anything outside clients/ is reproducible from the repo: re-run bun run deploy.",
    },
  ],
  entryPoints: [
    { label: "Stage build", path: "apps/atrium.cdn/scripts/build.mjs" },
    { label: "Deploy over SSH", path: "apps/atrium.cdn/scripts/deploy.mjs" },
    { label: "Client asset manifest", path: "apps/atrium.cdn/scripts/manifest.ts" },
    { label: "Server hardening", path: "apps/atrium.cdn/public/.htaccess" },
  ],
  env: [
    {
      name: "CDN_SSH_HOST",
      where: "apps/atrium.cdn/scripts/deploy.mjs:27",
      purpose: "SSH alias to publish to.",
      status: "missing",
      note: "Defaults to atrium-cdn, which is the real alias, so the deploy works unset.",
    },
    {
      name: "CDN_REMOTE_PATH",
      where: "apps/atrium.cdn/scripts/deploy.mjs:28",
      purpose: "Remote document root.",
      status: "missing",
      note: "Defaults to domains/atriumad.com/public_html/cdn.",
    },
    {
      name: "CDN_PROTECTED",
      where: "apps/atrium.cdn/scripts/deploy.mjs:29",
      purpose: "Path spared by rsync --delete.",
      status: "missing",
      note: "Defaults to clients/. Changing this can delete client media — treat it as load-bearing.",
    },
  ],
  links: [{ label: "Host", href: "https://cdn.atriumad.com/robots.txt" }],
  monitors: [
    {
      id: "cdn-robots",
      label: "Host reachable",
      meaning: "The whole CDN is down; every case study loses its media at once.",
      url: "https://cdn.atriumad.com/robots.txt",
      expectStatus: [200],
      degradedAboveMs: 1500,
    },
    {
      id: "cdn-client-asset",
      label: "Client asset delivery",
      meaning: "The host answers but real client media does not — usually encoding or permissions.",
      url: "https://cdn.atriumad.com/clients/AAHA/photos/AAHA_%20APR13%20Slide%201.jpg",
      method: "GET",
      expectStatus: [200],
      degradedAboveMs: 2500,
    },
  ],
  tags: ["hostinger", "rsync", "assets"],
}
