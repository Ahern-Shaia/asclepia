import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Chiron+GoRound+TC:wght@400;500;700", "Manrope:wght@500;700;800"]} />
      <View />
    </>
  );
}
