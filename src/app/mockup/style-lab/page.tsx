import Link from "next/link";
import { styles } from "./_styles";
import s from "./lab.module.css";

export default function Page() {
  return (
    <main className={s.index}>
      <h1>首頁風格實驗室（20 款）</h1>
      <p>同一份內容、20 種完全不同的美學風格。選定一款後再寫成正式 profile。</p>
      <ol className={s.list}>
        {styles.map((st) => (
          <li key={st.slug}>
            <Link href={`/mockup/style-lab/${st.slug}`} className={s.card}>
              <span className={s.no}>{st.slug.slice(0, 2)}</span>
              <strong>{st.name}</strong>
              <span>{st.brief}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
