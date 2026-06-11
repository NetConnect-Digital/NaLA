import { WpPageView } from "@/components/WpPageView";

export const revalidate = 3600;
export const metadata = { title: "Terms & Conditions" };

export default function TermsAndConditionsPage() {
  return <WpPageView slug="terms-and-conditions" />;
}
