# Weryfikacja — 12 października 2026

- Node 24.19.0, npm 11.9.0.
- Obecna wersja jest oparta na `hedoix-vite-clone.zip`: React 18.3.1, TypeScript 5.9.3, React Router 6.30.6, Vite 5.4.21. Grafiki z paczki początkowo zachowano bez zmian (SHA-256). Następnie zdjęcia hero/close-up i dashboard uaktualniono do wersji 1024 × 1024 zgodnych z grafikami wskazanymi przez użytkownika.
- Instalacja powtarzalna: `npm ci --include=dev --cache /workspace/.npm --no-audit --no-fund` zakończona powodzeniem, bez zmiany lockfile.
- Produkcyjny `npm run build` (kontrola TypeScript + Vite): PASS.
- `npm test`: **20 PASS**, 0 FAIL, 0 SKIP — 11 testów API (w tym OpenAI) i 9 testów Chromium.
- Zweryfikowano PL/NL i zapamiętanie języka, wszystkie sekcje, grafikę hero z paczki, formularze z wymaganą zgodą i przygotowaniem e-maila, czat przez API z historią i obsługą błędów, filtrowanie katalogu, rozmieszczenie darmowych ebooków w Edukacji, mobilne menu, brak przewijania w poziomie przy 390 i 320 px oraz bezpośrednie wejście na politykę prywatności.
- Testy API sprawdziły filtrowanie nieopublikowanych rekordów, ukrywanie linku płatnych plików, cache, stronicowanie, odrzucanie niebezpiecznych adresów i brak ujawnienia tokenu.
- Uruchomiony serwer produkcyjny oraz Vite z proxy API: `/api/health` zwraca `status: ok` w obu trybach.
- Bez ustawień Baserow `/api/products` zwraca `status: not_configured` i pustą listę; katalog dynamiczny jest ukryty, a zapowiedzi pozostają widoczne.
- Dostęp do Baserow Cloud potwierdzono przez odpowiedź 401 z endpointu API bez tokenu. Nie oznacza to dostępu do tabeli.
- Dostęp do OpenAI potwierdzono odpowiedzią HTTP 401 bez klucza. Serwer i proxy Vite zwracają `/api/chat/status` z `enabled: false`, ponieważ brak rzeczywistego klucza. Testy używają symulowanych odpowiedzi Responses API i sprawdzają brak wycieku klucza, walidację, limity, błędy oraz interfejs rozmowy. Żywa odpowiedź modelu pozostaje do weryfikacji po dodaniu klucza.

## Pozostałe kroki zewnętrzne

1. Utworzyć tabelę Baserow według `BASEROW.md`, dodać token Read i ID w ustawieniach, następnie sprawdzić pierwszy opublikowany produkt. Testy katalogu używały symulowanych odpowiedzi, nie żywej bazy.
2. Kod jest przygotowany do gałęzi `main`. Publikację na GitHub potwierdza wynik operacji Git i historia repozytorium. Następnie utworzyć usługę Render zgodnie z `RENDER.md`; wdrożenie Render pozostaje po stronie użytkownika.
3. Jeśli potrzebna jest bezpośrednia wysyłka formularzy, aktywować Formspree i sprawdzić dostarczenie wiadomości. Domyślny e-mail draft został przetestowany.
4. Przejrzeć i zapisać konfigurację w ustawieniach środowiska chmurowego, następnie opublikować środowisko. Zapisane instrukcje nie oznaczają publikacji ani sprawdzenia przywrócenia w nowym zadaniu.
5. Dodać `HEDI_OPENAI_API_KEY` w Render Environment i wykonać ponowne wdrożenie. Model domyślny to `gpt-4.1-mini`.
6. Wgrać rzeczywiste PDF-y do Baserow. Darmowe ebooki do nauki niderlandzkiego: `section=education`, `category=ebook`, `price=0`, `published=true`. W kodzie i testach nie ma rzeczywistych plików ebooków użytkownika.
