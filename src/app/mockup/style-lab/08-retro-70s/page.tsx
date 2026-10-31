import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Chiron+GoRound+TC:wght@500;900",
          "Fraunces:ital,opsz,wght,SOFT@0,9..144,700..900,100;1,9..144,700,100",
        ]}
      />
      <View />
    </>
  );
}
