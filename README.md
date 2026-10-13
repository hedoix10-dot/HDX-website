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
- [Formularze i automatyczne odpowiedzi Baserow](docs/AUTOMATYZACJE-BASEROW.md)
- [Supabase + Baserow — wybrana architektura i konfiguracja](docs/SUPABASE.md)
- [Gdzie wpisać dane Gmail i skonfigurować zamówienia ebooków](docs/GMAIL-BASEROW.md)
- [Ustawienia i wdrożenie Render](docs/RENDER.md)
- `render.yaml`: gotowy Blueprint Web Service.
- `.env.example`: nazwy ustawień; kopiuj lokalnie do `.env`, nigdy nie commituj tokenów.

Token Baserow jest używany wyłącznie na serwerze (`server/app.js`, `server/forms.js`). Nigdy nie używaj nazwy `VITE_BASEROW_TOKEN`, ponieważ zmienne `VITE_*` są publiczne. API katalogu ma cache 60 s; przeglądarka może dodatkowo zachować odpowiedź 30 s. Katalog pobiera po 100 wierszy Baserow i udostępnia przycisk kolejnej strony. Limit 100 stron chroni serwer przed nieograniczonymi zapytaniami.

## Formularze

Wybrany wariant docelowy: Baserow pozostaje panelem produktów i miejscem obsługi subskrybentów ebooków. Supabase obsługuje zsynchronizowany katalog oraz kontakty. Aktywacja wymaga wykonania migracji SQL i ustawienia `CATALOG_PROVIDER=supabase`, `CONTACT_PROVIDER=supabase`, `NEWSLETTER_PROVIDER=baserow`, `SUPABASE_URL` oraz poufnego `SUPABASE_SECRET_KEY`. Instrukcja: [SUPABASE.md](docs/SUPABASE.md). Bez jawnego wyboru dostawcy obowiązuje dotychczasowy wariant Baserow.

Po ustawieniu `BASEROW_CONTACT_TABLE_ID` i `BASEROW_NEWSLETTER_TABLE_ID` formularze zapisują dane przez serwer w tabelach Contacts i Subscribers. Token potrzebuje Read + Create na każdej z nich. Osobne workflow Baserow wysyłają potwierdzenia PL/NL przez SMTP. Szczegóły tabel i automatyzacji: [AUTOMATYZACJE-BASEROW.md](docs/AUTOMATYZACJE-BASEROW.md).

Bez konfiguracji tabel formularze **przygotowują e-mail** do `Hedoix10@gmail.com`. Użytkownik musi otworzyć wiadomość i wysłać ją w swoim programie pocztowym. Strona nie deklaruje wysłania zgłoszenia w tym trybie.

Opcjonalnie ustaw wspólny publiczny endpoint w `VITE_WEBHOOK_URL`, zgodnie z paczką źródłową. Otrzyma JSON z `type: contact` lub `type: newsletter`. Możesz też utworzyć dwa formularze w Formspree i ustawić oddzielne `VITE_CONTACT_ENDPOINT` oraz `VITE_SIGNUP_ENDPOINT`, np. `https://formspree.io/f/TWOJE_ID`. Oddzielny adres ma pierwszeństwo przed wspólnym webhookiem; zewnętrzne adresy mają pierwszeństwo przed endpointami Baserow. Są to publiczne adresy formularzy, a nie tokeny. API zewnętrzne musi obsługiwać CORS i JSON; przebuduj aplikację po ustawieniu adresu. Sukces jest pokazywany dopiero po odpowiedzi HTTP 2xx. W trybie zewnętrznego dostawcy nie jest potrzebny token Baserow.

Subskrybenci mają osobny wybór kolorowanek, ebooków i nauki niderlandzkiego oraz stałe segmenty niezależne od języka. Kontakt ma temat (domyślnie zapytanie o ofertę firmy). Zamówienia dwóch ebooków podanych przez właściciela trafiają do EbookRequests w Baserow, bez dopisywania do newslettera. Potwierdzenia kontaktów z Supabase są przekazywane przez HTTPS do MailQueue; wszystkie wiadomości wychodzą przez Gmail skonfigurowany tylko w Baserow. Render Free blokuje porty SMTP. Prompt tabel i ustawienia: [GMAIL-BASEROW.md](docs/GMAIL-BASEROW.md).

