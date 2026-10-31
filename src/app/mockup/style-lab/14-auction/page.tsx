import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={["Chiron+Sung+HK:wght@400;700", "Bodoni+Moda:ital,wght@0,400;0,600;1,400"]}
      />
      <View />
    </>
  );
}
