import Link from "next/link";
import { styles, variants } from "./_styles";
import s from "./lab.module.css";

export default function Page() {
  return (
    <main className={s.index}>
      <h1>首頁風格實驗室</h1>
      <p>「實機型錄」結構的 20 個變體（企業 10、嚴謹 10），以及先前 20 款自由風格。</p>
      {(["企業", "嚴謹"] as const).map((g) => (
        <section key={g} className={s.group}>
          <h2>{g}風格（實機型錄變體）</h2>
          <ol className={s.list}>
            {variants
              .filter((x) => x.group === g)
              .map((st) => (
                <li key={st.slug}>
                  <Link href={`/mockup/style-lab/${st.slug}`} className={s.card}>
                    <span className={s.no}>{st.slug.slice(0, 3).toUpperCase()}</span>
                    <strong>{st.name}</strong>
                    <span>{st.brief}</span>
                  </Link>
                </li>
              ))}
          </ol>
        </section>
      ))}
      <h2>自由風格 20 款</h2>
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
