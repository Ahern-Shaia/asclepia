import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={["IBM+Plex+Sans:wght@500;600;700", "Noto+Sans+TC:wght@400;500;700;900"]}
      />
      <View />
    </>
  );
}
