import { BasePage } from './base.page';

export class SettingsPage extends BasePage {
  readonly path = '/settings';

  readonly heading = this.page.getByRole('heading', { name: 'Your Settings', level: 1 });
  readonly logoutButton = this.page.getByRole('button', { name: 'Or click here to logout.' });

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
