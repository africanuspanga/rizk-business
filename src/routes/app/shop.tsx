import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Camera, LogOut, Plus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { ErrorText, Field, Img, LangSwitch, Page, Section, TopBar } from '#/components/ui'
import { getMyShop, updateShop } from '#/lib/api/merchant'
import { logout } from '#/lib/api/session'
import { CATEGORIES, NETWORKS } from '#/lib/format'
import { useLang, useT } from '#/lib/i18n'
import { uploadImage } from '#/lib/upload'

export const Route = createFileRoute('/app/shop')({
  loader: () => getMyShop(),
  component: ShopSettings,
})

function ShopSettings() {
  const t = useT()
  const lang = useLang()
  const router = useRouter()
  const data = Route.useLoaderData()
  const [s, setS] = useState(data.shop)
  const [areas, setAreas] = useState(data.areas.map((a) => ({ name: a.name, fee: String(a.fee) })))
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const logoRef = useRef<HTMLInputElement>(null)
  const set = (k: keyof typeof s) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setS({ ...s, [k]: e.target.value })

  async function save() {
    setBusy(true)
    setError('')
    await updateShop({ data: { ...s, areas: areas.map((a) => ({ name: a.name, fee: Number(a.fee.replace(/\D/g, '')) || 0 })) } })
    setBusy(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.invalidate()
  }

  return (
    <Page nav>
      <TopBar title={t('Duka langu', 'My shop')} sub={`rizk.tz/${s.slug}`} right={<LangSwitch />} />

      <div className="card flex items-center gap-4 p-5">
        <button type="button" className="relative" onClick={() => logoRef.current?.click()} aria-label={t('Badilisha logo', 'Change logo')}>
          <Img k={s.logo_key} alt={s.name} className="h-20 w-20 rounded-full" />
          <span className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white">
            <Camera size={15} />
          </span>
        </button>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            try {
              setS({ ...s, logo_key: await uploadImage(f, 400) })
            } catch {
              setError(t('Logo imeshindwa kupakiwa.', 'Logo upload failed.'))
            }
          }}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <input className="input" value={s.name} onChange={set('name')} aria-label={t('Jina la duka', 'Shop name')} />
        </div>
      </div>

      <Section title={t('Kuhusu duka', 'About the shop')}>
        <div className="card space-y-4 p-5">
          <Field label={t('Maelezo mafupi', 'Short bio')}>
            <textarea className="input" value={s.bio} onChange={set('bio')} placeholder={t('Mf. Nguo za kitenge, delivery Dar nzima', 'e.g. Kitenge outfits, delivery across Dar')} />
          </Field>
          <Field label={t('Aina ya duka', 'Category')}>
            <select className="input" value={s.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c[lang]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('Mahali duka lilipo', 'Shop location')}>
            <input className="input" value={s.location} onChange={set('location')} placeholder="Kariakoo, Mtaa wa Congo" />
          </Field>
          <Field label={t('Muda wa kazi', 'Opening hours')}>
            <input className="input" value={s.hours} onChange={set('hours')} placeholder={t('Jumatatu - Jumamosi, 8:00 - 20:00', 'Mon - Sat, 8:00 - 20:00')} />
          </Field>
        </div>
      </Section>

      <Section title={t('Malipo', 'Payments')}>
        <div className="card space-y-4 p-5">
          <Field label={t('Mtandao', 'Network')}>
            <select className="input" value={s.lipa_network} onChange={set('lipa_network')}>
              <option value="">{t('Chagua', 'Choose')}</option>
              {NETWORKS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Field label={t('Lipa Namba au namba ya simu', 'Lipa Namba or phone number')}>
            <input className="input" inputMode="numeric" value={s.lipa_number} onChange={set('lipa_number')} placeholder="123456" />
          </Field>
          <Field label={t('Jina linaloonekana kwenye malipo', 'Name shown on payments')} hint={t('Tunalitumia kukagua SMS za malipo za wateja', 'We use it to check buyers’ payment SMS')}>
            <input className="input" value={s.lipa_name} onChange={set('lipa_name')} placeholder="ZURI FASHION" />
          </Field>
          <Toggle
            label={t('Hii ni namba ya simu binafsi', 'This is a personal phone number')}
            checked={!!s.lipa_is_personal}
            onChange={(v) => setS({ ...s, lipa_is_personal: v ? 1 : 0 })}
          />
          <Toggle
            label={t('Kubali cash wakati wa kupokea', 'Accept cash on delivery')}
            checked={!!s.cod_enabled}
            onChange={(v) => setS({ ...s, cod_enabled: v ? 1 : 0 })}
          />
        </div>
      </Section>

      <Section title={t('Maeneo ya delivery', 'Delivery areas')}>
        <div className="card space-y-3 p-5">
          {areas.map((a, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-[2]"
                value={a.name}
                placeholder="Mikocheni"
                onChange={(e) => setAreas(areas.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
              <input
                className="input flex-1"
                inputMode="numeric"
                value={a.fee}
                placeholder="5000"
                onChange={(e) => setAreas(areas.map((x, j) => (j === i ? { ...x, fee: e.target.value } : x)))}
              />
              <button type="button" className="icon-btn mt-1" aria-label={t('Ondoa', 'Remove')} onClick={() => setAreas(areas.filter((_, j) => j !== i))}>
                <X size={16} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-soft btn-sm w-full" onClick={() => setAreas([...areas, { name: '', fee: '' }])}>
            <Plus size={16} /> {t('Ongeza eneo', 'Add area')}
          </button>
          <p className="text-xs text-muted">{t('Bei ni ya delivery tu. Weka 0 kama ni bure.', 'Delivery fee only. Use 0 for free delivery.')}</p>
        </div>
      </Section>

      <Section title={t('Mitandao ya kijamii', 'Social links')}>
        <div className="card space-y-4 p-5">
          <Field label="WhatsApp">
            <input className="input" type="tel" value={s.whatsapp} onChange={set('whatsapp')} />
          </Field>
          <Field label="Instagram">
            <input className="input" value={s.instagram} onChange={set('instagram')} placeholder="@dukalako" autoCapitalize="none" />
          </Field>
          <Field label="TikTok">
            <input className="input" value={s.tiktok} onChange={set('tiktok')} placeholder="@dukalako" autoCapitalize="none" />
          </Field>
          <Field label="Facebook">
            <input className="input" value={s.facebook} onChange={set('facebook')} placeholder="facebook.com/dukalako" autoCapitalize="none" />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-28 mt-6">
        <ErrorText>{error}</ErrorText>
        <button type="button" className="btn w-full shadow-[0_10px_24px_rgba(31,27,24,0.25)]" disabled={busy} onClick={save}>
          {saved ? t('Imehifadhiwa ✓', 'Saved ✓') : busy ? t('Inahifadhi...', 'Saving...') : t('Hifadhi mabadiliko', 'Save changes')}
        </button>
      </div>

      <button
        type="button"
        className="btn btn-soft mt-10 w-full text-muted"
        onClick={async () => {
          await logout()
          await router.invalidate()
          router.navigate({ to: '/' })
        }}
      >
        <LogOut size={18} /> {t('Toka', 'Log out')}
      </button>
    </Page>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[18px] bg-canvas px-4 py-3">
      <span className="text-[15px] font-semibold">{label}</span>
      <input type="checkbox" className="h-6 w-6 shrink-0 accent-[#1f1b18]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}
