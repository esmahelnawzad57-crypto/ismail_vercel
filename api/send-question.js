const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '@bestgroup1111111'; // 👈 لێرەدا یوزەرنەیمی گرووپە پەبڵیکەکەت جێگیرکرا

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

    try {
        const body = req.body;

        // ١. ناردنی پرسیار لە وێبسایتەکەوە بۆ چاتی تایبەتی هاوڕێکان
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
                        text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n${questionText}\n\n👤 ناو: ${friend.name}\n\n👇 بۆ وەڵامدانەوە، تەنها وەڵام (Reply) بدەرەوە.`
                    })
                });

                const telegramResult = await response.json();
                if (telegramResult.ok) {
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

        // ٢. وەڵامدانەوەی هاوڕێکان و ناردنی بۆ ناو گرووپ (Webhook)
        if (body.message && body.message.reply_to_message) {
            const originalBotMessage = body.message.reply_to_message.text;
            const answerText = body.message.text;

            if (originalBotMessage && originalBotMessage.includes('پرسیارێکی نوێی نهێنت بۆ هاتووە:')) {
                const lines = originalBotMessage.split('\n');
                let questionText = "نادیار";
                let friendName = "هاوڕێیەک";

                if (lines[2]) questionText = lines[2].trim();

                for (const line of lines) {
                    if (line.startsWith('👤 ناو:')) {
                        friendName = line.replace('👤 ناو:', '').trim();
                    }
                }

                const groupMessage = `📢 وەڵامێکی نوێ هات!\n\n🤔 پرسیار:\n"${questionText}"\n\n✍️ وەڵامی (${friendName}):\n"${answerText}"`;

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
