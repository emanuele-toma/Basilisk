import { commands, registerGuildCommands } from '@/commands';
import { CONFIG } from '@/config';
import { Database, IServerConfig } from '@/db';
import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  VoiceState,
} from 'discord.js';
import { registerCommands } from './commands/utils/registerCommands';

const client = new Client({
  intents: [GatewayIntentBits.GuildVoiceStates],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
  console.log(`Client user id: ${client.user?.id}`);

  registerCommands({ commands });

  registerGuildCommands({ guildId: CONFIG.DEV_GUILD_ID, commands });

  Database.getInstance().getConnection();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  commands.forEach(command => {
    if (interaction.commandName === command.name) {
      command.onExecute(interaction as ChatInputCommandInteraction);
    }
  });
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  // if not joining or leaving a voice channel, return
  if (oldState?.channelId === newState.channelId) return;

  await handleDeleteTempChannel(oldState, newState);
  await handleCreateTempChannel(newState);
});

const handleDeleteTempChannel = async (oldState: VoiceState | null, newState: VoiceState) => {
  // if user is not leaving a voice channel, return
  const isLeaving = !!oldState?.channelId;

  if (!isLeaving) return;

  const db = Database.getInstance().getConnection();

  const server = await db.models.ServerConfig.findOne<IServerConfig>({
    serverId: newState.guild?.id,
  });

  if (!server) return;

  // if user is not last in the channel, return
  const channel = await oldState?.guild?.channels.fetch(oldState.channelId || '');
  if (!channel) return;

  const size =
    'size' in channel.members
      ? channel?.members.size
      : 'cache' in channel.members
        ? channel?.members.cache.size
        : 0;

  if (size > 0) return;

  // if channel is not a temporary channel, return
  if (!server.temporaryChannels.includes(channel?.id || '')) return;

  console.log('Deleting channel:', channel?.name);

  // delete the channel
  await channel?.delete();

  // remove the channel from the list of temporary channels
  server.temporaryChannels = server.temporaryChannels.filter(id => id !== channel?.id);

  // mark it as modified
  server.markModified('temporaryChannels');

  await server.save();
};

const handleCreateTempChannel = async (newState: VoiceState) => {
  // if user is not joining a voice channel, return
  const isJoining = !!newState.channelId;

  if (!isJoining) return;

  const db = Database.getInstance().getConnection();

  const server = await db.models.ServerConfig.findOne<IServerConfig>({
    serverId: newState.guild?.id,
  });

  if (!server) return;

  // if user is not joining a channel that is in the list of voice channels, return
  const channel = await newState.guild?.channels.fetch(newState.channelId || '');

  if (!server.voiceChannels.includes(channel?.id || '')) return;

  console.log('Creating channel for:', newState.member?.displayName);

  // create a new temporary channel
  const newChannel = await newState.guild?.channels.create({
    name: `Canale di ${newState.member?.displayName}`,
    type: ChannelType.GuildVoice,
    parent: channel?.parentId,
    permissionOverwrites: [
      {
        id: newState.member?.id || '',
        allow: [
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.ManageRoles,
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.AttachFiles,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.SendTTSMessages,
          PermissionsBitField.Flags.SendVoiceMessages,
          PermissionsBitField.Flags.Connect,
          PermissionsBitField.Flags.PrioritySpeaker,
          PermissionsBitField.Flags.Speak,
          PermissionsBitField.Flags.UseEmbeddedActivities,
          PermissionsBitField.Flags.UseExternalSounds,
          PermissionsBitField.Flags.UseSoundboard,
          PermissionsBitField.Flags.UseVAD,
          PermissionsBitField.Flags.Stream,
        ],
      },
    ],
  });

  if (!newChannel) return;

  // add the channel to the list of temporary channels
  server.temporaryChannels.push(newChannel.id);

  // mark it as modified
  server.markModified('temporaryChannels');

  await server.save();

  // move the user to the new channel
  await newState.setChannel(newChannel);
};

client.login(CONFIG.BOT_TOKEN);

// Catch all errors
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Catch all uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});
