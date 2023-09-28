import { REST, Routes } from 'discord.js';
import { Command } from './global';
import { readdirSync } from 'fs';
import 'dotenv/config';

const rest = new REST().setToken(process.env.TOKEN!);

(async ()=>{

    let globalCommands: any[] = [];
    let experimentalCommands: any[] = [];

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

    console.log('Done!');
    process.exit();

})();