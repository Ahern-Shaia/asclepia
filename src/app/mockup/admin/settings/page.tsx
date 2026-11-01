import { SettingsView } from "@/components/admin/settings-view";
import { siteCopy } from "@/copy/site";
import { brands, company } from "../../_data";
import { AdminFrame } from "../_frame";

const USER = "staff@example.com";
const OWNER = "owner@example.com";

export default function Page() {
  return (
    <AdminFrame active="settings">
      <SettingsView
        user={USER}
        brands={brands}
        profile={{
          ...company,
          tagline: siteCopy.tagline,
          map: "",
          seo: siteCopy.description,
        }}
        history={{
          profile: {
            saved: { when: "2026-10-30 16:05", who: USER },
            previous: { when: "2026-10-21 09:30", who: OWNER },
          },
          theme: {
            saved: { when: "2026-10-28 10:12", who: OWNER },
            previous: { when: "2026-10-20 14:48", who: OWNER },
          },
          home: {
            saved: { when: "2026-10-29 09:40", who: USER },
            previous: { when: "2026-10-25 17:15", who: USER },
          },
          copy: {
            saved: { when: "2026-10-31 11:20", who: USER },
            previous: { when: "2026-10-30 18:02", who: OWNER },
          },
          features: {
            saved: { when: "2026-10-27 15:02", who: OWNER },
            previous: { when: "2026-10-19 10:30", who: OWNER },
          },
        }}
      />
    </AdminFrame>
  );
}
