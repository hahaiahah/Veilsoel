const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, ActivityType } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
const ms = require('ms');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

const PREFIX = "-";
const JAIL_ROLE_NAME = "مسجون";
const JAIL_CHANNEL_ID = "1483291016575586414";
const WELCOME_CHANNEL_ID = "1481786619303297205";
const LEAVE_CHANNEL_ID = "1481786887680299088";
const NEWS_CHANNEL_ID = "1481800500721746135";
const DECORATIVE_LINE = "https://cdn.discordapp.com/attachments/1481775956300402761/1481901028507914332/line.png";
const NEWS_API_KEY = "b3371fd75d11409ebb3b795d95f0ce8a";

// هرم الصلاحيات
const roleHierarchy = [
    "SOEL 🔱", "Central Bank.", "FlixerX", "Developer 👨‍💻", "Owner", "Co-Owner",
    "ابو محمد", "Head Moderator", "Moderator", "Admin", "Wicks", "Support🛠️",
    "Helper", "بكّمي", "Member", "سجن", "مسجون"
];

// تخزين رتب السجن في الذاكرة
const jailData = new Map();

function getHighestRole(member) {
    return member.roles.cache
        .filter(r => roleHierarchy.includes(r.name))
        .sort((a, b) => roleHierarchy.indexOf(a.name) - roleHierarchy.indexOf(b.name))
        .first();
}

function hasPermission(member, target) {
    if (!member || !target) return false;
    if (member.id === member.guild.ownerId) return true;
    const memberHighest = getHighestRole(member);
    const targetHighest = getHighestRole(target);
    if (!memberHighest) return false;
    if (!targetHighest) return true;
    return roleHierarchy.indexOf(memberHighest.name) < roleHierarchy.indexOf(targetHighest.name);
}

// ============ البوت جاهز ============
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} يعمل`);
    client.user.setActivity("-اوامر | نظام متكامل", { type: ActivityType.Watching });

    // مهمة الأخبار كل ساعتين
    cron.schedule('0 */2 * * *', async () => {
        try {
            const res = await axios.get(`https://newsapi.org/v2/top-headlines?country=sa&apiKey=${NEWS_API_KEY}`);
            const articles = res.data.articles.slice(0, 3);
            const channel = client.channels.cache.get(NEWS_CHANNEL_ID);
            if (!channel) return;
            for (const article of articles) {
                const embed = new EmbedBuilder()
                    .setTitle(article.title)
                    .setURL(article.url)
                    .setDescription(article.description || '')
                    .setImage(article.urlToImage || DECORATIVE_LINE)
                    .setColor(0x00ff00);
                channel.send({ embeds: [embed] });
            }
        } catch (e) { console.error('خطأ الأخبار:', e.message); }
    });
});

// ============ الترحيب والمغادرة الأسطوري ============
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
        .setTitle('🌟 مرحباً بك في سيرفرنا العريق!')
        .setDescription(`أهلاً وسهلاً ${member.user.username}، نورتنا بقدومك.\n\n🎉 أنت العضو رقم **${member.guild.memberCount}** في السيرفر.\n📅 انضممت في: <t:${Math.floor(Date.now()/1000)}:D>\n\nنتمنى لك وقتاً ممتعاً وتفاعلاً رائعاً.`)
        .setImage(DECORATIVE_LINE)
        .setColor(0x00ff00)
        .setFooter({ text: 'whitehat9995#' });
    channel.send({ content: `**مرحباً ${member.user}**`, embeds: [embed] });
});

client.on('guildMemberRemove', member => {
    const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
        .setTitle('💔 وداعاً ...')
        .setDescription(`**${member.user.username}** غادر السيرفر.\n\n📉 عدد الأعضاء المتبقين: **${member.guild.memberCount}**\n😢 نتمنى أن تعود إلينا يوماً.\nرافقتنا السلامة.`)
        .setImage(DECORATIVE_LINE)
        .setColor(0xff0000)
        .setFooter({ text: 'whitehat9995#' });
    channel.send({ embeds: [embed] });
});

