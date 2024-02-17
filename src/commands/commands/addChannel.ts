import { Database } from '@/db';
import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionsBitField,
  VoiceChannel,
} from 'discord.js';
import { BasiliskCommand } from '../types';

export const addChannel: BasiliskCommand = {
  name: 'add-channel',
  description: 'Start tracking a channel to create temporary voice channels in.',
  defaultMemberPermissions: ['ManageChannels'],
  options: [
    {
      name: 'channel',
      type: ApplicationCommandOptionType.Channel,
      description: 'The channel to add',
      required: true,
      channelTypes: [ChannelType.GuildVoice],
    },
  ],
  onExecute: async interaction => {
    const channel = interaction.options.getChannel('channel');

    // check permissions
    if (
      !(interaction.member?.permissions as PermissionsBitField).has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      await interaction.reply('You do not have permission to manage channels');
      return;
    }

    // check channel
    if (!channel) {
      await interaction.reply('Invalid channel');
      return;
    }

    // check if channel is a voice channel
    if (channel.type !== ChannelType.GuildVoice) {
      await interaction.reply('Channel must be a voice channel');
      return;
    }

    // check if channel has a category
    if (!(channel as VoiceChannel).parentId && !(channel as VoiceChannel).parent) {
      await interaction.reply('Channel must be in a category');
      return;
    }

    const db = Database.getInstance().getConnection();

    // find server by id
    const server = await db.models.ServerConfig.findOne({ serverId: interaction.guildId });

    // if there is no server, create one
    if (!server) {
      await db.models.ServerConfig.create({ serverId: interaction.guildId, voiceChannels: [] });
    }

    // add channel to server
    await db.models.ServerConfig.findOneAndUpdate(
      { serverId: interaction.guildId },
      { $addToSet: { voiceChannels: channel.id } }
    );

    // remove all channels that don't exist anymore
    await db.models.ServerConfig.findOneAndUpdate(
      { serverId: interaction.guildId },
      {
        $pull: {
          voiceChannels: {
            $nin: interaction.guild?.channels.cache
              .filter(c => c.type === ChannelType.GuildVoice)
              .map(c => c.id),
          },
        },
      }
    );

    await interaction.reply(`Channel ${channel.name} is now being tracked.`);
  },
};
