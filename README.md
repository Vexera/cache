# @vexera/cache
## Discord State Cache written in Typescript.

---

@vexera/cache is a library for processing Discord state events and updating an external cache accordingly.

### Usage

```ts
const cache = new Cache({
  redis,
  caches: {
    channels: new MongoDB.ChannelCache(db.collection('channels')),
    guilds: new MongoDB.GuildCache(db.collection('guilds')),
    members: new MongoDB.MemberCache(db.collection('members')),
    users: new MongoDB.UserCache(db.collection('users')),
    voiceStates: new MongoDB.VoiceStateCache(db.collection('voiceStates')),
  },
  send(shardID, event) {
    shards.get(shardID).send(event);
  }
});

shards.on('event', (shardID, event) => {
  cache.receive({ ...event, shard_id: shardID });
});
```

[See a larger, real example](test/index.ts)

### Usage Notes
- All events should be sent with a `shard_id` field, an integer of the shard id that the event came from.
- A `IDENTIFYING` event should be sent when the shard has started identifying with the Discord gateway.