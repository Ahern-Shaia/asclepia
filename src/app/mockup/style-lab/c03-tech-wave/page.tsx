import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Sora:wght@400;600;700", "Chiron+Hei+HK:wght@400;500;700;800"]} />
      <View />
    </>
  );
}
