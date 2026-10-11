import { comparePassword, hashPassword } from '../src/utils/hash';

describe('password hashing', () => {
  it('hashes passwords and verifies the original password', async () => {
    const hash = await hashPassword('correct horse battery staple');

    expect(hash).not.toBe('correct horse battery staple');
    await expect(comparePassword('correct horse battery staple', hash)).resolves.toBe(true);
    await expect(comparePassword('incorrect password', hash)).resolves.toBe(false);
  });
});
