import { cldVideoPoster, cldVideoUrl } from '@/lib/cloudinary'

type CldVideoProps = {
  /** Cloudinary video public ID, e.g. "clients/taha/reel". */
  publicId: string
  className?: string
  /** Autoplaying background loops must stay muted. Default true. */
  muted?: boolean
  loop?: boolean
  autoPlay?: boolean
  controls?: boolean
}

// Optimized MP4 from Cloudinary with an auto poster frame. Adaptive HLS lands
// with the Cloudflare Stream phase — call sites won't change.
export default function CldVideo({
  publicId,
  className,
  muted = true,
  loop = true,
  autoPlay = true,
  controls = false,
}: CldVideoProps) {
  return (
    <video
      className={className}
      src={cldVideoUrl(publicId)}
      poster={cldVideoPoster(publicId)}
      muted={muted}
      loop={loop}
      autoPlay={autoPlay}
      controls={controls}
      playsInline
      preload="metadata"
    />
  )
}
