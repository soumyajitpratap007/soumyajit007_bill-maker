"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BillBuilder } from "@/components/bill/BillBuilder";
import { localStore } from "@/lib/store/local";
import type { Bill } from "@/lib/types";

export default function EditBillPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    const b = localStore.getBill(params.id);
    if (!b) setNotFound(true);
    else setBill(b);
  }, [params?.id]);

  if (notFound) {
    return (
      <div className="p-10 text-center">
        <div className="font-semibold mb-2">Bill not found</div>
        <button className="text-brand-600" onClick={() => router.replace("/bills")}>Back to bills</button>
      </div>
    );
  }
  if (!bill) return <div className="p-10 text-center text-ink-500">Loading…</div>;
  return <BillBuilder mode="edit" initialBill={bill} />;
}
