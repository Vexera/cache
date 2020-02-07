import { BaseCache } from './BaseCache';
import { channel as channelConverter } from '../../CacheConverter';
import * as Implementations from '../../implementations';
import * as Discord from 'discord.d.ts';

export class ChannelCache extends BaseCache implements Implementations.ChannelCache {
  bulkAdd(shardID: number, channels: Discord.AnyGuildChannel[]) {
    const ops = channels.map((c) => ({
      updateOne: {
        filter: { _id: c.id },
        update: { $set: { ...channelConverter(c), shardID } },
        upsert: true
      },
    }));

    if (ops.length > 0) return this.collection.bulkWrite(ops);

    return Promise.resolve();
  }

  set(shardID: number, channel: Discord.AnyGuildChannel) {
    const data = { ...channelConverter(channel), shardID };

    return this.collection.updateOne({ _id: data._id }, { $set: data }, { upsert: true });
  }

  delete(channelID: Discord.Snowflake<Discord.Channel>) {
    return this.collection.deleteOne({ _id: channelID });
  }

  get(channelID: Discord.Snowflake<Discord.Channel>) {
    return this.collection.findOne({ _id: channelID });
  }

  async has(channelID: Discord.Snowflake<Discord.Channel>) {
    return await this.collection.find({ _id: channelID }).count() > 0;
  }
}
