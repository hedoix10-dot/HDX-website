# Baserow Cloud — ebooki i kolorowanki

## Szybkie podłączenie opublikowanej strony

1. W Baserow otwórz ustawienia swojego workspace i znajdź **Database tokens**. Utwórz token dla strony, nadając **Read** do tabeli produktów. To token Baserow; klucz OpenAI dodany wcześniej w Baserow pozostaw w jego konfiguracji.
2. Otwórz dokumentację API swojej tabeli. W adresie `/api/database/rows/table/123456/` liczba `123456` jest ID tabeli.
3. W Render otwórz usługę strony → **Environment → Add Environment Variable**. Dodaj `BASEROW_API_URL` z wartością `https://api.baserow.io`, `BASEROW_TABLE_ID` z ID tabeli i `BASEROW_TOKEN` z utworzonym tokenem.
4. Zapisz ustawienia i wykonaj ponowne wdrożenie usługi.
5. W tabeli, z polami opisanymi poniżej, dodaj produkt i zaznacz `published`. Tytuł musi być w `title`, a kategoria musi mieć wartość `ebook` lub `coloring`.
6. Otwórz publiczny adres swojej strony z końcówką `/api/products`. `status: ok` potwierdza otrzymanie danych z API. Lista `results` zawiera opublikowane produkty, które pojawią się w katalogu. `not_configured` oznacza brak ustawień, a `catalog_unavailable` wymaga sprawdzenia tokenu, uprawnień i ID.

Nie przesyłaj tokenu w wiadomości i nie używaj nazwy `VITE_BASEROW_TOKEN` — token powinien pozostać na serwerze.

## Utworzenie bazy

W Baserow Cloud utwórz workspace/bazę `HeDoiX` i tabelę `Products`. Nie jest to wykonywane automatycznie: na etapie przygotowania aplikacji tabela i token nie były dostępne.

Nazwy pól muszą być dokładnie takie jak poniżej (małe litery). Jeśli Baserow tworzy domyślne pole `Name`, zmień jego nazwę na `title`.

| Pole | Typ Baserow | Ustawienie / przykład |
|---|---|---|
| `title` | Single line text, pole główne | Tytuł ebooka lub kolorowanki |
| `description` | Long text | Opis produktu |
| `category` | Single select | Opcje dokładnie `ebook` i `coloring` |
| `section` | Single select | `education` dla ebooków do nauki niderlandzkiego, `entertainment` dla pozostałych produktów |
| `language` | Single select | Opcje `pl`, `nl`, `pl/nl` |
| `price` | Number, 2 miejsca dziesiętne | Cena w EUR; `0` oznacza darmowy plik |
| `cover` | File | Wgraj okładkę JPG/PNG/WebP; używany pierwszy plik |
| `file` | File | Wgraj PDF; używany pierwszy plik |
| `published` | Boolean | Włącz, aby pokazać produkt na stronie |

`docs/baserow-products-template.csv` zawiera dwa **nieopublikowane** przykładowe rekordy. Przy imporcie ustaw typy pól zgodnie z tabelą; pliki `cover` i `file` dodaj osobno jako pola File. Rekordy przykładowe wymagają zastąpienia prawdziwymi publikacjami.

## Darmowe ebooki z dysku — publikacja w Edukacji

Baserow jest najprostszą opcją dla tego projektu: strona ma już gotowy adapter. PDF-y i okładki wgrywasz w przeglądarce z własnego dysku do komórek typu File.

Dla każdego ebooka:

1. Dodaj wiersz z prawdziwym `title` i `description`.
2. Ustaw `category=ebook`, `section=education`, `price=0`.
3. Wybierz język treści, np. `pl/nl`, jeśli materiał objaśnia niderlandzki po polsku.
4. W polu `file` wgraj PDF, a w `cover` opcjonalną okładkę.
5. Zaznacz `published`, gdy plik jest gotowy do udostępnienia.

Po podłączeniu tokenu i ID tabeli opublikowany darmowy ebook pojawi się w sekcji Edukacja, z przyciskiem pobrania. Pozostałe trzy kafelki edukacyjne pozostają na stronie. `section=entertainment` umieszcza produkt w Rozrywce. Starsze rekordy bez pola `section` pozostają w Rozrywce.

Airtable także może przechowywać taką tabelę, ale obecny projekt wymagałby nowego adaptera API i tokenu. Nie jest teraz potrzebny do publikacji tych plików.

## Token i ID tabeli

1. W ustawieniach Baserow utwórz Database Token dla odpowiedniego workspace.
2. Nadaj mu tylko uprawnienie **Read** do `Products`. Aplikacja nie tworzy ani nie zmienia rekordów.
3. Otwórz dokumentację API wybranej bazy/tabeli. Z adresu `/api/database/rows/table/123456/` odczytaj liczbę `123456` — to `BASEROW_TABLE_ID`.
4. Wpisz w Render: `BASEROW_API_URL=https://api.baserow.io`, ID tabeli oraz token w `BASEROW_TOKEN`.
5. Zapisz zmienne i uruchom ponownie usługę. Nie wpisuj tokenu na czacie.

Do lokalnego uruchomienia skopiuj `.env.example` do `.env` i wpisz wartości tam. `.env` jest ignorowany przez Git. W chmurze Codex wymagania sekretu i ID są zadeklarowane w ustawieniach środowiska; wartości wpisuje użytkownik bezpiecznie w tym panelu.

## Publikacja

Wgraj okładkę, PDF i opis, wybierz kategorię, ustaw cenę oraz zaznacz `published`. Strona filtruje nieopublikowane rekordy po stronie serwera. Zmiany mogą pojawić się z opóźnieniem około 90 sekund z powodu cache. Większy katalog ma przycisk kolejnej strony.

Plik darmowego opublikowanego produktu jest dostępny przez link pobrania. Przy cenie większej od zera strona pokazuje cenę i kontakt, ale **nie ujawnia linku PDF w API katalogu**.

Pola File w Baserow mogą korzystać z publicznych adresów plików. Samo pominięcie linku w katalogu nie tworzy kontroli dostępu do magazynu. Nie przechowuj tam plików wymagających ochrony płatnością, zanim nie zostanie wdrożone prywatne przechowywanie, płatności i wydawanie dostępu po zakupie.

## Diagnostyka

- `status: not_configured`: brak ID tabeli lub tokenu na serwerze.
- HTTP 503 `catalog_configuration`: niepoprawny format ID tabeli.
- HTTP 503 `catalog_unavailable`: sprawdź token, Read, adres API, ID i dostęp sieciowy.
- `status: ok`, pusta lista: sprawdź `published`, tytuł, kategorię i nazwy pól.
- Brak linku PDF: sprawdź pole File, cenę `0` i adres HTTPS.

Bez utworzonej tabeli i tokenu testy używają symulowanych odpowiedzi. Podłączenie rzeczywistej bazy pozostaje do weryfikacji po wpisaniu tych danych.
