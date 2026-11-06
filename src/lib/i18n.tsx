import { createContext, useContext } from 'react'

export type Lang = 'sw' | 'en'
const LangContext = createContext<Lang>('sw')
export const LangProvider = LangContext.Provider
export const useLang = () => useContext(LangContext)

/** Inline pairs keep both languages side by side: t('Bidhaa', 'Products'). */
export function useT() {
  const lang = useLang()
  return (sw: string, en: string) => (lang === 'sw' ? sw : en)
}
