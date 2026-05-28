import { SectionLoading } from "../_components/section-loading";
import { SPECIAL_SECTIONS } from "@/lib/album-config";

const { accent, tint } = SPECIAL_SECTIONS.historia;

export default function HistoriaLoading() {
  return <SectionLoading accent={accent} tint={tint} wide />;
}
