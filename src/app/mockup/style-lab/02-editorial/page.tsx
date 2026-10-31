import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Noto+Serif+TC:wght@400;700;900",
          "Noto+Sans+TC:wght@400;500",
          "Instrument+Serif:ital@0;1",
        ]}
      />
      <View />
    </>
  );
}
