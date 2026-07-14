import { notFound } from "next/navigation";
import { cases, casesById } from "@/data/cases";
import CaseOpener from "./CaseOpener";

export function generateStaticParams() {
  return cases.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const c = casesById.get(params.id);
  return { title: c ? `${c.name} — RustFight` : "Case — RustFight" };
}

export default function CasePage({ params }: { params: { id: string } }) {
  const caseDef = casesById.get(params.id);
  if (!caseDef) notFound();
  return <CaseOpener caseDef={caseDef} />;
}
