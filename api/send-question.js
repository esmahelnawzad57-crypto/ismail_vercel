const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '-1003385254039'; // 👈 لێرەدا ئایدی گرووپە پرایڤتە نوێیەکەت جێگیرکرا

// 🔒 تەنها ناوی تۆ لێرەیە بۆ تاقیکردنەوەی فەرمی
const FRIENDS = [
    { name: "اسماعیل", id: "8471929492" }
];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const body = req.body;

        // ١. ناردنی لۆنکی وەڵامدانەوە بۆ چاتی تایبەتی ئیسماعیل
        if (body.question) {
            const questionText = body.question;
            const friend = FRIENDS[0]; 

            const encodedQ = encodeURIComponent(questionText);
            const encodedN = encodeURIComponent(friend.name);
            const answerLink = `https://ismail-vercel.vercel.app/?q=${encodedQ}&n=${encodedN}`;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: friend.id,
                    text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە!\n\n👇 بۆ بینینی پرسیارەکە و وەڵامدانەوەی، کلیک لەسەر ئەم لینکەی خوارەوە بکە:\n\n🔗 ${answerLink}`
                })
            });

            return res.status(200).json({ success: true });
        }

        // ٢. ناردنی ڕاستەوخۆی وەڵام لە سایتەکەوە بۆ ناو گرووپە پرایڤتەکە
        if (body.answer && body.origQuestion && body.friendName) {
            const groupMessage = `📢 وەڵامێکی نوێ هات!\n\n🤔 **پرسیار:**\n"${body.origQuestion}"\n\n✍️ **وەڵامی (${body.friendName}):**\n"${body.answer}"`;

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
