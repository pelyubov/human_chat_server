import * as bcrypt from 'bcrypt';
import Snowflake from '../src/core/utils/snowflake';

const snowflake = new Snowflake(1, 1);
const userID = snowflake.nextId();

const password = 'cơm chiên gà';

const hashed = bcrypt.hashSync(userID + password, 10);
console.log(`hashed: ${hashed}`);

const password2 = 'cơm chiên gà';

console.log(bcrypt.compareSync(userID + password2, hashed));
