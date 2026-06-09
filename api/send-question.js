const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '-1003385254039'; // ئایدی گرووپە پرایڤتەکەتان

// 👥 گەڕانەوەی ناوی هەموو هاوڕێکانت بۆ ناو سیستمەکە
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

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const body = req.body;

        // ١. ناردنی لینکەکە بە شێوازی تیروپشکی هەڕەمەکی بۆ یەکێک لە هاوڕێکان
        if (body.question) {
            const questionText = body.question;
            
            // تیروپشک بۆ هەڵبژاردنی یەک کەس
            const shuffledFriends = [...FRIENDS].sort(() => Math.random() - 0.5);
            const selectedFriend = shuffledFriends[0]; 

            const encodedQ = encodeURIComponent(questionText);
            const encodedN = encodeURIComponent(selectedFriend.name);
            const answerLink = `https://ismail-vercel.vercel.app/?q=${encodedQ}&n=${encodedN}`;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: selectedFriend.id,
                    text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە!\n\n👇 بۆ بینینی پرسیارەکە و وەڵامدانەوەی، کلیک لەسەر ئەم لینکەی خوارەوە بکە:\n\n🔗 ${answerLink}`
                })
            });

            return res.status(200).json({ success: true });
        }

        // ٢. وەرگرتنی وەڵامی هەر هاوڕێیەک لە سایتەکەوە و ناردنی بۆ ناو گرووپ
        if (body.answer && body.origQuestion && body.friendName) {
            const groupMessage = `📢 وەڵامێکی نوێ هات!\n\n🤔 **پرسیار:**\n"${body.origQuestion}"\n\n✍ *وەڵامی (${body.friendName}):*\n"${body.answer}"`;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: GROUP_CHAT_ID,
                    text: groupMessage
                })
            });

            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: 'Bad Request' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
