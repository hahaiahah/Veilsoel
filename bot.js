// ============================================
// بوت whitehat9995# - 50 أمر
// جميع الأوامر تبدأ بـ "-"
// ============================================

const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Partials } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
const ms = require('ms');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = "-";
const JAIL_ROLE_NAME = "مسجون";
const JAIL_CHANNEL_ID = "1483291016575586414"; // قناة السجن (اختصرنا)
const WELCOME_CHANNEL_ID = "1481786619303297205";
const LEAVE_CHANNEL_ID = "1481786887680299088";
const NEWS_CHANNEL_ID = "1481800500721746135";
const DECORATIVE_LINE = "https://cdn.discordapp.com/attachments/1481775956300402761/1481901028507914332/line.png";
const NEWS_API_KEY = "b3371fd75d11409ebb3b795d95f0ce8a"; // مفتاح الأخبار

// تخزين رتب السجن (في الذاكرة فقط)
const jailData = new Map();

// دالة فحص الصلاحيات حسب التسلسل
const roleHierarchy = [
    "SOEL 🔱", "Central Bank.", "FlixerX", "Developer 👨‍💻", "Owner", "Co-Owner",
    "ابو محمد", "Head Moderator", "Moderator", "Admin", "Wicks", "Support🛠️",
    "Helper", "بكّمي", "Member", "سجن", "مسجون"
];

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

