#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Schreibt check/videolinks.js aus der Pipeline.

Liest ~/tools/ruhepuls-pipeline/public/v<Zahl>/ und legt fuer jedes Video
ab, wohin verlinkt wird. Die Regeln in check/regeln.js nennen nur die
Video-ID (z. B. "v43") — die Links stehen ausschliesslich hier.

Was gilt als Ordner:  genau v<Zahl>. Alles andere wird uebersprungen,
also auch "v79.verworfen" und "v59-animation".

TikTok:   Steht in TIKTOK.md eine echte Video-URL (tiktok.com/.../video/...),
          wird die genommen. Sonst, wenn das Video auf TikTok ist
          (auf_tiktok: ja oder eine Zeile "hochgeladen"), das Kanalprofil.
          Sonst gar kein TikTok-Link.
YouTube:  url aus YOUTUBE.md, aber nur wenn das Video dort oeffentlich ist —
          also sicht: public ODER die geplante Startzeit (live:) ist vorbei.
          Sonst kein YouTube-Link.

Aufruf nach jedem Upload:
    python3 scripts/baue-videolinks.py
"""
import datetime
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIEL = os.path.join(HIER, "check", "videolinks.js")
PIPELINE = os.path.expanduser("~/tools/ruhepuls-pipeline/public")

KANAL_TIKTOK = "https://www.tiktok.com/@ruhepuls.de"
ORDNER = re.compile(r"^v\d+$")


def lies(pfad):
    try:
        with open(pfad, encoding="utf-8") as f:
            return f.read()
    except OSError:
        return ""


def feld(text, name):
    """Holt eine Zeile der Form 'name: wert'."""
    t = re.search(r"^%s:\s*(.+)$" % re.escape(name), text, re.M | re.I)
    return t.group(1).strip() if t else ""


def tiktok_link(text):
    echt = re.search(r"https://(?:www\.)?tiktok\.com/[^\s)\"']*?/video/\d+", text)
    if echt:
        return echt.group(0)
    if feld(text, "auf_tiktok").lower().startswith("ja") or re.search(
        r"^hochgeladen:", text, re.M | re.I
    ):
        return KANAL_TIKTOK
    return None


def youtube_link(text, jetzt):
    url = feld(text, "url")
    if not url.startswith("http"):
        return None
    if feld(text, "sicht").lower() == "public":
        return url
    start = feld(text, "live")
    if start:
        try:
            wann = datetime.datetime.fromisoformat(start)
            if wann.tzinfo is None:
                wann = wann.replace(tzinfo=jetzt.tzinfo)
            if wann <= jetzt:
                return url
        except ValueError:
            pass
    return None


def sammle():
    if not os.path.isdir(PIPELINE):
        print("ROT: %s gibt es nicht." % PIPELINE)
        return None
    jetzt = datetime.datetime.now().astimezone()
    videos = {}
    for name in sorted(os.listdir(PIPELINE)):
        if not ORDNER.match(name):
            continue
        ordner = os.path.join(PIPELINE, name)
        if not os.path.isdir(ordner):
            continue
        tk = lies(os.path.join(ordner, "TIKTOK.md"))
        yt = lies(os.path.join(ordner, "YOUTUBE.md"))
        eintrag = {
            "tiktok": tiktok_link(tk),
            "youtube": youtube_link(yt, jetzt),
            "titel": feld(yt, "titel").replace(" #Shorts", ""),
        }
        # 25.09.2026 (Liam): Ein TikTok-Link im mobilen Browser schickt in die App,
        # der Besucher ist weg vom Check. Deshalb liegt das Video selbst auf der
        # Seite (videos/<id>.mp4 + .jpg) — kein fremder Dienst, kein Verlassen.
        if os.path.exists(os.path.join(HIER, "videos", name + ".mp4")):
            eintrag["datei"] = "../videos/%s.mp4" % name
            eintrag["bild"] = "../videos/%s.jpg" % name
        if eintrag["tiktok"] or eintrag["youtube"] or eintrag.get("datei"):
            videos[name] = eintrag
    return videos


def main():
    videos = sammle()
    if videos is None:
        return 1
    inhalt = (
        "/* ERZEUGT von scripts/baue-videolinks.py — nicht von Hand aendern.\n"
        "   Quelle: ~/tools/ruhepuls-pipeline/public/<id>/TIKTOK.md und YOUTUBE.md\n"
        "   Stand: %s  ·  %d Videos mit Link\n"
        "   Neu bauen nach jedem Upload:  python3 scripts/baue-videolinks.py */\n"
        "window.RUHEPULS_VIDEOS = %s;\n"
        % (
            datetime.date.today().isoformat(),
            len(videos),
            json.dumps(
                {"kanal": {"tiktok": KANAL_TIKTOK}, "videos": videos},
                ensure_ascii=False,
                indent=2,
                sort_keys=True,
            ),
        )
    )
    with open(ZIEL, "w", encoding="utf-8") as f:
        f.write(inhalt)
    mit_yt = sum(1 for v in videos.values() if v["youtube"])
    print("Geschrieben: %s" % ZIEL)
    print("  Videos mit Link: %d  (davon mit YouTube: %d)" % (len(videos), mit_yt))
    return 0


if __name__ == "__main__":
    sys.exit(main())
