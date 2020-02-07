import { Shard } from '@spectacles/gateway';
import Cache from '../src';
import * as RedisCache from '../src/drivers/redis';
import * as Redis from 'ioredis';
import { MongoClient } from 'mongodb';

(async () => {
	// if (!process.env.TOKEN) {
	// 	throw new Error('No token specified');
	// }
	//
	// const mongodb = await MongoClient.connect('mongodb://localhost/cache_test');
	// const db = mongodb.db();
	//
	// const shard = new Shard(process.env.TOKEN, 0);

	const cache = new Cache({
		redis: new Redis(),
		caches: {
			channels: new RedisCache.ChannelCache(new Redis({ keyPrefix: 'vexera:' }), 'channelCache'),
			guilds: new RedisCache.GuildCache(new Redis({ keyPrefix: 'vexera:' }), 'guildCache'),
			// members: new RedisCache.MemberCache(db.collection('memberCache')),
			// users: new RedisCache.UserCache(db.collection('userCache')),
			// voiceStates: new RedisCache.VoiceStateCache(db.collection('voiceStates'))
		},
		send(shardID, event) {
			// shard.send(event);
		}
	});

	cache.guilds?.set(0, '585454996800405509', {
		id: '585454996800405509',
		name: 'lmaooooooooooo',
		unavailable: true
	});

	console.log(await cache.guilds?.get('585454996800405509'));

	cache.receive({
		t: 'IDENTIFYING',
		shard_id: 0
	});

	cache.on('debug', console.log);
	// shard.on('receive', (event) => {
	// 	event.shard_id = 0;
	//
	// 	cache.receive(event);
	// });
})()
