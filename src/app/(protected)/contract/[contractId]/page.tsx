import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getContractByIdAction } from "@/features/contract/actions/contract";

import ClientContractPage from "./page.client";

export const metadata: Metadata = {
  title: "契約詳細",
  description: "契約詳細",
};

export default async function ContractPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  // TODO: 契約の作成者がログインユーザーと一致するか確認
  const contract = await getContractByIdAction(contractId);
  if (!contract) {
    return notFound();
  }
  return <ClientContractPage contractId={contractId} />;
}
