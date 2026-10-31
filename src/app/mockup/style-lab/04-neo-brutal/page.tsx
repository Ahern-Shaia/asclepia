import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Chiron+Hei+HK:wght@500;900", "Archivo:wdth,wght@125,800"]} />
      <View />
    </>
  );
}
