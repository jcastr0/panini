import { SectionLoading } from "../_components/section-loading";
import { SPECIAL_SECTIONS } from "@/lib/album-config";

const { accent, tint } = SPECIAL_SECTIONS.apertura;

export default function AperturaLoading() {
  return <SectionLoading accent={accent} tint={tint} />;
}
