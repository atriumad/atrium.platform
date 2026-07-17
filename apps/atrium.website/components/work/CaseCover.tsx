'use client'

import Image from 'next/image'
import CldImage from '@/components/media/CldImage'
import { type CaseStudy, getCaseCover } from '@/lib/work'

type Props = {
  study: CaseStudy
  className?: string
  priority?: boolean
}

export default function CaseCover({ study, className = '', priority = false }: Props) {
  const cover = getCaseCover(study)

  return (
    <div
      className={`relative isolate h-full w-full overflow-hidden bg-[var(--teal-900)] ${className}`}
      role="img"
      aria-label={`${study.client} case study cover`}
      data-case-cover={study.slug}
    >
      {cover.imageId && (
        <CldImage
          publicId={cover.imageId}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          style={{ objectPosition: cover.position }}
        />
      )}

      <div className="absolute inset-0 z-10 bg-black/45" aria-hidden="true" />

      <div className="absolute inset-0 z-20 flex items-center justify-center p-8 md:p-12" aria-hidden="true">
        {cover.logo ? (
          <div
            className="relative h-20 w-[min(58%,20rem)] md:h-24"
            style={cover.logoOffsetY ? { transform: `translateY(${cover.logoOffsetY})` } : undefined}
          >
            <Image
              src={cover.logo}
              alt=""
              fill
              sizes="20rem"
              className="object-contain brightness-0 invert"
            />
          </div>
        ) : (
          <span className="max-w-[16ch] text-center text-3xl font-medium leading-tight text-white md:text-5xl">
            {study.client}
          </span>
        )}
      </div>
    </div>
  )
}
