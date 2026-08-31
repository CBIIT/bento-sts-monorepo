import { useEffect, useState } from "react";

export type Route = {
  pathname: string;
  searchParams: URLSearchParams;
};

const base = import.meta.env.BASE_URL;

export function readRoute(): Route {
  const raw = window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "/";
  const url = new URL(raw, "https://metadata-explorer.local");
  return { pathname: url.pathname, searchParams: url.searchParams };
}

export function appHref(href: string) {
  if (!href.startsWith("/")) return href;
  return `${base}#${href}`;
}

export function navigate(href: string, replace = false) {
  const route = href.startsWith("/") ? href : `/${href}`;
  const nextHash = `#${route}`;
  if (window.location.hash === nextHash) return;
  if (replace) {
    window.history.replaceState(null, "", `${base}#${route}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = route;
  }
}

export function replaceRouteQuery(values: Record<string, string | boolean>) {
  const { pathname } = readRoute();
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== "" && value !== false) params.set(key, String(value));
  });
  navigate(`${pathname}${params.size ? `?${params.toString()}` : ""}`, true);
}

export function replaceCompareRoute(params: URLSearchParams) {
  navigate(`/compare?${params.toString()}`, true);
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return route;
}

export function usePathname() {
  return useRoute().pathname;
}
