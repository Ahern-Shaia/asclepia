import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Chiron+Hei+HK:wght@400;700;900", "Archivo:wght@500;700;800"]} />
      <View />
    </>
  );
}
