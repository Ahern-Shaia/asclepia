import { LabFonts } from "../_fonts";
import { View } from "./view";

export default function Page() {
  return (
    <>
      <LabFonts
        families={["Noto+Sans+TC:wght@400;500;700;900", "Red+Hat+Display:wght@500;700;900"]}
      />
      <View />
    </>
  );
}
