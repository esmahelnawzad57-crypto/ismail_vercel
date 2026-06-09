const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '-1003385254039';

const FRIENDS = [
    { name: "شەنیار", id: "5285811533" },
    { name: "عبدالباست", id: "8094239190" },
    { name: "اسماعیل", id: "8471929492" },
    { name: "سۆنیا", id: "8356643097" },
    { name: "شەهین", id: "8294302530" },
    { name: "ڕاز", id: "6675931933" }
];

// دروستکردنی بنکەیەک بۆ بەستنەوەی نامەکان بەیەکەوە لەسەر سێرڤەر بە شێوازی کاتی
if (!global.questionStore) {
    global.questionStore = new Map();
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const body = req.body;

        // ١. ناردنی پرسیار لە وێبسایتەکەوە
        if (body.question) {
            const questionText = body.question;
            const shuffledFriends = [...FRIENDS].sort(() => Math.random() - 0.5);
            
            let messageSent = false;

            for (const friend of shuffledFriends) {
                const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
                const response = await fetch(telegramUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: friend.id,
                        text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n"${questionText}"\n\n👇 بۆ وەڵامدانەوە، تەنها وەڵام (Reply) بدەرەوە.`
                    })
                });

                const telegramResult = await response.json();
                
                if (telegramResult.ok) {
                    // لێرەدا ئایدی نامەکە دەبەستینەوە بە ناوی هاوڕێکە و پرسیارەکەوە
                    const msgId = telegramResult.result.message_id;
                    global.questionStore.set(msgId, {
                        question: questionText,
                        name: friend.name
                    });
                    
                    messageSent = true;
                    break;
                }
            }

            if (messageSent) {
                return res.status(200).json({ success: true, message: "نامەکە نێردرا" });
            } else {
                return res.status(500).json({ error: 'کێشەیەک لە ناردن هەیە' });
            }
        }

        // ٢. وەڵامدانەوە و ناردن بۆ گرووپ (Webhook)
        if (body.message && body.message.reply_to_message) {
            const replyToMsgId = body.message.reply_to_message.message_id;
            const answerText = body.message.text;
            const originalBotMessage = body.message.reply_to_message.text;

            let questionText = "";
            let friendName = "";

            // ڕێگای یەکەم: ئەگەر زانیاری نامەکە لە سێرڤەر مابوو
            if (global.questionStore.has(replyToMsgId)) {
                const savedData = global.questionStore.get(replyToMsgId);
                questionText = savedData.question;
                friendName = savedData.name;
            } 
            // ڕێگای دووەم (بۆ دڵنیایی زیاتر): ئەگەر سێرڤەرەکە پاکبووەوە، ڕاستەوخۆ دەقی نامە کۆنەکە دەخوێنێتەوە
            else if (originalBotMessage && originalBotMessage.includes('پرسیارێکی نوێی نهێنت بۆ هاتووە:')) {
                const lines = originalBotMessage.split('\n');
                if (lines[2]) questionText = lines[2].replace(/"/g, '').trim();
                
                // ئەگەر ناوەکە بەهۆی ڕێکخستنی تێلیگرامەوە نەخوێندرایەوە، دەنووسێت "هاوڕێیەک"
                friendName = "هاوڕێیەک";
            }

            if (questionText) {
                const groupMessage = `📢 **وەڵامێکی نوێ هات!**\n\n🤔 **پرسیار:**\n"${questionText}"\n\n✍️ **وەڵامی (${friendName}):**\n"${answerText}"`;

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_CHAT_ID,
                        text: groupMessage,
                        parse_mode: 'Markdown'
                    })
                });
                
                global.questionStore.delete(replyToMsgId); // پاککردنەوەی یادگە
            }

            return res.status(200).json({ ok: true });
        }

        return res.status(400).json({ error: 'Bad Request' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
