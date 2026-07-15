import Image, { type ImageProps } from 'next/image'
import { cloudinaryLoader } from '@/lib/cloudinary'

type CldImageProps = Omit<ImageProps, 'src' | 'loader'> & {
  /** Cloudinary public ID, e.g. "clients/taco-naco/hero" (not a raw URL). */
  publicId: string
}

// Optimized image from Cloudinary via next/image (f_auto,q_auto, responsive).
export default function CldImage({ publicId, alt, ...rest }: CldImageProps) {
  return <Image loader={cloudinaryLoader} src={publicId} alt={alt} {...rest} />
}
