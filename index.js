const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { readdirSync } = require('fs');
require("dotenv").config();

const commands = [];
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const client = new Client({ intents: 3276799 });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const channelId = '1214282186774024293';

    // Obtener el canal por ID
    const channel = client.channels.cache.get(channelId);

        // Crear un botón
        const button = new ButtonBuilder()
            .setCustomId('generate_application_button')
            .setLabel('📩 Postular')
            .setStyle(ButtonStyle.Success);

        // Crear una fila de acciones con el botón
        const row = new ActionRowBuilder().addComponents(button);

        // Crear un embed
        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Comenzar postulación')
            .setDescription('para empezar tu postulación dale click al boton.');

        // Enviar el embed con el botón al canal
        await channel.send({ embeds: [embed], components: [row] });

});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        // Manejar la interacción del botón
        if (interaction.customId === 'generate_application_button') {
            try {
                await interaction.deferUpdate();
                await require('./commands/postular').execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.followUp('Hubo un error al ejecutar este comando.');
            }
        }
    } else if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'postular') {
            try {
                await interaction.deferReply({ ephemeral: true });
                await require('./commands/postular').execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.followUp('Hubo un error al ejecutar este comando.');
            }
        }
    }
});

client.login(process.env.TOKEN);
