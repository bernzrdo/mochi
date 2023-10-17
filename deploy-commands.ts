import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody as CommandJSON, Routes } from 'discord.js';
import { Command } from './global';
import { readdirSync, writeFileSync } from 'fs';
import 'dotenv/config';

const rest = new REST().setToken(process.env.TOKEN!);

(async ()=>{

    let globalCommands: CommandJSON[] = [];
    let experimentalCommands: CommandJSON[] = [];

    for(let file of readdirSync(__dirname + '/commands')){

        let command: Command = await import(`./commands/${file.slice(0, -3)}`);

        let json = command.data.toJSON();

        console.log(`/${json.name} ${command.experimental ? '🧪' : ''}`);

        if(command.experimental){
            json.description = `🧪 ${json.description}`;
            experimentalCommands.push(json);
        }else{
            globalCommands.push(json);
        }
        
    }

    console.log('Publishing global commands...');
    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID!),
        { body: globalCommands }
    );

    console.log('Publishing experimental commands...');
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.TEST_GUILD_ID!),
        { body: experimentalCommands }
    );
    
    console.log('Updating README...');
    
    let readme = [
        '<h1 align="center">',
        '<img src="https://i.imgur.com/N74BwjO.png">',
        '<br>',
        'Mochi',
        '</h1>',
        '<p align="center">',
        '<a href="https://discord.com/api/oauth2/authorize?client_id=1155666080925241364&permissions=0&scope=bot"><img src="https://img.shields.io/badge/Adicionar_ao_Servidor-5865F2?logo=discord&logoColor=fff" alt="Adicionar ao Servidor"></a>',
        '<a href="https://discord.gg/SNazbqFubs"><img src="https://img.shields.io/badge/Entrar_no_Servidor-5865F2?logo=discord&logoColor=fff" alt="Entrar no Servidor"></a>',
        '</p>',
        '',
        'O Mochi é um bot de Discord que adiciona comandos úteis a qualquer servidor! O que lhe distingue de outros bots, não é só ser 100% português de portugal, mas também a sua simplicidade.',
        '',
        '|Comando|Descrição|Código|',
        '|-|-|-|'
    ];

    for(let command of globalCommands){
        readme.push(`|**/${command.name}**|${command.description}|[${command.name}.ts](https://github.com/bernzrdo/mochi/blob/main/commands/${command.name}.ts)`);
    }

    writeFileSync('README.md', readme.join('\n'));

    console.log('Done!');
    process.exit();

})();