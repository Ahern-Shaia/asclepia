import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Chiron+Sung+HK:wght@300;500",
          "Noto+Sans+TC:wght@400;700",
          "Schibsted+Grotesk:wght@400;600",
        ]}
      />
      <View />
    </>
  );
}
