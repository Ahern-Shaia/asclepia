import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Space+Mono:wght@400;700", "Noto+Sans+TC:wght@400;700;900"]} />
      <View />
    </>
  );
}
