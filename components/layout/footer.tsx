import Link from 'next/link'
import { AidenLogo } from '@/components/ui/aiden-logo'

export function Footer() {
  return (
    <footer className="border-t-2 border-border-subtle bg-black-deep">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <AidenLogo size="sm" />
              <span className="aiden-app-name text-xl text-white-dim">.Test</span>
            </div>
            <p className="text-white-muted text-sm">
              AI-powered synthetic qualitative research with Phantom Consumer Memory™
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white-full font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://redbaez.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-muted hover:text-white-full transition-colors text-sm"
                >
                  About Redbaez
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@redbaez.com"
                  className="text-white-muted hover:text-white-full transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white-full font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-white-muted hover:text-white-full transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white-muted hover:text-white-full transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border-subtle">
          <p className="text-white-dim text-sm text-center">
            © {new Date().getFullYear()} Redbaez. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
