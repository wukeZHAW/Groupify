# Groupify

Erstelle die Web-App **Groupify** um Studierende zufälligerweise in Gruppen aufzuteilen.


## Funktionalität

* Liste der Studierenden laden (CSV-Datei im Format: `Name;Vorname`)
* Anzahl der Gruppen oder Gruppengrösse definieren
* Taste `aufteilen`: weist 1 zufällige:r Studierende:r 1 zufälliger Gruppe zu
* darstellen aller Gruppen: Bezeichnung der Gruppe, Mitglieder der Gruppe
* wenn alle Studierende zugeteilt sind:
  - (_Benutzer kann_) Gruppen bearbeiten
    * Studierende umteilen
    * Studierende löschen
    * Studierende hinzufügen
    * Bezeichnung der Gruppen ändern<br>
      Bezeichnung der Gruppen: Nr. (Default), Dubletten verhindern
  - (_Benutzer kann_) Gruppenzuteilung als CSV-Datei im Format: `Name;Vorname;Gruppe` speichern
