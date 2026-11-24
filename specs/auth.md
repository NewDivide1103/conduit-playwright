# Sign up and logout: test plan

Backlog cases 1 and 5, written with Page Objects and fixtures (roadmap stage 3). Login (case 2) is in
[`login.md`](login.md).

## Sign up (case 1)

Implemented in [`tests/ui/register.spec.ts`](../tests/ui/register.spec.ts) with
[`RegisterPage`](../src/pages/register.page.ts). Runs logged out (`LOGGED_OUT`).

| #   | Scenario                                     | Data                   | Expected result                                                                                          | Tags                    |
| --- | -------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1.1 | Sign up with valid data                      | `buildUser()` (unique) | Redirect to `/`; nav shows the username and **New Article**, no **Sign up**; `localStorage.jwtToken` set | `@smoke`, `@regression` |
| 1.2 | **Sign up** is disabled until form is filled | `buildUser()`          | Disabled when empty and with username + email only; enabled once the password is filled                  | `@regression`           |

Negative sign-up cases (taken email/username, invalid fields) are parameterized in stage 4 (case 4). Error messages
render as `email has already been taken` / `username has already been taken` in the same `.error-messages` list as
on the login page.

## Logout (case 5)

Implemented in [`tests/ui/logout.spec.ts`](../tests/ui/logout.spec.ts) with
[`SettingsPage`](../src/pages/settings.page.ts). Starts logged in through the shared storageState (`authedUser`).

| #   | Scenario                  | Expected result                                                                                                        | Tags                    |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 5.1 | Log out from **Settings** | Redirect to `/`; nav shows **Sign in** / **Sign up**, no username; `jwtToken` removed; still logged out after a reload | `@smoke`, `@regression` |

Conduit's JWT is stateless: logging out only clears this browser context's localStorage, so other tests that share
the same token are not affected.

## Locators

| Page        | Element      | Locator                                                               |
| ----------- | ------------ | --------------------------------------------------------------------- |
| `/register` | Heading      | `getByRole('heading', { name: 'Sign up', level: 1 })`                 |
| `/register` | Inputs       | `getByRole('textbox', { name: 'Username' \| 'Email' \| 'Password' })` |
| `/register` | Submit       | `getByRole('button', { name: 'Sign up' })` (the nav item is a link)   |
| `/settings` | Heading      | `getByRole('heading', { name: 'Your Settings', level: 1 })`           |
| `/settings` | Logout       | `getByRole('button', { name: 'Or click here to logout.' })`           |
| any         | Header links | `NavBar`: `getByRole('navigation').getByRole('link', …)`              |
