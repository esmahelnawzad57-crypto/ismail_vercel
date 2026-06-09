const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const MY_ID = '8471929492'; // ئایدی ئیسماعیل

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const body = req.body;

        if (body.question) {
            const questionText = body.question;
            
            // ناردنی ڕاستەوخۆ بۆ چاتی تایبەتی ئیسماعیل
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: MY_ID,
                    text: `📩 پرسیارێکی نوێ بۆ تێست:\n\n"${questionText}"`
                })
            });

            const result = await response.json();
            if (result.ok) {
                return res.status(200).json({ success: true, message: "نێردرا بۆ ئیسماعیل" });
            } else {
                return res.status(500).json({ error: 'کێشە لە تێلیگرام' });
            }
        }

        return res.status(400).json({ error: 'No question provided' });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
