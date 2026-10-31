import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Chiron+Hei+HK:wght@300;600", "Geist+Mono:wght@400"]} />
      <View />
    </>
  );
}
