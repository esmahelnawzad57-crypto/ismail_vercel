const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '-1003385254039'; // ئایدی گرووپە پرایڤتە نوێیەکەت

// هاوڕێکانت (ئێستا تەنها ناوی تۆم هێشتووەتەوە بۆ ئەوەی ۱۰۰٪ تاقیی بکەینەوە)
const FRIENDS = [
    { name: "اسماعیل", id: "8471929492" }
];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const body = req.body;

        // ١. کاتێک پرسیار لە سایتەکەوە دێت (تەنها بۆ ئیسماعیل دەچێت لەگەڵ دوگمەی کلیککردن)
        if (body.question) {
            const questionText = body.question;
            const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: FRIENDS[0].id,
                    text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n"${questionText}"`,
                    reply_markup: {
                        inline_keyboard: [[
                            { 
                                text: "✍️ وەڵامدانەوە بەم پرسیارە", 
                                // ناردنی دەقی پرسیارەکە ڕێک لە ناو خودی دوگمەکە بۆ ئەوەی ون نەبێت
                                callback_data: `ans_${questionText.substring(0, 40)}` 
                            }
                        ]]
                    }
                })
            });

            const telegramResult = await response.json();
            if (telegramResult.ok) {
                return res.status(200).json({ success: true, message: "نامەکە نێردرا" });
            } else {
                return res.status(500).json({ error: 'کێشە لە تێلیگرام هەیە' });
            }
        }

        // ٢. کاتێک ئیسماعیل کلیک لەسەر دوگمەی "وەڵامدانەوە بەم پرسیارە" دەکات
        if (body.callback_query) {
            const chatId = body.callback_query.message.chat.id;
            const callbackData = body.callback_query.data;
            const msgId = body.callback_query.message.message_id;

            if (callbackData.startsWith('ans_')) {
                const questionText = callbackData.replace('ans_', '');

                // بۆتەکە نامە کۆنەکە دەگۆڕێت بۆ بۆکسی نووسین کە بە هێمای # دەستپێدەکات
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        message_id: msgId,
                        text: `🤔 پرسیار: "${questionText}"\n\n👇 تکایە وەڵامەکەت ڕێک بە شێوازی ڕیپڵای (Reply) بنووسە لەسەر ئەم نامەیە و بینێرە:`
                    })
                });

                // لادانی لۆدینگی دوگمەکە
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ callback_query_id: body.callback_query.id })
                });
            }
            return res.status(200).json({ ok: true });
        }

        // ٣. وەرگرتنی وەڵامەکە بە شێوازی ڕیپڵای (Reply) و ناردنی ڕاستەوخۆ بۆ گرووپی پرایڤت
        if (body.message && body.message.reply_to_message) {
            const originalBotMessage = body.message.reply_to_message.text;
            const answerText = body.message.text;

            if (originalBotMessage && originalBotMessage.includes('پرسیار:')) {
                // دەرهێنانی پرسیارەکە لە نامە کۆنەکە
                const lines = originalBotMessage.split('\n');
                const questionText = lines[0].replace('🤔 پرسیار: ', '').replace(/"/g, '');

                const groupMessage = `📢 وەڵامێکی نوێ هات!\n\n🤔 **پرسیار:**\n"${questionText}"\n\n✍️ **وەڵامی (اسماعیل):**\n"${answerText}"`;

                // ناردنی فەرمی بۆ گرووپە پرایڤتەکەت کە خۆت ئۆنەریتی
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_CHAT_ID,
                        text: groupMessage
                    })
                });

                // پەیامی دڵنیایی بۆ خۆت
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: body.message.chat.id,
                        text: `✅ دەستت خۆش ئیسماعیل، وەڵامەکەت سەرکەوتووانە بڵاوکرایەوە لە ناو گرووپ!`
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
