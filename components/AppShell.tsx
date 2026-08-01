import Link from "next/link";
import { AuthChip } from "@/components/AuthChip";

const navItems = [
  { label: "Dashboard", short: "Home", href: "/" },
  { label: "Add", short: "Add", href: "/quick-entry" },
  { label: "Transactions", short: "Ledger", href: "/transactions" },
  { label: "Balances", short: "Balances", href: "/balances" },
  { label: "Card Dues", short: "Cards", href: "/card-dues" },
  { label: "Budgets", short: "Budget", href: "/budgets" },
  { label: "Reports", short: "Reports", href: "/reports" },
  { label: "Settings", short: "Settings", href: "#" },
];

const mobileNavItems = navItems.slice(0, 5);

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
