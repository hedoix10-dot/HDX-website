# Gdzie podłączyć Baserow i API

## Baserow — ebooki i kolorowanki

**Baserow Cloud:** utwórz bazę/tabelę w panelu Baserow. Wgraj ebooki, kolorowanki i okładki do pól File. Strukturę `Products` znajdziesz w `BASEROW.md`.

**Render:** Dashboard → Twoja usługa → **Environment → Add Environment Variable**:

| Zmienna | Co wpisać |
|---|---|
| `BASEROW_API_URL` | `https://api.baserow.io` |
| `BASEROW_TABLE_ID` | Numeryczne ID tabeli z jej dokumentacji API |
| `BASEROW_TOKEN` | Poufny Database Token z uprawnieniem Read do tabeli |

Zapisz zmienne i uruchom ponownie usługę. Token jest potrzebny wyłącznie serwerowi. Nigdy nie twórz `VITE_BASEROW_TOKEN`.

**Lokalnie:** skopiuj `.env.example` do `.env` w głównym katalogu projektu i wpisz te same wartości. `npm start` odczytuje `.env`. Plik jest ignorowany przez Git. **W chmurze Codex:** wartości dodaj w ustawieniach środowiska, nie w czacie.

**W kodzie:**

- `server/app.js`: serwerowe połączenie z Baserow, endpoint `GET /api/products` i mapowanie pól w `publicProduct()`. Jeśli nazwy kolumn w Twojej bazie są inne, dostosuj tę funkcję.
- `src/sections/Catalog.tsx`: widok katalogu i pobieranie `/api/products`.
- `src/sections/Entertainment.tsx`: umiejscowienie katalogu w stronie z paczki.

Bez danych Baserow katalog jest ukryty, a sekcja rozrywki zachowuje zapowiedzi z paczki. Po podłączeniu tabela zasila widok. Widoczne są wyłącznie rekordy z `published=true`, tytułem i kategorią `ebook` lub `coloring`. API nie zwraca linku do płatnego pliku. Nie ma jeszcze płatności ani ochrony dostępu do magazynu plików.

## API formularzy / Make / n8n / Formspree

W tym samym miejscu **Render → Environment** dodaj:

- `VITE_WEBHOOK_URL`: jeden **publiczny adres HTTPS** obsługujący oba formularze, zgodnie z paczką.
- Alternatywnie `VITE_CONTACT_ENDPOINT` i `VITE_SIGNUP_ENDPOINT`: oddzielne publiczne adresy; mają pierwszeństwo przed wspólnym webhookiem.

Po zmianie `VITE_*` wykonaj **ponowny build/deploy**, ponieważ Vite umieszcza je w kodzie przeglądarki. To miejsce na adres endpointu, nie na klucze, hasła lub tokeny. Adres powinien być przeznaczony do publicznych formularzy i mieć ograniczenie spamu po stronie odbiorcy.

Przeglądarka wykonuje POST z nagłówkiem `Content-Type: application/json`. Zewnętrzny API/webhook musi przyjmować JSON, odpowiadać HTTP 2xx po przyjęciu zgłoszenia i mieć CORS dla domeny strony (w tym obsługę preflight OPTIONS). Dla Formspree użyj adresu `https://formspree.io/f/TWOJE_ID`.

Kontakt:

```json
{"type":"contact","name":"Anna","email":"anna@example.com","company":"Firma","message":"Proszę o kontakt","consent":"on"}
```

Zapis zainteresowań:

```json
{"type":"newsletter","name":"Anna","email":"anna@example.com","interests":["Kolorowanki i ebooki"],"consent":true}
```

**W kodzie:** `src/lib/useFormDelivery.ts` obsługuje wspólne żądania, błędy i tryb e-mail. Same pola i wygląd są w `src/sections/Contact.tsx` oraz `src/sections/Signup.tsx`. Jeśli Twoja usługa wymaga innego formatu, dostosuj tutaj payload.

Bez endpointu formularze przygotowują e-mail do wysłania w programie pocztowym. Nie pokazują fałszywego komunikatu „wysłano”.

## Inne klucze API, np. rzeczywisty asystent AI

Poufne klucze dodawaj jako zmienne serwerowe w **Render → Environment**, bez prefiksu `VITE_`. Wywołanie dostawcy i autoryzację zaimplementuj w `server/app.js` lub module importowanym przez ten serwer. Przeglądarka powinna wywoływać Twój endpoint `/api/...`, bez otrzymywania klucza.

`src/components/ChatWidget.tsx` jest obecnie oznaczoną demonstracją z gotowymi odpowiedziami. Tutaj zastąpisz gotowe odpowiedzi wywołaniem swojego API asystenta. Nie ma jeszcze podłączonego płatnego modelu ani zewnętrznego czatu.
