const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '-1003385254039';

// 🚀 لێرەدا هەموو هاوڕێکانت وەک خۆیان پارێزراون
const FRIENDS = [
    { name: "شەنیار", id: "5285811533" },
    { name: "عبدالباست", id: "8094239190" },
    { name: "اسماعیل", id: "8471929492" },
    { name: "سۆنیا", id: "8356643097" },
    { name: "شەهین", id: "8294302530" },
    { name: "ڕاز", id: "6675931933" }
];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;

        // ١. لۆجیکی ناردنی پرسیار لە وێبسایتەکەوە
        if (body.question) {
            const questionText = body.question;
            
            // تێکەڵکردنی هاوڕێکان بە شێوازی هەڕەمەکی بۆ ئەوەی دادپەروەرانە بێت
            const shuffledFriends = [...FRIENDS].sort(() => Math.random() - 0.5);
            
            let messageSent = false;
            let telegramResult = null;
            let selectedFriend = null;

            // گەڕان بەدوای یەکەم هاوڕێدا کە بۆتەکەی لای چالاک بێت
            for (const friend of shuffledFriends) {
                const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
                
                // شاردنەوەی ناوی هاوڕێکە لە ناو نیشانەی [ ] بۆ ئەوەی دواتر وێبهووکەکە بیخوێنێتەوە
                const response = await fetch(telegramUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: friend.id,
                        text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n"${questionText}"\n\n👤 بۆ: [${friend.name}]\n\n👇 بۆ وەڵامدانەوە، تەنها Reply (وەڵام)ی ئەم نامەیە بدەرەوە.`
                    })
                });

                telegramResult = await response.json();

                if (telegramResult.ok) {
                    messageSent = true;
                    selectedFriend = friend;
                    break; // نامەکە بۆ یەکەم کەسی بەردەست چوو، ئیتر بۆ کەسی تر ناچێت
                }
            }

            if (messageSent) {
                return res.status(200).json({ success: true, message: "نامەکە نێردرا" });
            } else {
                return res.status(500).json({ error: 'هیچ کام لە هاوڕێکان بۆتەکەیان ستارت نەکردووە!' });
            }
        }

        // ٢. لۆجیکی وەڵامدانەوە لە تێلیگرامەوە و ناردنی بۆ گرووپ (Webhook)
        if (body.message && body.message.reply_to_message) {
            const originalBotMessage = body.message.reply_to_message.text;
            const answerText = body.message.text;

            // پشکنیین بۆ دڵنیابوون لەوەی کە نامەکە هی یارییەکەیە
            if (originalBotMessage && originalBotMessage.includes('پرسیارێکی نوێی نهێنت بۆ هاتووە:')) {
                
                // دەرهێنانی دەقی پرسیارەکە لە نێوان جوت کەوانەکاندا ""
                const firstQuote = originalBotMessage.indexOf('"');
                const lastQuote = originalBotMessage.lastIndexOf('"');
                const questionText = originalBotMessage.substring(firstQuote + 1, lastQuote);

                // دەرهێنانی ناوی هاوڕێکە لە نێوان نیشانەکانی [ ]
                const firstBracket = originalBotMessage.indexOf('[');
                const lastBracket = originalBotMessage.indexOf(']');
                const friendName = originalBotMessage.substring(firstBracket + 1, lastBracket) || "هاوڕێیەک";

                const groupMessage = `📢 **وەڵامێکی نوێ هات!**\n\n🤔 **پرسیار:**\n"${questionText}"\n\n✍️ **وەڵامی (${friendName}):**\n"${answerText}"`;

                // ناردنی ڕاپۆرتی کۆتایی بۆ ناو گرووپەکەتان
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_CHAT_ID,
                        text: groupMessage,
                        parse_mode: 'Markdown'
                    })
                });
            }

            return res.status(200).json({ ok: true });
        }

        return res.status(400).json({ error: 'Bad Request' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
