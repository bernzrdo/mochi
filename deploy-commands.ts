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

        if(command.experimental){
            let json = command.data.toJSON();
            json.description = `🧪 ${json.description}`;
            experimentalCommands.push(json);
        }else
            globalCommands.push(command.data.toJSON());
        
    }

    await rest.put(
        Routes.applicationCommands('1155666080925241364'),
        { body: globalCommands }
    );

    await rest.put(
        Routes.applicationGuildCommands('1155666080925241364', '1147082837107933194'),
        { body: experimentalCommands }
    );

})();