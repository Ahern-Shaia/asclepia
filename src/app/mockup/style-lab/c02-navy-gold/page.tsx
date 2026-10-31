import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Noto+Serif+TC:wght@700;900",
          "Noto+Sans+TC:wght@400;500;700",
          "Cormorant+Garamond:wght@600;700",
        ]}
      />
      <View />
    </>
  );
}
