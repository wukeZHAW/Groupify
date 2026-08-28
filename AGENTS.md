# AGENTS.md

## Projekt

Groupify ist eine clientseitige Vanilla-JavaScript-Webanwendung zur zufälligen Gruppeneinteilung.

## Architektur

- UI und Domänenlogik getrennt halten.
- Domänenlogik befindet sich unter `src/`.
- `Groupify` verwaltet den zentralen Domänenzustand.
- Änderungen an Gruppenzuteilungen über die vorgesehenen Domain-Methoden durchführen.
- High Cohesion und Low Coupling beibehalten.
- KISS bevorzugen und unnötige Abstraktionen vermeiden.

## Code

- ES6-Module und ES6-Klassen verwenden.
- Bestehenden Coding Style beibehalten.
- Keine unnötigen Dependencies hinzufügen.
- Keine Frameworks einführen, solange sie nicht erforderlich sind.
- Bestehendes Verhalten nicht ohne Anforderung verändern.

## Testing

- Änderungen an der Domänenlogik mit Tests absichern.
- Bestehende Tests nicht entfernen, nur um einen Fehler zu umgehen.
- Nach relevanten Änderungen `npm test` ausführen.
- Alle Tests müssen erfolgreich sein.

## Änderungen

- Nur Änderungen durchführen, die für die aktuelle Aufgabe notwendig sind.
- Keine unabhängigen Refactorings nebenbei durchführen.
- Bestehende Architekturentscheidungen respektieren.
- Bei Unsicherheit zuerst den bestehenden Code analysieren.