import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Colors } from './../global';

export const data = new SlashCommandBuilder()
    .setName('foto')
    .setDescription('Obtem a foto de perfil de algúem')
    .addMentionableOption(o=>o
        .setName('utilizador')
        .setDescription('Utilizador de quem queres a foto de perfil')
        .setRequired(true)
    )
    .addStringOption(o=>o
        .setName('formato')
        .setDescription('Formato da foto de perfil')
        .addChoices(
            { name: 'GIF', value: 'gif' },
            { name: 'JPEG', value: 'jpeg' },
            { name: 'JPG', value: 'jpg' },
            { name: 'PNG', value: 'png' },
            { name: 'WEBP', value: 'webp' }
        )
    )
    .addBooleanOption(o=>o
        .setName('estático')
        .setDescription('Utilizar versão estática da foto de perfil')
    )
    .addStringOption(o=>o
        .setName('tamanho')
        .setDescription('Tamanho da foto de perfil')
        .addChoices(
            { name: '16px', value: '16' },
            { name: '32px', value: '32' },
            { name: '64px', value: '64' },
            { name: '128px', value: '128' },
            { name: '256px', value: '256' },
            { name: '512px', value: '512' },
            { name: '1024px', value: '1024' },
            { name: '2048px', value: '2048' },
            { name: '4096px', value: '4096' }
        )
    );

export async function execute(interaction: ChatInputCommandInteraction){

    let user = interaction.options.getUser('utilizador')!;
    let extension: any = interaction.options.getString('formato') ?? 'png';
    let forceStatic: any = interaction.options.getBoolean('estático') ?? false;
    let size: any = +(interaction.options.getString('tamanho') ?? 512);

    const avatarURL = user.avatarURL({ extension, forceStatic, size });

    if(!avatarURL){
        await interaction.reply({ embeds: [ new EmbedBuilder()
            .setColor(Colors.Error)
            .setTitle('Uh oh!')
            .setDescription('Não fui capaz de obter essa foto de perfil.')
        ], ephemeral: true });
        return;
    }

    await interaction.reply({
        files: [avatarURL]
    });

}