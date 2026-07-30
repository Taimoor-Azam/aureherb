"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

type SideMenuProps = {
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ locales, currentLocale }: SideMenuProps) => {
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  aria-label="Open menu"
                  className="relative h-full flex items-center text-herb-mist transition-colors duration-200 focus:outline-none hover:text-herb-ink"
                >
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 16 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 1h14M1 6h14M1 11h14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition-opacity ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div
                  className="fixed inset-0 z-[50] bg-herb-ink/30 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                  aria-hidden="true"
                />
              </Transition>

              <Transition
                show={open}
                as={Fragment}
                enter="transition-transform ease-out duration-250"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition-transform ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <PopoverPanel
                  static
                  className="fixed inset-y-0 left-0 z-[51] flex h-screen w-[280px] max-w-[85vw] flex-col border-r border-herb-clay bg-herb-sand text-herb-ink shadow-lg"
                >
                  <div
                    data-testid="nav-menu-popup"
                    className="flex h-full flex-col justify-between p-6"
                  >
                    <div className="flex items-center justify-between border-b border-herb-clay pb-5">
                      <LocalizedClientLink
                        href="/"
                        className="font-display text-xl tracking-[0.08em] text-herb-ink uppercase"
                        onClick={close}
                      >
                        AureHerb
                      </LocalizedClientLink>
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="rounded p-1 text-herb-mist transition-colors hover:bg-herb-clay/40 hover:text-herb-ink"
                        aria-label="Close menu"
                      >
                        <XMark />
                      </button>
                    </div>

                    <ul className="flex flex-1 flex-col gap-1 py-8">
                      {Object.entries(SideMenuItems).map(([name, href]) => (
                        <li key={name}>
                          <LocalizedClientLink
                            href={href}
                            className="block rounded px-2 py-2.5 text-base font-medium text-herb-ink transition-colors hover:bg-herb-clay/30 hover:text-herb-leaf"
                            onClick={close}
                            data-testid={`${name.toLowerCase()}-link`}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-y-4 border-t border-herb-clay pt-5 text-sm text-herb-mist">
                      {!!locales?.length && (
                        <div
                          className="flex items-center justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "text-herb-mist transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <Text className="txt-compact-small text-herb-mist">
                        © {new Date().getFullYear()} AureHerb.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
