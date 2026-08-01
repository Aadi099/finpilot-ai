import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finance dashboard shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>FinPilot AI<\/title>/i);
  assert.match(html, /Total net worth/);
  assert.match(html, /Opening snapshot/);
  assert.match(html, /Quick entry/);
  assert.match(html, /Asset Allocation/);
  assert.match(html, /Recent Activity/);
  assert.match(html, /Personal Finance/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/i);
});

test("keeps the phase one foundation modular", async () => {
  const [layout, dashboard, accounts, transactions, auth, sampleData, prisma] =
    await Promise.all([
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/accounts/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/transactions/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../lib/auth.ts", import.meta.url), "utf8"),
      readFile(new URL("../lib/sample-data.ts", import.meta.url), "utf8"),
      readFile(new URL("../prisma/schema.prisma", import.meta.url), "utf8"),
    ]);

  assert.match(layout, /title:\s*"FinPilot AI"/);
  assert.match(dashboard, /<AppShell active="Dashboard">/);
  assert.match(accounts, /<AppShell active="Accounts">/);
  assert.match(transactions, /<AppShell active="Transactions">/);
  assert.match(auth, /getCurrentUser/);
  assert.match(sampleData, /assetAllocation/);
  assert.match(sampleData, /transactions/);

  for (const model of [
    "User",
    "Account",
    "Category",
    "Transaction",
    "Budget",
    "Investment",
    "Goal",
    "Loan",
    "Bill",
      "PortfolioHistory",
      "MonthlySnapshot",
  ]) {
    assert.match(prisma, new RegExp(`model ${model} \\{`));
  }
});
