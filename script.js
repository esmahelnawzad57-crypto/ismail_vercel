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
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { question, answer, origQuestion, friendName } = req.body;

        if (question) {
            const friend = FRIENDS[Math.floor(Math.random() * FRIENDS.length)];
            
            // 🔒 لێرەدا دەقی پرسیارەکە لە تێلیگرام دەشارینەوە
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    chat_id: friend.id, 
                    text: `📩 پرسیارێکی نهێنی نوێت بۆ هاتووە!\n\n👇 بۆ بینینی پرسیارەکە و وەڵامدانەوە، کلیک بکە:\nhttps://ismail-vercel.vercel.app/?q=${encodeURIComponent(question)}&n=${encodeURIComponent(friend.name)}` 
                })
            });
            return res.status(200).json({ success: true });
        }

        if (answer) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    chat_id: GROUP_CHAT_ID, 
                    text: `📢 وەڵام بۆ (${friendName}):\n\n🤔 **پرسیار:**\n"${origQuestion}"\n\n✍️ **وەڵام:**\n"${answer}"` 
                })
            });
            return res.status(200).json({ success: true });
        }
    } catch (e) { return res.status(500).json({ error: e.message }); }
};
