import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Inter+Tight:wght@500;800", "Chiron+Hei+HK:wght@400;800"]} />
      <View />
    </>
  );
}
