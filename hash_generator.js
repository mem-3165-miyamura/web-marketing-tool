// hash_generator.js
const bcrypt = require('bcrypt');

// ハッシュ化したいパスワード
const password = '123456'; 
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    console.log('--- GENERATED HASH ---');
    console.log(hash);
    console.log('----------------------');
});