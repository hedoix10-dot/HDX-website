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

## OpenAI — rzeczywista rozmowa z HeDi

Kod rozmowy jest gotowy: przeglądarka wywołuje `POST /api/chat`, a serwer korzysta z OpenAI Responses API. Klucz znajduje się wyłącznie na serwerze.

1. Otwórz **Render → usługa `hedoix-website` → Environment → Add Environment Variable**.
2. W nazwie wpisz dokładnie `HEDI_OPENAI_API_KEY`. W wartości wpisz swój klucz OpenAI. Możesz wykorzystać istniejący klucz, do którego masz dostęp; jeśli go nie możesz odczytać, utwórz nowy w https://platform.openai.com/api-keys. Klucz musi mieć dostęp do Responses API i wybranego modelu.
3. Opcjonalnie dodaj `HEDI_OPENAI_MODEL=gpt-4.1-mini`. Jest to model domyślny, więc brak tej zmiennej go nie zmienia.
4. Zapisz zmienne i wykonaj ponowne wdrożenie.
5. Na stronie kliknij **HEDI**, wpisz pytanie i sprawdź odpowiedź. `/api/chat/status` z `enabled: true` oznacza obecność klucza; dopiero odpowiedź na wiadomość potwierdza działanie OpenAI.

Klucz wpisany w Baserow nie przenosi się automatycznie do Render. W Baserow może pozostać do jego funkcji AI; strona potrzebuje własnego ustawienia `HEDI_OPENAI_API_KEY` w Render. Nigdy nie używaj `VITE_OPENAI_API_KEY` ani nie wstawiaj klucza do GitHub lub wiadomości na czacie.

**Pliki:** `server/chat.js` zawiera wywołanie OpenAI, kontekst HeDoiX i limity; `src/components/ChatWidget.tsx` obsługuje rozmowę, historię, wysyłkę i błędy. `/api/chat/status` jest publiczną informacją o konfiguracji, bez wartości klucza. Bez klucza HeDi pokazuje niedostępność i odsyła do kontaktu, zamiast udawać rozmowę.

API obsługuje język PL/NL i przekazuje maksymalnie 10 wiadomości, do 6000 znaków. Odpowiedź ma limit 600 tokenów. Obowiązuje 10 żądań na adres IP i 60 łącznie na minutę, maksymalnie 4 równocześnie na instancję. Błędy dostawcy są zwracane bez danych klucza. Rozmowa nie jest zapisywana w bazie strony; żądania mają `store: false`. Przetwarzanie przez dostawcę podlega jego polityce API.

Aktualne testy sprawdzają kontrolowane odpowiedzi OpenAI. Żywe połączenie wymaga prawdziwego klucza i konta API z dostępem do modelu.


## Supabase — kiedy go dołączyć

Dla obecnego katalogu darmowych ebooków najprościej pozostawić Baserow jako miejsce edycji produktów oraz wgrywania PDF-ów i okładek. Potwierdzona tabela Products ma ID 1258474.

Supabase warto dołączyć do osobnych zadań: kont użytkowników, logowania, historii zakupów albo przechowywania plików z dostępem dla uprawnionych użytkowników. Baserow może wtedy nadal być panelem redakcyjnym katalogu. Nie ma potrzeby dublowania rekordów produktów w obu bazach.

Na tym etapie nie dodano Supabase do aplikacji. Rozsądny kolejny krok to połączenie obecnej tabeli Baserow i sprawdzenie pierwszego darmowego PDF-u. Decyzję o Supabase można podjąć przy wdrażaniu kont lub płatnych materiałów.
