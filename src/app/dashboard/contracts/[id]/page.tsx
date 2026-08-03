import { redirect } from 'next/navigation';

export default async function ContractDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/contracts?id=${id}`);
}
