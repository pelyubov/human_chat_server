import { GroupChat } from 'src/chat/entities/groupchat';
import { User } from 'src/user/entities/user.enity';
import Snowflex from '../utils/snowflake';

const snowflake = new Snowflex(1, 1);

type UserTest = User & { friends: BigInt[] };

const dummyUserData: UserTest[] = [
  {
    id: snowflake.nextId(),
    name: 'John Doe',
    username: 'johndoe',
    email: 'johndoe@example.com',
    password: 'password123',
    status: true,
    isDeleted: false,
    friends: [],
  },
  {
    id: snowflake.nextId(),
    name: 'Jane Doe',
    username: 'janedoe',
    email: 'janedoe@example.com',
    password: 'password123',
    status: true,
    isDeleted: false,
    friends: [],
  },
  {
    id: snowflake.nextId(),
    name: 'Bob Smith',
    username: 'bobsmith',
    email: 'bobsmith@example.com',
    password: 'password123',
    status: true,
    isDeleted: false,
    friends: [],
  },
  {
    id: snowflake.nextId(),
    name: 'Alice Johnson',
    username: 'alicejohnson',
    email: 'alicejohnson@example.com',
    password: 'password123',
    status: true,
    isDeleted: false,
    friends: [],
  },
  {
    id: snowflake.nextId(),
    name: 'Mike Brown',
    username: 'mikebrown',
    email: 'mikebrown@example.com',
    password: 'password123',
    status: true,
    isDeleted: false,
    friends: [],
  },
  {
    id: snowflake.nextId(),
    name: 'Sarah Williams',
    username: 'sarahwilliams',
    email: 'sarahwilliams@example.com',
    password: 'password123',
    status: true,
    isDeleted: false,
    friends: [],
  },
];

type MessageTest = Message & {
  sender: BigInt;
  receiver?: BigInt;
};

const dummyMessageData: MessageTest[] = [];

type GroupChatTest = GroupChat & {
  messages: BigInt[];
};

const dummyGroupChatData: GroupChatTest[] = [
  {
    id: snowflake.nextId(),
    name: 'Group 1',
    photo: 'https://example.com/group_1.png',
    messages: [],
    members: [dummyUserData[0], dummyUserData[1]],
  },
];

const dummyDB = Object.create(null);
dummyDB.snowfex = snowflake;
dummyDB.users = dummyUserData;
dummyDB.messages = dummyMessageData;
dummyDB.groupchats = dummyGroupChatData;

export default dummyDB;
