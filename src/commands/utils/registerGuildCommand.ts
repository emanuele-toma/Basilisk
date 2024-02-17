import { CONFIG } from '@/config';
import { REST, Routes } from 'discord.js';
import { BasiliskCommand } from '../types';

interface RegisterGuildCommandsProps {
  guildId: string;
  commands: BasiliskCommand[];
}

export async function registerGuildCommands({ guildId, commands }: RegisterGuildCommandsProps) {
  const rest = new REST({ version: '10' }).setToken(CONFIG.BOT_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(CONFIG.CLIENT_ID, guildId), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
