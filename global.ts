import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, ColorResolvable, ButtonInteraction } from 'discord.js';

export interface Command {
    data: SlashCommandBuilder;
    experimental?: boolean;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
    button?: (interaction: ButtonInteraction) => Promise<void>;
}

export const Colors = {
    Primary: '#cba6f7' as ColorResolvable,
    Error: '#f38ba8' as ColorResolvable
}