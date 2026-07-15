import DragGallery from '@/components/work/DragGallery'
import VideoMarquee from '@/components/work/VideoMarquee'

// Preview route for the media components. Remove or repurpose once wired into
// the real client pages with actual assets.
export default function GalleryDemoPage() {
  return (
    <>
      <VideoMarquee />
      <DragGallery />
    </>
  )
}
