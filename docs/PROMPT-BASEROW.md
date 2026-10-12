# Prompt do AI Baserow

Wklej poniższy tekst do asystenta AI, który może tworzyć i konfigurować tabele Baserow. Pole AI służące wyłącznie do generowania tekstu nie utworzy struktury tabeli; w takim przypadku użyj listy pól jako instrukcji w edytorze bazy.

```text
Przygotuj bazę Baserow dla strony HeDoiX, która udostępnia darmowe ebooki do nauki języka niderlandzkiego oraz pokazuje inne ebooki i kolorowanki.

Utwórz bazę „HeDoiX” i tabelę „Products”. Jeśli już istnieją, zachowaj wszystkie istniejące rekordy i pliki. Dodaj brakujące pola. Jeśli istniejące pole ma niezgodny typ, wskaż konflikt przed zmianą, która mogłaby utracić dane.

Domyślne główne pole Name przemianuj na title, zachowując jego wartości. Jeśli główne pole ma już nazwę title, pozostaw je bez zmian.

Nazwy pól muszą być dokładnie takie, małymi literami, bez spacji i bez tłumaczenia:

1. title — Single line text, główne pole tabeli. Prawdziwy tytuł publikacji.
2. description — Long text. Krótki opis zawartości publikacji.
3. category — Single select. Opcje wyłącznie: ebook, coloring.
4. section — Single select. Opcje wyłącznie: education, entertainment.
5. language — Single select. Opcje: pl, nl, pl/nl. To język treści materiału, nie język interfejsu strony.
6. price — Number, 2 miejsca po przecinku, bez liczb ujemnych. Wartość 0 dla darmowego materiału; pozostałe kwoty w EUR.
7. cover — File. Opcjonalna okładka PNG, JPG lub WebP. Wgrywamy jeden plik okładki do rekordu.
8. file — File. PDF ebooka albo kolorowanki, wgrywany z dysku. Wgrywamy jeden PDF do rekordu.
9. published — Boolean. Domyślnie wyłączone. Włączamy dopiero po sprawdzeniu tytułu, kategorii, sekcji, ceny i pliku PDF.

Pola cover i file muszą mieć typ File, nie tekst ani URL. Aplikacja korzysta z obiektów załączników zwracanych przez Baserow API. Nie twórz własnego pola id — korzystamy z identyfikatora rekordu Baserow.

Reguły dla darmowych ebooków do nauki niderlandzkiego:
- category = ebook
- section = education
- price = 0
- language = nl, pl lub pl/nl, zgodnie z rzeczywistą treścią
- published = false do momentu wgrania i sprawdzenia PDF

Reguły dla innych ebooków i kolorowanek:
- category = ebook lub coloring
- section = entertainment
- price = 0 dla darmowych materiałów
- published = false do momentu przygotowania publikacji

Nie twórz przykładowych produktów ani fikcyjnych plików. Nie publikuj rekordów automatycznie. Tytuły, opisy, okładki i PDF-y dodam samodzielnie ze swojego dysku.

Utwórz widoki, jeśli Twoje uprawnienia to umożliwiają:
- „Do przygotowania”: published = false.
- „Opublikowane”: published = true.
- „Edukacja — darmowe ebooki”: section = education AND category = ebook AND price = 0 AND published = true.
- „Rozrywka”: section = entertainment AND published = true.

Strona odczytuje dane z API:
GET https://api.baserow.io/api/database/rows/table/ID_TABELI/?user_field_names=true

W podsumowaniu:
1. Podaj rzeczywiste ID tabeli Products, jeżeli masz do niego dostęp; nie zgaduj go.
2. Potwierdź nazwy i typy dziewięciu pól.
3. Potwierdź, że nie usunięto istniejących danych i nie dodano fikcyjnych produktów.
4. Podaj instrukcję utworzenia Database Token z uprawnieniem wyłącznie Read do Products. Nie pokazuj wartości tokenu w zwykłym podsumowaniu.
5. Wskaż każdy krok, którego nie mogłeś wykonać automatycznie.

Klucz OpenAI używany przez funkcje AI Baserow pozostaje w jego konfiguracji. Strona korzysta z odrębnego połączenia Baserow przez Database Token. Tokenu Baserow nie zapisuj w rekordach tabeli ani w polu tekstowym.
```

Po utworzeniu tabeli wpisz w **Render → usługa strony → Environment**:

- `BASEROW_API_URL=https://api.baserow.io`
- `BASEROW_TABLE_ID` — rzeczywiste ID tabeli
- `BASEROW_TOKEN` — token Read, wpisany bezpośrednio w panelu

Zapisz zmienne i wdroż ponownie. Wgraj pierwszy PDF, ustaw `category=ebook`, `section=education`, `price=0`, potem `published=true`. Sprawdź `/api/products` oraz przycisk pobrania w Edukacji. Sama odpowiedź AI o wykonaniu konfiguracji nie potwierdza jeszcze działania API i pliku.

Rozmowa HeDi z OpenAI ma osobne ustawienie **`HEDI_OPENAI_API_KEY` w Render**.
