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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const body = req.body;
        if (body.question) {
            const friend = FRIENDS[Math.floor(Math.random() * FRIENDS.length)];
            const answerLink = `https://ismail-vercel.vercel.app/?q=${encodeURIComponent(body.question)}&n=${encodeURIComponent(friend.name)}`;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: friend.id, text: `❓ پرسیارێکی نوێ:\n"${body.question}"\n\n👇 وەڵام بدەرەوە:\n${answerLink}` })
            });
            return res.status(200).json({ success: true });
        }
        if (body.answer) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text: `📢 وەڵام:\n"${body.origQuestion}"\n\n✍️ (${body.friendName}):\n"${body.answer}"` })
            });
            return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Bad Request' });
    } catch (e) { return res.status(500).json({ error: e.message }); }
};
