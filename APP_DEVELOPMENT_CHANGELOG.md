## PRIVATE MODE · 30.09.2026 · Quellbasis V270 / 16e8448

- Dauerhaft gespeicherter Account-Schalter unter Profil → Privacy → Community Visibility.
- Serverseitiger Schutz von Ranglisten, Summen, Trainingsbuch, Video-Nachweisen, Profilfotos, Globusarchiv und persönlicher Weltrekordhistorie. Persönliche Daten werden ausschließlich dem authentifizierten Eigentümer separat geliefert.
- Migration 0016 ergänzt athletes.private_mode und setzt Roman anhand bestehender Athleten-ID, Nummer und Eigentümer-ID auf ON. Keine Änderungen an Trainingseinträgen oder Challenges.
- Creator-Credits bleiben unabhängig sichtbar. Bestehende Handbücher vor Änderung unter docs/backups/2026-09-30-private-mode gesichert.
- Lokale Regressionstests verwenden SQLite und simulierte Identitäten; sie ersetzen keinen echten Zweitaccount-Test.

## Version 247 · 28.09.2026, 12:53 Uhr Zürich

- Globus: Landmassen, Ozeane, Licht und Hintergrund sichtbar aufgehellt.
- Mürren-Marker auf einen einzelnen kleinen runden roten Punkt reduziert; antippbare Fläche bleibt groß genug für Finger. Keine äußere Puls- oder Kreis-Markierung mehr.
- GPS-Klärung: Auf der dokumentierten Archivkarte liegt nur der Ort Mürren vor, weder exakte Koordinaten noch Original-Aufnahmehöhe. Höhe ist für einen Ortsmarker optional; genaue Lage erfordert Original-GPS-Metadaten.
- Statistik: sichtbares Buch-Icon oben rechts für die persönliche Freigabe (privat, 24 Stunden, dauerhaft; heute oder alle Tage). Eigentümer können ihr eigenes Trainingsbuch auch privat öffnen. Zugriffe anderer Athleten bleiben serverseitig von aktiver Freigabe abhängig.
- Beide Handbücher nach Sicherung der Version 246 aktualisiert.

## Version 246 · 28.09.2026, 12:41 Uhr Zürich

- Neues Modul Push Your World mit Untertitel Push Your City; interaktiver 3D-Globus mit Fingerrotation, Pinch-Zoom, Ländern, dynamischen Labels und Hauptstädten; Einstieg über Hauptmenü.
- Historischer Archivpunkt PYW-000005 (Roman Dossenbach, 30 Push-ups, Mürren Flower Trail, 27.09.2026, 13:23:59 Europe/Zurich) mit ungefährem Ortsmarker; exakte Original-GPS-Daten und Aufnahmehöhe nicht archiviert.
- Trainingshandbuch und Funktionshandbuch nach vorherigem Backup auf V246 aktualisiert.

# THE.HUMAN.CHOICE · App-Entwicklung und Dokumentation

## Version 245 · 28.09.2026 · Europe/Zurich

- Die Sprachresultate werden über Index und Länge gelesen; Androids nicht iterierbares SpeechRecognitionResult verursachte sonst keine Übernahme des gesprochenen Werts.
- Die Erkennung startet direkt beim Tippen ohne vorgeschaltete separate getUserMedia-Abfrage. Grün bedeutet nun tatsächlichen Erkennungsstart und nicht bloß einen gedrückten Knopf.
- Erfolg und Fehler sind als sichtbare Rückmeldung unterscheidbar. Eingabe 1 bis 121 erscheint im Zahlenfeld und muss weiterhin bewusst gespeichert werden.
- Beide Handbücher Version 244 vor der Änderung gesichert und anschließend aktualisiert.

## Version 244 · 28.09.2026 · Europe/Zurich

- Erfolgreiche Live-Abfragen für Sitzung, Profil und Trainingsbuch bestätigt; das Auftreten separater Zustände ist kein zweiter App-Start.
- Der Anmeldehinweis erscheint erst nach 0,8 Sekunden; kurze erfolgreiche Prüfungen wechseln dadurch ohne zusätzlichen Textzustand.
- Während des Trainingsbuchabrufs erscheinen dezente Tages-Platzhalter statt einer Textmeldung; Fehlerhinweis und Retry bleiben erhalten.
- Beide Handbücher Version 243 vor Beginn gesichert und anschließend aktualisiert.

## Version 243 · 28.09.2026 · Europe/Zurich

