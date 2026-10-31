import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={[
          "Noto+Sans+TC:wght@500;900",
          "Big+Shoulders+Display:wght@600;800",
          "Big+Shoulders+Stencil+Display:wght@800",
        ]}
      />
      <View />
    </>
  );
}
