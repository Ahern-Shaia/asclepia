import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts families={["Noto+Sans+TC:wght@300;400;500", "Noto+Serif+TC:wght@400;600"]} />
      <View />
    </>
  );
}
