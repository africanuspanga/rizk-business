import { useRouter } from '@tanstack/react-router'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { ErrorText, Field, Img } from '#/components/ui'
import { deleteProduct, saveProduct, type ProductRow } from '#/lib/api/merchant'
import { useT } from '#/lib/i18n'
import { uploadImage } from '#/lib/upload'

export function ProductForm({ product }: { product?: ProductRow }) {
  const t = useT()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ? String(product.price) : '',
    compare_price: product?.compare_price ? String(product.compare_price) : '',
    stock: product?.stock == null ? '' : String(product.stock),
    active: product ? !!product.active : true,
  })
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  async function addFiles(files: FileList | null) {
    if (!files) return
    const list = Array.from(files).slice(0, 6 - images.length)
    setUploading((n) => n + list.length)
    for (const f of list) {
      try {
        const key = await uploadImage(f)
        setImages((prev) => [...prev, key])
      } catch {
        setError(t('Picha moja imeshindwa kupakiwa. Jaribu tena.', 'A photo failed to upload. Try again.'))
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        const res = await saveProduct({ data: { ...form, id: product?.id, images } })
        setBusy(false)
        if ('error' in res) {
          return setError(res.error === 'name' ? t('Andika jina la bidhaa.', 'Enter a product name.') : t('Weka bei.', 'Enter a price.'))
        }
        router.navigate({ to: '/app/products' })
      }}
    >
      <div className="hide-scroll -mx-4 flex gap-3 overflow-x-auto px-4 py-1">
        {images.map((k, i) => (
          <div key={k} className="relative shrink-0">
            <Img k={k} alt="" className="h-32 w-32 rounded-[22px]" />
            {i === 0 && <span className="absolute bottom-2 left-2 rounded-full bg-card px-2.5 py-0.5 text-[11px] font-bold">{t('Kuu', 'Main')}</span>}
            <button
              type="button"
              aria-label={t('Ondoa picha', 'Remove photo')}
              onClick={() => setImages(images.filter((x) => x !== k))}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-card shadow"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`u${i}`} className="flex h-32 w-32 shrink-0 items-center justify-center rounded-[22px] bg-peach/60">
            <Loader2 className="animate-spin" />
          </div>
        ))}
        {images.length + uploading < 6 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-32 w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-[#e2d6cb] text-sm font-semibold"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-peach">
              <Plus size={20} />
            </span>
            {t('Picha', 'Photo')}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <div className="card space-y-4 p-5">
        <Field label={t('Jina la bidhaa', 'Product name')}>
          <input className="input" value={form.name} onChange={set('name')} placeholder={t('Mf. Gauni la kitenge', 'e.g. Kitenge dress')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('Bei (TSh)', 'Price (TSh)')}>
            <input className="input" inputMode="numeric" value={form.price} onChange={set('price')} placeholder="35000" />
          </Field>
          <Field label={t('Bei ya zamani', 'Was price')}>
            <input className="input" inputMode="numeric" value={form.compare_price} onChange={set('compare_price')} placeholder={t('Hiari', 'Optional')} />
          </Field>
        </div>
        <Field label={t('Idadi iliyopo', 'In stock')} hint={t('Acha wazi kama haiishi', 'Leave empty if it never runs out')}>
          <input className="input" inputMode="numeric" value={form.stock} onChange={set('stock')} placeholder="∞" />
        </Field>
        <Field label={t('Maelezo', 'Description')}>
          <textarea className="input" value={form.description} onChange={set('description')} placeholder={t('Saizi, rangi, kitambaa...', 'Sizes, colours, material...')} />
        </Field>
        <label className="flex items-center justify-between rounded-[18px] bg-canvas px-4 py-3">
          <span className="text-[15px] font-semibold">{t('Onyesha dukani', 'Show in shop')}</span>
          <input type="checkbox" className="h-6 w-6 accent-[#1f1b18]" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
        </label>
      </div>

      <ErrorText>{error}</ErrorText>
      <button className="btn w-full" disabled={busy || uploading > 0}>
        {busy ? t('Inahifadhi...', 'Saving...') : t('Hifadhi bidhaa', 'Save product')}
      </button>
      {product && (
        <button
          type="button"
          className="btn btn-soft w-full text-bad"
          onClick={async () => {
            if (!window.confirm(t('Futa bidhaa hii?', 'Delete this product?'))) return
            await deleteProduct({ data: { id: product.id } })
            router.navigate({ to: '/app/products' })
          }}
        >
          <Trash2 size={18} /> {t('Futa bidhaa', 'Delete product')}
        </button>
      )}
    </form>
  )
}
