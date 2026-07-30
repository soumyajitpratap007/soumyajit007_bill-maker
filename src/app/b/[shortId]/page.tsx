"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { IDownload, ILogo, IWhatsapp } from "@/components/ui/Icon";
import { BillRenderer } from "@/components/bill/BillRenderer";
import { localStore } from "@/lib/store/local";
import type { Bill } from "@/lib/types";
import { downloadBlob, generatePdfBlob } from "@/lib/pdf/exportPdf";
import { whatsappLink } from "@/lib/share/share";
import { useRef } from "react";

export default function PublicBillPage() {
  const params = useParams<{ shortId: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [notFound, setNotFound] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params?.shortId) return;
    const b = localStore.getBillByShortId(params.shortId) || localStore.getBill(params.shortId);
    if (!b) setNotFound(true);
    else setBill(b);
  }, [params?.shortId]);

  async function onDownload() {
    if (!ref.current || !bill) return;
    const blob = await generatePdfBlob(ref.current);
    downloadBlob(blob, `${bill.number}.pdf`);
  }

  if (notFound) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink-50 dark:bg-ink-950 p-6 text-center">
        <div>
          <div className="text-lg font-semibold">Bill not found</div>
          <p className="text-sm text-ink-500 mt-1">This link may have expired, or the bill was created on a different device.</p>
          <Link href="/" className="inline-block mt-4"><Button>Go home</Button></Link>
        </div>
      </div>
    );
  }
  if (!bill) return <div className="min-h-screen grid place-items-center text-ink-500">Loading…</div>;

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      <header className="sticky top-0 z-30 border-b border-ink-200 dark:border-ink-800 bg-white/90 dark:bg-ink-950/90 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"><ILogo/></span> Bill Maker</Link>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onDownload}><IDownload width={14} height={14}/> Download</Button>
            <a href={whatsappLink(bill)} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline"><IWhatsapp width={14} height={14}/> WhatsApp</Button>
            </a>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-6 overflow-x-auto">
        <div className="mx-auto shadow-card" style={{ width: 794 }}>
          <BillRenderer bill={bill} ref={ref} />
        </div>
      </main>
    </div>
  );
}