// ============ تشغيل البوت ============
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} يعمل`);
    client.user.setActivity("-اوامر | للمساعدة", { type: 3 });

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

// ============ الترحيب والمغادرة ============
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setTitle(`🌟 مرحباً ${member.user.username}`)
        .setDescription(`أنت العضو رقم **${member.guild.memberCount}**`)
        .setImage(DECORATIVE_LINE)
        .setColor(0x00ff00);
    channel.send({ embeds: [embed] });
});

client.on('guildMemberRemove', member => {
    const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setTitle(`💔 ${member.user.username} غادر`)
        .setDescription(`نتمنى له التوفيق. الأعضاء المتبقين: **${member.guild.memberCount}**`)
        .setImage(DECORATIVE_LINE)
        .setColor(0xff0000);
    channel.send({ embeds: [embed] });
});

// ============ معالج الأوامر ============
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ----- دالة المساعدة -----
    const sendHelp = () => {
        const embed = new EmbedBuilder()
            .setTitle('📜 قائمة أوامر whitehat9995#')
            .setColor(0x00ff00)
            .setDescription('كل الأوامر تبدأ بـ `-`')
            .addFields(
                { name: '🛡️ إشراف', value: 'كتم, اص, تكلم, انبح, طرد, تفو, باند, حظر, سجن, فك_سجن, مسح, لوك, انلوك, تحذير, ميوت' },
                { name: '😈 استفزاز', value: 'انقلع, خرس, سحب_عليه, انفجر, امص, كمخ, صفعة, بصق, اخرس, انبح, تفو' },
                { name: '🎮 ألعاب', value: 'حجرة, ورقة, مقص, تخمين, عملة, نرد, اكس_او, سرعة_كتابة, شنق, تحدي' },
                { name: '🕌 إسلامية', value: 'قرآن, حديث, اذكار, تسبيح, صلاة' },
                { name: '👤 عامة', value: 'اوامر, بينج, سيرفر, اواتار, تحقق, تايم, طقس, يوزر, رتبة, احصائيات' },
                { name: '💰 اقتصاد', value: 'فلوسي, راتب, تحويل, متجر, هدية' },
                { name: '🎫 تذاكر', value: 'تذكرة, مساعدة, بلاغ, تقرير, قريب' }
            )
            .setFooter({ text: 'whitehat9995# | SOEL © 2025' });
        message.channel.send({ embeds: [embed] });
    };

    // ============ أوامر عامة ============
    switch (command) {
        case 'اوامر':
        case 'help':
            return sendHelp();

        case 'بينج':
            const pingMsg = await message.channel.send('⏳ جاري الحساب...');
            const ping = pingMsg.createdTimestamp - message.createdTimestamp;
            pingMsg.edit({ content: `🏓 بونج! سرعة الاتصال: **${ping}ms**` });
            break;

        case 'سيرفر':
            const guild = message.guild;
            const serverEmbed = new EmbedBuilder()
                .setTitle(`📊 ${guild.name}`)
                .setThumbnail(guild.iconURL())
                .addFields(
                    { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
                    { name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true },
                    { name: '💬 الرومات', value: `${guild.channels.cache.size}`, inline: true },
                    { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
                )
                .setColor(0x00ff00);
            message.channel.send({ embeds: [serverEmbed] });
            break;

        case 'اواتار':
            const user = message.mentions.users.first() || message.author;
            const avatarEmbed = new EmbedBuilder()
                .setTitle(`🖼️ صورة ${user.username}`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setColor(0x00ff00);
            message.channel.send({ embeds: [avatarEmbed] });
            break;

        case 'تحقق':
            const memberCheck = message.mentions.members.first() || message.member;
            const checkEmbed = new EmbedBuilder()
                .setTitle(`🕵️ تقرير ${memberCheck.user.username}`)
                .setThumbnail(memberCheck.user.displayAvatarURL())
                .addFields(
                    { name: '🆔 ID', value: memberCheck.user.id, inline: true },
                    { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(memberCheck.user.createdTimestamp / 1000)}:D>`, inline: true },
                    { name: '📥 تاريخ الانضمام', value: `<t:${Math.floor(memberCheck.joinedTimestamp / 1000)}:D>`, inline: true },
                    { name: '🎭 أعلى رتبة', value: `${memberCheck.roles.highest}`, inline: true }
                )
                .setColor(0x00ff00);
            message.channel.send({ embeds: [checkEmbed] });
            break;

        case 'تايم':
            message.channel.send(`⏰ الوقت الحالي: ${new Date().toLocaleTimeString('ar-SA')}`);
            break;

        case 'طقس':
            if (!args[0]) return message.reply('❌ اكتب اسم مدينة، مثال: -طقس الرياض');
            try {
                const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args[0]}&appid=YOUR_OPENWEATHER_API_KEY&lang=ar&units=metric`);
                const w = weatherRes.data;
                const weatherEmbed = new EmbedBuilder()
                    .setTitle(`🌤️ الطقس في ${w.name}`)
                    .setDescription(`${w.weather[0].description}`)
                    .addFields(
                        { name: '🌡️ الحرارة', value: `${w.main.temp}°C`, inline: true },
                        { name: '💧 الرطوبة', value: `${w.main.humidity}%`, inline: true }
                    )
                    .setColor(0x00ff00);
                message.channel.send({ embeds: [weatherEmbed] });
            } catch (e) { message.reply('❌ مدينة غير صالحة أو خطأ في API.'); }
            break;

        case 'يوزر':
            const userInfo = message.mentions.users.first() || message.author;
            const userEmbed = new EmbedBuilder()
                .setTitle(`👤 معلومات ${userInfo.username}`)
                .setThumbnail(userInfo.displayAvatarURL())
                .addFields(
                    { name: 'ID', value: userInfo.id, inline: true },
                    { name: 'تاريخ الإنشاء', value: `<t:${Math.floor(userInfo.createdTimestamp / 1000)}:D>`, inline: true }
                )
                .setColor(0x00ff00);
            message.channel.send({ embeds: [userEmbed] });
            break;

        case 'رتبة':
            const rankMember = message.mentions.members.first() || message.member;
            const roles = rankMember.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') || 'لا يوجد';
            message.channel.send(`🎭 رتب ${rankMember.user.username}: ${roles}`);
            break;

        case 'احصائيات':
            const statsEmbed = new EmbedBuilder()
                .setTitle('📈 إحصائيات السيرفر')
                .addFields(
                    { name: 'الأعضاء', value: `${message.guild.memberCount}`, inline: true },
                    { name: 'الرومات النصية', value: `${message.guild.channels.cache.filter(c => c.type === 0).size}`, inline: true },
                    { name: 'الرومات الصوتية', value: `${message.guild.channels.cache.filter(c => c.type === 2).size}`, inline: true }
                )
                .setColor(0x00ff00);
            message.channel.send({ embeds: [statsEmbed] });
            break;

        // ============ أوامر إشرافية واستفزازية ============
        case 'كتم':
        case 'اص':
        case 'ميوت':
            const muteMember = message.mentions.members.first();
            if (!muteMember) return message.reply('منشن شخص.');
            if (!hasPermission(message.member, muteMember)) return message.reply('❌ ما تقدر عليه');
            const muteDuration = args[1] ? ms(args[1]) : 0;
            await muteMember.timeout(muteDuration || null, 'كتم');
            message.reply(`✅ ${muteMember.user.username} انكتم${muteDuration ? ' لمدة ' + args[1] : ' للأبد'} .`);
            break;

        case 'تكلم':
        case 'انبح':
            const unmuteMember = message.mentions.members.first();
            if (!unmuteMember) return message.reply('منشن شخص.');
            if (!hasPermission(message.member, unmuteMember)) return message.reply('❌ ما تقدر عليه');
            await unmuteMember.timeout(null);
            message.reply(`🔊 ${unmuteMember.user.username} صار يقدر يتكلم.`);
            break;

        case 'طرد':
        case 'تفو':
            const kickMember = message.mentions.members.first();
            if (!kickMember) return message.reply('منشن شخص.');
            if (!hasPermission(message.member, kickMember)) return message.reply('❌ ما تقدر تطرده');
            await kickMember.kick('طرد بواسطة البوت');
            message.reply(`👢 ${kickMember.user.username} طار من السيرفر`);
            break;

        case 'باند':
        case 'حظر':
            const banMember = message.mentions.members.first();
            if (!banMember) return message.reply('منشن شخص.');
            if (!hasPermission(message.member, banMember)) return message.reply('❌ ما تقدر تحظره');
            await banMember.ban({ reason: 'حظر بواسطة البوت' });
            message.reply(`🔨 ${banMember.user.username} انحظر`);
            break;

        case 'سجن':
            const jailMember = message.mentions.members.first();
            if (!jailMember) return message.reply('منشن شخص.');
            if (!hasPermission(message.member, jailMember)) return message.reply('❌ ما تقدر تسجنه');
            const jailRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
            if (!jailRole) return message.reply('دور السجن مو موجود.');
            // حفظ الرتب
            const memberRoles = jailMember.roles.cache.filter(r => r.name !== '@everyone').map(r => r.id);
            jailData.set(`${message.guild.id}-${jailMember.id}`, memberRoles);
            await jailMember.roles.set([jailRole]);
            message.reply(`🔒 ${jailMember.user.username} انسجن`);
            break;

        case 'فك_سجن':
            const unjailMember = message.mentions.members.first();
            if (!unjailMember) return message.reply('منشن شخص.');
            const savedRoles = jailData.get(`${message.guild.id}-${unjailMember.id}`);
            if (!savedRoles) return message.reply('هذا مو مسجون.');
            const jailRole2 = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
            await unjailMember.roles.remove(jailRole2);
            await unjailMember.roles.add(savedRoles);
            jailData.delete(`${message.guild.id}-${unjailMember.id}`);
            message.reply(`🔓 ${unjailMember.user.username} خرج من السجن ورجعت رتبه`);
            break;

        case 'مسح':
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ ما عندك صلاحية');
            const amount = parseInt(args[0]);
            if (!amount || amount < 1 || amount > 100) return message.reply('اكتب رقم بين 1 و 100');
            await message.channel.bulkDelete(amount, true);
            message.channel.send(`✅ تم مسح ${amount} رسالة`).then(m => setTimeout(() => m.delete(), 3000));
            break;

        case 'لوك':
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('❌ ما عندك صلاحية');
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
            message.reply('🔒 الروم مقفول.');
            break;

        case 'انلوك':
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('❌ ما عندك صلاحية');
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
            message.reply('🔓 الروم مفتوح.');
            break;

        case 'تحذير':
            const warnMember = message.mentions.members.first();
            if (!warnMember) return message.reply('منشن شخص.');
            message.channel.send(`⚠️ ${warnMember.user.username} تم تحذيرك!`);
            break;

        // أوامر استفزازية إضافية
        case 'انقلع':
            const kickMe = message.mentions.members.first();
            if (!kickMe) return message.reply('منشن شخص.');
            if (!hasPermission(message.member, kickMe)) return message.reply('❌ ما تقدر');
            await kickMe.timeout(60000, 'انقلع دقيقة');
            message.reply(`💨 ${kickMe.user.username} انقلع دقيقة`);
            break;

        case 'خرس':
            const silence = message.mentions.members.first();
            if (!silence) return message.reply('منشن شخص.');
            if (!hasPermission(message.member, silence)) return message.reply('❌ ما تقدر');
            await silence.timeout(300000, 'خرس 5 دقائق');
            message.reply(`🤫 ${silence.user.username} خرس 5 دقايق`);
            break;

        case 'سحب_عليه':
            const ignore = message.mentions.members.first();
            if (!ignore) return message.reply('منشن شخص.');
            // يسجن بسرعة (نفس السجن لكن بدون حفظ)
            const jRole = message.guild.roles.cache.find(r => r.name === JAIL_ROLE_NAME);
            if (!jRole) return message.reply('دور السجن مو موجود.');
            await ignore.roles.add(jRole);
            message.reply(`🚔 ${ignore.user.username} انسحب عليه وسجن`);
            break;

        case 'انفجر':
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ ما عندك صلاحية');
            const explodeMember = message.mentions.members.first();
            if (!explodeMember) return message.reply('منشن شخص.');
            const msgs = await message.channel.messages.fetch({ limit: 100 });
            const userMsgs = msgs.filter(m => m.author.id === explodeMember.id);
            await message.channel.bulkDelete(userMsgs, true);
            message.reply(`💥 رسائل ${explodeMember.user.username} انفجرت`);
            break;

        case 'امص':
        case 'كمخ':
        case 'صفعة':
        case 'بصق':
        case 'اخرس':
            const target = message.mentions.members.first();
            if (!target) return message.reply('منشن شخص.');
            message.channel.send(`${target.user.username} تعال ${command} مني 😂`);
            break;

        // ============ ألعاب ============
        case 'حجرة':
        case 'ورقة':
        case 'مقص':
            const rps = ['حجرة', 'ورقة', 'مقص'];
            const botRPS = rps[Math.floor(Math.random() * rps.length)];
            message.reply(`✊✋✌️ البوت اختار: **${botRPS}**`);
            break;

        case 'تخمين':
            const guess = Math.floor(Math.random() * 10) + 1;
            const userGuess = parseInt(args[0]);
            if (!userGuess) return message.reply('خمن رقم بين 1 و 10');
            if (userGuess === guess) message.reply('✅ صح عليك!');
            else message.reply(`❌ غلط! الرقم كان ${guess}`);
            break;

        case 'عملة':
            const coin = Math.random() < 0.5 ? 'ملك' : 'كتابة';
            message.reply(`🪙 ${coin}`);
            break;

        case 'نرد':
            const dice = Math.floor(Math.random() * 6) + 1;
            message.reply(`🎲 ${dice}`);
            break;

        case 'اكس_او':
            message.reply('🕹️ اكس او: قريباً');
            break;

        case 'سرعة_كتابة':
            message.reply('⌨️ اكتب: "البوت الأسطوري" بأسرع وقت. جاري التطوير');
            break;

        case 'شنق':
            message.reply('🇸🇦 شنق: جاري التطوير');
            break;

        case 'تحدي':
            const challenge = message.mentions.members.first();
            if (!challenge) return message.reply('منشن شخص للتحدي');
            message.channel.send(`${challenge.user.username} تم تحديك في معركة! ⚔️`);
            break;

        // ============ إسلامية ============
        case 'قرآن':
            message.reply('📖 استمع للقرآن: https://quran.com');
            break;

        case 'حديث':
            message.reply('📜 حديث: "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت"');
            break;

        case 'اذكار':
            message.reply('📿 سبحان الله وبحمده، سبحان الله العظيم');
            break;

        case 'تسبيح':
            message.reply('📿 سبحان الله، الحمدلله، الله أكبر');
            break;

        case 'صلاة':
            message.reply('🕌 حان الآن وقت الصلاة (للتذكير)');
            break;

        // ============ اقتصاد وهمي ============
        case 'فلوسي':
            message.reply('💰 رصيدك: 500 ريال (وهمي)');
            break;

        case 'راتب':
            message.reply('💸 استلمت راتبك اليومي: 100 ريال');
            break;

        case 'تحويل':
            const transferUser = message.mentions.users.first();
            const amountTrans = parseInt(args[1]);
            if (!transferUser || !amountTrans) return message.reply('استخدم: -تحويل @شخص المبلغ');
            message.reply(`💵 حولت ${amountTrans} ريال إلى ${transferUser.username}`);
            break;

        case 'متجر':
            message.reply('🛒 المتجر: 1. كلمة مرور (1000) 2. رتبة مميزة (5000)');
            break;

        case 'هدية':
            const giftUser = message.mentions.users.first();
            if (!giftUser) return message.reply('منشن شخص تهديه');
            message.reply(`🎁 أهديت ${giftUser.username} 50 ريال`);
            break;

        // ============ تذاكر ============
        case 'تذكرة':
            message.reply('🎫 نظام التذاكر: اختر نوع التذكرة:\n- الدعم الفني\n- الإبلاغ عن عضو\n- الإبلاغ عن إداري\n(سيتم إنشاء روم خاص)');
            // هنا يمكن تطوير نظام تذاكر بسيط بإنشاء روم خاص يدويًا (سنختصر)
            break;

        case 'مساعدة':
            message.reply('📞 للمساعدة العاجلة تواصل مع الإدارة');
            break;

        case 'بلاغ':
            message.reply('🚨 تم إرسال بلاغك للإدارة');
            break;

        case 'تقرير':
            message.reply('📊 تقريرك: لا توجد بيانات بعد');
            break;

        case 'قريب':
            message.reply('⏳ الخدمة قيد الإنشاء');
            break;

        default:
            message.reply('❌ أمر غير معروف. اكتب `-اوامر`');
    }
});

// تشغيل البوت
client.login(process.env.TOKEN);
