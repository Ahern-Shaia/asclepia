import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Noto+Serif+TC:wght@900", "Noto+Sans+TC:wght@400;700;900"]} />
      <View />
    </>
  );
}
