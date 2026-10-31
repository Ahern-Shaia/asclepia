import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Noto+Serif+TC:wght@700;900",
          "Noto+Sans+TC:wght@400;500;700",
          "Courier+Prime:wght@400;700",
          "Libre+Barcode+39",
        ]}
      />
      <View />
    </>
  );
}
