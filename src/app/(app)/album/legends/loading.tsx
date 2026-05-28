import { SectionLoading } from "../_components/section-loading";
import { SPECIAL_SECTIONS } from "@/lib/album-config";

const { accent, tint } = SPECIAL_SECTIONS.legends;

export default function LegendsLoading() {
  return <SectionLoading accent={accent} tint={tint} legendsGrid />;
}
