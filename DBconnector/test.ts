import Snowflake from '@Project.Root/utils/snowflake';
import * as bcrypt from 'bcrypt';

const snowflake = new Snowflake(1);
const userID = snowflake.next();

const password = 'cơm chiên gà';

const hashed = bcrypt.hashSync(userID + password, 10);
console.log(`hashed: ${hashed}`);

const password2 = 'cơm chiên gà';

console.log(bcrypt.compareSync(userID + password2, hashed));
