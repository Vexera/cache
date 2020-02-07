import { Shard } from '@spectacles/gateway';
import Cache from '../src';
import * as MongoDB from '../src/mongodb';
import Redis from 'ioredis';
import { MongoClient } from 'mongodb';

(async () => {
  if (!process.env.TOKEN) {
    throw new Error('No token specified');
  }

  const mongodb = await MongoClient.connect('mongodb://localhost/cache_test');
  const db = mongodb.db();

  const shard = new Shard(process.env.TOKEN, 0);
  
  const cache = new Cache({
    redis: new Redis(),
    caches: {
      channels: new MongoDB.ChannelCache(db.collection('channelCache')),
      guilds: new MongoDB.GuildCache(db.collection('guildCache')),
      members: new MongoDB.MemberCache(db.collection('memberCache')),
      users: new MongoDB.UserCache(db.collection('userCache')),
      voiceStates: new MongoDB.VoiceStateCache(db.collection('voiceStates'))
    },
    send(shardID, event) {
      shard.send(event);
    }
  });

  cache.receive({
    t: 'IDENTIFYING',
    shard_id: 0
  });
  
  cache.on('debug', console.log);
  shard.on('receive', (event) => {
    event.shard_id = 0;

    cache.receive(event);
  });
})()
