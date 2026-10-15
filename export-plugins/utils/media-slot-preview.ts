/**
 * Dev-tools preview for media slots.
 *
 * Previews an uncommitted image on a video slot by swapping the poster of the
 * patched video host that public/airo-video-slots.js created. The committed
 * poster is kept so revertMediaSlotPreview can restore it.
 */

const SLOT_PREFIX_IMAGES = '/airo-assets/images/'
const PREVIEW_ATTR = 'data-airo-media-preview'

/** The subset of the patched video element this module touches. */
interface PatchedVideoHost {
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
  removeAttribute(name: string): void
}

let active: { host: PatchedVideoHost; committedPoster: string | null } | null = null

export interface MediaSlotPreviewOptions {
  isVideo: boolean
}

/**
 * Previews `url` on the patched video host for `slotPath`.
 * Returns false when no patched host exists or the preview is not an image.
 */
export function previewMediaSlot(slotPath: string, url: string, options: MediaSlotPreviewOptions): boolean {
  if (options.isVideo) return false
  const host = findPatchedHost(slotPath)
  if (!host) return false

  revertMediaSlotPreview()
  active = { host, committedPoster: host.getAttribute('poster') }
  host.setAttribute(PREVIEW_ATTR, 'poster')
  host.setAttribute('poster', url)
  return true
}

/** Restores the committed poster and clears the preview marker. */
export function revertMediaSlotPreview(): void {
  if (!active) return
  const { host, committedPoster } = active
  active = null
  host.removeAttribute(PREVIEW_ATTR)
  if (committedPoster === null) host.removeAttribute('poster')
  else host.setAttribute('poster', committedPoster)
}

function findPatchedHost(slotPath: string): PatchedVideoHost | null {
  const posterPath = SLOT_PREFIX_IMAGES + slotPath
  const videos = document.querySelectorAll('video[data-airo-video-patched="true"]')
  for (const video of videos) {
    if ((video.getAttribute('poster') ?? '').includes(posterPath)) return video
  }
  return null
}