## Testy

```sh
npm run build
npm test
```

Testy API używają kontrolowanych odpowiedzi Baserow. Nie wymagają zewnętrznej bazy i nie potwierdzają połączenia z żywą tabelą. Testy przeglądarkowe używają Chromium; konfiguracja wykrywa `/usr/bin/chromium`, można też ustawić `CHROMIUM_PATH`. Na innej maszynie zainstaluj przeglądarkę Playwright: `npx playwright install chromium`.

## Grafiki i zakres

Główne grafiki, komponenty i style pochodzą z `hedoix-vite-clone.zip`. Zdjęcia hero/close-up oraz dashboard uaktualniono do wersji 1024 × 1024 zgodnych z grafikami wskazanymi przez użytkownika. Pełna sylwetka oraz siedzący HeDi są widoczne w rozmowie, ale ich pliki nie są jeszcze dostępne w projekcie. Treści oraz wygląd paczki są głównym wzorem; dokument odtworzenia jest materiałem pomocniczym. Tłumaczenie NL jest przygotowane w projekcie. Poprzednia wersja została zachowana poza repozytorium jako `/workspace/hedoix-before-clone.zip`.

Nagłówek hero zachowuje całe słowa przy 320–1440 px; zdjęcie HeDi obniżono, a siatka 56 × 56 px jest widoczna pod wszystkimi sekcjami. Oryginalne logo HDX odzyskano bez zmian z przesłanego PDF-u i zapisano w `public/images/hdx-logo.jpg`. Komponent Logo używa go domyślnie w nagłówku i stopce. Opcjonalny publiczny `VITE_BRAND_LOGO_URL` nadpisuje ten adres; przy błędzie zostaje znak SVG.

Chat HeDi korzysta z OpenAI przez serwerowy endpoint `/api/chat`. W Render Environment dodaj `HEDI_OPENAI_API_KEY` lub `OPENAI_API_KEY`; model domyślny to `gpt-4.1-mini`. Bez klucza chat pokazuje niedostępność i kontakt. Testy OpenAI są symulowane. Memory, fiszki i muzyka są zapowiedziane jako „wkrótce”; kafelek „NARZĘDZIA E-LEARNINGOWE” prowadzi do autorskiej aplikacji WerkBuddy: https://werkbuddy.onrender.com.

Przesłane dwa darmowe ebooki są dostępne bez formularza z `public/ebooks`: `trening-gramatyczny-czasowniki.pdf` (48 stron) oraz `podstawy-nederlands-leren.pdf` (10 stron). Bajty PDF-ów zachowano bez zmian. Okładki w `public/images/ebooks` to oryginalne grafiki promocyjne przesłane w `Music.rar`, przypisane po tytule: `podstawy-cover.png` do Podstaw, a `trening-cover.png` do Treningu. Pliki PNG zachowano bez zmian; adresy w metadanych mają parametr wersji, aby odświeżyć obrazy w przeglądarce. `shared/ebooks.json` definiuje tytuły, aliasy oraz ścieżki plików. Dopasowany po tytule darmowy produkt z Baserow może nadpisać okładkę, opis i PDF bez tworzenia drugiego kafelka. Strony formularzy są nadal dostępne jako opcja; pobranie nie zapisuje do newslettera.

Katalog obsługuje bezpłatne publiczne pobrania. Ebooki do nauki niderlandzkiego trafiają do Edukacji przy `section=education`, `category=ebook`, `price=0`. Pozostałe produkty pozostają w Rozrywce; starsze rekordy bez pola section domyślnie trafiają do Rozrywki. Płatne produkty mają cenę i kontakt; płatności oraz chroniona dystrybucja plików wymagają osobnego wdrożenia.

Przed publikacją uzupełnij dane prawnego administratora w polityce prywatności zgodnie z rzeczywistą firmą oraz dostawcami usług.
