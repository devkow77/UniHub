# UniHub

## Aktualnie zrobione

### Backend

- [x] Rejestracja użytkowników.
- [x] Hashowanie haseł przez Argon2.
- [x] Logowanie i JWT.
- [x] Access i refresh tokens w HttpOnly cookies.
- [x] Odświeżanie tokenów i rotacja refresh tokenów.
- [x] Wylogowanie i unieważnianie refresh tokenów.
- [x] Ochrona CSRF.
- [x] Chronione endpointy.
- [x] Pobieranie aktualnego profilu z PostgreSQL.
- [x] Weryfikacja, czy konto jest aktywne.
- [x] Edycja profilu użytkownika (`PATCH /users/me`).
- [x] Zmiana hasła z weryfikacją obecnego hasła.
- [x] Unieważnianie pozostałych sesji po zmianie hasła.
- [x] Wystawianie nowych tokenów po zmianie hasła.
- [x] Publiczne profile użytkowników (`GET /users/:id`).
- [x] Ukrywanie adresów e-mail w publicznych profilach.
- [x] Ukrywanie profili nieaktywnych kont.
- [x] Pobieranie listy aktywnych użytkowników (`GET /users`).
- [x] Paginacja listy użytkowników (`page`, `limit`).
- [x] Ograniczenie maksymalnego limitu do 100 użytkowników.
- [x] Metadane paginacji (`total`, `page`, `limit`, `totalPages`).
- [x] Sortowanie użytkowników od najnowszych.

### Baza danych i infrastruktura

- [x] PostgreSQL uruchamiany przez Docker.
- [x] Prisma ORM 7.
- [x] Modele `User` i `RefreshToken`.
- [x] Migracje bazy danych.
- [x] Połączenie NestJS z PostgreSQL przez Prisma Adapter.
- [x] Globalny `PrismaModule` w NestJS.

### Frontend

- [ ] W trakcie realizacji.
