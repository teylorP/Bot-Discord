const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("postular")
        .setDescription("Crea un canal privado de postulación"),
    async execute(interaction) {
        // Verificar si la interacción ya ha sido respondida o diferid

        // Obtener la información del canal y los roles necesarios
        const channelPrefix = "postulacion-";
        const rolesAllowed = ["1214027753830096957", "1214157607418208256", "1214012862863769601", "1214188759931953172"];

        function userHasPermission(member) {
            return rolesAllowed.some(roleId => member.roles.cache.has(roleId));
        }

        // Crear el canal
        const member = interaction.member;
        const cleanUsername = member.user.username.replace(/[^a-zA-Z0-9]/g, ''); // Eliminar caracteres no permitidos
        const truncatedName = cleanUsername.substring(0, 32); // Limitar el nombre a 32 caracteres
        const channelName = `${channelPrefix}${truncatedName}`;

        // Verificar si el canal ya existe
        const existingChannel = interaction.guild.channels.cache.find(channel => channel.name === channelName);

        if (existingChannel) {
            await interaction.followUp({ content: "¡Ya has creado un canal de postulacion!.", ephemeral: true });
        } else {
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: "1214007099810648064",
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],  // Reemplaza esto con el ID de la categoría real
            });

            // Mencionar al usuario que ejecutó el comando en el nuevo canal
            await channel.send(`¡Hola ${interaction.user}! Este es tu canal de postulación, completa la información necesaria.`);

            // Enviar las preguntas debajo de la mención
            const preguntasEmbed = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle('**Preguntas para la postulación**')
                .setDescription(`Por favor, responde a las siguientes preguntas:\n\n` +
                    `**Nombre:**\n` +
                    `**Edad ooc:**\n` +
                    `**Tiempo en el servidor:**\n` +
                    `**Experiencia en rol de mafia:**\n` +
                    `**Alguna sanción grave que debamos saber:**\n` +
                    `**Actividad diaria:**\n` +
                    `**Qué puedes aportar a Cosa Nostra:**`);

                const button = new ButtonBuilder()
                    .setCustomId('aprobarButton')
                    .setLabel('Aprobar')
                    .setStyle(ButtonStyle.Success);

                const button2 = new ButtonBuilder()
                    .setCustomId('rechazarButton')
                    .setLabel('Rechazar')
                    .setStyle(ButtonStyle.Danger);
        
                const row = new ActionRowBuilder().addComponents(button, button2);

                // Verificar si el usuario que ejecutó el comando es el mismo que está viendo el mensaje
                await channel.send({ embeds: [preguntasEmbed], components: [row] }).then(msg => {
                    // Manejar eventos de botones
                    const filter = (i) => i.customId === 'aprobarButton' || i.customId === 'rechazarButton';
                    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
        
                    collector.on('collect', async (i) => {
                        // Verificar qué botón fue presionado y realizar acciones necesarias
                        if (userHasPermission(i.member)) {
                            if (i.customId === 'aprobarButton') {

                                const roleIdToAssign = '1214034017897414686';
                                const roleIdToRemove = '1214020903592132700';
    
                                const roleToAssign = interaction.guild.roles.cache.get(roleIdToAssign);
                                const roleToRemove = interaction.guild.roles.cache.get(roleIdToRemove);
                                if (roleToAssign && roleToRemove) {
                                    await interaction.member.roles.add(roleToAssign);
                                    await interaction.member.roles.remove(roleToRemove);

                                                // Obtener el canal específico para enviar el mensaje
                                    const canalNotificacionesId = '1215030560670490684';  // Reemplazar con el ID del canal
                                    const canalNotificaciones = interaction.guild.channels.cache.get(canalNotificacionesId);

                                    if (canalNotificaciones) {
                                        // Enviar mensaje mencionando a la persona
                                        await canalNotificaciones.send(`¡Felicidades ${interaction.user} has aprobado la postulación! Ahora eres ${roleToAssign.name}.`);
                                        const canalAEliminar = interaction.guild.channels.cache.get(channel.id);

                                        if (canalAEliminar) {
                                            // Intenta borrar el canal
                                            canalAEliminar.delete()
                                                .then(() => console.log(`Canal ${channel.id} eliminado exitosamente.`))
                                                .catch(error => console.error(`Error al intentar eliminar el canal ${channel.id}: ${error}`));
                                        } else {
                                            console.error(`No se encontró el canal con el ID ${channel.id}.`);
                                        }
                                    } else {
                                        console.error('No se pudo encontrar el canal de notificaciones.');
                                    }
                                }
                                
                            } else if (i.customId === 'rechazarButton') {
                                // Verificar permisos antes de ejecutar la acción
                                const canalNotificacionesId = '1215030560670490684';  // Reemplazar con el ID del canal
                                const canalNotificaciones = interaction.guild.channels.cache.get(canalNotificacionesId);

                                if (canalNotificaciones) {
                                    // Enviar mensaje mencionando a la persona
                                    await canalNotificaciones.send(`¡Lo sentimos ${interaction.user} has fallado la postulación! deberas esperar 15 dias para volver a postularte.`);
                                    const canalAEliminar = interaction.guild.channels.cache.get(channel.id);

                                    if (canalAEliminar) {
                                        // Intenta borrar el canal
                                        canalAEliminar.delete()
                                            .then(() => console.log(`Canal ${channel.id} eliminado exitosamente.`))
                                            .catch(error => console.error(`Error al intentar eliminar el canal ${channel.id}: ${error}`));
                                    } else {
                                        console.error(`No se encontró el canal con el ID ${channel.id}.`);
                                    }
                                } else {
                                    console.error('No se pudo encontrar el canal de notificaciones.');
                                }
                            }
                        } else {
                            await i.followUp('No tienes permisos para ejecutar esta acción.');
                        }

                    });
                });

            // Añadir permisos a roles permitidos
            rolesAllowed.forEach(async roleId => {
                const role = interaction.guild.roles.cache.get(roleId);
                if (role) {
                    await channel.permissionOverwrites.create(role, { VIEW_CHANNEL: 1 });
                }
            });
            // Enviar mensaje informativo
            await interaction.followUp({ content: `Canal de postulaciones creado exitosamente en <#${channel.id}>.`, ephemeral: true });
        }
    },
    
};