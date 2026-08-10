// ─── Hand-authored asset overrides ─────────────────────────────────────────
// cloudinary-assets.generated.ts is rewritten by scripts/sync-cloudinary-assets.ts,
// so a client whose media lives outside Cloudinary cannot be recorded there.
// Entries here win over the generated lists for the slugs they name.
//
// Values are finished URLs, not public IDs. The delivery helpers in
// lib/cloudinary.ts pass absolute URLs through untouched, and the host is
// allowed in next.config.ts for next/image.

import type { CaseAssets } from './cloudinary-assets.generated'

export const caseAssetOverrides: Record<string, CaseAssets> = {
  'taco-naco': {
    images: [
      'https://cdn.atriumad.com/clients/TNKC/photos/Artboard%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/Artboard%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/Artboard%203.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR01%20Post%20Easter%20brunch%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR05%20Slide%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR05%20Slide%205.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR19%20Slide%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR19%20Slide%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR24%20Photo%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR24%20Photo%203.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR31%20farmers%20Market.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20AUG15%20Churros-Proof%20of%20love.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUL13%20Nacho%20Bowl%20Wednesday.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUL14%20Slide%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUL14%20Slide%203.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUL17%20Slide%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUL17%20Slide%204.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUL18%20Slide%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUL18%20Slide%204.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUN05%20Ceviche%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUN07%20Fathers%20day.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20JUN07%20Reminder_%20tequila.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20MAR13%20Slide%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20MAY27%20Ceviche.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20MAY31%20Creative%20Post%204.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20MAY32%20Creative%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20MAY34%20Creative%20Post%203%20(1).jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20MAY34%20Creative%20Post%203.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20MAY36%20Slide%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20MAY38%20Slide%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_APR16_CREATIVE%20POST.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_JUN26%20Happy%20Hour%20Story.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_JUN26%20Happy%20Hour.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_MAR01%20Slide%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_MAR02%20SLIDE%201.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_MAR02%20SLIDE%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_MAR10%20Slide%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_MAR11%20Slide%202.jpg',
      'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_MAR12%20Slide1_.jpg',
    ],
    videos: [
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20APR12_Margarita%201%20.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20APR29_Ceviche%20Tostada-.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20AUG05%20Cochinita%20Pibil%20-Prep%20Reedit.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20AUG06%20Loaded%20Nachos%20-Prep%20Reedit-.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20AUG08%20Drawing%20Transitions.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20AUG11%20DIVIDED%20SCREEN.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20JUL01%20Chilaquiles.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20JUL06%20Tosta-Guac%20Build%20Up.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20JUL12%20Compilation%20Single%20Item.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20JUN30%20Fan%20Fest%20FIFA%20food%20truck-.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20MAY01%20Football%20Video-.mp4',
      'https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20MAY06%20Tequila%20Shoot%20Video-.mp4',
    ],
  },
}
