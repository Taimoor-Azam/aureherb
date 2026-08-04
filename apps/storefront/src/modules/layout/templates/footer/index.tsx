import { Text } from "@modules/common/components/ui"
import Facebook from "@modules/common/icons/facebook"
import Instagram from "@modules/common/icons/instagram"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FACEBOOK_URL = "https://www.facebook.com/share/1HPAidoQoY/"
const INSTAGRAM_URL = "https://www.instagram.com/aureherbofficial"

export default async function Footer() {
  return (
    <footer className="border-t border-[#d7d0c3] w-full bg-[#f3eee4]">
      <div className="content-container flex flex-col w-full">
        <div className="flex justify-center pt-8 pb-16 small:pb-24">
          <div className="flex flex-col gap-10 xsmall:flex-row xsmall:gap-16 text-small-regular">
            <div className="flex flex-col gap-y-3">
              <span className="txt-small-plus text-[#1c2d22]">Social Media</span>
              <div className="flex items-center gap-4">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AureHerb on Facebook"
                  className="text-[#5c675f] transition-colors hover:text-[#1c2d22]"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AureHerb on Instagram"
                  className="text-[#5c675f] transition-colors hover:text-[#1c2d22]"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-[#1c2d22]">Help</span>
              <ul className="grid grid-cols-1 gap-y-2 text-[#5c675f] txt-small">
                <li>
                  <LocalizedClientLink
                    href="/track-order"
                    className="hover:text-[#1c2d22]"
                  >
                    Track Your Order
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-[#1c2d22]"
                  >
                    Shop all
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/cart"
                    className="hover:text-[#1c2d22]"
                  >
                    Cart
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account"
                    className="hover:text-[#1c2d22]"
                  >
                    Account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/content/privacy-policy"
                    className="hover:text-[#1c2d22]"
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/content/terms-of-use"
                    className="hover:text-[#1c2d22]"
                  >
                    Terms of Use
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mb-10 flex w-full justify-center text-[#7a847c]">
          <Text className="txt-compact-small text-center">
            © {new Date().getFullYear()} AureHerb.
          </Text>
        </div>
      </div>
    </footer>
  )
}
