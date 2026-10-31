import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Chiron+Hei+HK:wght@400;700;900", "Barlow+Condensed:wght@500;700"]} />
      <View />
    </>
  );
}
