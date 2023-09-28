import { Client, Events, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import { Command } from './global';
import 'dotenv/config';

// ---------- START ----------

const bot = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
]});

bot.once(Events.ClientReady, async ()=>{
    console.log('BOT: Ready!');

//     let news = await bot.channels.fetch('1155936078717526016');
//     let forum = await bot.channels.fetch('1155935139013066815');
//     let chat = await bot.channels.fetch('1155921954382037002');
//     let spam = await bot.channels.fetch('1155936310062755860');

//     let welcome = await bot.channels.fetch('1155926462084431932') as TextBasedChannel;
//     await welcome.send(`**Olá!** :wave: Nesta comunidade tu podes:
// :handshake: Pedir ajuda para utilizar o Mochi.
// :bulb: Sugerir ideias para novas funcionalidades e comandos.
// :cockroach: Denunciar bugs que tenhas encontrados.
// :star_struck: E muito mais!

// **Conhece os nossos canais**
// :newspaper: ${news} Fica a saber sobre novas atualizações!
// :speaking_head: ${forum} Deixa aqui sugestões ou bugs para melhorar o Mochi.
// :busts_in_silhouette: ${chat} Fala aqui sobre o que tu quiseres!
// :robot: ${spam} Aqui podes testar comandos do Mochi!

// Obrigado por estares aqui! :smiling_face_with_3_hearts:`);

//     let rules = await bot.channels.fetch('1155925981647867986') as TextBasedChannel;
//     await rules.send({ embeds: [new EmbedBuilder()
//         .setColor('#C6A0F6')
//         .setTitle('💞 Respeita toda a gente.')
//         .setDescription(`Não toleramos homofobia, transfobia, racismo, sexismo, assédio ou discurso de ódio.`)
//     ]});
//     await rules.send({ embeds: [new EmbedBuilder()
//         .setColor('#D398D6')
//         .setTitle('🔞 Conteúdo gráfico não tem lugar aqui.')
//         .setDescription(`Isto inclui imagens, vídeos, textos ou links com esse tipo de conteúdo.`)
//     ]});
//     await rules.send({ embeds: [new EmbedBuilder()
//         .setColor('#E08FB6')
//         .setTitle('✉️ Evita enviar mensagens privadas aos nossos membros.')
//         .setDescription(`Podes sempre contactá-los por aqui.`)
//     ]});
//     await rules.send({ embeds: [new EmbedBuilder()
//         .setColor('#ED8796')
//         .setTitle('👁️ Se vires algo fora do comum,')
//         .setDescription(`Informa alguém no staff para conseguirmos manter um ambiente agradável.`)
//     ]});

});

bot.login(process.env.TOKEN);

// ---------- COMMANDS ----------

let commands: Command[] = [];

(async ()=>{

    for(let file of readdirSync(__dirname + '/commands')){
        let command = await import(`./commands/${file.slice(0, -3)}`);
        commands.push(command);
    }

})();

bot.on(Events.InteractionCreate, async interaction=>{

    if(interaction.isChatInputCommand())
        await commands.find(c=>c.data.name == interaction.commandName)!.execute(interaction);

    if(interaction.isAutocomplete())
        await commands.find(c=>c.data.name == interaction.commandName)!.autocomplete!(interaction);

    if(interaction.isButton() && interaction.customId.includes('-'))
        await commands.find(c=>interaction.customId.startsWith(c.data.name + '-'))!.button!(interaction);

});