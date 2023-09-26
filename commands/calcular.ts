import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Colors } from './../global';
import { evaluate } from 'mathjs';

export const data = new SlashCommandBuilder()
    .setName('calcular')
    .setDescription('Calcula uma expressão matemática')
    .addStringOption(o=>o
        .setName('expressão')
        .setDescription('Expressão para calcular')
        .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction){

    const expression = interaction.options.getString('expressao')!;

    let result;

    try{

        result = evaluate(expression);

    }catch(error: any){

        await interaction.reply({ embeds: [ new EmbedBuilder()
            .setColor(Colors.Error)
            .setTitle('Ocorreu um erro!')
            .setDescription(error.message)
        ]});
        
        return;
    }

    await interaction.reply({ embeds: [
        new EmbedBuilder()
            .setColor(Colors.Primary)
            .setAuthor({ name: expression + ' =' })
            .setTitle(result.toString())
    ] });

}