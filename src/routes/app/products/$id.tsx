import { createFileRoute, notFound } from '@tanstack/react-router'
import { ProductForm } from '#/components/product-form'
import { Page, TopBar } from '#/components/ui'
import { getMyProduct } from '#/lib/api/merchant'
import { useT } from '#/lib/i18n'

export const Route = createFileRoute('/app/products/$id')({
  loader: async ({ params }) => {
    const product = await getMyProduct({ data: { id: params.id } })
    if (!product) throw notFound()
    return product
  },
  component: EditProduct,
})

function EditProduct() {
  const t = useT()
  const product = Route.useLoaderData()
  return (
    <Page nav>
      <TopBar back="/app/products" title={t('Hariri bidhaa', 'Edit product')} />
      <ProductForm key={product.id} product={product} />
    </Page>
  )
}
