import { BaseCache } from './BaseCache';
import { voiceState as voiceStateConverter, user } from '../../CacheConverter';
import * as Implementations from '../../implementations';
import * as Discord from 'discord.d.ts';
import { VoiceState } from '../../types';

export class VoiceStateCache extends BaseCache implements Implementations.VoiceStateCache {
  bulkAdd(shardID: number, guildID: Discord.GuildSnowflake, voiceStates: Partial<Discord.VoiceState>[]) {
    const ops = voiceStates.map((vs) => ({
      updateOne: {
        filter: { _id: `${guildID}.${vs.user_id}` },
        update: { $set: { ...voiceStateConverter(vs, guildID), shardID } },
        upsert: true
      }
    }));

    if (ops.length > 0) return this.collection.bulkWrite(ops);
    else return Promise.resolve();
  }

  set(shardID: number, guildID: Discord.GuildSnowflake, userID: Discord.UserSnowflake, voiceState: Discord.VoiceState) {
    const data = { ...voiceStateConverter(voiceState), shardID };

    return this.collection.updateOne(
      { _id: data._id },
      { $set: data },
      { upsert: true }
    );
  }

  get(guildID: Discord.GuildSnowflake, userID: Discord.UserSnowflake): Promise<VoiceState | null> {
    return this.collection.findOne({ _id: `${guildID}.${userID}` });
  }

  delete(guildID: Discord.GuildSnowflake, userID: Discord.UserSnowflake) {
    return this.collection.deleteOne({ _id: `${guildID}.${userID}` });
  }

  deleteByGuild(guildID: Discord.GuildSnowflake) {
    return this.collection.deleteMany({ guildID });
  }

  async has(guildID: Discord.GuildSnowflake, userID: Discord.UserSnowflake) {
    return await this.collection.find({ _id: `${guildID}.${userID}` }).count() > 0;
  }
}
