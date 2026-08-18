# Groupify – zentrale Verwaltung der Gruppenzuteilung

## Zweck

Die Klasse `Groupify` ist die zentrale Verwaltungsschicht der Anwendung.

Sie hält den gesamten Zustand der Gruppenzuteilung zusammen und stellt sicher, dass Studierende kontrolliert zwischen dem nicht zugeteilten Zustand und den eigentlichen Gruppen verschoben werden.

Die Main Application soll die Zuteilungslogik nicht selbst implementieren, sondern nur über die öffentliche Schnittstelle von `Groupify` darauf zugreifen.

## Grundmodell

Groupify verwaltet:

- eine virtuelle Gruppe `unallocated`
- ein Array `groups[]` mit den eigentlichen Gruppen

Ein Student befindet sich zu jedem Zeitpunkt entweder:

1. in `unallocated`
2. oder in genau einer Gruppe aus `groups[]`

Dadurch ist kein zusätzliches Property wie `student.assigned` notwendig.

Der Zustand eines Students ergibt sich daraus, in welcher Gruppe er sich befindet.

## Struktur

Main Application
    |
    v
Groupify
    |
    |-- unallocated: Group
    |
    `-- groups[]: Group[]
            |
            `-- Student[]

Die Main Application arbeitet möglichst nur mit `Groupify`.

`Groupify` verwendet intern die bereits vorhandenen Klassen `Group` und `Student`.

## Verantwortlichkeiten

### Group

Eine `Group` ist für ihren eigenen Zustand verantwortlich.

Sie kennt:

- ihren Namen
- `min`
- `max`
- ihre Students
- ob sie `complete` ist
- ob sie `full` ist

Die `Group` kontrolliert über ihre eigenen Methoden, ob Students hinzugefügt oder entfernt werden können.

### Student

Ein `Student` repräsentiert einen einzelnen Studierenden.

Der Student kennt seinen vollständigen Namen.

Der Student weiß nicht, welcher Gruppe er zugeteilt ist.

### Groupify

`Groupify` verwaltet die Beziehungen zwischen den Groups und Students.

Die Klasse entscheidet, wie Students zwischen `unallocated` und den eigentlichen Gruppen verschoben werden.

Sie ist insbesondere dafür verantwortlich, dass kein Student gleichzeitig in mehreren Gruppen oder gleichzeitig in `unallocated` und einer normalen Gruppe liegt.

## Geplante Methoden

### `allocate(student, targetGroup)`

Weist einen bisher nicht zugeteilten Student einer Gruppe zu.

Vorher:

unallocated: [Max, Anna, Peter]
Group 1:     []

Nachher:

unallocated: [Anna, Peter]
Group 1:     [Max]

---

### `unallocate(group, student)`

Entfernt einen Student aus einer Gruppe und verschiebt ihn zurück nach `unallocated`.

Vorher:

unallocated: [Anna, Peter]
Group 1:     [Max]

Nachher:

unallocated: [Anna, Peter, Max]
Group 1:     []

---

### `move(sourceGroup, student, targetGroup)`

Verschiebt einen Student direkt von einer Gruppe in eine andere Gruppe.

Vorher:

Group 1: [Max, Anna]
Group 2: []

Nachher:

Group 1: [Anna]
Group 2: [Max]

---

### `randAssign(student)`

Weist einen einzelnen unallocated Student zufällig einer möglichen Gruppe zu.

Die Gruppe wird erst zum Zeitpunkt der Zuteilung zufällig gewählt.

Es soll keine im Voraus berechnete Zuteilungsliste geben.

Grundidee:

1. mögliche Gruppen bestimmen
2. volle bzw. nicht erlaubte Gruppen ausschließen
3. zufällig eine mögliche Gruppe auswählen
4. Student über `allocate()` zuweisen

---

### `randAssignAll()`

Teilt alle noch nicht zugeteilten Students auf die Gruppen auf.

Die Methode soll auf den bereits vorhandenen Zuteilungsmechanismen aufbauen und keine zweite unabhängige Zuteilungslogik implementieren.

## Wichtige Designregeln

- So wenig Klassen und State wie möglich.
- Keine parallelen Zustände wie `student.assigned`.
- Ein Student befindet sich immer genau an einem Ort.
- `Groupify` verändert Groups über deren öffentliche Methoden.
- Bestehende Validierungen der Klasse `Group` sollen wiederverwendet werden.
- Keine Zuteilungslogik in der UI.
- Keine DOM-/HTML-Abhängigkeiten in `Groupify`.
- Keine im Voraus berechnete Queue für `randAssign()`.
- Gemeinsame Logik nicht mehrfach implementieren.
- Erst validieren, danach Zustand verändern.
- Ungültige Operationen dürfen keinen teilweise veränderten Zustand hinterlassen.

## Ziel

Am Ende soll die Main Application nicht wissen müssen, wie die Gruppenzuteilung intern funktioniert.

Statt selbst Arrays und Students zu verändern, soll sie beispielsweise nur noch Operationen wie diese ausführen:

groupify.allocate(student, targetGroup);
groupify.unallocate(group, student);
groupify.move(sourceGroup, student, targetGroup);
groupify.randAssign(student);
groupify.randAssignAll();

Die interne Konsistenz der Gruppenzuteilung ist die Verantwortung von `Groupify`.