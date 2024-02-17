import { CONFIG } from '@/config';
import { REST, Routes } from 'discord.js';
import { BasiliskCommand } from '../types';

interface RegisterCommandsProps {
  commands: BasiliskCommand[];
}

export async function registerCommands({ commands }: RegisterCommandsProps) {
  const rest = new REST({ version: '10' }).setToken(CONFIG.BOT_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
