import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800",
          "Noto+Sans+TC:wght@400;500;900",
        ]}
      />
      <View />
    </>
  );
}
