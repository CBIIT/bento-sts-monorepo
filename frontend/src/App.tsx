import { type FormEvent, type MouseEvent, useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { ComparisonWorkspace } from "./components/ComparisonWorkspace";
import { ModelEntityView, NodeEntityView, PropertyEntityView, TermEntityView } from "./components/EntityUi";
import { ModelsExplorer, SearchExplorer, TermsExplorer } from "./components/ExplorerViews";
import { HomeView } from "./HomeView";
import { navigate, useRoute } from "./router";

const strategies = new Set(["exact", "normalized", "cde", "value-set", "overlap"]);

function RouteView() {
  const route = useRoute();
  const { pathname, searchParams } = route;
  const segments = pathname.split("/").filter(Boolean).map(decodeURIComponent);

  useEffect(() => {
    const label = pathname === "/" ? "Home" : segments.at(-1)?.replaceAll("-", " ") ?? "Metadata Explorer";
    document.title = `${label} · Metadata Explorer`;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  if (pathname === "/") return <HomeView />;
  if (pathname === "/models") return <ModelsExplorer initialIncludePrevious={searchParams.get("previous") === "true"} />;
  if (pathname === "/search") return <SearchExplorer initialQuery={searchParams.get("q") ?? ""} initialDefinitions={searchParams.get("definitions") === "true"} initialType={searchParams.get("type") ?? "All"} />;
  if (pathname === "/terms") return <TermsExplorer initialQuery={searchParams.get("q") ?? ""} initialDefinitions={searchParams.get("definitions") === "true"} initialOrigin={searchParams.get("origin") ?? "all"} />;
  if (pathname === "/compare") {
    const requestedStrategy = searchParams.get("strategy") ?? "exact";
    const strategy = strategies.has(requestedStrategy) ? requestedStrategy as "exact" | "normalized" | "cde" | "value-set" | "overlap" : "exact";
    const requestedView = searchParams.get("view");
    const view = requestedView === "stack" ? "stack" : requestedView === "freeform" ? "freeform" : "graph";
    return <ComparisonWorkspace
      key={`${pathname}-${searchParams.toString()}`}
      initialLeftModel={searchParams.get("leftModel") ?? undefined}
      initialRightModel={searchParams.get("rightModel") ?? undefined}
      initialView={view}
      initialStrategy={strategy}
      initialStatus={searchParams.get("status") ?? undefined}
      initialQuery={searchParams.get("query") ?? undefined}
      initialThreshold={searchParams.has("overlapThreshold") ? Number(searchParams.get("overlapThreshold")) : undefined}
      initialSelected={searchParams.get("selectedEntity") ?? undefined}
    />;
  }
  if (segments[0] === "models" && segments.length === 2) return <ModelEntityView modelId={segments[1]} />;
  if (segments[0] === "models" && segments[2] === "nodes" && segments[3]) return <NodeEntityView modelId={segments[1]} nodeId={segments[3]} />;
  if (segments[0] === "models" && segments[2] === "properties" && segments[3]) return <PropertyEntityView modelId={segments[1]} propertyId={segments[3]} />;
  if (segments[0] === "terms" && segments[1]) return <TermEntityView termId={segments[1]} />;
  return <section className="site-width page-section"><h1>Page not found</h1><p>The requested prototype route is not available.</p></section>;
}

export default function App() {
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = anchor.getAttribute("href");
    if (href === "#main-content") {
      event.preventDefault();
      document.getElementById("main-content")?.focus();
      return;
    }
    const hashRouteIndex = href?.indexOf("/#/") ?? -1;
    if (href && hashRouteIndex >= 0) {
      event.preventDefault();
      navigate(href.slice(hashRouteIndex + 2));
      return;
    }
    if (href?.startsWith("/")) {
      event.preventDefault();
      navigate(href);
    }
  }

  function handleSubmit(event: FormEvent<HTMLDivElement>) {
    const form = event.target as HTMLFormElement;
    if (form.tagName !== "FORM" || form.getAttribute("action") !== "/search") return;
    event.preventDefault();
    const params = new URLSearchParams();
    const query = String(new FormData(form).get("q") ?? "").trim();
    if (query) params.set("q", query);
    navigate(`/search${params.size ? `?${params.toString()}` : ""}`);
  }

  return <div onClick={handleClick} onSubmitCapture={handleSubmit}><AppShell><RouteView /></AppShell></div>;
}
