"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home", matches: (pathname: string) => pathname === "/" },
  { href: "/models", label: "Models", matches: (pathname: string) => pathname.startsWith("/models") },
  { href: "/terms", label: "Terms", matches: (pathname: string) => pathname.startsWith("/terms") },
  { href: "/compare", label: "Compare", matches: (pathname: string) => pathname.startsWith("/compare") },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="portal-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="official-banner">
        <div className="site-width official-banner-inner">
          <span className="flag-mark" aria-hidden="true" />
          <span>An official website of the United States government</span>
        </div>
      </div>
      <header className="portal-header">
        <div className="site-width portal-brand-row">
          <Link className="portal-brand" href="/" aria-label="Metadata Explorer home">
            <span className="nih-text-mark" aria-hidden="true">NIH</span>
            <span className="portal-brand-copy">
              <strong>National Cancer Institute</strong>
              <small>Metadata Explorer</small>
            </span>
          </Link>
          <p>Biomedical metadata discovery and model comparison</p>
        </div>
      </header>
      <nav className="portal-nav" aria-label="Primary navigation">
        <div className="site-width portal-nav-inner">
          {navItems.map((item) => {
            const current = item.matches(pathname);
            return <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>{item.label}</Link>;
          })}
        </div>
      </nav>
      <main id="main-content" className={pathname === "/" ? "portal-main portal-main-home" : "portal-main portal-main-workspace"} tabIndex={-1}>{children}</main>
      <footer className="portal-footer">
        <div className="site-width portal-footer-grid">
          <div className="portal-footer-identity">
            <span className="nih-text-mark inverse" aria-hidden="true">NIH</span>
            <div><strong>National Cancer Institute</strong><p>Metadata Explorer</p><small>Mock-only. Unverified against MDB.</small></div>
          </div>
          <div><strong>Explore</strong><Link href="/models">Data models</Link><Link href="/search">Metadata search</Link><Link href="/terms">Terminology</Link></div>
          <div><strong>Compare</strong><Link href="/compare">Model comparison</Link><Link href="/compare?view=graph">Graph view</Link><Link href="/compare?view=stack">Value set stacks</Link></div>
          <div><strong>Institutional resources</strong><a href="https://www.cancer.gov/" target="_blank" rel="noreferrer">Cancer.gov</a><a href="https://www.nih.gov/" target="_blank" rel="noreferrer">National Institutes of Health</a><a href="https://ncit.nci.nih.gov/" target="_blank" rel="noreferrer">NCI Thesaurus</a></div>
        </div>
        <div className="portal-footer-legal"><div className="site-width"><span>U.S. Department of Health and Human Services</span><span>National Institutes of Health</span><span>National Cancer Institute</span><span>USA.gov</span></div></div>
      </footer>
    </div>
  );
}
