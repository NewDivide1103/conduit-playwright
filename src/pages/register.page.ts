import type { NewUser } from '../data/user.factory';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  readonly path = '/register';

  readonly heading = this.page.getByRole('heading', { name: 'Sign up', level: 1 });
  readonly usernameInput = this.page.getByRole('textbox', { name: 'Username' });
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email' });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  // Role `button` excludes the nav link with the same text.
  readonly submitButton = this.page.getByRole('button', { name: 'Sign up' });
  readonly signInLink = this.page.getByRole('link', { name: 'Have an account?' });
  // CSS on purpose, see LoginPage.errorMessages.
  readonly errorMessages = this.page.locator('.error-messages').getByRole('listitem');

  async fillForm(user: Partial<NewUser>): Promise<void> {
    await this.usernameInput.fill(user.username ?? '');
    await this.emailInput.fill(user.email ?? '');
    await this.passwordInput.fill(user.password ?? '');
  }

  async register(user: NewUser): Promise<void> {
    await this.fillForm(user);
    await this.submitButton.click();
  }
}
