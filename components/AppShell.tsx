import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Quick Entry", href: "/quick-entry" },
  { label: "Accounts", href: "/accounts" },
  { label: "Transactions", href: "/transactions" },
  { label: "Budget", href: "#" },
  { label: "Investments", href: "#" },
  { label: "Goals", href: "#" },
  { label: "Loans", href: "#" },
  { label: "Bills", href: "#" },
  { label: "Reports", href: "#" },
  { label: "AI Assistant", href: "#" },
  { label: "Settings", href: "#" },
];

export function AppShell({
  active,
  children,
}: Readonly<{
  active: string;
  children: React.ReactNode;
}>) {
  const user = getCurrentUser();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="FinPilot AI home">
          <span>FP</span>
          <strong>FinPilot AI</strong>
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
            <strong>{user.workspaceName}</strong>
          </div>
          <Link className="user-chip" href="/sign-in">
            <span>{user.initials}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.authProvider}</small>
            </div>
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
