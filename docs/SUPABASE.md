# Supabase + Baserow dla HeDoiX

Projekt: **https://smjzlzhbnojrdrhvnapp.supabase.co**.

Zgodnie z decyzją właściciela:

| Część systemu | Miejsce |
|---|---|
| Edycja ebooków i kolorowanek | Baserow → HeDoiX → Products (1258474) |
| Katalog odczytywany przez stronę | Supabase → hdx_products, synchronizowany z Baserow |
| Zgłoszenia kontaktowe | Supabase → hdx_contacts |
| Subskrybenci ebooków i zapisów na nowości | **Baserow → Subscribers** |
| Potwierdzenia i wysyłka dotycząca ebooków/subskrypcji | **Automatyzacje Baserow + skonfigurowana poczta SMTP** |
| Potwierdzenia kontaktowe | Supabase → hdx_email_outbox → Baserow MailQueue → Gmail |
| Pliki | Istniejące pliki w Baserow; przygotowane też buckety Supabase Storage |
| Rozmowa z HeDi | OpenAI przez serwer Render |
| Kod i hosting strony | GitHub + Render |

Subskrybenci nie są kopiowani do Supabase. Zapis na nowości ze strony trafia wyłącznie do Baserow. Nie dodano logowania, płatności ani historii czatów do bazy.

## 1. Przygotuj tabele Supabase

W Supabase Dashboard otwórz projekt → **SQL Editor → New query**. Wklej cały plik [202610120001_hedoix.sql](../supabase/migrations/202610120001_hedoix.sql) i kliknij **Run**.

Skrypt tworzy trzy tabele z prefiksem `hdx_`, funkcje synchronizacji i kolejki oraz trzy buckety Storage. Nie zmienia innych tabel projektu ani istniejących bucketów. RLS jest włączone, a dostęp do tabel i funkcji ma tylko serwerowy service_role. Dla istniejących tabel o tych samych nazwach sprawdź zgodność schematu przed wykonaniem; skrypt nie migruje nieznanego schematu.

## 2. Ustaw Render

W Supabase znajdź serwerowy klucz w **Project Settings → API Keys → Secret keys**. Możesz użyć klucza `sb_secret_...`; starszy `service_role` JWT jest również obsługiwany. Klucz jest poufny i omija RLS — wpisz go tylko w ustawieniach serwera. Publiczny publishable/anon key nie jest wystarczający do tej integracji.

W **Render → hdx-website → Environment** ustaw:

```env
SUPABASE_URL=https://smjzlzhbnojrdrhvnapp.supabase.co
SUPABASE_SECRET_KEY=TWÓJ_SERWEROWY_KLUCZ_SUPABASE
CATALOG_PROVIDER=supabase
CONTACT_PROVIDER=supabase
NEWSLETTER_PROVIDER=baserow
BASEROW_SYNC_INTERVAL_SECONDS=300
```

Pozostaw `BASEROW_API_URL=https://api.baserow.io`, `BASEROW_TABLE_ID=1258474`, `BASEROW_TOKEN` i `BASEROW_NEWSLETTER_TABLE_ID=ID_TABELI_SUBSCRIBERS`. Token Baserow potrzebuje Read na Products oraz Read + Create na Subscribers. Kontakt w tym wariancie nie wymaga tabeli Contacts w Baserow.

Jeżeli `VITE_CONTACT_ENDPOINT`, `VITE_SIGNUP_ENDPOINT` lub `VITE_WEBHOOK_URL` wskazują inną usługę, usuń je i wykonaj **Save, rebuild, and deploy**, aby formularze używały przygotowanych endpointów. Zewnętrzne adresy mają pierwszeństwo.

Zmienne `CONTACT_PROVIDER` i `NEWSLETTER_PROVIDER` są niezależne. `FORMS_PROVIDER`, jeśli pozostało ze starszej konfiguracji, jest tylko wspólnym ustawieniem awaryjnym; jawne ustawienia powyżej mają pierwszeństwo. Domyślnie aplikacja używa Baserow, więc samo dodanie URL Supabase nie przełącza działającego katalogu.

## 3. Baserow: subskrybenci ebooków

Jeśli tabela Subscribers nie istnieje, użyj części promptu dotyczącej Subscribers w [AUTOMATYZACJE-BASEROW.md](AUTOMATYZACJE-BASEROW.md). Podaj jej ID w `BASEROW_NEWSLETTER_TABLE_ID`. Tabela Products nie może pełnić roli tabeli subskrybentów.

Publikuj workflow powitalny opisany w tej instrukcji: **Rows created (Subscribers) → warunek consent=true, active=true, confirmation_sent=false → SMTP → Update row**. Ebooki i nowe materiały możesz później wysyłać do widoku Aktywni, zgodnie z zainteresowaniami. Sama integracja nie tworzy kampanii ani nie wysyła nieprzesłanego jeszcze PDF-u.

Nie uruchamiaj workflow Contacts w Baserow, jeżeli kontakt kierujesz do Supabase. Zapobiega to dwóch niezależnym ścieżkom potwierdzenia.

## 4. Synchronizacja produktów

Serwer po uruchomieniu pobiera całą tabelę Products i zapisuje katalog w Supabase jedną transakcją. Następnie powtarza synchronizację co 5 minut, gdy działa. Dane edytujesz w Baserow. Zmiany w kopii Supabase mogą zostać zastąpione przez następny zapis z Baserow.

- Wyłączenie published ukrywa produkt.
- Usunięcie produktu w Baserow usuwa jego kopię w Supabase.
- Niekompletne pobranie lub błąd API pozostawia poprzedni katalog.
- Ręczne rekordy Supabase ze źródłem manual nie są usuwane przez synchronizację.
- Nieprawidłowe produkty bez tytułu, z nieobsługiwaną kategorią/sekcją lub błędną ceną nie są publikowane.

