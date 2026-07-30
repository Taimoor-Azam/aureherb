import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@modules/common/components/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const sortedItems = items
    ? [...items].sort((a, b) => {
        return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
      })
    : null

  return (
    <div className="min-w-0">
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">Cart</Heading>
      </div>

      <div className="small:hidden divide-y divide-ui-border-base">
        {sortedItems
          ? sortedItems.map((item) => (
              <Item
                key={item.id}
                item={item}
                layout="mobile"
                currencyCode={cart?.currency_code}
              />
            ))
          : repeat(5).map((i) => (
              <div key={i} className="py-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-gray-200" />
                    <div className="w-24 h-4 bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="hidden small:block">
        <Table>
          <Table.Header className="border-t-0">
            <Table.Row className="text-ui-fg-subtle txt-medium-plus">
              <Table.HeaderCell className="!pl-0">Item</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Quantity</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell className="!pr-0 text-right">
                Total
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems
              ? sortedItems.map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    layout="table"
                    currencyCode={cart?.currency_code}
                  />
                ))
              : repeat(5).map((i) => {
                  return <SkeletonLineItem key={i} />
                })}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
