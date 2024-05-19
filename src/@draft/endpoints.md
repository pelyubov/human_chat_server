```js
RegisterParams {
	username: string,
	displayName?: string,
	email: string,
	password: string,
	bio?: string
}

SearchUsersReturn {
	userId: bigint,
	email: string,
	name: string
}


Endpoints: '/api':

Auth: '/auth' {
	login: POST (email, password) => JWT_TOKEN,
	register: POST (params: RegisterParam) -> Check email exist => boolean,
	forgotPassword: POST (email: string) -> Send OTP code to email,
	checkOTPCode: POST (OTP: number),
	resetPassword: POST (email: string, password: string),
	updateAccount: POST (...) -> WS sent deletedAccId -> Account's friend, // include delete
}

User: '/user' {
	search: POST (pageSize, pageIndex, keyword) => SearchUserReturn[]
	getById: GET (userId) => DetailUserReturn;
	getByEmail: GET (email) => DetailUserReturn;
	getFriends: GET (pageSize, pageIndex, accountId);
	requestFriend: WS (accountId, friendId);
	cancelRequestFriend: WS (accountId, friendId);
}

Channel: '/channel' {
	...
	update: WS (ownerId, channelId, @Body UpdateChannelParams params) // include add members, remove members, delete
}

Message: '/message' {

}

Call: '/call' {

}

```
