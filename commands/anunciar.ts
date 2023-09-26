import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextBasedChannel } from 'discord.js';
import { Colors } from './../global';

export const data = new SlashCommandBuilder()
    .setName('anunciar')
    .setDescription('Anuncia uma novidade no servidor do Mochi')
    .addStringOption(o=>o
        .setName('título')
        .setDescription('Título da novidade')
        .setRequired(true)
    )
    .addStringOption(o=>o
        .setName('descrição')
        .setDescription('Descrição da novidade')
        .setRequired(true)
    );

export const experimental = true;

export async function execute(interaction: ChatInputCommandInteraction){

    const title = interaction.options.getString('título')!;
    const description = interaction.options.getString('descrição')!;

    const NEWS_CHANNEL = await interaction.client.channels.fetch('1155936078717526016') as TextBasedChannel;

    const EMBED = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle(title)
        .setDescription(description);

    let row: any = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('send')
            .setLabel('Enviar')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary)
    )
    
    const response = await interaction.reply({
        content: '**Pré-visualização da Novidade**',
        embeds: [ EMBED ],
        components: [ row ]
    });

    try {

        const confirm = await response.awaitMessageComponent({ filter: i=>i.user.id == interaction.user.id, time: 60e3 });

        if(confirm.customId == 'send'){
            let message = await NEWS_CHANNEL.send({ embeds: [ EMBED ] });
            await message.crosspost();
            await confirm.update({ content: `**Novidade enviada!** ${message.url}`, embeds: [], components: [] })
        }

        if(confirm.customId == 'cancel')
            await confirm.update({ content: '_Novidade cancelada._', embeds: [], components: [] });

    }catch(e){
        await interaction.editReply({ content: '_Novidade cancelada._', embeds: [], components: [] });
    }
}