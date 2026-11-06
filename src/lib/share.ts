export async function shareLink(url: string, title: string) {
  try {
    if (navigator.share) {
      await navigator.share({ url, title })
      return 'shared'
    }
  } catch {
    return 'cancelled'
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    window.prompt('Copy', url)
    return 'copied'
  }
}

import { useEffect, useState } from 'react'

const PUBLIC_ORIGIN = 'https://rizk.tz'

/** Same text on the server and the first client render, then the real origin (local, preview or live). */
export function useOrigin() {
  const [origin, setOrigin] = useState(PUBLIC_ORIGIN)
  useEffect(() => setOrigin(window.location.origin), [])
  return origin
}
