import Link from "next/link";
import { AuthChip } from "@/components/AuthChip";

const navItems = [
  { label: "Dashboard", short: "Home", href: "/" },
  { label: "Quick Entry", short: "Entry", href: "/quick-entry" },
  { label: "Accounts", short: "Banks", href: "/accounts" },
  { label: "Transactions", short: "Ledger", href: "/transactions" },
  { label: "Budget", short: "Budget", href: "#" },
  { label: "Investments", short: "Invest", href: "#" },
  { label: "Reports", short: "Reports", href: "#" },
  { label: "Settings", short: "Settings", href: "#" },
];

const mobileNavItems = navItems.slice(0, 4);

export function AppShell({
  active,
  children,
}: Readonly<{
  active: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="FinPilot AI home">
          <span>FP</span>
          <strong>FinPilot</strong>
        </Link>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              aria-current={active === item.label ? "page" : undefined}
              className={active === item.label ? "active" : ""}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-surface">
        <header className="topbar">
          <div>
            <span>Workspace</span>
            <strong>{active}</strong>
          </div>
          <AuthChip />
        </header>
        {children}
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => (
          <Link
            aria-current={active === item.label ? "page" : undefined}
            className={active === item.label ? "active" : ""}
            href={item.href}
            key={item.label}
          >
            <span>{item.short}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
