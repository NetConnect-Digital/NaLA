import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerDownloads } from "@/lib/wc-admin";
import { AccountLayout } from "@/components/account/AccountLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Downloads" };

export default async function DownloadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const downloads = await getCustomerDownloads(user.id).catch(() => []);

  return (
    <AccountLayout>
      <h2 className="text-2xl">Downloads</h2>

      {downloads.length === 0 ? (
        <div className="mt-6 rounded-lg border border-line bg-white p-8 text-center">
          <p className="text-ink-soft">No downloads available yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse rounded-lg bg-white shadow-sm">
            <thead>
              <tr className="bg-navy text-left text-white">
                <th className="p-3 font-sans">Product</th>
                <th className="p-3 font-sans">Downloads remaining</th>
                <th className="p-3 font-sans">Expires</th>
                <th className="p-3 font-sans">Download</th>
              </tr>
            </thead>
            <tbody>
              {downloads.map((d) => (
                <tr key={d.download_id} className="border-b border-line align-middle">
                  <td className="p-3 font-bold text-navy">{d.product_name}</td>
                  <td className="p-3 text-ink-soft">
                    {d.downloads_remaining === "" ? "∞" : d.downloads_remaining}
                  </td>
                  <td className="p-3 text-ink-soft">
                    {d.access_expires
                      ? new Date(d.access_expires).toLocaleDateString("en-US")
                      : "Never"}
                  </td>
                  <td className="p-3">
                    <a
                      href={d.download_url}
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan px-4 py-1.5 text-xs font-bold uppercase tracking-wide !text-white transition-colors hover:bg-cyan-700"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AccountLayout>
  );
}
