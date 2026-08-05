# Groupify

Erstelle die Web-App **Groupify** um Studierende zufälligerweise in Gruppen aufzuteilen.


## Funktionalität

* Liste der Studierenden laden (CSV-Datei im Format: `Name;Vorname`)
* Anzahl der Gruppen oder Gruppengrösse definieren
* Taste `aufteilen`: weist 1 zufällige:r Studierende:r 1 zufälliger Gruppe zu
* wenn alle Studierende zugeteilt sind
  - _optional_ Gruppen bearbeiten
    * Studierende umteilen
    * Studierende löschen
    * Studierende hinzufügen
    * Bezeichnung der Gruppen ändern<br>
      Bezeichnung der Gruppen: Nr. (Default), Dubletten verhindern
  - speichern der Gruppenzuteilung als CSV-Datei im Format: `Name;Vorname;Gruppe`
