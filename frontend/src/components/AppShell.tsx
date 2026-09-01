"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home", matches: (pathname: string) => pathname === "/" },
  { href: "/search", label: "Search", matches: (pathname: string) => pathname.startsWith("/search") || pathname.startsWith("/value-sets") },
  { href: "/models", label: "Models", matches: (pathname: string) => pathname.startsWith("/models") },
  { href: "/terms", label: "Terms", matches: (pathname: string) => pathname.startsWith("/terms") },
  { href: "/compare", label: "Compare", matches: (pathname: string) => pathname.startsWith("/compare") },
] as const;

const workspaceNavItems = [
  { href: "/search", label: "Search", icon: "search", matches: (pathname: string) => pathname.startsWith("/search") || pathname.startsWith("/value-sets") },
  { href: "/models", label: "Models", icon: "models", matches: (pathname: string) => pathname.startsWith("/models") },
  { href: "/terms", label: "Terms", icon: "terms", matches: (pathname: string) => pathname.startsWith("/terms") },
  { href: "/compare", label: "Compare", icon: "compare", matches: (pathname: string) => pathname.startsWith("/compare") },
] as const;

function WorkspaceIcon({ name }: { name: (typeof workspaceNavItems)[number]["icon"] }) {
  if (name === "search") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>;
  }
  if (name === "models") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></svg>;
  }
  if (name === "terms") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h7" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h14M15 4l3 3-3 3M20 17H6M9 14l-3 3 3 3" /></svg>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

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
      {isHome ? (
        <>
          <nav className="portal-nav" aria-label="Primary navigation">
            <div className="site-width portal-nav-inner">
              {navItems.map((item) => {
                const current = item.matches(pathname);
                return <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>{item.label}</Link>;
              })}
            </div>
          </nav>
          <main id="main-content" className="portal-main portal-main-home" tabIndex={-1}>{children}</main>
        </>
      ) : (
        <div className="portal-dashboard-frame">
          <aside className="portal-dashboard-sidebar">
            <nav className="dashboard-nav" aria-label="Workspace navigation">
              <p className="dashboard-nav-title">Workspace</p>
              {workspaceNavItems.map((item) => {
                const current = item.matches(pathname);
                return (
                  <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>
                    <span className="dashboard-nav-icon"><WorkspaceIcon name={item.icon} /></span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="dashboard-status">
              <span aria-hidden="true" />
              <div><strong>Prototype data</strong><small>Mock-only · MDB unverified</small></div>
            </div>
          </aside>
          <main id="main-content" className="portal-main portal-main-workspace" tabIndex={-1}>{children}</main>
        </div>
      )}
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
