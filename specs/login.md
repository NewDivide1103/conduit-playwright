# Login: test plan and locator practice

Backlog case 2. Implemented in [`tests/ui/login.spec.ts`](../tests/ui/login.spec.ts). Written without Page Objects
in roadmap stage 2 to practice locators; since stage 3 the locators below live in
[`LoginPage`](../src/pages/login.page.ts) and [`NavBar`](../src/components/nav-bar.component.ts). The parameterized
negative cases (case 3) come in stage 4.

## Scenarios

| #   | Scenario                                     | Data                          | Expected result                                                                                          | Tags                    |
| --- | -------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------- |
| 2.1 | Log in with valid credentials                | New user registered via API   | Redirect to `/`; nav shows the username and **New Article**, no **Sign in**; `localStorage.jwtToken` set | `@smoke`, `@regression` |
| 2.2 | **Sign in** is disabled until form is filled | Any email + password          | Disabled when empty and with email only; enabled once both fields are filled                             | `@regression`           |
| 2.3 | Wrong password                               | Registered user, bad password | Error `email or password is invalid`; stays on `/login`; still logged out                                | `@regression`           |

All tests run logged out: `test.use({ storageState: LOGGED_OUT })`. The user is created via the API by the `newUser`
fixture.

## Locators on `/login`

What the page exposes to the accessibility tree (from `locator('body').ariaSnapshot()`):

```yaml
- heading "Sign in" [level=1]
- link "Need an account?"
- list:
    - listitem: email or password is invalid # only after a failed login
- group:
    - textbox "Email"
    - textbox "Password"
    - button "Sign in" [disabled]
```

| Element       | Chosen locator                                        | Why                                                                                           |
| ------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Heading       | `getByRole('heading', { name: 'Sign in', level: 1 })` | `level` separates it from the **Sign in** nav link and button                                 |
| Email         | `getByRole('textbox', { name: 'Email' })`             | No `<label>`, but the placeholder becomes the accessible name, so the role locator works      |
| Password      | `getByRole('textbox', { name: 'Password' })`          | Same; `type="password"` inputs still have the `textbox` role                                  |
| Submit        | `getByRole('button', { name: 'Sign in' })`            | Role `button` excludes the nav **link** with the same text                                    |
| Error message | `locator('.error-messages').getByRole('listitem')`    | The `<ul>` has no name or test id; CSS scopes it, `toHaveText([...])` checks the full list    |
| Nav links     | `getByRole('navigation').getByRole('link', …)`        | Chaining scopes the search to the header, so footer/body links with the same name don't match |

Rejected alternatives: `getByPlaceholder('Email')` (works, but lower priority than role), `getByLabel('Email')`
(fails: there is no label), `input[formcontrolname="email"]` (Angular implementation detail),
`getByText('Sign in')` (strict mode violation: matches the nav link, heading and button).

## Practice exercises

1. Run `npm run codegen`, open **Sign in**, record the login flow and compare the generated locators with the table.
2. In VS Code, use **Pick locator** (Playwright sidebar) on each element and note when it suggests a different one.
3. Break strictness on purpose: replace the button locator with `page.getByText('Sign in')`, run the test and read
   the strict mode error, which lists every match.
4. Run the spec headed and repeated to check stability: `npx playwright test tests/ui/login.spec.ts --headed --repeat-each 5 --project=chromium`.
5. Open the trace of a run (`--trace on`, then `npm run report`) and inspect the action log and DOM snapshots.
