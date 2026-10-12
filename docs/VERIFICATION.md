# Weryfikacja — 12 października 2026

- Node 24.19.0, npm 11.9.0.
- Obecna wersja jest oparta na `hedoix-vite-clone.zip`: React 18.3.1, TypeScript 5.9.3, React Router 6.30.6, Vite 5.4.21. Grafiki z paczki początkowo zachowano bez zmian (SHA-256). Następnie zdjęcia hero/close-up i dashboard uaktualniono do wersji 1024 × 1024 zgodnych z grafikami wskazanymi przez użytkownika.
- Instalacja powtarzalna: `npm ci --include=dev --cache /workspace/.npm --no-audit --no-fund` zakończona powodzeniem, bez zmiany lockfile.
- Produkcyjny `npm run build` (kontrola TypeScript + Vite): PASS.
- `npm run test:api` oraz `npx playwright test`: **44 PASS**, 0 FAIL, 0 SKIP — 30 testów API (Baserow, Supabase, kolejka Gmail, zamówienia ebooków i OpenAI) i 14 testów Chromium.
- `npm run test:sql`: migracja i testy funkcji przeszły na PostgreSQL 17 w izolowanym kontenerze z rolami i strukturą storage.buckets używaną przez Supabase. Sprawdzono powtórne wykonanie migracji, uprawnienia/RLS, transakcyjność synchronizacji, zachowanie rekordów ręcznych, unikalność zgłoszeń, kolejkę i rezerwację wiadomości oraz wstrzymanie wysyłki po wycofaniu zgody. Test nie łączy się z projektem użytkownika.
- Nagłówek hero zachowuje całe słowa i mieści je w kontenerze przy 320, 390, 722, 1024 i 1440 px w PL/NL. HeDi znajduje się poniżej początku nagłówka. Wizualnie potwierdzono przywróconą siatkę 56 × 56 px pod sekcjami. Nagłówek nawigacji przełącza się na menu mobilne poniżej 1280 px, aby nie ściskać logo i linków.
- Oryginalny nowy znak HDX jest widoczny inline, ale jego plik nie jest dostępny w workspace. Komponent Logo jest przygotowany na VITE_BRAND_LOGO_URL i bezpieczny fallback; nie podmieniono go na wymyśloną grafikę.
- Zweryfikowano PL/NL i zapamiętanie języka, wszystkie sekcje, grafikę hero z paczki, formularze z wymaganą zgodą i przygotowaniem e-maila, czat przez API z historią i obsługą błędów, filtrowanie katalogu, rozmieszczenie darmowych ebooków w Edukacji, mobilne menu, brak przewijania w poziomie przy 390 i 320 px oraz bezpośrednie wejście na politykę prywatności.
- Testy API sprawdziły filtrowanie nieopublikowanych rekordów, ukrywanie linku płatnych plików, cache, stronicowanie, odrzucanie niebezpiecznych adresów i brak ujawnienia tokenu.
- Uruchomiony serwer produkcyjny oraz Vite z proxy API: `/api/health` zwraca `status: ok` w obu trybach.
- Bez ustawień Baserow `/api/products` zwraca `status: not_configured` i pustą listę; katalog dynamiczny jest ukryty, a zapowiedzi pozostają widoczne.
- Na publicznym Render `https://hdx-website.onrender.com/api/products` potwierdzono `status: ok`, pustą listę widocznych produktów i brak kolejnej strony. Połączenie katalogu działa; publikacja pierwszego rzeczywistego PDF-u nadal wymaga dodania produktu.
- Endpointy formularzy zapisują kontakty i subskrypcje do oddzielnych tabel Baserow. Sprawdzono walidację zgody i danych, ochronę przed zapisem do Products, filtrowanie po nazwach pól zgodnie z oficjalnym schematem API, deduplikację, ponowienia, równoczesny zapis jednego adresu, błędy uprawnień, brak wycieku tokenu i limity. Testy używają symulowanego API, nie zapisują osób w prawdziwej bazie.
- Przeglądarka sprawdza konfigurację formularzy, zapisuje przez serwer po aktywacji tabel, zachowuje wiadomość po błędzie i używa tego samego submission_id przy ponowieniu. Przetestowano newsletter NL z zainteresowaniami i osobną zgodą. Bez konfiguracji pozostaje tryb ręcznego e-maila.
- Oficjalny schemat Baserow Cloud potwierdził obsługę Rows created, SMTP email i Update row. Zapisano prompt i instrukcję konfiguracji dwóch natywnych workflow w docs/AUTOMATYZACJE-BASEROW.md. Nie skonfigurowano ani nie opublikowano workflow na koncie użytkownika, nie wysłano rzeczywistego e-maila.
- Dostęp do OpenAI potwierdzono odpowiedzią HTTP 401 bez klucza. Serwer i proxy Vite zwracają `/api/chat/status` z `enabled: false`, ponieważ brak rzeczywistego klucza. Testy używają symulowanych odpowiedzi Responses API i sprawdzają brak wycieku klucza, walidację, limity, błędy oraz interfejs rozmowy. Żywa odpowiedź modelu pozostaje do weryfikacji po dodaniu klucza.

