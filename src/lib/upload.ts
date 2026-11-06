/** Shrinks a phone photo in the browser (longest side 1200px, WebP) before upload: saves the buyer's data too. */
export async function uploadImage(file: File, max = 1200): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  let blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.82))
  // Older Safari cannot encode WebP and hands back PNG; use JPEG there.
  if (!blob || blob.type !== 'image/webp') blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85))
  if (!blob) throw new Error('encode')
  const res = await fetch('/api/upload', { method: 'POST', headers: { 'content-type': blob.type }, body: blob })
  if (!res.ok) throw new Error(`upload ${res.status}`)
  return ((await res.json()) as { key: string }).key
}
