# Baserow Cloud — ebooki i kolorowanki

## Utworzenie bazy

W Baserow Cloud utwórz workspace/bazę `HeDoiX` i tabelę `Products`. Nie jest to wykonywane automatycznie: na etapie przygotowania aplikacji tabela i token nie były dostępne.

Nazwy pól muszą być dokładnie takie jak poniżej (małe litery). Jeśli Baserow tworzy domyślne pole `Name`, zmień jego nazwę na `title`.

| Pole | Typ Baserow | Ustawienie / przykład |
|---|---|---|
| `title` | Single line text, pole główne | Tytuł ebooka lub kolorowanki |
| `description` | Long text | Opis produktu |
| `category` | Single select | Opcje dokładnie `ebook` i `coloring` |
| `language` | Single select | Opcje `pl`, `nl`, `pl/nl` |
| `price` | Number, 2 miejsca dziesiętne | Cena w EUR; `0` oznacza darmowy plik |
| `cover` | File | Wgraj okładkę JPG/PNG/WebP; używany pierwszy plik |
| `file` | File | Wgraj PDF; używany pierwszy plik |
| `published` | Boolean | Włącz, aby pokazać produkt na stronie |

`docs/baserow-products-template.csv` zawiera dwa **nieopublikowane** przykładowe rekordy. Przy imporcie ustaw typy pól zgodnie z tabelą; pliki `cover` i `file` dodaj osobno jako pola File. Rekordy przykładowe wymagają zastąpienia prawdziwymi publikacjami.

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
