# Formularze i automatyczne odpowiedzi HeDoiX

Aktualna instrukcja Gmail, segmentów i zamówień konkretnych ebooków: [GMAIL-BASEROW.md](GMAIL-BASEROW.md). Dodano pole segments do Subscribers oraz tabele MailQueue i EbookRequests. Cała wysyłka odbywa się przez Gmail w Baserow; kontakty pozostają w Supabase.

**Aktualna decyzja właściciela:** subskrybenci ebooków i automatyzacje związane z zapisami zostają w Baserow. Kontakty mają trafiać do Supabase. W tym wariancie użyj poniższego schematu Subscribers i workflow powitalnego; nie twórz Contacts ani jego workflow w Baserow. Szczegóły i ustawienia są w [SUPABASE.md](SUPABASE.md). Poniższy pełny prompt opisuje alternatywę, w której oba formularze używają Baserow — dla obecnego wariantu skopiuj tylko część dotyczącą Subscribers.

Strona obsługuje dwa niezależne przepływy:

1. Kontakt → tabela `Contacts` → automatyczne potwierdzenie otrzymania zgłoszenia.
2. Zapis na nowości → tabela `Subscribers` → automatyczne powitanie.

Kod zapisuje dane przez serwer Render. E-maile wysyła **automatyzacja Baserow przez SMTP**. Klucze nie trafiają do przeglądarki. Tabela `Products` (1258474) nadal służy wyłącznie ebookom i kolorowankom.

## 1. Utwórz tabele w Baserow

W bazie **HeDoiX (591071)** utwórz dwie nowe tabele: `Contacts` i `Subscribers`. Poniższy prompt można wkleić do AI Baserow. Weryfikuj nazwy i typy pól — muszą być dokładnie takie, jak poniżej. Samo wygenerowanie tabel nie uruchamia poczty.

```text
W istniejącej bazie HeDoiX utwórz dwie puste tabele Contacts i Subscribers.
Nie zmieniaj istniejącej tabeli Products ani pozostałych baz i tabel.
Nie twórz przykładowych osób, adresów ani zgłoszeń.

W OBU tabelach utwórz pola:
name — Single line text, pole główne
email — Email
language — Single select: pl, nl
consent — Boolean, domyślnie false
consent_version — Single line text
submitted_at — Date z godziną, UTC
submission_id — Single line text
source — Single line text
confirmation_subject — Single line text
confirmation_body — Long text
confirmation_sent — Boolean, domyślnie false
confirmation_sent_at — Date z godziną, UTC, może być puste

Tylko w Contacts dodaj:
company — Single line text, opcjonalne
message — Long text
topic — Single select: business_offer, coloring, ebook, general
status — Single select: new, in_progress, closed; domyślnie new

Tylko w Subscribers dodaj:
interests — Long text
segments — Long text
active — Boolean, domyślnie false

Widoki Contacts:
Wszystkie — bez filtra
Nowe — status=new
Potwierdzenia do wysłania — consent=true i confirmation_sent=false

Widoki Subscribers:
Wszystkie — bez filtra
Aktywni — consent=true i active=true
Wypisani — active=false
Potwierdzenia do wysłania — consent=true i active=true i confirmation_sent=false

Podaj numeryczne ID obu utworzonych tabel. Nie pokazuj tokenów ani haseł.
```

## 2. Połącz Render z tabelami

W Baserow zmień uprawnienia używanego Database token:

- Products: **Read**, jak dotychczas.
- Contacts: **Read + Create**.
- Subscribers: **Read + Create**.

Read jest potrzebne do wykrywania ponowionych zgłoszeń i istniejących zapisów; Create do zapisywania nowych. Automatyzacja Baserow używa osobnego połączenia Local Baserow z dostępem do odczytu i aktualizacji tych tabel.

W **Render Dashboard → hdx-website → Environment** dodaj:

