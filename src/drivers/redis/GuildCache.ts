import * as Implementations from '../../implementations';
import * as Discord from "discord.d.ts";
import {BaseCache} from "./BaseCache";
import {guild as guildConverter, role as roleConverter} from "../../CacheConverter";
import {Guild} from "../../types";
import {Redis} from "ioredis";

export class GuildCache extends BaseCache implements Implementations.GuildCache {
	constructor(redis: Redis, key: string) {
		super(redis, key);
	}

	async get(id: Discord.Snowflake<Discord.Guild>): Promise<Guild | null> {
		const guild = await this.redis.hget(this.hashKey, 'id');

		return guild ? JSON.parse(guild) : null;
	}

	set(shardID: number, id: Discord.Snowflake<Discord.Guild>, guild: Discord.Guild | Discord.UnavailableGuild) {
		const data = {
			...guildConverter(guild),
			_id: id,
			shardID,
		};

		return this.redis.hset(this.hashKey, id, JSON.stringify(data));
	}

	async bulkAdd(shardID: number, guilds: Array<Discord.Guild | Discord.UnavailableGuild>) {
		for (const guild of guilds) {
			await this.redis.hset(this.hashKey, guild.id, JSON.stringify({...guildConverter(guild), shardID}))
		}
	}

	async addRole(guildID: Discord.Snowflake<Discord.Guild>, role: Discord.Role) {
		const data = roleConverter(role, guildID);
		const guild = await this.get(guildID);

		if (!guild) throw new Error('Guild not found');


		guild.roles = guild.roles.filter((r) => r.id !== data.id);
		guild.roles.push(data);

		return this.redis.hset(this.hashKey, guildID, JSON.stringify({...guild, roles: guild.roles}));
	}

	async removeRole(guildID: Discord.Snowflake<Discord.Guild>, roleID: Discord.Snowflake<Discord.Role>) {
		const guild = await this.get(guildID);

		if (!guild) throw new Error('Guild not found');

		guild.roles = guild.roles.filter((r) => r.id !== roleID);
		return this.redis.hset(this.hashKey, guildID, JSON.stringify({...guild, roles: guild.roles}));
	}

	delete(guildID: Discord.Snowflake<Discord.Guild>) {
		return this.redis.hdel(this.hashKey, guildID);
	}

	async has(guildID: Discord.Snowflake<Discord.Guild>) {
		return Boolean(this.redis.hexists(this.hashKey, guildID));
	}
}
