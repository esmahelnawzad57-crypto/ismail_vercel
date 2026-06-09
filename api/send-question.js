const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '-1005196416114'; 

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

        // ١. ناردنی پرسیار لە سایتەوە بۆ چاتی ئیسماعیل لەگەڵ دوگمەی ئامادە
        if (body.question) {
            const questionText = body.question;
            const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            
            // دروستکردنی کلیلێک کە دەقی پرسیارەکەی تێدا شاراوەتەوە
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: FRIENDS[0].id,
                    text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n"${questionText}"\n\n👇 بۆ ئەوەی ئەم پرسیارە ڕاستەوخۆ بنێریتە ناو گرووپەکەت، کلیک لەسەر دوگمەی خوارەوە بکە:`,
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "🚀 ناردنی ڕاستەوخۆ بۆ گرووپ", callback_data: `post_${questionText.substring(0, 50)}` }
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

        // ٢. کاتێک کلیک لەسەر دوگمەی "ناردنی ڕاستەوخۆ بۆ گرووپ" دەکەیت
        if (body.callback_query) {
            const callbackData = body.callback_query.data;
            const chatId = body.callback_query.message.chat.id;

            if (callbackData.startsWith('post_')) {
                // دەرهێنانی دەقی پرسیارەکە لە کلیکەکە
                const questionText = callbackData.replace('post_', '');
                
                const groupMessage = `📢 پرسیارێکی نوێ لە لایەن (اسماعیل)ەوە هات!\n\n🤔 **پرسیار:**\n"${questionText}"`;

                // ناردنی ڕاستەوخۆ بۆ گرووپ بەبێ پێویستی بە وێبهووکی ئاڵۆز
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_CHAT_ID,
                        text: groupMessage
                    })
                });

                // گۆڕینی دەقی نامە کۆنەکە لە چاتی تایبەتت بۆ ئەوەی بزانیت نێردراوە
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `✅ پرسیارەکە بە سەرکەوتوویی بڵاوکرایەوە لە ناو گرووپ!`
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
