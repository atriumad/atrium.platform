import Image, { type ImageProps } from 'next/image'
import { type CldImageProps as BaseProps, CldImage as CldImageBase } from 'next-cloudinary'

type CldImageProps = Omit<BaseProps, 'src'> & {
  /** A Cloudinary public ID, e.g. "taco-naco/TNKC_FEB18_Slide_2", or a finished
   *  URL for a client whose media is delivered from our own CDN. */
  publicId: string
}

/** Strip a legacy `v1784223449/` delivery-version prefix so next-cloudinary
 *  doesn't mistake it for a folder (which 404s). */
function stripVersion(publicId: string): string {
  return publicId.trim().replace(/^\/+/, '').replace(/^v\d+\//, '')
}

function isAbsoluteUrl(src: string): boolean {
  return /^https?:\/\//i.test(src.trim())
}

// Optimized image from Cloudinary (f_auto, q_auto, responsive) via next-cloudinary.
//
// A publicId that is already a URL is served by next/image instead: passing one
// to CldImageBase makes it build a Cloudinary delivery URL around the URL, which
// fails. The host must be listed in next.config.ts remotePatterns.
export default function CldImage({ publicId, alt, ...rest }: CldImageProps) {
  if (isAbsoluteUrl(publicId)) {
    return <Image alt={alt} src={publicId.trim()} {...(rest as Omit<ImageProps, 'src' | 'alt'>)} />
  }

  return <CldImageBase src={stripVersion(publicId)} alt={alt} {...rest} />
}
