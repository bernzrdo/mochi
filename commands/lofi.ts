import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, EmbedBuilder, VoiceBasedChannel } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus, entersState, VoiceConnection, createAudioPlayer, createAudioResource, getVoiceConnection } from '@discordjs/voice';
import { Colors } from './../global';
import play from 'play-dl';

export const data = new SlashCommandBuilder()
    .setName('lofi')
    .setDescription('Toco lofi hip hop no canal onde estás');

const command = `</lofi:1156981890998349864>`;

export async function execute(interaction: ChatInputCommandInteraction){

    let channel = (interaction.member as GuildMember).voice.channel;

    let connection = getVoiceConnection(interaction.guild!.id);

    // No connection
    if(!connection){

        if(!channel){
            await interaction.reply({ embeds: [ new EmbedBuilder()
                .setColor(Colors.Error)
                .setTitle('Uh oh!')
                .setDescription('Tens que entrar num canal de voz primeiro.')
            ], ephemeral: true });
            return;
        }

        joinChannel(interaction, channel);

    }else{

        let myChannel = await interaction.guild!.channels.fetch(connection.joinConfig.channelId!) as VoiceBasedChannel;

        if(myChannel.members.size > 1){

            if(!channel){
                await interaction.reply({ embeds: [ new EmbedBuilder()
                    .setColor(Colors.Error)
                    .setTitle('Não estás a ouvir a música!')
                    .setDescription('Só quem está no canal de voz comigo é que pode parar a música.')
                ], ephemeral: true });
                return;
            }

            if(myChannel.id != channel.id){
                await interaction.reply({ embeds: [ new EmbedBuilder()
                    .setColor(Colors.Error)
                    .setTitle('Estou noutro canal!')
                    .setDescription('Só posso ir ao teu canal de voz tocar música quando alguém do meu decidir parar a música.')
                ], ephemeral: true });
                return;
            }

        }

        if(channel && myChannel.id != channel.id){
            joinChannel(interaction, channel);
            return;
        }

        connection.destroy();

        await interaction.reply({ embeds: [ new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle('Espero que tenhas gostado!')
            .setDescription(`Se precisares de mais música, é só enviares ${command}.`)
        ], ephemeral: true });

    }

}

async function joinChannel(interaction: ChatInputCommandInteraction, channel: VoiceBasedChannel ) {
    
    const player = createAudioPlayer();
    const { stream, type } = await play.stream('https://www.youtube.com/watch?v=jfKfPfyJRdk');

    const resource = createAudioResource(stream, { inputType: type });
    player.play(resource);
    player.on('error', e=>console.error(e));

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
    });
    connection.on(VoiceConnectionStatus.Disconnected, ()=>handleDisconnect(connection));
    connection.subscribe(player);

    await interaction.reply({ embeds: [ new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({ name: 'Lofi Girl', 'iconURL': 'https://i.imgur.com/QBnVwy7.png', 'url': 'https://www.youtube.com/@LofiGirl' })
        .setTitle('lofi hip hop radio 📚 - beats to relax/study to')
        .setDescription(`A tocar no canal de voz ${channel}\n_Usa ${command} para parar de tocar._`)
        .setImage('https://i3.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg')
    ]});

}

async function handleDisconnect(connection: VoiceConnection){

    try{

        await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5e3),
            entersState(connection, VoiceConnectionStatus.Connecting, 5e3),
        ]);
        
        // Just moving channels, all is good.
        
    }catch(error){

        // Actually disconnected.
        connection.destroy();

    }

}