- Der gesonderte Ladebildschirm beim Refresh wurde entfernt. Das Dashboard bleibt vom ersten Bild bis zum Abschluss der Anmeldeprüfung sichtbar; Speichern ist währenddessen gesperrt.
- Die Profilabfrage endet bei Zeitüberschreitung verständlich und löscht das vorhandene Profil bei einem bloß temporären Serverfehler nicht.
- Beide Handbücher Version 242 wurden vor der Änderung separat gesichert und die aktuellen Fassungen angepasst.

## Version 242 · 28.09.2026 · Europe/Zurich

- Beim Refresh erscheint statt eines dunklen/leeren Zwischenbildschirms ein Startbereich mit Dashboard-Farbgebung und Ladestatus.
- Das Trainingsbuch zeigt während des Abrufs einen Ladestatus. Fehler beim Abruf werden sichtbar und lassen sich erneut laden; eine vorübergehend leere Antwort wird bei vorhandenem Monatsstand nicht mehr fälschlich als dauerhaft leeres Trainingsbuch bezeichnet.
- Späte Antworten älterer Trainingsbuchabfragen überschreiben keine neueren Daten. Vor der Änderung wurden beide Handbücher der Version 241 separat gesichert.

## Version 241 · 28.09.2026 · Europe/Zurich

- Der Morgengruß wird vor dem Einblenden des Dashboards bestimmt; die zusätzliche einmalige Sprachvorschau, die ein zweites Begrüßungsfenster öffnete, entfällt.
- Gleichzeitige Sitzungsprüfungen beim Start verwenden denselben laufenden Vorgang, damit keine doppelte Initialisierung stattfindet.
- Beim ersten Mikrofontippen wartet die App auf die Browserberechtigung und startet anschließend selbstständig die Spracherkennung. Doppeltes Tippen wird während des Starts gesperrt, Fehler werden angezeigt.
- Beide Handbücher wurden vor Beginn unverändert als Version 240 gesichert und danach aktualisiert.

## Version 240 · 28.09.2026 · Europe/Zurich

- Zwei getrennte Slider: Menü über ☰ links oben, Einstellungen über Zahnrad links unten. Derselbe Knopf, × oder der Hintergrund schließt den Slider.
- Im Einstellungen-Slider klappen persönliche Daten, Trainingsbuch und Stimme/Morgengruß einzeln nach unten auf; Unterpunkte führen zum passenden Profilabschnitt.
- Die tatsächlichen Profileinstellungen sind entsprechend in drei aufklappbare Abschnitte gegliedert. Die bestehende Speicherung und Freigabelogik bleibt erhalten.
- Trainingshandbuch und App-Funktionshandbuch auf die neue Bedienung aktualisiert. Beide Handbücher der Version 239 wurden vor der Änderung gesichert.

## Version 239 · 28.09.2026 · Europe/Zurich

- Das bestehende Seitenmenü öffnet den heutigen Morgengruß erneut; ein Zahnrad führt direkt zu den Einstellungen.
- Im Profil werden Trainingsbuch-Inhalt (heutiger Tag oder alle Tage) und Dauer (privat, 24 Stunden oder dauerhaft) getrennt gewählt. Änderungen gelten erst nach dem Speichern.
- Die 24-Stunden-Freigabe läuft automatisch ab und kann vorzeitig beendet werden. Der gewählte Inhalt gilt auch für zeitlich begrenzte Freigaben.
- Trainingshandbuch und App-Funktionshandbuch wurden mit den aktuellen Menüs, Freigaben und der vollständig scrollbaren Trainingshistorie abgeglichen.
- Vor Beginn wurden die Handbücher der Version 238 unverändert gesichert.

## Verbindliche Pflege bei jeder App-Änderung

1. Beide aktuellen Handbücher **vor** der Änderung als separate, datierte Backups archivieren.
2. App-Funktion ändern und prüfen.
3. Trainingshandbuch und Funktionshandbuch mit dem tatsächlichen Verhalten abgleichen: neue Funktionen ergänzen, entfernte Funktionen löschen, geänderte Abläufe korrigieren.
4. Versionsnummer, Zeit in Europe/Zurich, kurze Änderungsbeschreibung und einen überprüfbaren Fingerabdruck des vollständigen Quellcode-Backups im App-Entwicklungsordner archivieren.

Die Backups dokumentieren Entwicklungsstände. Sie ersetzen weder die individuelle Feststellung der Urheberschaft noch eine rechtliche Prüfung von Schutzrechten.
