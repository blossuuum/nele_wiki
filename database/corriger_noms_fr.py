#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Corrige les noms de lieux/personnages qui n'étaient pas ceux de la version
française des jeux (Ocarina of Time / Wind Waker) dans les fichiers CSV,
JSON et XML de collectibles.

UTILISATION :
1. Placez ce script dans le MÊME dossier que vos fichiers
   (all_collectibles.csv/json/xml, oot_*.csv/json, ww_*.csv/json, etc.)
2. Ouvrez un terminal dans ce dossier.
3. Lancez :   python3 corriger_noms_fr.py
4. Le script modifie les fichiers sur place et crée une sauvegarde .bak
   de chaque fichier original avant modification.

Vous pouvez ajouter/retirer des corrections dans la liste CORRECTIONS
ci-dessous si vous en trouvez d'autres.
"""

import os
import glob
import shutil

# Liste des corrections : (texte incorrect, texte correct FR officiel)
# L'ordre compte : les remplacements les plus longs/spécifiques sont faits
# AVANT les plus courts pour éviter les remplacements partiels indésirables.
CORRECTIONS = [
    # --- Ocarina of Time ---
    ("Cimetière de Kakariko", "Cimetière Cocorico"),
    ("Cocoricos de Kakariko", "Cocoricos égarés d'Anju"),

    # --- Wind Waker ---
    ("Caverne Dragon Roost", "Caverne du Dragon"),
    ("Île Dragon Roost", "Île du Dragon"),
    ("Après la Forteresse Oubliée", "Après la Forteresse Maudite"),
    ("Forteresse Oubliée", "Forteresse Maudite"),
    ("Medli", "Médolie"),
]

# Extensions de fichiers à traiter
EXTENSIONS = ("*.csv", "*.json", "*.xml", "*.js")


def trouver_fichiers():
    fichiers = []
    for ext in EXTENSIONS:
        fichiers.extend(glob.glob(ext))
    return sorted(set(fichiers))


def corriger_fichier(chemin):
    with open(chemin, "r", encoding="utf-8") as f:
        contenu = f.read()

    contenu_original = contenu
    nb_remplacements_total = 0
    details = []

    for ancien, nouveau in CORRECTIONS:
        occurrences = contenu.count(ancien)
        if occurrences > 0:
            contenu = contenu.replace(ancien, nouveau)
            nb_remplacements_total += occurrences
            details.append(f'    "{ancien}" -> "{nouveau}"  ({occurrences}x)')

    if nb_remplacements_total > 0:
        # Sauvegarde de l'original avant modification
        chemin_bak = chemin + ".bak"
        if not os.path.exists(chemin_bak):
            shutil.copy2(chemin, chemin_bak)

        with open(chemin, "w", encoding="utf-8") as f:
            f.write(contenu)

        print(f"✔ {chemin} : {nb_remplacements_total} remplacement(s)")
        for d in details:
            print(d)
    else:
        print(f"— {chemin} : aucune correction nécessaire")


def main():
    fichiers = trouver_fichiers()
    if not fichiers:
        print("Aucun fichier .csv/.json/.xml trouvé dans ce dossier.")
        return

    print(f"{len(fichiers)} fichier(s) trouvé(s) : {', '.join(fichiers)}\n")

    for fichier in fichiers:
        corriger_fichier(fichier)

    print("\nTerminé. Les fichiers originaux ont été sauvegardés avec l'extension .bak")


if __name__ == "__main__":
    main()