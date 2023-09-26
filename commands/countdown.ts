import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Colors } from './../global';
import countdown from 'countdown';

export const data = new SlashCommandBuilder()
    .setName('countdown')
    .setDescription('Mostra quanto tempo falta para uma data')
    .addIntegerOption(o=>o
        .setName('dia')
        .setDescription('Dia da data prevista')
        .setMinValue(1)
        .setMaxValue(31)
        .setRequired(true)
    )
    .addStringOption(o=>o
        .setName('mês')
        .setDescription('Mês da data prevista')
        .setRequired(true)
        .addChoices(
            { name: '1 - Janeiro',    value: '0'  },
            { name: '2 - Fevereiro',  value: '1'  },
            { name: '3 - Março',      value: '2'  },
            { name: '4 - Abril',      value: '3'  },
            { name: '5 - Maio',       value: '4'  },
            { name: '6 - Junho',      value: '5'  },
            { name: '7 - Julho',      value: '6'  },
            { name: '8 - Agosto',     value: '7'  },
            { name: '9 - Setembro',   value: '8'  },
            { name: '10 - Outubro',   value: '9'  },
            { name: '11 - Novembro',  value: '10' },
            { name: '12 - Dezembro',  value: '11' },
        )
    )
    .addIntegerOption(o=>o
        .setName('ano')
        .setDescription('Ano da data prevista')
        .setRequired(true)
    )
    .addIntegerOption(o=>o
        .setName('hora')
        .setDescription('Hora da data prevista')
        .setMinValue(0)
        .setMaxValue(23)    
    )
    .addIntegerOption(o=>o
        .setName('minuto')
        .setDescription('Minuto da data prevista')
        .setMinValue(0)
        .setMaxValue(59)    
    );

export async function execute(interaction: ChatInputCommandInteraction){

    const day = interaction.options.getInteger('dia')!;
    const month = +interaction.options.getString('mês')!;
    const year = interaction.options.getInteger('ano')!;
    const hour = interaction.options.getInteger('hora') ?? 0;
    const minute = interaction.options.getInteger('minuto') ?? 0;
    
    let date: Date;

    try{

        date = new Date(year, month, day, hour, minute);
        
    }catch(error: any){

        await interaction.reply({ embeds: [ new EmbedBuilder()
            .setColor(Colors.Error)
            .setTitle('Data inválida!')
            .setDescription('Ocorreu um erro a utilizar a data que me deste.')
        ], ephemeral: true });
        
        return;
    }

    let timespan = countdown(date) as countdown.Timespan;

    let timespanParts: string[] = [];

    if(timespan.years)
        timespanParts.push(timespan.years == 1 ? '1 ano' : `${timespan.years} anos`);

    if(timespan.months)
        timespanParts.push(timespan.months == 1 ? '1 mês' : `${timespan.months} meses`);

    if(timespan.days)
        timespanParts.push(timespan.days == 1 ? '1 dia' : `${timespan.days} dias`);

    if(timespan.hours)
        timespanParts.push(timespan.hours == 1 ? '1 hora' : `${timespan.hours} horas`);

    if(timespan.minutes)
        timespanParts.push(timespan.minutes == 1 ? '1 minuto' : `${timespan.minutes} minutos`);

    if(timespan.seconds)
        timespanParts.push(timespan.seconds == 1 ? '1 segundo' : `${timespan.seconds} segundos`);

    let timespanText = '0 segundos';

    if(timespanParts.length == 1) timespanText = timespanParts[0];
    else {
        timespanText = timespanParts.pop()!;
        timespanText = `${timespanParts.join(', ')} e ${timespanText}`
    }
    
    const MONTHS = [ 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' ];

    const SPECIAL_DATES = [
        { day: 1, month: 1, pronoun: 'o', name: 'Ano Novo', emoji: '🥂' },
        { day: 14, month: 2, pronoun: 'o', name: 'Dia dos Namorados', emoji: '💞' },
        { day: 8, month: 3, pronoun: 'o', name: 'Dia da Mulher', emoji: '👩' },
        { day: 25, month: 4, pronoun: 'o', name: 'Dia da Liberdade', emoji: '🌹' },
        { day: 1, month: 5, pronoun: 'o', name: 'Dia do Trabalhador', emoji: '🛠️' },
        { day: 9, month: 5, pronoun: 'o', name: 'Dia da Europa', emoji: '🇪🇺' },
        { day: 1, month: 6, pronoun: 'o', name: 'Dia da Criança', emoji: '🧒' },
        { day: 10, month: 6, pronoun: 'o', name: 'Dia de Portugal', emoji: '🇵🇹' },
        { day: 5, month: 10, pronoun: 'a', name: 'Implantação da República', emoji: '🇵🇹' },
        { day: 31, month: 10, pronoun: 'o', name: 'Dia da Bruxas', emoji: '🧛' },
        { day: 1, month: 11, pronoun: 'o', name: 'Dia de Todos os Santos', emoji: '😇' },
        { day: 1, month: 12, pronoun: 'a', name: 'Restauração da Independência', emoji: '🇵🇹' },
        { day: 8, month: 12, pronoun: 'a', name: 'Imaculada Conceição', emoji: '🤰' },
        { day: 24, month: 12, pronoun: 'a', name: 'Véspera de Natal', emoji: '🎄' },
        { day: 25, month: 12, pronoun: 'o', name: 'Natal', emoji: '🎄' },
        { day: 31, month: 12, pronoun: 'a', name: 'Véspera de Ano Novo', emoji: '🥂' },
    ];

    let description = timespan.value! < 0 ? 'até ' : 'desde ';

    let specialDate = SPECIAL_DATES.find(d=>d.day == date.getDate() && d.month == date.getMonth() + 1);
    let dateStr = `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
    if(date.getHours() || date.getMinutes()) dateStr += ` ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    description += specialDate
        ? `${specialDate.pronoun} **${specialDate.name} ${date.getFullYear()} ${specialDate.emoji}** (${dateStr})`
        : dateStr;

    await interaction.reply({ embeds: [ new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle(timespanText)
        .setDescription(description)
    ]});

}