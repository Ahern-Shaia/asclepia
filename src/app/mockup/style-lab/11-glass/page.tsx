import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Manrope:wght@500;800", "Noto+Sans+TC:wght@400;700"]} />
      <View />
    </>
  );
}
