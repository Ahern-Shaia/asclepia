import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Noto+Sans+TC:wght@400;500;700;900",
          "IBM+Plex+Mono:wght@400;500;600",
          "IBM+Plex+Sans+Condensed:wght@500;700",
        ]}
      />
      <View />
    </>
  );
}
