import { BasiliskCommand } from '../types';

export const ping: BasiliskCommand = {
  name: 'ping',
  description: 'Ping!',
  onExecute: async interaction => {
    const reply = await interaction.reply({
      content: 'Calculating...',
      ephemeral: true,
      fetchReply: true,
    });
    const ping = reply.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Ping: ${ping}ms`);
  },
};
