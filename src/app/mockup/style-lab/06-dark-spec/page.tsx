import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["IBM+Plex+Mono:wght@400;600", "Noto+Sans+TC:wght@300;500;700"]} />
      <View />
    </>
  );
}
