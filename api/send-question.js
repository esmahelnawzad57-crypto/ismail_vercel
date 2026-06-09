const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '@bestgroup1111111';

// 🔒 تەنها ناوی تۆ لێرەیە بۆ تاقیکردنەوەی کۆتایی
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

        // ١. ناردنی پرسیار لە سایتەوە بۆ چاتی ئیسماعیل
        if (body.question) {
            const questionText = body.question;
            const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: FRIENDS[0].id,
                    text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n"${questionText}"\n\n👇 بۆ وەڵامدانەوە، تەنها وەڵام (Reply) بدەرەوە بەم نامەیە.`
                })
            });

            const telegramResult = await response.json();
            if (telegramResult.ok) {
                return res.status(200).json({ success: true, message: "نامەکە بۆ ئیسماعیل نێردرا" });
            } else {
                return res.status(500).json({ error: 'کێشە لە تێلیگرام هەیە' });
            }
        }

        // ٢. وەرگرتنی ڕیپڵایەکەت و ناردنی بۆ ناو گرووپی پەبڵیک
        if (body.message && body.message.reply_to_message) {
            const originalBotMessage = body.message.reply_to_message.text;
            const answerText = body.message.text;

            if (originalBotMessage && originalBotMessage.includes('پرسیارێکی نوێی نهێنت بۆ هاتووە:')) {
                const lines = originalBotMessage.split('\n');
                let questionText = "نادیار";
                
                if (lines[2]) {
                    questionText = lines[2].replace(/"/g, '').trim();
                }

                const groupMessage = `📢 وەڵامێکی نوێ هات!\n\n🤔 پرسیار:\n"${questionText}"\n\n✍️ وەڵامی (اسماعیل):\n"${answerText}"`;

                // ناردنی فەرمی بۆ گرووپ
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_CHAT_ID,
                        text: groupMessage
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
