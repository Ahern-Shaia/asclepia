import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Noto+Sans+TC:wght@400;700", "IBM+Plex+Mono:wght@400;600"]} />
      <View />
    </>
  );
}
