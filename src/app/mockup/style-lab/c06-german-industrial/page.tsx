import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={["Noto+Sans+TC:wght@400;500;700;900", "Barlow+Condensed:wght@500;600;700"]}
      />
      <View />
    </>
  );
}
