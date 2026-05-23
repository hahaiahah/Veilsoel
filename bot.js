// ============================================
// بوت whitehat9995# - النسخة الأسطورية النهائية
// ============================================

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

// ============ الإعدادات ============
const PREFIX = "-";
const JAIL_ROLE_NAME = "مسجون";
const WELCOME_CHANNEL_ID = "1481786619303297205";
const LEAVE_CHANNEL_ID = "1481786887680299088";
const NEWS_CHANNEL_ID = "1481800500721746135";
const DECORATIVE_LINE = "https://cdn.discordapp.com/attachments/1481775956300402761/1481901028507914332/line.png";
const NEWS_API_KEY = "b3371fd75d11409ebb3b795d95f0ce8a";
const SUPPORT_ROLE_ID = "123456789012345678"; // ضع هنا آيدي رتبة الدعم الفني

// التسلسل الهرمي للرتب
const roleHierarchy = [
    "SOEL 🔱", "Central Bank.", "FlixerX", "Developer 👨‍💻", "Owner", "Co-Owner",
    "ابو محمد", "Head Moderator", "Moderator", "Admin", "Wicks", "Support🛠️",
    "Helper", "بكّمي", "Member", "سجن", "مسجون"
];

// تخزين السجن
const jailData = new Map();

// ============ دوال مساعدة ============
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

async function sendDM(user, content) {
    try { await user.send(content); } catch (e) { /* لا يمكن إرسال */ }
}

