# HeDoiX — AI & Automatyzacja

Główną podstawą strony jest przesłana paczka `hedoix-vite-clone.zip`: React 18 + TypeScript + React Router 6 + Tailwind 3.4 + Lenis + Framer Motion + Sonner. Zachowano układ, komponenty sekcji, panele, efekty i grafiki tej paczki. Dodano serwer Node/Express dla katalogu Baserow, pełniejsze tłumaczenie PL/NL, lokalne fonty, poprawną obsługę formularzy i politykę prywatności. Przygotowane pod Render **Web Service**.

## Uruchomienie

Wymagany Node 24.19.0 (`.node-version`).

```sh
npm ci --include=dev
npm run build
npm start
```

Serwer używa `PORT` od dostawcy hostingu, lokalnie domyślnie 3001. `GET /api/health` zwraca `{"status":"ok"}`. `/api/products` zwraca katalog; bez konfiguracji Baserow pokazuje stan `not_configured`, a strona informuje o nadchodzących publikacjach.

Tryb edycji: pozostaw `npm start` uruchomione w jednym terminalu, a w drugim uruchom `npm run dev`. Vite przekazuje `/api` do serwera na porcie 3001. Po zmianie frontendu odśwież produkcyjny `dist` przez `npm run build`.

## Baserow i Render

- [Instrukcja Baserow i struktura tabeli](docs/BASEROW.md)
- [Gdzie podłączyć Baserow i API](docs/INTEGRACJE.md)
- [Gotowy prompt do AI Baserow](docs/PROMPT-BASEROW.md)
- [Ustawienia i wdrożenie Render](docs/RENDER.md)
- `render.yaml`: gotowy Blueprint Web Service.
- `.env.example`: nazwy ustawień; kopiuj lokalnie do `.env`, nigdy nie commituj tokenów.

Token Baserow jest używany wyłącznie w `server/app.js`. Nigdy nie używaj nazwy `VITE_BASEROW_TOKEN`, ponieważ zmienne `VITE_*` są publiczne. API ma cache 60 s; przeglądarka może dodatkowo zachować odpowiedź 30 s. Katalog pobiera po 100 wierszy Baserow i udostępnia przycisk kolejnej strony. Limit 100 stron chroni serwer przed nieograniczonymi zapytaniami.

## Formularze

Domyślnie formularze **przygotowują e-mail** do `Hedoix10@gmail.com`. Użytkownik musi otworzyć wiadomość i wysłać ją w swoim programie pocztowym. Strona nie deklaruje wysłania zgłoszenia w tym trybie.

Opcjonalnie ustaw wspólny publiczny endpoint w `VITE_WEBHOOK_URL`, zgodnie z paczką źródłową. Otrzyma JSON z `type: contact` lub `type: newsletter`. Możesz też utworzyć dwa formularze w Formspree i ustawić oddzielne `VITE_CONTACT_ENDPOINT` oraz `VITE_SIGNUP_ENDPOINT`, np. `https://formspree.io/f/TWOJE_ID`. Oddzielny adres ma pierwszeństwo przed wspólnym webhookiem. Są to publiczne adresy formularzy, a nie tokeny. API zewnętrzne musi obsługiwać CORS i JSON; przebuduj aplikację po ustawieniu adresu. Sukces jest pokazywany dopiero po odpowiedzi HTTP 2xx. Do działania formularzy nie jest potrzebny token Baserow.

## Testy

```sh
npm run build
npm test
```

Testy API używają kontrolowanych odpowiedzi Baserow. Nie wymagają zewnętrznej bazy i nie potwierdzają połączenia z żywą tabelą. Testy przeglądarkowe używają Chromium; konfiguracja wykrywa `/usr/bin/chromium`, można też ustawić `CHROMIUM_PATH`. Na innej maszynie zainstaluj przeglądarkę Playwright: `npx playwright install chromium`.

## Grafiki i zakres

Główne grafiki, komponenty i style pochodzą z `hedoix-vite-clone.zip`. Zdjęcia hero/close-up mają w paczce rozmiar 334 × 324 px i zostały zachowane. Treści oraz wygląd paczki są głównym wzorem; dokument odtworzenia jest materiałem pomocniczym. Tłumaczenie NL jest przygotowane w projekcie. Poprzednia wersja została zachowana poza repozytorium jako `/workspace/hedoix-before-clone.zip`.

Chat HeDi korzysta z OpenAI przez serwerowy endpoint `/api/chat`. W Render Environment dodaj `HEDI_OPENAI_API_KEY`; model domyślny to `gpt-4.1-mini`. Bez klucza chat pokazuje niedostępność i kontakt. Testy OpenAI są symulowane; działanie na żywo wymaga uzupełnienia klucza. Gry, muzyka i e-learning są zapowiedziane jako „wkrótce”. Katalog obsługuje bezpłatne publiczne pobrania. Ebooki do nauki niderlandzkiego trafiają do Edukacji przy `section=education`, `category=ebook`, `price=0`. Pozostałe produkty pozostają w Rozrywce; starsze rekordy bez pola section domyślnie trafiają do Rozrywki. Płatne produkty mają cenę i kontakt; płatności oraz chroniona dystrybucja plików wymagają osobnego wdrożenia.

Przed publikacją uzupełnij dane prawnego administratora w polityce prywatności zgodnie z rzeczywistą firmą oraz dostawcami usług.
