import { Badge } from "@modules/common/components/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="green" className={className}>
      <span className="font-semibold">Cash on delivery:</span> Pay when your
      order arrives. No card required.
    </Badge>
  )
}

export default PaymentTest