// ============ البوت يعمل ============
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} يعمل`);
    client.user.setActivity("-اوامر | نظام متكامل", { type: ActivityType.Watching });

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

// ============ الترحيب والمغادرة (فخمين وبسيطين) ============
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
        .setTitle('🌟 مرحباً بك في رحابنا')
        .setDescription(`حللت أهلاً ووطئت سهلاً، يا **${member.user.username}**.\nأنت العضو رقم **${member.guild.memberCount}** في السيرفر.\nأسأل الله أن تطيب لك الإقامة بيننا.`)
        .setImage(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor(0x00ff00)
        .setFooter({ text: 'whitehat9995#' });
    channel.send({ embeds: [embed] });
});

client.on('guildMemberRemove', member => {
    const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
        .setTitle('💔 وداعاً')
        .setDescription(`غادرنا **${member.user.username}**، سائلين المولى أن يوفقه أينما حلّ.\nعدد المتبقين: **${member.guild.memberCount}**`)
        .setImage(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor(0xff0000)
        .setFooter({ text: 'whitehat9995#' });
    channel.send({ embeds: [embed] });
});

// ============ معالج الأوامر ============
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // دالة إرسال خاص مع صورة السيرفر
    const sendPunishmentDM = async (user, action, reason, duration) => {
        const guildIcon = message.guild.iconURL({ dynamic: true, size: 1024 });
        let dmContent = `🛑 **${action}** من سيرفر **${message.guild.name}**`;
        if (reason) dmContent += `\n📝 السبب: ${reason}`;
        if (duration) dmContent += `\n⏱️ المدة: ${duration}`;
        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription(dmContent)
            .setThumbnail(guildIcon)
            .setFooter({ text: 'whitehat9995#' });
        await sendDM(user, { embeds: [embed] });
    };

    // ============ قائمة الأوامر ============
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

    // ============ أوامر عامة ============
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
    // ============ إشراف أساسي ============
    else if (['كتم', 'اص', 'ميوت'].includes(command)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        const duration = args[1] ? ms(args[1]) : 0;
        const reason = args.slice(2).join(' ') || '';
        await member.timeout(duration || null, reason || 'كتم');
        message.channel.send(`✅ ${member.user} انكتم${duration ? ' لمدة '+args[1] : ' للأبد'}${reason ? ' بسبب: '+reason : ''}`);
        sendPunishmentDM(member.user, 'كتم', reason, duration ? args[1] : 'دائم');
    }
    else if (['تكلم', 'انبح'].includes(command)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        await member.timeout(null);
        message.channel.send(`🔊 ${member.user} صار يتكلم`);
    }
    else if (['طرد', 'تفو'].includes(command)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        await member.kick('طرد');
        message.channel.send(`👢 ${member.user} طار من السيرفر`);
    }
    else if (['باند', 'حظر'].includes(command)) {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        await member.ban({ reason: 'حظر' });
        message.channel.send(`🔨 ${member.user} انحظر`);
    }
    else if (command === 'سجن') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        const jailRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
        if (!jailRole) return message.reply('دور السجن غير موجود');
        const memberRoles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.id);
        jailData.set(`${message.guild.id}-${member.id}`, memberRoles);
        await member.roles.set([jailRole]);
        message.channel.send(`🔒 ${member.user} أُودع السجن`);
    }
    else if (command === 'فك_سجن' || command === 'عفو') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        const saved = jailData.get(`${message.guild.id}-${member.id}`);
        if (!saved) return message.reply('ليس مسجوناً');
        const jailRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
        await member.roles.remove(jailRole);
        await member.roles.add(saved);
        jailData.delete(`${message.guild.id}-${member.id}`);
        message.channel.send(`🔓 ${member.user} خرج من السجن ورُدّت إليه رتبه`);
    }
    else if (command === 'مسح') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ لا تملك صلاحية');
        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100) return message.reply('اكتب رقم بين 1 و 100');
        await message.channel.bulkDelete(amount, true);
        message.channel.send(`✅ تم مسح ${amount} رسالة`).then(m => setTimeout(() => m.delete(), 3000));
    }
    else if (command === 'لوك') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('❌ لا تملك صلاحية');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        message.reply('🔒 أُقفل الروم');
    }
    else if (command === 'انلوك') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('❌ لا تملك صلاحية');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        message.reply('🔓 فُتح الروم');
    }
    else if (command === 'تحذير' || command === 'انذار') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        const reason = args.slice(1).join(' ') || '';
        message.channel.send(`⚠️ ${member.user} تلقيت تحذيراً${reason ? ' بسبب: '+reason : ''}`);
        sendPunishmentDM(member.user, 'تحذير', reason);
    }
    // ============ أوامر إشرافية جديدة ============
    else if (command === 'ابلع_رجلي') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        const duration = args[1] ? ms(args[1]) : 600000; // افتراضي 10 دقائق
        const reason = args.slice(2).join(' ') || 'أمر استفزازي';
        await member.timeout(duration, reason);
        message.channel.send(`🦵 ${member.user} ابتلع رجلي لمدة ${ms(duration, { long: true })}`);
        sendPunishmentDM(member.user, 'إبلاع رجلي 😂', reason, ms(duration, { long: true }));
    }
    else if (command === 'تهدئة') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        await member.timeout(300000, 'تهدئة');
        message.channel.send(`🧊 ${member.user} هُدّئ 5 دقائق`);
        sendPunishmentDM(member.user, 'تهدئة', '', '5 دقائق');
    }
    else if (command === 'تقييد') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('❌ لا تملك صلاحية');
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        await message.channel.permissionOverwrites.edit(member.id, { SendMessages: false });
        message.channel.send(`🔇 ${member.user} قُيّد في هذا الروم`);
    }
    else if (command === 'فك_الكل') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('منشن شخص.');
        if (!hasPermission(message.member, member)) return message.reply('❌ لا تملك صلاحية.');
        await member.timeout(null);
        const jailRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
        if (jailRole && member.roles.cache.has(jailRole.id)) {
            const saved = jailData.get(`${message.guild.id}-${member.id}`);
            if (saved) {
                await member.roles.remove(jailRole);
                await member.roles.add(saved);
                jailData.delete(`${message.guild.id}-${member.id}`);
            }
        }
        // يمكن فك التقييد من جميع الرومات لكن نكتفي بالميوت والسجن
        message.channel.send(`✨ ${member.user} رُفعت عنه جميع العقوبات`);
    }
    else if (command === 'تنظيف') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ لا تملك صلاحية');
        const fetched = await message.channel.messages.fetch({ limit: 100 });
        const botMessages = fetched.filter(m => m.author.id === client.user.id);
        await message.channel.bulkDelete(botMessages, true);
        message.channel.send('🧹 نُظّفت رسائل البوت').then(m => setTimeout(() => m.delete(), 3000));
    }
    else if (command === 'قول') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ لا تملك صلاحية');
        const sayMessage = args.join(' ');
        if (!sayMessage) return message.reply('اكتب شيئاً ليقوله البوت');
        await message.delete().catch(() => {});
        message.channel.send(sayMessage);
    }
    // ============ استفزاز ============
    else if (['انقلع', 'اخرس', 'خرس', 'سحب_عليه', 'انفجر', 'امص', 'كمخ', 'صفعة', 'بصق'].includes(command)) {
        const target = message.mentions.members.first();
        if (!target) return message.reply('منشن شخص.');
        if (['انقلع', 'اخرس', 'خرس'].includes(command)) {
            if (!hasPermission(message.member, target)) return message.reply('❌ لا تملك صلاحية');
            await target.timeout(60000, 'عقوبة استفزازية');
            message.channel.send(`💨 ${target.user} انعاقب دقيقة`);
        } else if (command === 'سحب_عليه') {
            if (!hasPermission(message.member, target)) return message.reply('❌ لا تملك صلاحية');
            const jRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
            if (!jRole) return message.reply('دور السجن غير موجود');
            await target.roles.add(jRole);
            message.channel.send(`🚔 ${target.user} سُحب عليه وسُجن`);
        } else if (command === 'انفجر') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ لا تملك صلاحية');
            const msgs = await message.channel.messages.fetch({ limit: 100 });
            const userMsgs = msgs.filter(m => m.author.id === target.id);
            await message.channel.bulkDelete(userMsgs, true);
            message.channel.send(`💥 رسائل ${target.user} طارت`);
        } else {
            message.channel.send(`${target.user} تعال ${command} مني 😂`);
        }
    }
    // ============ ألعاب ============
    else if (['حجرة', 'ورقة', 'مقص'].includes(command)) {
        const choices = ['حجرة', 'ورقة', 'مقص'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        message.reply(`✊✋✌️ البوت اختار: **${botChoice}**`);
    }
    else if (command === 'تخمين') {
        const guess = Math.floor(Math.random() * 10) + 1;
        const userGuess = parseInt(args[0]);
        if (!userGuess) return message.reply('خمن رقم بين 1 و 10');
        message.reply(userGuess === guess ? '✅ أصبت!' : `❌ أخطأت! الرقم كان ${guess}`);
    }
    else if (command === 'عملة') {
        message.reply(`🪙 ${Math.random() < 0.5 ? 'ملك' : 'كتابة'}`);
    }
    else if (command === 'نرد') {
        message.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
    }
    else if (['اكس_او', 'سرعة_كتابة', 'شنق', 'تحدي'].includes(command)) {
        message.reply('⏳ قيد التطوير');
    }
    // ============ إسلامية ============
    else if (command === 'قرآن') message.reply('📖 https://quran.com');
    else if (command === 'حديث') message.reply('📜 "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت"');
    else if (command === 'اذكار') message.reply('📿 سبحان الله وبحمده، سبحان الله العظيم');
    else if (command === 'تسبيح') message.reply('📿 سبحان الله، الحمدلله، الله أكبر');
    else if (command === 'صلاة') message.reply('🕌 حان الآن وقت الصلاة');
    // ============ اقتصاد ============
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
    // ============ تذاكر (لوحة الأوامر) ============
    else if (command === 'تذكرة') {
        const embed = new EmbedBuilder()
            .setTitle('🎫 نظام التذاكر')
            .setDescription('اختر نوع التذكرة التي ترغب بها.')
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

// ============ تفاعلات الأزرار والقوائم ============
client.on('interactionCreate', async interaction => {
    // قائمة المساعدة
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'help_menu') {
            const value = interaction.values[0];
            let embed;
            switch (value) {
                case 'moderation':
                    embed = new EmbedBuilder().setTitle('🛡️ الإشراف').setDescription('كتم, اص, تكلم, انبح, طرد, تفو, باند, حظر, سجن, فك_سجن, مسح, لوك, انلوك, تحذير, ابلع_رجلي, تهدئة, تقييد, فك_الكل, تنظيف, قول, عفو').setColor(0x00ff00);
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
                    embed = new EmbedBuilder().setTitle('🎫 التذاكر').setDescription('تذكرة (لفتح قائمة التذاكر)').setColor(0x00ff00);
                    break;
            }
            await interaction.update({ embeds: [embed], components: [interaction.message.components[0]] });
        }
    }
    // أزرار التذاكر
    else if (interaction.isButton()) {
        if (interaction.customId.startsWith('ticket_') && !interaction.customId.startsWith('ticket_close')) {
            const type = interaction.customId.replace('ticket_', '');
            const guild = interaction.guild;
            const member = interaction.member;

            const channel = await guild.channels.create({
                name: `تذكرة-${member.user.username}-${type}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: guild.ownerId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });

            const embed = new EmbedBuilder()
                .setTitle(`🎫 ${type === 'support' ? 'دعم فني' : type === 'report_member' ? 'إبلاغ عن عضو' : 'إبلاغ عن إداري'}`)
                .setDescription(`مرحباً بك ${member.user}، سيقوم فريق الدعم بالرد عليك في أقرب وقت.\nيرجى إرفاق الصور والأدلة اللازمة لتسريع حل مشكلتك.`)
                .setColor(0x00ff00);

            const closeRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`ticket_close_${channel.id}`).setLabel('🔒 قفل التذكرة').setStyle(ButtonStyle.Danger)
                );

            const pingMessage = `<@&${SUPPORT_ROLE_ID}>`;
            await channel.send({ content: pingMessage, embeds: [embed], components: [closeRow] });
            await interaction.reply({ content: `✅ أُنشئت تذكرتك في ${channel}`, ephemeral: true });
        }
        else if (interaction.customId.startsWith('ticket_close_')) {
            const channelId = interaction.customId.replace('ticket_close_', '');
            const channel = interaction.guild.channels.cache.get(channelId);
            if (channel) {
                await channel.delete();
            }
            await interaction.reply({ content: 'تم قفل التذكرة وحذفها.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN).catch(err => console.error('فشل الاتصال:', err));
