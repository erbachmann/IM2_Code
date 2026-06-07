# hungry but lost 🍽️

Eine Recipe-Discovery-Web-App, die zufällige Rezeptvorschläge liefert – gefiltert nach Kategorie, speicherbar als Favoriten und mit detaillierter Rezeptansicht.

**Stack:** HTML · CSS (3 Dateien) · JS 
**API:** [TheMealDB](https://www.themealdb.com/api.php)

---

## Dateistruktur

```
/
├── index.html          # App-Shell, alle DOM-Elemente
├── css/
│   ├── style.css       # Hauptstyles, Layout, Animationen
│   ├── resets.css      # CSS-Reset (importiert)
│   └── fonts.css       # Font-Face-Definitionen (importiert)
└── js/
    └── script.js       # Gesamte App-Logik (ES Modul)
```

---

## Features

- Zufälliges Rezept laden (oder nach Kategorie filtern)
- Rezept als Favorit speichern (`localStorage`)
- Favoriten-Panel mit Detailansicht
- Fullscreen-Detail-Overlay mit Zutaten und Kochschritten
- Responsive für Mobile und Desktop
- Tastatur-Shortcuts: `Space` = neues Rezept, `Escape` = Overlay schliessen

---

## HTML — Wichtige IDs & Klassen

| ID / Klasse              | Aufgabe                                              |
| ------------------------ | ---------------------------------------------------- |
| `#recipe_card`           | Container für die Recipe Card (beim Laden versteckt) |
| `#recipe_img`            | Vorschaubild des Rezepts                             |
| `#recipe_title`          | Rezepttitel                                          |
| `#recipe_category`       | Kategorie-Label                                      |
| `#recipe_kitchen`        | Area-/Küchen-Label                                   |
| `#btn_load_recipe`       | „inspire me"-Button → lädt zufälliges Rezept         |
| `#btn_like_recipe`       | Herz-Button → speichert/entfernt Favorit             |
| `#catecory_kitchen`      | Dropdown → filtert nach Kategorie                    |
| `#detail_overlay`        | Fullscreen-Rezept-Overlay (fixed, z-index 20)        |
| `#fav_overlay`           | Favoriten-Panel (fixed, rechte Hälfte, z-index 15)   |
| `#fav_list`              | `<ul>` im Favoriten-Overlay                          |
| `#detail_grocery`        | Zutatenliste (Desktop)                               |
| `#detail_grocery_mobile` | Zutatenliste (Mobile, nur ≤768px sichtbar)           |
| `#detail_steps`          | Nummerierte Kochschritte                             |
| `header .btn_heart`      | Header-Button: öffnet Favoriten / schliesst Overlays |

---

## CSS-Architektur

### Farbvariablen

| Variable           | Wert      | Verwendung                                    |
| ------------------ | --------- | --------------------------------------------- |
| `--c-background-1` | `#D9D9D9` | Seitenhintergrund, Card-Hintergrund           |
| `--c-text-1`       | `#1A2F5E` | Textfarbe, dunkle Flächen                     |
| `--c-accent-1`     | `#F2E28D` | Gelb — Icon-Striche, Close-Button-Hintergrund |
| `--c-accent-2`     | `#C73C75` | Pink — Herz-Button, Favoriten-Overlay         |
| `--c-accent-3`     | `#79ACD9` | Blau — Body-Hintergrund                       |

### Layout

- **Desktop:** `main` als CSS Grid (2 gleiche Spalten, volle Viewport-Höhe)
- **Mobile (≤768px):** `main` wechselt zu `flex-direction: column-reverse`, Teller-Logo ausgeblendet, Card und Buttons expandieren auf volle Breite

### Button-States (`.btn_heart`)

| Klasse      | Bedeutung              | Darstellung                                       |
| ----------- | ---------------------- | ------------------------------------------------- |
| `.liked`    | Rezept ist gespeichert | Herz-Icon gefüllt                                 |
| `.is_close` | Overlay ist offen      | Gelber Hintergrund, X sichtbar, Herz ausgeblendet |

### Animationen

| Name           | Anwendung                         | Auslöser                                             |
| -------------- | --------------------------------- | ---------------------------------------------------- |
| `cardSlideIn`  | `.recipe.slide-in`                | Neues Rezept geladen                                 |
| `cardSlideOut` | `.recipe.slide-out`               | Vor dem Laden der nächsten Card                      |
| `overlayIn`    | `.detail_overlay`, `.fav_overlay` | Beim Öffnen                                          |
| `itemDrop`     | `.fav_item`                       | Beim Rendern der Liste (gestaffelt via `:nth-child`) |
| `favItemOut`   | `.fav_item.removing`              | Vor dem Entfernen aus dem DOM                        |
| `heartBounce`  | `.btn_heart.heart-pop svg`        | Beim Like-Klick                                      |
| `idlePulse`    | `#btn_load_recipe`                | 3 s nach Seitenload, läuft bis Hover                 |

---

## JavaScript

### State-Variablen

```js
let selectedRecipe; // Vollständiges MealDB-Objekt der aktuellen Card
let favWasOpen; // War das Favoriten-Overlay vor dem Detail-Overlay offen?
```

Favoriten werden in `localStorage` als `likedRecipes` gespeichert:

```js
// Struktur eines Eintrags
{ idMeal: "12345", strMeal: "Rezeptname", strMealThumb: "https://..." }
```

### API-Endpunkte

| Endpunkt              | Verwendung                            |
| --------------------- | ------------------------------------- |
| `/categories.php`     | Kategorien-Dropdown beim Laden füllen |
| `/random.php`         | Zufälliges Rezept (Dropdown = „all")  |
| `/filter.php?c={cat}` | Rezeptliste einer Kategorie           |
| `/lookup.php?i={id}`  | Vollständige Rezeptdetails            |

> **Zweistufiger Fetch bei Kategorien:** `filter.php` liefert nur Basisdaten (id, Name, Thumbnail). Danach folgt immer ein zweiter Aufruf mit `lookup.php`, um die vollständigen Daten zu holen.

### Kernfunktionen

#### `loadCatecory()`

Lädt alle Kategorien und füllt das `<select>` `#catecory_kitchen`.

#### `renderRecipe(meal)`

Prüft ob die Card sichtbar ist. Falls ja: Slide-out-Animation, dann `loadNewCard`. Falls nein: direkt `loadNewCard`.

#### `loadNewCard(meal)`

Füllt alle DOM-Felder der Card, synchronisiert `.liked` aus `localStorage` und startet die Slide-in-Animation.

#### `openDetail(meal)`

- Speichert `favWasOpen`
- Füllt `#detail_overlay` mit Titel, Kategorie, Area und Bild
- Baut Zutatenliste aus `strIngredient1–20` + `strMeasure1–20` (Desktop + Mobile)
- Parst `strInstructions` zeilenweise und rendert `<li>`-Schritte (leere/stub-Zeilen gefiltert)
- Setzt Header-Button auf `.is_close`

#### `closeDetail()`

Versteckt `#detail_overlay`, setzt Header-Button zurück. Schliesst das Favoriten-Overlay nur, wenn `favWasOpen === false`.

#### `renderFavList()`

Liest `likedRecipes` aus `localStorage` und rendert jedes als `.fav_item` mit:

- **`.btn_remove`** → animiert ausblenden → aus Storage entfernen → aus DOM löschen
- **`.btn_details`** → `lookup.php` aufrufen → `openDetail()` starten

### Event-Listener

| Element               | Event     | Aktion                                                  |
| --------------------- | --------- | ------------------------------------------------------- |
| `#btn_load_recipe`    | `click`   | Rezept laden, `renderRecipe` aufrufen                   |
| `#btn_like_recipe`    | `click`   | `localStorage` togglen, `.liked` togglen, `heartBounce` |
| `.btn_details` (Card) | `click`   | `openDetail(selectedRecipe)`                            |
| `header .btn_heart`   | `click`   | Favoriten-Panel togglen / Overlay schliessen            |
| `document`            | `click`   | Favoriten-Panel bei Klick ausserhalb schliessen         |
| `document`            | `keydown` | `Escape` → Overlays schliessen; `Space` → neues Rezept  |