## Pozostałe kroki zewnętrzne

Docelowa konfiguracja została zmieniona na hybrydową: Baserow edytuje produkty i obsługuje subskrybentów ebooków; Supabase przechowuje katalog i kontakty. Kod integracji, SQL i instrukcje są przygotowane, ale nie wykonano SQL w projekcie https://smjzlzhbnojrdrhvnapp.supabase.co i nie ma w środowisku jego serwerowego klucza. Instrukcja SUPABASE.md wskazuje dokładnie ustawienia Render. Przekazanie newslettera do Baserow, a kontaktu do Supabase zostało sprawdzone w testach z kontrolowanymi odpowiedziami API.

1. Dodać pierwszy rzeczywisty produkt do istniejącej tabeli Products (1258474) i sprawdzić widok oraz pobranie PDF-u.
2. GitHub main i usługa Render już istnieją. Po kolejnych commitach sprawdzić wdrożenie z aktualnego SHA; nie utożsamiać udanego push z zakończonym wdrożeniem.
3. W obecnym wariancie utworzyć tylko Subscribers w Baserow; ustawić ID i Read + Create w Render. Skonfigurować SMTP i workflow powitalny w Baserow. W Supabase uruchomić SQL i dodać klucz serwerowy do Render, następnie sprawdzić kontakt. Potwierdzenia kontaktowe są przekazywane do Baserow MailQueue i wysyłane przez tę samą integrację Gmail. Zamówienia dwóch ebooków trafiają do EbookRequests, skąd workflow powiadamia właściciela.
4. Przejrzeć i zapisać konfigurację w ustawieniach środowiska chmurowego, następnie opublikować środowisko. Zapisane instrukcje nie oznaczają publikacji ani sprawdzenia przywrócenia w nowym zadaniu.
5. Dodać `HEDI_OPENAI_API_KEY` w Render Environment i wykonać ponowne wdrożenie. Model domyślny to `gpt-4.1-mini`.
6. Wgrać rzeczywiste PDF-y do Baserow. Darmowe ebooki do nauki niderlandzkiego: `section=education`, `category=ebook`, `price=0`, `published=true`. W kodzie i testach nie ma rzeczywistych plików ebooków użytkownika.

- OpenAI obsługuje HEDI_OPENAI_API_KEY oraz standardowy alias OPENAI_API_KEY; pierwszeństwo ma niepusta pierwsza zmienna. Na ostatniej rzeczywistej kontroli Render /api/chat/status nadal zwracało enabled=false. Nie wykonano rzeczywistej odpowiedzi OpenAI bez klucza.
- Oba tytuły ebooków podane przez właściciela są widoczne w Edukacji i mają działające lokalnie strony formularzy. Testy sprawdziły wybór książki, zgodę, zapis oraz bezpośrednią trasę. PDF-ów ani ich adresów nie dostarczono; nie deklarowano pobrania ani rzeczywistego wysłania ebooka.
