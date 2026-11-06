import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '#/components/product-form'
import { Page, TopBar } from '#/components/ui'
import { useT } from '#/lib/i18n'

export const Route = createFileRoute('/app/products/new')({ component: NewProduct })

function NewProduct() {
  const t = useT()
  return (
    <Page nav>
      <TopBar back="/app/products" title={t('Bidhaa mpya', 'New product')} />
      <ProductForm />
    </Page>
  )
}