// ============ معالج الأوامر ============
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const sendDM = async (user, content) => {
        try { await user.send(content); } catch (e) {}
    };

    if (command === 'اوامر' || command === 'help') {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_menu')
                    .setPlaceholder('اختر القسم')
                    .addOptions([
                        { label: '🛡️ الإشراف', value: 'moderation' },
                        { label: '😈 الاستفزاز', value: 'fun' },
                        { label: '🎮 الألعاب', value: 'games' },
                        { label: '🕌 الإسلامية', value: 'islamic' },
                        { label: '👤 العامة', value: 'general' },
                        { label: '💰 الاقتصاد', value: 'economy' },
                        { label: '🎫 التذاكر', value: 'tickets' }
                    ])
            );
        const embed = new EmbedBuilder()
            .setTitle('📜 قائمة الأوامر')
            .setDescription('**اختر القسم من القائمة أدناه**')
            .setColor(0x00ff00)
            .setFooter({ text: 'whitehat9995#' });
        message.channel.send({ embeds: [embed], components: [row] });
        return;
    }

    // أوامر عامة
    if (command === 'بينج') {
        const pingMsg = await message.channel.send('⏳ جاري الحساب...');
        const ping = pingMsg.createdTimestamp - message.createdTimestamp;
        pingMsg.edit({ content: `🏓 بونج! سرعة الاتصال: **${ping}ms**` });
    }
    else if (command === 'سيرفر') {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setTitle(`📊 ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true },
                { name: '💬 الرومات', value: `${guild.channels.cache.size}`, inline: true },
                { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(guild.createdTimestamp/1000)}:D>`, inline: true }
            )
            .setColor(0x00ff00);
        message.channel.send({ embeds: [embed] });
    }
    else if (command === 'اواتار') {
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setTitle(`🖼️ ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor(0x00ff00);
        message.channel.send({ embeds: [embed] });
    }
    else if (command === 'تحقق') {
        const member = message.mentions.members.first() || message.member;
        const embed = new EmbedBuilder()
            .setTitle(`🕵️ تقرير ${member.user.username}`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '🆔 ID', value: member.user.id, inline: true },
                { name: '📅 تاريخ الحساب', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:D>`, inline: true },
                { name: '📥 تاريخ الانضمام', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:D>`, inline: true },
                { name: '🎭 أعلى رتبة', value: `${member.roles.highest}`, inline: true }
            )
            .setColor(0x00ff00);
        message.channel.send({ embeds: [embed] });
    }
    else if (command === 'تايم') {
        message.channel.send(`⏰ ${new Date().toLocaleTimeString('ar-SA')}`);
    }
    else if (command === 'طقس') {
        if (!args[0]) return message.reply('❌ اكتب اسم مدينة');
        try {
            const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args[0]}&appid=YOUR_KEY&lang=ar&units=metric`);
            const w = res.data;
            const embed = new EmbedBuilder()
                .setTitle(`🌤️ ${w.name}`)
                .setDescription(w.weather[0].description)
                .addFields({ name: '🌡️ الحرارة', value: `${w.main.temp}°C`, inline: true }, { name: '💧 الرطوبة', value: `${w.main.humidity}%`, inline: true })
                .setColor(0x00ff00);
            message.channel.send({ embeds: [embed] });
        } catch (e) { message.reply('❌ مدينة غير صالحة'); }
    }
    else if (command === 'يوزر') {
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setTitle(`👤 ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields({ name: 'ID', value: user.id, inline: true }, { name: 'تاريخ الإنشاء', value: `<t:${Math.floor(user.createdTimestamp/1000)}:D>`, inline: true })
            .setColor(0x00ff00);
        message.channel.send({ embeds: [embed] });
    }
    else if (command === 'رتبة') {
        const member = message.mentions.members.first() || message.member;
        const roles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') || 'لا يوجد';
        message.channel.send(`🎭 ${member.user.username}: ${roles}`);
    }
    else if (command === 'احصائيات') {
        const embed = new EmbedBuilder()
            .setTitle('📈 إحصائيات السيرفر')
            .addFields(
                { name: 'الأعضاء', value: `${message.guild.memberCount}`, inline: true },
                { name: 'الرومات النصية', value: `${message.guild.channels.cache.filter(c => c.type === 0).size}`, inline: true },
                { name: 'الرومات الصوتية', value: `${message.guild.channels.cache.filter(c => c.type === 2).size}`, inline: true }
            )
            .setColor(0x00ff00);
        message.channel.send({ embeds: [embed] });
    }
    // إشراف
    else if (['كتم', 'اص', 'ميوت'].includes(command)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ ما تقدر عليه');
        const duration = args[1] ? ms(args[1]) : 0;
        await member.timeout(duration || null, 'كتم');
        message.channel.send(`✅ ${member.user} انكتم${duration ? ' لمدة '+args[1] : ' للأبد'}`);
        sendDM(member.user, `⚠️ تم كتمك في سيرفر ${message.guild.name}`);
    }
    else if (['تكلم', 'انبح'].includes(command)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ ما تقدر عليه');
        await member.timeout(null);
        message.channel.send(`🔊 ${member.user} صار يقدر يتكلم`);
    }
    else if (['طرد', 'تفو'].includes(command)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ ما تقدر');
        await member.kick('طرد');
        message.channel.send(`👢 ${member.user} طار من السيرفر`);
    }
    else if (['باند', 'حظر'].includes(command)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ ما تقدر');
        await member.ban({ reason: 'حظر' });
        message.channel.send(`🔨 ${member.user} انحظر`);
    }
    else if (command === 'سجن') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ ما تقدر');
        const jailRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
        if (!jailRole) return message.reply('دور السجن مو موجود');
        const memberRoles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.id);
        jailData.set(`${message.guild.id}-${member.id}`, memberRoles);
        await member.roles.set([jailRole]);
        message.channel.send(`🔒 ${member.user} انسجن`);
    }
    else if (command === 'فك_سجن') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        const saved = jailData.get(`${message.guild.id}-${member.id}`);
        if (!saved) return message.reply('مو مسجون');
        const jailRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
        await member.roles.remove(jailRole);
        await member.roles.add(saved);
        jailData.delete(`${message.guild.id}-${member.id}`);
        message.channel.send(`🔓 ${member.user} خرج من السجن ورجعت رتبه`);
    }
    else if (command === 'مسح') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ ما عندك صلاحية');
        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100) return message.reply('اكتب رقم بين 1 و 100');
        await message.channel.bulkDelete(amount, true);
        message.channel.send(`✅ تم مسح ${amount} رسالة`).then(m => setTimeout(() => m.delete(), 3000));
    }
    else if (command === 'لوك') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('❌ ما عندك صلاحية');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        message.reply('🔒 الروم مقفول');
    }
    else if (command === 'انلوك') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('❌ ما عندك صلاحية');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        message.reply('🔓 الروم مفتوح');
    }
    else if (command === 'تحذير') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ ما تقدر');
        message.channel.send(`⚠️ ${member.user} تم تحذيرك!`);
        sendDM(member.user, `⚠️ لقد تلقيت تحذيراً في سيرفر ${message.guild.name}`);
    }
    // استفزاز
    else if (['انقلع', 'اخرس', 'خرس', 'سحب_عليه', 'انفجر', 'امص', 'كمخ', 'صفعة', 'بصق'].includes(command)) {
        const target = message.mentions.members.first();
        if (!target) return message.reply('منشن شخص.');
        if (['انقلع', 'اخرس', 'خرس'].includes(command)) {
            if (!hasPermission(message.member, target)) return message.reply('❌ ما تقدر');
            await target.timeout(60000, 'عقوبة استفزازية');
            message.channel.send(`💨 ${target.user} انعاقب دقيقة`);
        } else if (command === 'سحب_عليه') {
            if (!hasPermission(message.member, target)) return message.reply('❌ ما تقدر');
            const jRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
            if (!jRole) return message.reply('دور السجن مو موجود');
            await target.roles.add(jRole);
            message.channel.send(`🚔 ${target.user} انسحب عليه وسجن`);
        } else if (command === 'انفجر') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ ما عندك صلاحية');
            const msgs = await message.channel.messages.fetch({ limit: 100 });
            const userMsgs = msgs.filter(m => m.author.id === target.id);
            await message.channel.bulkDelete(userMsgs, true);
            message.channel.send(`💥 رسائل ${target.user} انفجرت`);
        } else {
            message.channel.send(`${target.user} تعال ${command} مني 😂`);
        }
    }
    // ألعاب
    else if (['حجرة', 'ورقة', 'مقص'].includes(command)) {
        const choices = ['حجرة', 'ورقة', 'مقص'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        message.reply(`✊✋✌️ البوت اختار: **${botChoice}**`);
    }
    else if (command === 'تخمين') {
        const guess = Math.floor(Math.random() * 10) + 1;
        const userGuess = parseInt(args[0]);
        if (!userGuess) return message.reply('خمن رقم بين 1 و 10');
        message.reply(userGuess === guess ? '✅ صح عليك!' : `❌ غلط! الرقم كان ${guess}`);
    }
    else if (command === 'عملة') {
        message.reply(`🪙 ${Math.random() < 0.5 ? 'ملك' : 'كتابة'}`);
    }
    else if (command === 'نرد') {
        message.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
    }
    else if (['اكس_او', 'سرعة_كتابة', 'شنق', 'تحدي'].includes(command)) {
        message.reply('⏳ قريباً');
    }
    // إسلامية
    else if (command === 'قرآن') message.reply('📖 https://quran.com');
    else if (command === 'حديث') message.reply('📜 "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت"');
    else if (command === 'اذكار') message.reply('📿 سبحان الله وبحمده، سبحان الله العظيم');
    else if (command === 'تسبيح') message.reply('📿 سبحان الله، الحمدلله، الله أكبر');
    else if (command === 'صلاة') message.reply('🕌 حان الآن وقت الصلاة');
    // اقتصاد
    else if (command === 'فلوسي') message.reply('💰 رصيدك: 500 ريال (وهمي)');
    else if (command === 'راتب') message.reply('💸 استلمت راتبك اليومي: 100 ريال');
    else if (command === 'تحويل') {
        const user = message.mentions.users.first();
        const amount = parseInt(args[1]);
        if (!user || !amount) return message.reply('-تحويل @شخص المبلغ');
        message.reply(`💵 حولت ${amount} ريال إلى ${user.username}`);
    }
    else if (command === 'متجر') message.reply('🛒 المتجر: 1. كلمة مرور (1000) 2. رتبة مميزة (5000)');
    else if (command === 'هدية') {
        const user = message.mentions.users.first();
        if (!user) return message.reply('منشن شخص تهديه');
        message.reply(`🎁 أهديت ${user.username} 50 ريال`);
    }
    else if (command === 'تذكرة') {
        const embed = new EmbedBuilder()
            .setTitle('🎫 نظام التذاكر')
            .setDescription('اختر نوع التذكرة:')
            .setColor(0x00ff00);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('ticket_support').setLabel('الدعم الفني').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('ticket_report_member').setLabel('الإبلاغ عن عضو').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_report_admin').setLabel('الإبلاغ عن إداري').setStyle(ButtonStyle.Secondary)
            );
        message.channel.send({ embeds: [embed], components: [row] });
    }
});

// ============ التفاعلات ============
client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'help_menu') {
            const value = interaction.values[0];
            let embed;
            switch (value) {
                case 'moderation':
                    embed = new EmbedBuilder().setTitle('🛡️ الإشراف').setDescription('كتم, اص, تكلم, انبح, طرد, تفو, باند, حظر, سجن, فك_سجن, مسح, لوك, انلوك, تحذير').setColor(0x00ff00);
                    break;
                case 'fun':
                    embed = new EmbedBuilder().setTitle('😈 الاستفزاز').setDescription('انقلع, خرس, اخرس, سحب_عليه, انفجر, امص, كمخ, صفعة, بصق').setColor(0x00ff00);
                    break;
                case 'games':
                    embed = new EmbedBuilder().setTitle('🎮 الألعاب').setDescription('حجرة, ورقة, مقص, تخمين, عملة, نرد, اكس_او, سرعة_كتابة, شنق, تحدي').setColor(0x00ff00);
                    break;
                case 'islamic':
                    embed = new EmbedBuilder().setTitle('🕌 الإسلامية').setDescription('قرآن, حديث, اذكار, تسبيح, صلاة').setColor(0x00ff00);
                    break;
                case 'general':
                    embed = new EmbedBuilder().setTitle('👤 العامة').setDescription('اوامر, بينج, سيرفر, اواتار, تحقق, تايم, طقس, يوزر, رتبة, احصائيات').setColor(0x00ff00);
                    break;
                case 'economy':
                    embed = new EmbedBuilder().setTitle('💰 الاقتصاد').setDescription('فلوسي, راتب, تحويل, متجر, هدية').setColor(0x00ff00);
                    break;
                case 'tickets':
                    embed = new EmbedBuilder().setTitle('🎫 التذاكر').setDescription('تذكرة (لفتح قائمة التذاكر), مساعدة, بلاغ, تقرير, قريب').setColor(0x00ff00);
                    break;
            }
            await interaction.update({ embeds: [embed], components: [interaction.message.components[0]] });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith('ticket_')) {
            const type = interaction.customId.replace('ticket_', '');
            const guild = interaction.guild;
            const member = interaction.member;

            const channel = await guild.channels.create({
                name: `ticket-${member.user.username}-${type}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: guild.ownerId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });
            const embed = new EmbedBuilder()
                .setTitle(`🎫 تذكرة ${type === 'support' ? 'دعم فني' : type === 'report_member' ? 'إبلاغ عن عضو' : 'إبلاغ عن إداري'}`)
                .setDescription(`مرحباً ${member.user}، فريق الدعم سيأتي قريباً.`)
                .setColor(0x00ff00);
            channel.send({ embeds: [embed] });
            await interaction.reply({ content: `✅ تم إنشاء تذكرتك في ${channel}`, ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN).catch(err => console.error('فشل الاتصال:', err));
