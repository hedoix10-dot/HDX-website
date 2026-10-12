# Podłączenie Render

## Dane do formularza New → Web Service

| Pole | Wartość |
|---|---|
| Repozytorium | `https://github.com/hedoix10-dot/HDX-website` |
| Branch | `main` |
| Name | `hedoix-website` lub własna dostępna nazwa |
| Runtime / Language | Node |
| Root Directory | puste — pliki projektu mają być w głównym katalogu repozytorium |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| Node | `24.19.0`, automatycznie z `.node-version` |
| Instance Type | Free na start; płatny plan, jeśli serwer ma działać bez usypiania |

**Nie wybieraj Static Site:** dostęp do Baserow wymaga serwera, aby token nie trafił do przeglądarki. Nie ustawiaj ręcznie portu — Render dostarcza `PORT`, a serwer nasłuchuje na `0.0.0.0`.

## Wybór repozytorium i aktualizacje

W Render wybierz repozytorium `hedoix10-dot/HDX-website` i gałąź `main`. Pliki projektu znajdują się w głównym katalogu, więc Root Directory pozostaw puste. Następnie utwórz Web Service z ustawieniami podanymi powyżej.

Przy kolejnych zmianach kodu na gałęzi `main`:

```sh
git add .
git commit -m "Update HeDoiX website"
git push origin main
```

Automatyczne wdrażanie na Render jest ustawione na nowe commity. Nie używaj force push. Publikacja kodu na GitHub i utworzenie usługi Render to osobne kroki; rzeczywisty adres strony nada Render po wdrożeniu.

## Zmienne Environment

| Nazwa | Wartość | Wymaganie |
|---|---|---|
| `NODE_ENV` | `production` | Zalecane |
| `BASEROW_API_URL` | `https://api.baserow.io` | Baserow Cloud |
| `BASEROW_TABLE_ID` | ID tabeli `Products` | Do uruchomienia katalogu |
| `BASEROW_TOKEN` | Token Baserow z uprawnieniem Read do tej tabeli | Poufna wartość, wpisz wyłącznie w panelu |
| `VITE_CONTACT_ENDPOINT` | Adres formularza Formspree | Opcjonalne |
| `VITE_SIGNUP_ENDPOINT` | Adres formularza Formspree | Opcjonalne |
| `VITE_WEBHOOK_URL` | Publiczny adres API lub webhooka wspólny dla formularzy | Opcjonalne; oddzielne adresy mają pierwszeństwo |
| `HEDI_OPENAI_API_KEY` | Twój klucz OpenAI, wyłącznie w panelu Environment | Do rozmowy z HeDi |
| `HEDI_OPENAI_MODEL` | `gpt-4.1-mini` | Opcjonalne; model domyślny |

Nigdy nie umieszczaj tokenu w kodzie, repozytorium ani wiadomości na czacie. W Render wpisujesz rzeczywisty token; konfiguracja sekretu w środowisku Codex nie przenosi go automatycznie do Render. Zmiany `VITE_*` wymagają przebudowania; ustawienia Baserow są czytane przez serwer przy uruchomieniu.

Zmienne wpisujesz w **Render Dashboard → wybierz usługę `hedoix-website` → Environment → Add Environment Variable**. Zapisz je i wdroż ponownie. Szczegóły plików i formatów żądań są w `INTEGRACJE.md`.

Możesz najpierw wdrożyć stronę bez ustawień Baserow — biblioteka będzie pusta i pokaże zapowiedź publikacji. Gdy utworzysz tabelę, uzupełnij zmienne i uruchom ponownie usługę.

## Alternatywa: Blueprint

Render → New → Blueprint → wybierz repozytorium. Render odczyta `render.yaml`. Podczas tworzenia wpisz `BASEROW_TABLE_ID` i `BASEROW_TOKEN`, oznaczone `sync: false`. Jeśli tabela jeszcze nie istnieje i chcesz już opublikować stronę, użyj ręcznego Web Service i uzupełnij Baserow później.

## Sprawdzenie po wdrożeniu

Render nada własny adres usługi — sprawdź go w panelu, nie zakładaj konkretnej nazwy domeny.

1. Otwórz stronę i przełącz PL/NL.
2. Sprawdź bezpośrednie wejście na `/polityka-prywatnosci`.
3. `/api/health` ma zwracać `{"status":"ok"}`.
4. Po podłączeniu Baserow `/api/products` ma zwracać `status: "ok"`; zobacz pierwszy opublikowany produkt.
5. Sprawdź pobranie darmowego PDF. Odpowiedź API nie powinna zawierać tokenu ani linku do płatnego pliku.
6. Formularz e-mail wymaga wysłania w programie pocztowym; jeśli aktywujesz Formspree, sprawdź otrzymanie zgłoszenia.

Oficjalne instrukcje: https://render.com/docs/deploy-node-express-app oraz https://render.com/docs/blueprint-spec.
