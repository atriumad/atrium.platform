import { type CldImageProps as BaseProps, CldImage as CldImageBase } from 'next-cloudinary'

type CldImageProps = Omit<BaseProps, 'src'> & {
  /** Cloudinary public ID, e.g. "taco-naco/TNKC_FEB18_Slide_2" (not a raw URL). */
  publicId: string
}

/** Strip a legacy `v1784223449/` delivery-version prefix so next-cloudinary
 *  doesn't mistake it for a folder (which 404s). */
function stripVersion(publicId: string): string {
  return publicId.trim().replace(/^\/+/, '').replace(/^v\d+\//, '')
}

// Optimized image from Cloudinary (f_auto, q_auto, responsive) via next-cloudinary.
export default function CldImage({ publicId, alt, ...rest }: CldImageProps) {
  return <CldImageBase src={stripVersion(publicId)} alt={alt} {...rest} />
}
