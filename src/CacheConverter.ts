import removeNull, { removeNullPartial } from './utils/removeNull';
import * as Discord from 'discord.d.ts';
import { VoiceState, Member, User, Guild, Role, GuildCategory, GuildNewsChannel, GuildStoreChannel, GuildVoiceChannel, GuildTextChannel, Channel, Overwrite } from './types';

/* Overwrite */

export function overwrite(data: Discord.PermissionOverwrite) {
  return removeNull<Overwrite>({
    id: data.id,
    type: data.type,
    allow: data.allow,
    deny: data.deny,
  });
}

/* Channel */

// export function channel(data: Partial<Discord.GuildTextChannel>): DiscordCache.GuildTextChannel
// export function channel(data: Partial<Discord.GuildVoiceChannel>): DiscordCache.GuildVoiceChannel
// export function channel(data: Partial<Discord.GuildStoreChannel>): DiscordCache.GuildStoreChannel
// export function channel(data: Partial<Discord.GuildNewsChannel>): DiscordCache.GuildNewsChannel
// export function channel(data: Partial<Discord.GuildCategoryChannel>): DiscordCache.GuildCategory
export function channel(data: Partial<Discord.AnyGuildChannel>): Partial<Channel> {
  switch (data.type) {
    case Discord.ChannelType.GUILD_TEXT: {
      return removeNull<Partial<GuildTextChannel>>({
        _id: data.id,
        guildID: data.guild_id,
        name: data.name,
        type: data.type,
        position: data.position,
        nsfw: data.nsfw,
        topic: data.topic,
        parentID: data.parent_id,
        overwrites: (data.permission_overwrites || []).map(overwrite),
      });
    }
    case Discord.ChannelType.GUILD_VOICE: {
      return removeNull<Partial<GuildVoiceChannel>>({
        _id: data.id,
        guildID: data.guild_id,
        name: data.name,
        type: data.type,
        position: data.position,
        parentID: data.parent_id,
        bitrate: data.bitrate,
        userLimit: data.user_limit,
        overwrites: (data.permission_overwrites || []).map(overwrite),
      });
    }
    case Discord.ChannelType.GUILD_STORE: {
      return removeNull<Partial<GuildStoreChannel>>({
        _id: data.id,
        guildID: data.guild_id,
        name: data.name,
        type: data.type,
        position: data.position,
        parentID: data.parent_id,
      });
    }
    case Discord.ChannelType.GUILD_NEWS: {
      return removeNull<Partial<GuildNewsChannel>>({
        _id: data.id,
        guildID: data.guild_id,
        name: data.name,
        type: data.type,
        position: data.position,
        topic: data.topic,
        nsfw: data.nsfw,
        parentID: data.parent_id,
        overwrites: (data.permission_overwrites || []).map(overwrite),
      });
    }
    case Discord.ChannelType.GUILD_CATEGORY: {
      return removeNull<Partial<GuildCategory>>({
        _id: data.id,
        guildID: data.guild_id,
        name: data.name,
        type: data.type,
        position: data.position,
        overwrites: (data.permission_overwrites || []).map(overwrite),
      });
    }
    default: throw new Error('Unimplemented');
  }
}

/* Role */

export function role(data: Discord.Role, guildID: Discord.GuildSnowflake) {
  return removeNull<Role>({
    id: data.id,
    guildID,
    name: data.name,
    color: data.color,
    position: data.position,
    permissions: data.permissions,
  });
}

/* Guild */
export function guild(data: Partial<Discord.Guild & Discord.UnavailableGuild> & { id: Discord.GuildSnowflake }) {
  return removeNull<Partial<Guild>>({
    _id: data.id,
    name: data.name,
    icon: data.icon,
    ownerID: data.owner_id,
    region: data.region,
    unavailable: !!data.unavailable,
    roles: (data.roles || []).map((d) => role(d, data.id)),
  });
}

/* User */

export function user(data: Discord.User) {
  return removeNull<User>({
    _id: data.id,
    username: data.username,
    discriminator: data.discriminator,
    avatar: data.avatar,
    bot: !!data.bot
  });
}

/* Member */

export function member(data: Discord.GuildMember, guildID: Discord.GuildSnowflake) {
  return removeNull<Member>({
    _id: `${guildID}.${data.user.id}`,
    guildID,
    userID: data.user.id,
    nickname: data.nick,
    roles: data.roles,
    joinedAt: data.joined_at,
  });
}

/* Voice State */

export function voiceState(data: Partial<Discord.VoiceState>, guildID?: Discord.GuildSnowflake) {
  return removeNull<Partial<VoiceState>>({
    _id: `${data.guild_id || guildID}.${data.user_id}`,
    guildID: data.guild_id || guildID,
    channelID: data.channel_id,
    userID: data.user_id,
    deaf: data.deaf,
    mute: data.mute,
    selfDeaf: data.self_deaf,
    selfMute: data.self_mute,
  });
}
