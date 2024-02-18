import {
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

export interface BasiliskCommand extends RESTPostAPIChatInputApplicationCommandsJSONBody {
  onExecute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
