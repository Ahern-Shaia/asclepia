import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Inter+Tight:wght@500;700;800", "Noto+Sans+TC:wght@400;500;700;900"]} />
      <View />
    </>
  );
}
