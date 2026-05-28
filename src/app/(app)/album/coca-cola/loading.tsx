import { SectionLoading } from "../_components/section-loading";
import { SPECIAL_SECTIONS } from "@/lib/album-config";

const { accent, tint } = SPECIAL_SECTIONS["coca-cola"];

export default function CocaColaLoading() {
  return <SectionLoading accent={accent} tint={tint} />;
}
