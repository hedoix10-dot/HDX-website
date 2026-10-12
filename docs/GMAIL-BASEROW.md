# Gdzie wpisać dane — Gmail, formularze i ebooki

**Cała poczta wychodzi z Twojego Gmaila przez Baserow.** Kontakty są w Supabase, a subskrybenci i zamówienia ebooków w Baserow. Render Free blokuje porty SMTP 25/465/587, dlatego hasło Gmail wpisujesz **tylko w Baserow**, nie w Render.

## 1. Gmail w Baserow

Google → włącz weryfikację dwuetapową → [Hasła aplikacji](https://myaccount.google.com/apppasswords) → wygeneruj hasło dla Baserow. Jeśli konto nie udostępnia tej funkcji, sprawdź ustawienia/zasady konta Google. Nie używaj zwykłego hasła konta.

Baserow → aplikacja Automation → Integrations → SMTP:

| Pole | Wartość |
|---|---|
| Host | smtp.gmail.com |
| Port | 587 |
| TLS | włączone |
| Username | Twój Gmail, np. Hedoix10@gmail.com |
| Password | hasło aplikacji Google, wyłącznie w tym panelu |

## 2. Tabele Baserow — prompt do AI

W bazie HeDoiX wklej prompt. Jeśli któraś tabela już istnieje, dodaj tylko brakujące pola i widoki, zachowując jej dane. Nazwy pól muszą być dokładne.

```text
W bazie HeDoiX przygotuj trzy tabele: Subscribers, MailQueue, EbookRequests.
Nie zmieniaj tabeli Products. Zachowaj istniejące dane. Nie dodawaj fikcyjnych osób.

Subscribers:
name — Single line text, główne
email — Email
language — Single select: pl, nl
interests — Long text
segments — Long text
active — Boolean, domyślnie false
consent — Boolean, domyślnie false
consent_version — Single line text
submitted_at — Date z godziną UTC
submission_id — Single line text
source — Single line text
confirmation_subject — Single line text
confirmation_body — Long text
confirmation_sent — Boolean, domyślnie false
confirmation_sent_at — Date z godziną UTC

Widoki Subscribers:
Aktywni: consent=true i active=true
Kolorowanki: consent=true, active=true i segments zawiera coloring
Ebooki: consent=true, active=true i segments zawiera ebook
Niderlandzki: consent=true, active=true i segments zawiera dutch_learning
Firmy: consent=true, active=true i segments zawiera business_automation
Potwierdzenia: consent=true, active=true i confirmation_sent=false

MailQueue:
job_id — Single line text, główne
recipient — Email
subject — Single line text
body — Long text
source — Single line text
created_at — Date z godziną UTC
sent — Boolean, domyślnie false
sent_at — Date z godziną UTC
Widoki: Do wysłania (sent=false), Wysłane (sent=true)

EbookRequests:
name — Single line text, główne
email — Email
book_id — Single line text
book_title — Single line text
language — Single select: pl, nl
consent — Boolean, domyślnie false
consent_version — Single line text
submitted_at — Date z godziną UTC
submission_id — Single line text
source — Single line text
owner_subject — Single line text
owner_body — Long text
notification_sent — Boolean, domyślnie false
notification_sent_at — Date z godziną UTC
fulfilled — Boolean, domyślnie false
fulfilled_at — Date z godziną UTC
Widoki: Do obsługi (fulfilled=false), Wysłane ebooki (fulfilled=true)

W EbookRequests dodaj widoki filtrowane po book_id:
Gramatyka: trening-gramatyczny-czasowniki
Podstawy: podstawy-nederlands-leren

Podaj numeryczne ID trzech tabel. Nie pokazuj tokenów ani haseł.
```

Zapis na nowości wymaga oddzielnej zgody marketingowej. Zamówienie pojedynczego ebooka służy tylko jego wysyłce — nie zapisuje automatycznie osoby do newslettera.

## 3. ID i token w Render

Render → hdx-website → Environment → Add Environment Variable:

| Key | Value |
|---|---|
| BASEROW_NEWSLETTER_TABLE_ID | ID Subscribers |
| BASEROW_EMAIL_TABLE_ID | ID MailQueue |
| BASEROW_EBOOK_REQUEST_TABLE_ID | ID EbookRequests |
| BASEROW_TOKEN | Database token z Read + Create na tych tabelach i Read na Products |

Tabela MailQueue musi być osobna od Products, Subscribers i EbookRequests. Token ustawiaj tylko w panelu. Zapisz i wdroż ponownie. Nie wpisuj hasła Gmail w Render.

Kontakty w Supabase wymagają SQL i klucza opisanych w [SUPABASE.md](SUPABASE.md). Zewnętrzne VITE_* adresy formularzy mają pierwszeństwo; pozostaw je puste dla przygotowanej integracji. `/api/forms/ebook/status` sprawdza konfigurację zamówień ebooków.

## 4. Trzy automatyzacje Baserow

**Potwierdzenie newslettera:** Rows created Subscribers → iterator bieżących wierszy, jeśli trigger zwraca listę → warunek consent=true, active=true, confirmation_sent=false → SMTP To=email, Subject=confirmation_subject, Body=confirmation_body, Plain text → Update row confirmation_sent=true i czas wysyłki. Treść zawiera wybrane zainteresowania w języku użytkownika. Jedna osoba może wybrać kilka segmentów i dostaje jedno potwierdzenie.

**Potwierdzenie kontaktu firmowego:** Rows created MailQueue → iterator → warunek sent=false i source=contact_confirmation → SMTP To=recipient, Subject=subject, Body=body, Plain text → Update row sent=true, sent_at=czas wysyłki. Render po wykryciu tej flagi aktualizuje potwierdzenie w Supabase. Sam zapis do MailQueue nie oznacza wysłania e-maila. job_id zapewnia wykrywanie ponowień; nie twórz ręcznie jego duplikatów.

**Powiadomienie o zamówieniu ebooka:** Rows created EbookRequests → iterator → warunek consent=true i notification_sent=false → SMTP To=Twój Gmail (np. Hedoix10@gmail.com), Subject=owner_subject, Body=owner_body, Plain text → Update row notification_sent=true i czas wysyłki. Powiadomienie zawiera tytuł oraz adres osoby zamawiającej, zgodnie z prośbą właściciela.

W każdej akcji ustaw From name HeDi / HeDoiX oraz From email ten sam Gmail, którego używa integracja SMTP. Opublikuj workflow po skonfigurowaniu mapowań. Nie używaj triggera Rows updated bez warunków, aby aktualizacja flag nie uruchamiała pętli.

## 5. Odpowiedź z ebookiem — przygotowuje właściciel

Dwa ebooki mają na stronie przycisk bezpośredniego pobrania oraz opcjonalny link do formularza:

- `/ebooki/trening-gramatyczny-czasowniki` — E-book Trening Gramatyczny i Czasowniki.
- `/ebooki/podstawy-nederlands-leren` — E-Book PODSTAWY Nederlands leren.

Publiczne adresy przesłanych PDF-ów do użycia w automatycznej odpowiedzi:

- `book_id=trening-gramatyczny-czasowniki`: https://hdx-website.onrender.com/ebooks/trening-gramatyczny-czasowniki.pdf
- `book_id=podstawy-nederlands-leren`: https://hdx-website.onrender.com/ebooks/podstawy-nederlands-leren.pdf

Własną odpowiedź możesz dodać w Baserow jako kolejny krok SMTP skierowany do **email klienta**, z warunkiem book_id i odpowiednim linkiem powyżej. Ostatni krok ustawia fulfilled=true i datę po udanej wysyłce. Powiadomienie właściciela (`owner_body`) zawiera również link do wybranego PDF-u. Wbudowana akcja SMTP w sprawdzonym schemacie Baserow ma temat i treść; załączniki nie są w niej udostępnione. Jeśli wymagane są załączniki zamiast linków, trzeba skonfigurować osobną obsługę Gmaila/załączników. Sama publikacja PDF-ów nie włącza workflow Gmail ani nie zapisuje pobierających do newslettera.

Na razie bez skonfigurowanej tabeli strona przygotowuje e-mail do ręcznego wysłania i wyraźnie to opisuje. Po konfiguracji zapisuje zgłoszenie w EbookRequests, a rzeczywiste wiadomości wysyła aktywna automatyzacja. Przetestuj na swoim adresie każdy z trzech przepływów.

## 6. Obsługa błędów

SMTP sent oznacza przyjęcie przez Gmail, nie potwierdzenie doręczenia. W razie błędu w Baserow sprawdź historię workflow. Jeśli Gmail przyjął wiadomość, ale zapis flagi się nie powiódł, sprawdź historię przed ponowieniem, aby nie wysłać jej drugi raz.

Bridge z Supabase sprawdza MailQueue z opóźnieniem i ponawia odczyt z odstępem, maksymalnie 5 razy; wysłanie SMTP nie jest ponawiane przez tworzenie kolejnych wierszy. Brak działającego workflow zostawia wiersz Baserow do obsługi i może zakończyć oczekiwanie w Supabase statusem failed. Po naprawie sprawdź obie kolejki przed ręcznym ponowieniem.

Na Render Free zadania w tle zatrzymują się podczas uśpienia; po wybudzeniu wznawiają odczyt kolejek. Ograniczenie SMTP potwierdzono w [oficjalnej dokumentacji Render](https://render.com/docs/free).
