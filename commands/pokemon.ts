import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, EmbedBuilder, ColorResolvable } from 'discord.js';
import { Colors } from './../global';
import pokedex from 'oakdex-pokedex';

export const data = new SlashCommandBuilder()
    .setName('pokemon')
    .setDescription('Sabe mais sobre um Pokémon')
    .addStringOption(o=>o
        .setName('id')
        .setDescription('ID ou nome do Pokémon')
        .setRequired(true)
        .setAutocomplete(true)
    );

export async function execute(interaction: ChatInputCommandInteraction){

    const query = interaction.options.getString('id')!;

    const pokemon = pokedex.findPokemon(query);

    if(!pokemon){
        await interaction.reply({ embeds: [ new EmbedBuilder()
            .setColor(Colors.Error)
            .setTitle('Uh oh!')
            .setDescription('Não fui capaz de encontrar esse pokémon.')
        ], ephemeral: true });
        return;
    }

    let color;
    switch(pokemon.color){
        case 'Pink':   color = '#f5c2e7'; break;
        case 'Green':  color = '#a6e3a1'; break;
        case 'Blue':   color = '#89b4fa'; break;
        case 'Purple': color = '#cba6f7'; break;
        case 'Gray':   color = '#6c7086'; break;
        case 'Brown':  color = '#f2cdcd'; break;
        case 'Black':  color = '#11111b'; break;
        case 'Yellow': color = '#f9e2af'; break;
        case 'White':  color = '#cdd6f4'; break;
        case 'Red':    color = '#f38ba8'; break;
    }

    await interaction.reply({ embeds: [ new EmbedBuilder()
        .setColor(color as ColorResolvable)
        .setTitle(`${pokemon.names.en} (#${pokemon.national_id})`)
        .setURL(`https://www.pokemon.com/us/pokedex/${pokemon.names.en.toLowerCase()}`)
        .setDescription(Object.values(pokemon.pokedex_entries)[0].en)
        .setThumbnail(`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemon.national_id.toString().padStart(3, '0')}.png`)
        .addFields(
            { name: 'Tipo', value: pokemon.types.join(', '), inline: true },
            { name: 'Habilidades', value: pokemon.abilities.map(a=>a.hidden ? `||${a.name}||` : a.name).join(', '), inline: true },
            { name: 'Categoria', value: pokemon.categories.en.replace(' Pokémon', '') },
            { name: 'Tamanho', value: pokemon.height_eu, inline: true },
            { name: 'Peso', value: pokemon.weight_eu, inline: true },
        )
    ]});

}

export async function autocomplete(interaction: AutocompleteInteraction){

    const query = interaction.options.getFocused().toLowerCase().replace(/[^0-9a-z]/g, '');

    if(!query){
        await interaction.respond([]);
        return;
    }
    
    let options: { name: string, value: string }[] = [];

    for(let pokemon of pokedex.allPokemon()){

        if(options.length >= 10) break;

        if(
            pokemon.national_id.toString().startsWith(query) ||
            pokemon.names.en.toLowerCase().startsWith(query)
        ) options.push({
            name: `${pokemon.names.en} (#${pokemon.national_id})`,
            value: pokemon.national_id.toString()
        });

    }

    await interaction.respond(options);
    
}