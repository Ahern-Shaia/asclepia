import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Barlow:wght@500;600;700",
          "B612+Mono:wght@400;700",
          "Noto+Sans+TC:wght@400;500;700",
        ]}
      />
      <View />
    </>
  );
}
