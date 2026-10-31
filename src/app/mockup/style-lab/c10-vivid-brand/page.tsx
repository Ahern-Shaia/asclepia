import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Chiron+GoRound+TC:wght@400;700;900",
          "Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800",
        ]}
      />
      <View />
    </>
  );
}
