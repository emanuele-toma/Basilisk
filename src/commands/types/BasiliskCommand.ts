import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js';

export interface BasiliskCommand extends ChatInputApplicationCommandData {
  onExecute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
