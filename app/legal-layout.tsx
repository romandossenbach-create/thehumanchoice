import Link from "next/link";

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="legalPage">
    <header className="legalHeader">
      <Link href="/" className="brand" aria-label="Zur Startseite">
        <span className="brandMark">THC</span>
        <span><strong>THE.HUMAN.CHOICE</strong><small>Road to 100 Push-ups</small></span>
      </Link>
      <Link href="/" className="backLink">Zurück zur App</Link>
    </header>
    <article className="legalArticle">
      <p className="eyebrow">Rechtliche Informationen</p>
      <h1>{title}</h1>
      <p className="legalScope">Gültig für THE.HUMAN.CHOICE und Road to 100 Push-ups.</p>
      {children}
      <p className="legalVersion"><strong>Stand:</strong> September 2026 · Maßgeblich ist die deutsche Fassung.</p>
    </article>
    <nav className="legalNav" aria-label="Rechtliche Seiten">
      <Link href="/impressum">Impressum</Link>
      <Link href="/nutzungsbedingungen">Nutzungsbedingungen</Link>
      <Link href="/datenschutz">Datenschutz</Link>
    </nav>
  </main>;
}
