import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextBasedChannel, ButtonInteraction, InteractionReplyOptions } from 'discord.js';
import { Colors } from './../global';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { writeFileSync } from 'fs';

export const data = new SlashCommandBuilder()
    .setName('define')
    .setDescription('Descobre a definição de uma palavra')
    .addStringOption(o=>o
        .setName('palavra')
        .setDescription('Palavra para definir')
        .setRequired(true)
    );

function cantAdd(definition: string[], str: string): boolean {
    return [ ...definition, str ].reduce((sum, word)=>sum + word.length, 0) > 4096;
}

async function getDefinition(word: string): Promise<InteractionReplyOptions> {

    let { status, data, request } = await axios.get(`https://dicionario.priberam.org/${word}`);

    if(status != 200){
        console.log({ word, status, data });
        return { embeds: [ new EmbedBuilder()
            .setColor(Colors.Error)
            .setTitle('Uh oh!')
            .setDescription('Ocorreu um erro enquanto procurava a definição.')
        ], ephemeral: true }
    }
    
    let { window } = new JSDOM(data);
    function $(selector: string){
        return window.document.querySelector(selector);
    }

    // Not Found
    if(data.includes('Palavra não encontrada') || data.includes('ainda não se encontra no Dicionário Priberam')){

        let noSuggestionsEmbed = new EmbedBuilder()
            .setColor(Colors.Error)
            .setTitle('Palavra não encontrada!')
            .setDescription(`Não encontrei a palavra **"${word}"** no dicionário.\nVerifica se está bem escrita.`);
        
        let suggestionsEmbed = new EmbedBuilder()
            .setColor(Colors.Error)
            .setTitle('Palavra não encontrada!')
            .setDescription(`Não encontrei a palavra **"${word}"** no dicionário.\nTalvez querias dizer uma destas palavras:`);

        // Gater suggestions

        let buttons: ButtonBuilder[] = [];

        for(let $suggestion of $('#resultados')!.querySelectorAll('.pb-sugestoes-proximas a, .pb-sugestoes-afastadas a')){
            if(buttons.length == 5) break;
            buttons.push(new ButtonBuilder()
                .setCustomId('define-' + $suggestion.textContent!)
                .setLabel($suggestion.textContent!)
                .setStyle(ButtonStyle.Secondary)
            );
        }
        
        // No suggestions
        if(buttons.length == 0)
            return { embeds: [ noSuggestionsEmbed ] }
        
        // More sugestions
        let row: any = new ActionRowBuilder().addComponents(...buttons);
        return {
            embeds: [ suggestionsEmbed ],
            components: [ row ]
        }

    }

    // Gather information

    let silabas = $('#resultados .titpalavra')?.textContent ?? $('#resultados .varpt')!.textContent!;
    let url = `${request.protocol}//${request.host}${request.path}`;

    let img: string | null = null;
    let $img = $('#resultados .dp-definicao-cartao img');
    if($img) img = ($img as any).src;

    // Gather definition

    let definition: string[] = [];
    let i = 1;

    for(let $el of $('#resultados .dp-definicao')!.children){

        console.log($el.outerHTML.replace($el.innerHTML, ''));

        if($el.matches('h4.varpt')){
            let str = `**${$el.querySelector('span')!.textContent}**`;
            if(cantAdd(definition, str)) break;
            definition.push(str);
            continue;
        }

        if($el.matches('p.dp-definicao-linha')){
            let str = `${i++}. ${$el.querySelector('.def')!.textContent}`;
            if(cantAdd(definition, str)) break;
            definition.push(str);
            continue;
        }

        if($el.matches('br, h1')) break;

    }

    // Return result

    return { embeds: [ new EmbedBuilder()
        .setColor('#ec008c')
        .setTitle(silabas)
        .setURL(url)
        .setDescription(definition.join('\n'))
        .setThumbnail(img)
        .setFooter({ text: 'Dicionário Priberam Online de Português', iconURL: 'https://i.imgur.com/AOeaHZS.png' })
    ]};

}

export async function execute(interaction: ChatInputCommandInteraction){
    const word = interaction.options.getString('palavra')!.toLowerCase().replace(/[^a-zà-ü -]/g, '');
    await interaction.reply(await getDefinition(word));
}

export async function button(interaction: ButtonInteraction){
    let definition = await getDefinition(interaction.customId.substring('define-'.length));
    interaction.update({ embeds: definition.embeds, components: definition.components ?? [] });
}