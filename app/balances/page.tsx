import { AppShell } from "@/components/AppShell";
import { AddBankAccountForm } from "@/components/accounts/AddBankAccountForm";
import { CreditCardManager } from "@/components/balances/CreditCardManager";

export default function BalancesPage() {
  return (
    <AppShell active="Balances">
      <section className="page-heading">
        <p className="eyebrow">Balances</p>
        <h1>Banks, cards, and available money</h1>
        <p>
          Keep banks and credit cards separate so spending, outstanding dues,
          and actual bank balance stay clear.
        </p>
      </section>

      <AddBankAccountForm />
      <CreditCardManager />
    </AppShell>
  );
}
