const bcrypt = require('bcryptjs');

const hashes = [
  { email: 'manav@gmail.com', hash: '$2b$10$TCc9KWY/2uinmyL.6opGXucdL8BAlu2wtgi5/p3Coyci.NqLSUN2q' },
  { email: 'rush@gmail.com', hash: '$2b$10$oqSHsH.uCdrr7LKN3416.OTxddlQ4k.uGfU7SJTIemxZQqxNDgdGK' }
];

const passwordsToTest = [
  '123456', 'password', 'Password123', 'Admin123', '12345678', '12345', 'password123',
  'manav', 'manav123', 'manav@123', 'rush', 'rush123', 'rush@123'
];

async function test() {
  for (const user of hashes) {
    let found = false;
    for (const pwd of passwordsToTest) {
      if (bcrypt.compareSync(pwd, user.hash)) {
        console.log(`Found password for ${user.email}: ${pwd}`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`Could not find password for ${user.email}`);
    }
  }
}

test();
