import { WpPageView } from "@/components/WpPageView";

export const revalidate = 3600;
export const metadata = { title: "Terms of Service" };

export default function TermsOfServicePage() {
  return <WpPageView slug="terms-of-service" />;
}
