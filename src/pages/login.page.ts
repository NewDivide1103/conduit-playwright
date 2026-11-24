import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly path = '/login';

  // `level` separates the heading from the nav link and the button with the same text.
  readonly heading = this.page.getByRole('heading', { name: 'Sign in', level: 1 });
  // The inputs have no <label>; the placeholder becomes the accessible name.
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email' });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  readonly submitButton = this.page.getByRole('button', { name: 'Sign in' });
  readonly signUpLink = this.page.getByRole('link', { name: 'Need an account?' });
  // CSS on purpose: the error <ul> has no accessible name or test id, and a role locator
  // can't tell it apart from the nav list. The class is part of the RealWorld markup spec.
  readonly errorMessages = this.page.locator('.error-messages').getByRole('listitem');

  async fillForm(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillForm(email, password);
    await this.submitButton.click();
  }
}
