# Universal Marketplace

## Opis projektu
Universal Marketplace to nowoczesna, pełnostackowa platforma typu marketplace dla produktów i usług. Projekt umożliwia użytkownikom przeglądanie ofert, dodawanie przedmiotów do koszyka, zarządzanie własnym profilem oraz wystawianie i przeglądanie opinii. 

Platforma rozwiązuje problem rozproszenia usług i produktów na rynku, dostarczając zunifikowane miejsce dla transakcji C2C (Client-to-Client) oraz B2B (Business-to-Business).

## Funkcjonalności
- **Uwierzytelnianie:** Bezpieczne logowanie i rejestracja oparte na tokenach JWT.
- **Marketplace:** Zaawansowane przeglądanie ofert z możliwością filtrowania (typ, wyszukiwanie tekstowe, tagi) oraz stronicowaniem wyników.
- **System Koszyka:** Dodawanie ofert do koszyka, zarządzanie ich ilością oraz proces realizacji zamówienia (checkout).
- **Zarządzanie profilem:** Podgląd i edycja danych użytkownika, a także dostęp do wystawionych ofert i zebranych opinii.
- **System opinii:** Możliwość wystawiania ocen i komentarzy innym użytkownikom z opcją odpowiedzi.

## Technologie

Projekt składa się z dwóch głównych części (Backend i Frontend), opartych o nowoczesny stack technologiczny:

### Frontend (klient)
- **Framework:** Angular 21 (Standalone components, Signals)
- **Zarządzanie stanem:** Scentralizowany serwis `State` z wykorzystaniem Angular Signals
- **Styling:** Tailwind CSS + Angular Material
- **API i autoryzacja:** `HttpClient` z funkcyjnym interceptorem JWT
- **Testowanie:** Vitest

### Backend (serwer) - *osobne repozytorium/moduł*
- **Framework:** Spring Boot 4.0.4, Java 25
- **Architektura:** Warstwowa (Controller -> Service -> Repository), RESTful API
- **Baza danych:** PostgreSQL (komunikacja przez JPA/Hibernate)
- **Mapowanie obiektów:** MapStruct
- **Zabezpieczenia:** Spring Security z JWT
- **Dokumentacja API:** OpenAPI/Swagger (SpringDoc)

## Instalacja

Aby uruchomić projekt lokalnie, wykonaj poniższe kroki. Poniższa instrukcja dotyczy aplikacji frontendowej.

### Wymagania
- [Node.js](https://nodejs.org/) (zalecana najnowsza wersja LTS)
- [npm](https://www.npmjs.com/) lub [Yarn](https://yarnpkg.com/)
- Działający backend Universal Marketplace (Java/Spring Boot) na domyślnym porcie.

### Kroki uruchomienia
1. Sklonuj repozytorium:
   ```bash
   git clone <adres-repozytorium>
   cd universal-marketplace-fe
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   ```

3. Skonfiguruj środowisko (opcjonalnie):
   Upewnij się, że adres URL backendu w plikach środowiskowych Angulara (np. `src/environments/environment.ts`) wskazuje na poprawne lokalne API (domyślnie `/api`).

4. Uruchom serwer deweloperski:
   ```bash
   npm run start
   # lub
   ng serve
   ```
5. Aplikacja będzie dostępna pod adresem: `http://localhost:4200/`

## Użycie

Po uruchomieniu aplikacji frontendowej i backendowej, użytkownik może:
1. Zarejestrować się jako nowy klient lub sprzedawca.
2. Zalogować się, by otrzymać token JWT.
3. Przeglądać oferty dostępne na głównej stronie, korzystać z wyszukiwarki i filtrów.
4. Dodać wybrane usługi lub produkty do koszyka i przejść do podsumowania.
5. Sprawdzić panel swojego profilu w prawym górnym rogu, aby zaktualizować dane i przejrzeć opinie.

## Struktura projektu

Struktura frontendu (Angular) oparta jest na nowoczesnych standardach standalone:
- `src/app/` - główny katalog logiki biznesowej i widoków
  - `components/` - rezywalne, generyczne komponenty interfejsu (np. przyciski, karty)
  - `features/` - główne funkcjonalności (auth, marketplace, cart, profile)
  - `core/` - serwisy rdzenne, interceptory (JWT), główny stan aplikacji (`State` service)
  - `styles/` - pliki konfiguracyjne Tailwind CSS i bazowe style

## Testy

Projekt wykorzystuje nowoczesny runner Vitest w połączeniu z Angular.
Aby uruchomić testy jednostkowe, wpisz w konsoli:
```bash
npm run test
```
