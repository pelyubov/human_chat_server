// schema.vertexLabel('user').ifNotExists()
//     .partitionBy('user_id', SnowflakeType.INSTANCE)
//     .properties('name', Text)
//     .properties('age', Int)
//     .properties('email', Text)
//     .properties('phone', Text)
//     .properties('friends', setOf(Text))
//     .create()

// schema.edgeLabel('authored').
//   ifNotExists().
//   from('person').to('book').
//   create()

schema.vertexLabel('user').ifNotExists()
    .partitionBy('id', Uuid)
    .property('name', Text)
    .property('username', Varchar)
    .property('birthday', Date)    
    .property('email', Text)
    .property('password', Text)
    .property('avatar', Text)
    .property('status', Boolean)
    .property('created_at', Date)
    .create()

schema.vertexLabel('group_chat').ifNotExists()
    .partitionBy('id', Uuid)
    .property('name', Text)
    .property('photo', Text)
    .property('messages', Map)
    .create()

schema.edgeLabel('include').ifNotExists()
    .from('group_chat').to('user')
    .property('role', Text) // 0: member 1: admin
    .property('nickname', Varchar)
    .create()

schema.edgeLabel('communicate').ifNotExists()
    .from('user').to('user')
    .property('type', Text) // Loại mối quan hệ (ví dụ: friendship, follow, block, subscribe, waiting,...)
    .property('since', Date)
    .property('is_read', Boolean)
    .property('messages', List)
    .create()

schema.vertexLabel('message').ifNotExists()
    .partitionBy('id', Uuid)
    .property('content', Text)
    .create()
    
schema.edgeLabel('reply_to').ifNotExists()
    .from('message').to('message')
    .create()

schema.edgeLabel('sent').ifNotExists()
    .from('user').to('message')
    .property('create_at', Timestamp)
    .create()

schema.vertexLabel('attrachtment').ifNotExists()
    .partitionBy('id', Uuid)
    .property('url', setOf(Text))
    .create()

schema.edgeLabel('has').ifNotExists()
    .from('message').to('attrachtment')
    .create()