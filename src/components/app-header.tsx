'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Rocket } from 'lucide-react'
// import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="relative z-50 px-30 py-6 bg-card dark:bg-card border-b border-border/50 backdrop-blur-md">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">SpaceFund</span>
              <span className="block text-xs text-muted-foreground">Crowdfunding the Future of Space</span>
            </div>
          </div>
          <ul className="hidden md:flex gap-4 flex-nowrap items-center ml-6">
            {links.map(({ label, path }) => (
              <li key={path}>
                <Link
                  className={`hover:text-primary ${isActive(path) ? 'text-primary font-bold' : 'text-foreground'}`}
                  href={path}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <div className="hidden md:flex items-center gap-4">
          <WalletButton />
          <ClusterUiSelect />
          {/* <ThemeSelect /> */}
        </div>

        {showMenu && (
          <div className="md:hidden fixed inset-x-0 top-[52px] bottom-0 bg-card/95 backdrop-blur-sm">
            <div className="flex flex-col p-4 gap-4 border-t dark:border-neutral-800">
              <ul className="flex flex-col gap-4">
                {links.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      className={`hover:text-primary block text-lg py-2 ${isActive(path) ? 'text-primary font-bold' : 'text-foreground'}`}
                      href={path}
                      onClick={() => setShowMenu(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <WalletButton />
                <ClusterUiSelect />
                {/* <ThemeSelect /> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}