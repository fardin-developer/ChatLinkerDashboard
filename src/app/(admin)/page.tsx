// app/(admin)/page.tsx
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "ChatLinker",
  description: "Affordable WhatsApp API",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
