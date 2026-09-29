import { LegalLayout } from "../legal-layout";

export default function ImpressumPage() {
  return <LegalLayout title="Impressum">
    <section>
      <h2>Angaben gemäß § 5 DDG</h2>
      <address><strong>Roman Dossenbach</strong><br />Steinackerstrasse 16<br />79576 Weil am Rhein<br />Deutschland</address>
      <p><strong>E-Mail:</strong> <a href="mailto:pushupmania@gmail.com">pushupmania@gmail.com</a></p>
    </section>
    <section>
      <h2>Verantwortlich für Inhalte</h2>
      <p>Roman Dossenbach, Anschrift wie oben.</p>
    </section>
    <section>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Ich bin weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    </section>
    <section>
      <h2>Haftung für Inhalte und Links</h2>
      <p>Als Diensteanbieter bin ich für eigene Inhalte nach den allgemeinen gesetzlichen Vorschriften verantwortlich. Die Apps können Links zu externen Seiten enthalten. Für deren Inhalte ist der jeweilige Anbieter verantwortlich. Sobald mir eine konkrete Rechtsverletzung bekannt wird, prüfe und entferne ich den betreffenden Inhalt oder Link, soweit dies erforderlich ist.</p>
    </section>
    <section>
      <h2>Urheberrecht</h2>
      <p>Die von Roman Dossenbach erstellten Inhalte, Trainingskonzepte, Texte, Bilder, Videos, Grafiken, Datenbankstrukturen, Softwareelemente und Gestaltungen unterliegen dem geltenden Urheberrecht und sonstigen Schutzrechten. Eine Vervielfältigung, Bearbeitung, Veröffentlichung, Weitergabe oder kommerzielle Nutzung ist ohne vorherige schriftliche Zustimmung nicht gestattet, soweit sie nicht ausdrücklich gesetzlich erlaubt ist.</p>
    </section>
  </LegalLayout>;
}