```env
BASEROW_CONTACT_TABLE_ID=ID_TABELI_CONTACTS
BASEROW_NEWSLETTER_TABLE_ID=ID_TABELI_SUBSCRIBERS
```

Pozostaw `BASEROW_API_URL`, `BASEROW_TABLE_ID=1258474` i `BASEROW_TOKEN`. Jeśli wygenerujesz nowy token, wpisz go wyłącznie w Environment. Zapisz i wdroż ponownie.

Jeżeli wcześniej ustawiono `VITE_CONTACT_ENDPOINT`, `VITE_SIGNUP_ENDPOINT` lub `VITE_WEBHOOK_URL`, usuń te zmienne i przebuduj stronę, aby używała przygotowanych endpointów Baserow. Zewnętrzne adresy nadal mają pierwszeństwo.

Status konfiguracji jest widoczny pod `https://hdx-website.onrender.com/api/forms/status`. Obie wartości `true` oznaczają obecność wymaganych ustawień. Dopiero wysłanie formularza i pojawienie się wiersza potwierdza faktyczne uprawnienia i poprawność pól.

## 3. Podłącz pocztę w Baserow

W swoim workspace dodaj aplikację **Automation**. W jej integracjach skonfiguruj **SMTP** i **Local Baserow**. Dane SMTP wpisuj tylko w panelu Baserow. Nadawca musi być adresem dozwolonym przez usługę pocztową.

Wybór dostawcy poczty jest jeszcze potrzebny. Można użyć istniejącej skrzynki obsługującej SMTP albo usługi pocztowej. Dla Gmail potrzebne są włączona weryfikacja dwuetapowa i hasło aplikacji, jeśli konto udostępnia tę funkcję; administrator może ją zablokować. Nie używaj zwykłego hasła Google i nie wysyłaj hasła aplikacji na czacie.

Jeśli wybierzesz Gmail, ustawienia SMTP to `smtp.gmail.com`, port `587`, TLS włączony; użytkownik i adres nadawcy to Twoja skrzynka. Gmail nadaje się do potwierdzeń na początek; ma limity wysyłki. Masowe kampanie newslettera wymagają osobnej konfiguracji dostawcy.

## 4. Automatyzacja „Potwierdzenie zgłoszenia”

Utwórz workflow z tym przepływem:

```text
Rows created: Contacts
    → Iterator po utworzonych wierszach, jeśli trigger zwraca listę
    → Warunek: consent=true, confirmation_sent=false, source=website_contact
    → Send email (SMTP)
    → Update row: confirmation_sent=true, confirmation_sent_at=czas wysłania
```

Używaj danych **bieżącego wiersza** w iteratorze. W akcji SMTP ustaw:

| Pole akcji | Wartość |
|---|---|
| From name | HeDi / HeDoiX |
| From email | Dozwolony adres nadawcy z integracji SMTP |
| To | `email` bieżącego wiersza |
| Subject | `confirmation_subject` bieżącego wiersza |
| Body type | Plain text |
| Body | `confirmation_body` bieżącego wiersza |

W Update row wybierz tę samą tabelę i ID bieżącego wiersza. Aktualizacja musi być wykonywana **po udanej akcji SMTP**. `confirmation_sent` oznacza przyjęcie wiadomości przez SMTP, a nie potwierdzone doręczenie do skrzynki. Trigger dotyczy tworzenia wierszy, więc aktualizacja flagi nie uruchamia pętli.

Domyślny temat PL: **HeDoiX — otrzymaliśmy Twoje zgłoszenie**.

Domyślna treść PL:

```text
Dziękujemy za wiadomość! Otrzymaliśmy Twoje zgłoszenie.
Zespół HeDoiX skontaktuje się z Tobą.

To automatyczne potwierdzenie przyjęcia wiadomości.
Nie zapisuje Cię do newslettera.

HeDi i zespół HeDoiX
Hedoix10@gmail.com
```

Serwer przygotowuje również wersję NL na podstawie języka strony. Nie dołącza oryginalnej wiadomości klienta do automatycznego potwierdzenia.

