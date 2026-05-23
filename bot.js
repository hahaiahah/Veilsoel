// ============================================
// بوت whitehat9995# - الحماية والتحقيق
// الحقوق محفوظة © SOEL
// ============================================

const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

const PREFIX = '-';

// ============ بداية تشغيل البوت ============
client.once('ready', () => {
    console.log(`✅ تم تشغيل ${client.user.tag} بنجاح`);
    console.log(`⚡ موجود في ${client.guilds.cache.size} سيرفر`);
    client.user.setActivity('🛡️ -اوامر للمساعدة', { type: 'WATCHING' });
});

// ============ الأوامر ============
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ── أمر عرض الأوامر ──
    if (command === 'اوامر' || command === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🛡️ أوامر بوت whitehat9995#')
            .setDescription('**كل الأوامر تبدأ بـ `-`**')
            .addFields(
                { name: '📋 أوامر عامة', value: '`-اوامر` - عرض كل الأوامر\n`-بينج` - سرعة الاتصال\n`-سيرفر` - معلومات السيرفر\n`-اواتار` - صورة البروفايل', inline: false },
                { name: '🛡️ أوامر إشرافية', value: '`-طرد @شخص` - طرد عضو\n`-حظر @شخص` - حظر عضو\n`-الغاء_حظر ID` - فك الحظر\n`-مسح 10` - مسح عدد رسائل\n`-ميوت @شخص` - إسكات عضو\n`-الغاء_ميوت @شخص` - فك الإسكات', inline: false },
                { name: '🕵️ أوامر تحقيق', value: '`-تحقق @شخص` - كل معلومات العضو\n`-صيد face` - بحث عن صورة بروفايل\n`-فحص رابط` - فحص رابط مشبوه', inline: false },
                { name: '⚙️ أوامر متقدمة', value: '`-روم_تحقيق` - إنشاء روم للتحقيق\n`-لوج` - تفعيل سجل المراقبة', inline: false }
            )
            .setFooter({ text: 'whitehat9995# | SOEL © 2025' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ── بينج ──
    if (command === 'بينج') {
        const msg = await message.channel.send('⏳ جاري الحساب...');
        const ping = msg.createdTimestamp - message.createdTimestamp;
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏓 بونج!')
            .setDescription(`سرعة الاتصال: **${ping}ms**\nسرعة API: **${client.ws.ping}ms**`);
        return msg.edit({ content: null, embeds: [embed] });
    }

    // ── معلومات السيرفر ──
    if (command === 'سيرفر') {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`📊 معلومات ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true },
                { name: '💬 الرومات', value: `${guild.channels.cache.size}`, inline: true },
                { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
            );
        return message.channel.send({ embeds: [embed] });
    }

    // ── الأفاتار ──
    if (command === 'اواتار') {
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`🖼️ صورة ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`[تحميل الصورة](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`);
        return message.channel.send({ embeds: [embed] });
    }

    // ── طرد ──
    if (command === 'طرد') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.channel.send('❌ ما عندك صلاحية طرد');
        }
        const member = message.mentions.members.first();
        if (!member) return message.channel.send('❌ منشن الشخص');
        if (!member.kickable) return message.channel.send('❌ ما أقدر أطرده');
        await member.kick();
        return message.channel.send(`✅ تم طرد **${member.user.username}**`);
    }

    // ── حظر ──
    if (command === 'حظر') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.channel.send('❌ ما عندك صلاحية حظر');
        }
        const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!member) return message.channel.send('❌ منشن الشخص أو أعطه ID');
        if (!member.bannable) return message.channel.send('❌ ما أقدر أحظره');
        await member.ban({ reason: 'تم الحظر بواسطة البوت' });
        return message.channel.send(`✅ تم حظر **${member.user.username}**`);
    }

    // ── إلغاء الحظر ──
    if (command === 'الغاء_حظر') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.channel.send('❌ ما عندك صلاحية');
        }
        const id = args[0];
        if (!id) return message.channel.send('❌ أعطني ID الشخص');
        await message.guild.members.unban(id);
        return message.channel.send(`✅ تم إلغاء حظر **${id}**`);
    }

    // ── مسح رسائل ──
    if (command === 'مسح') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.channel.send('❌ ما عندك صلاحية');
        }
        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100) return message.channel.send('❌ اكتب رقم بين 1 و 100');
        await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`✅ تم مسح **${amount}** رسالة`);
        setTimeout(() => msg.delete(), 3000);
        return;
    }

    // ── ميوت ──
    if (command === 'ميوت') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send('❌ ما عندك صلاحية');
        }
        const member = message.mentions.members.first();
        if (!member) return message.channel.send('❌ منشن الشخص');
        await member.timeout(60000 * 10, 'تم الإسكات بواسطة البوت'); // 10 دقائق
        return message.channel.send(`✅ تم إسكات **${member.user.username}** لمدة 10 دقائق`);
    }

    // ── إلغاء ميوت ──
    if (command === 'الغاء_ميوت') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send('❌ ما عندك صلاحية');
        }
        const member = message.mentions.members.first();
        if (!member) return message.channel.send('❌ منشن الشخص');
        await member.timeout(null);
        return message.channel.send(`✅ تم فك الإسكات عن **${member.user.username}**`);
    }

    // ── تحقيق ──
    if (command === 'تحقق') {
        const member = message.mentions.members.first() || message.member;
        const user = member.user;
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(`🕵️ تقرير تحقيق: ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '📥 تاريخ الانضمام', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
                { name: '🤖 بوت؟', value: user.bot ? 'نعم ⚠️' : 'لا', inline: true },
                { name: '🎭 أعلى رتبة', value: `${member.roles.highest}`, inline: true },
                { name: '📊 عدد الرتب', value: `${member.roles.cache.size}`, inline: true }
            )
            .setFooter({ text: 'whitehat9995# | تحقيق' })
            .setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ── فحص رابط ──
    if (command === 'فحص') {
        const link = args[0];
        if (!link) return message.channel.send('❌ أعطني رابط');
        const embed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('🔍 فحص الرابط')
            .setDescription(`الرابط: ${link}\n\n⚠️ استخدم [VirusTotal](https://www.virustotal.com) لفحص دقيق\n🔗 [افتح في VirusTotal](https://www.virustotal.com/gui/url/${encodeURIComponent(link)})`);
        return message.channel.send({ embeds: [embed] });
    }
});

// ============ تشغيل البوت ============
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
    console.error('❌ خطأ: لم يتم العثور على TOKEN في متغيرات البيئة');
    process.exit(1);
}

client.login(TOKEN);
