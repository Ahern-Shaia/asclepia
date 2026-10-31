import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Noto+Serif+TC:wght@400;600;900"]} />
      <View />
    </>
  );
}
