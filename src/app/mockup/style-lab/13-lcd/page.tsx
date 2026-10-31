import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "DotGothic16",
          "VT323",
          "Barlow+Condensed:wght@600",
          "Noto+Sans+TC:wght@400;700",
        ]}
      />
      <View />
    </>
  );
}
