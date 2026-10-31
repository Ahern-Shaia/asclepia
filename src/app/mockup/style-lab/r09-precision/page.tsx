import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Noto+Sans+TC:wght@300;500;700", "Azeret+Mono:wght@400;500"]} />
      <View />
    </>
  );
}
