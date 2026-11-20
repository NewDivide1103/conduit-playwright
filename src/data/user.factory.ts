import { faker } from '@faker-js/faker';

export interface NewUser {
  username: string;
  email: string;
  password: string;
}

/** Унікальний користувач для кожного прогону — тести не залежать один від одного. */
export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const suffix = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    username: `pw_${suffix}`,
    email: `pw_${suffix}@test.dev`,
    password: faker.internet.password({ length: 12, prefix: 'Aa1!' }),
    ...overrides,
  };
}