Widok strony ma dodatkowy cache do 60 s na serwerze i 30 s w przeglądarce. Na bezpłatnym Render synchronizacja i worker poczty zatrzymują się podczas uśpienia usługi; startują po wybudzeniu. Do pracy bez przerw potrzebna jest stale działająca usługa lub osobny harmonogram.

## 5. Supabase Storage

Przygotowane buckety:

- `hdx-covers` — publiczne okładki JPG/PNG/WebP, do 10 MB.
- `hdx-free-ebooks` — **wyłącznie darmowe publiczne PDF-y**, do 50 MB.
- `hdx-private-files` — prywatne pliki PDF, do 50 MB; ich sprzedaż i autoryzowane pobrania wymagają osobnego wdrożenia.

Istniejące załączniki Baserow pozostają dostępne przez swoje adresy. Skrypt nie kopiuje automatycznie bajtów plików między usługami. Jeżeli chcesz przechowywać nowy bezpłatny ebook w Supabase, wgraj PDF w Dashboard → Storage → hdx-free-ebooks, skopiuj publiczny URL i dodaj w Baserow opcjonalne pole URL `file_url`. Dla okładki użyj `cover_url`; nazwę pliku można ustawić w `file_name` (Single line text). Synchronizacja preferuje te adresy, a gdy są puste, używa istniejących pól File `file` i `cover`.

Dwa przesłane darmowe ebooki są już częścią strony w `public/ebooks` i nie wymagają migracji do Storage, aby je pobierać. Możesz później dodać je w Products z `section=education`, `category=ebook`, `price=0`, `published=true`; zgodny tytuł z `shared/ebooks.json` lub jego alias zastąpi dane istniejącego kafelka. Samo pobranie PDF-u nie zapisuje osoby do Subscribers.

Płatnego PDF-u nie umieszczaj w publicznym buckecie. Serwer nie ujawnia w katalogu adresu pliku dla price > 0, ale nie zapewnia autoryzacji zakupów.

## 6. Potwierdzenia kontaktowe z Supabase

Zapis kontaktu i utworzenie wiadomości w `hdx_email_outbox` następują w jednej transakcji. Powtórzenie submission_id nie tworzy drugiego kontaktu ani drugiej wiadomości. Bez konfiguracji poczty kolejka pozostaje pending.

Właściciel wybrał wyłącznie Gmail. Całą pocztę wysyła Baserow przez swoją integrację SMTP. Render Free blokuje porty SMTP, więc worker przekazuje potwierdzenia przez HTTPS do MailQueue w Baserow.

W Render ustaw `BASEROW_EMAIL_TABLE_ID=ID_MAILQUEUE`, a tokenowi Baserow nadaj Read + Create na tej tabeli. Gmail i hasło aplikacji wpisz tylko w integracji SMTP Baserow. Pełny prompt tabel oraz trzy workflow opisuje [GMAIL-BASEROW.md](GMAIL-BASEROW.md).

Worker rezerwuje wiadomości w Supabase, sprawdza po job_id istniejący wiersz MailQueue i tworzy go tylko raz. Baserow wysyła SMTP i ustawia sent=true. Dopiero po odczytaniu tej flagi Supabase oznacza potwierdzenie jako sent. Brak flagi powoduje ponowienie odczytu z odstępem, nie tworzenie kolejnego e-maila. Po 5 próbach niepowodzenie wymaga sprawdzenia obu kolejek. sent oznacza przyjęcie przez Gmail, nie gwarancję doręczenia.

Adres odbiorcy i treść potwierdzenia kontaktu są również przetwarzane w Baserow MailQueue. Pełna wiadomość klienta zostaje w Supabase. Subskrybenci i zamówienia ebooków mają osobne tabele Baserow i nie są kopiowani do Supabase.

## 7. Sprawdzenie

1. Po SQL i wdrożeniu zobacz w logach Render `HeDoiX catalogue sync complete`.
2. `https://hdx-website.onrender.com/api/products` powinno zwracać status ok. Pusta lista jest poprawna dla pustej tabeli Products.
3. `/api/forms/status` powinno zwracać contact=true, newsletter=true. To potwierdza obecność konfiguracji; rzeczywisty zapis weryfikuje uprawnienia.
4. Wyślij formularz kontaktowy na własny adres — wiersz musi pojawić się w Supabase hdx_contacts, z potwierdzeniem pending w hdx_email_outbox.
5. Zapisz własny adres na ebooki/nowości — wiersz musi pojawić się w **Baserow Subscribers**, bez kopii w Supabase.
6. Opublikuj realny bezpłatny PDF w Baserow i sprawdź zsynchronizowany katalog oraz pobranie.
7. Potwierdzenia pocztowe sprawdź osobno po aktywacji właściwych dostawców.

Testy aplikacji używają symulowanego API. Schemat i funkcje SQL zostały dodatkowo sprawdzone na PostgreSQL 17 w izolowanym kontenerze ze strukturą i rolami odpowiadającymi używanym częściom Supabase. To nie jest potwierdzenie połączenia z projektem użytkownika.

Sprawdzenie można powtórzyć przez `npm run test:sql` przy działającym Dockerze. Skrypt używa przypiętego obrazu, tworzy bazę bez dostępu do sieci, wykonuje migrację dwukrotnie, uruchamia supabase/tests/schema.sql i usuwa kontener.

**Do aktywacji pozostały:** wykonanie SQL w projekcie, serwerowy klucz Supabase w Render, ID tabel Subscribers, MailQueue i EbookRequests, ich uprawnienia oraz konfiguracja Gmail w Baserow. Nie wpisano rzeczywistych kluczy ani nie wykonano migracji w Twoim projekcie.