## 5. Automatyzacja „Powitanie subskrybenta”

Drugi workflow ma identyczną akcję SMTP, lecz inną tabelę i warunek:

```text
Rows created: Subscribers
    → Iterator po utworzonych wierszach, jeśli trigger zwraca listę
    → Warunek: consent=true, active=true, confirmation_sent=false, source=website_newsletter
    → Send email (SMTP): email / confirmation_subject / confirmation_body
    → Update row: confirmation_sent=true, confirmation_sent_at=czas wysłania
```

Domyślny temat PL: **HeDoiX — dziękujemy za zapis na nowości**.

```text
Dziękujemy za zapis na nowości HeDoiX!
Będziemy informować Cię o nowych projektach i materiałach
zgodnych z Twoimi zainteresowaniami.

Możesz zrezygnować, wysyłając e-mail na Hedoix10@gmail.com
z tematem Wypisz mnie.

HeDi i zespół HeDoiX
```

To potwierdzenie zapisu, bez mechanizmu double opt-in ani automatycznej kampanii. Nie wysyła fikcyjnego ebooka lub linku. Gdy ktoś poprosi o wypisanie, ustaw `active=false`. Przyszłe kampanie muszą wybierać wyłącznie `consent=true` i `active=true`.

Ponowny zapis tego samego e-maila nie tworzy nowego wiersza, nie wysyła ponownego powitania i nie włącza wcześniej wypisanej osoby. Zmiany zainteresowań lub ponowną aktywację obsługuje właściciel po potwierdzeniu aktualnej prośby. Formularz odpowiada jednakowo dla nowych i istniejących adresów, aby nie ujawniać bazy subskrybentów.

## 6. Uruchomienie i sprawdzenie

Skonfiguruj integracje, zmapuj dane i opublikuj oba workflow w Baserow. Aktywne automatyzacje reagują na nowe zgłoszenia; wcześniej utworzone wiersze nie są automatycznie odtwarzane.

1. Wyślij formularz kontaktowy ze strony na własny adres e-mail. Sprawdź nowy wiersz Contacts, historię workflow i potwierdzenie w skrzynce.
2. Zapisz własny adres na nowości. Sprawdź Subscribers, język, zainteresowania i potwierdzenie.
3. Spróbuj ponownie z tym samym e-mailem: nie powinno być drugiego subskrybenta ani drugiego powitania.
4. Ustaw `active=false` i sprawdź, że ten adres zniknie z widoku Aktywni.
5. W razie błędu SMTP wiersz zostaje zapisany z `confirmation_sent=false`. Sprawdź historię automatyzacji i popraw integrację. Jeżeli SMTP przyjęło wiadomość, ale aktualizacja flagi się nie powiodła, sprawdź historię przed ponowną wysyłką — ponowienie całego workflow może wysłać drugi e-mail.

Ochrona przed równoczesnymi duplikatami działa na jednej instancji Render. Przy wielu instancjach lub ręcznych importach potrzebne jest dodatkowe wymuszenie unikalności w bazie. Limity formularzy: 5 prób na IP i 100 łącznie na 10 minut, najwyżej 4 żądania równocześnie na instancję. Dane klientów i błędy dostawców nie są wypisywane w logach aplikacji.

Schemat API sprawdzono w oficjalnym `https://api.baserow.io/api/schema.json`: dostępne są triggery `local_baserow_rows_created`, akcje `smtp_email` i `local_baserow_update_row`, integracja SMTP z TLS oraz filtrowanie po nazwie pola. Rzeczywista dostępność w workspace i limity zależą od konta.

**Status przygotowania:** kod i instrukcje są gotowe. Utworzenie tabel, wpisanie ich ID na Render oraz konfiguracja i publikacja workflow SMTP wymagają dostępu do Twojego panelu Baserow/Render. Nie wykonano rzeczywistej wysyłki e-mail ani zapisu testowej osoby do Twojej bazy.
