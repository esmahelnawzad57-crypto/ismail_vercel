const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '@bestgroup1111111';

// 🔒 بە کاتی تەنها ئایدی ئیسماعیل لێرە جێگیر کراوە بۆ تاقیکردنەوە
const TARGET_FRIEND = { name: "اسماعیل", id: "8471929492" };

if (!global.waitingForAnswer) {
    global.waitingForAnswer = new Map();
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

        // ١. ناردنی پرسیار لە سایتەوە - تەنها و تەنها بۆ ئیسماعیل دەچێت
        if (body.question) {
            const questionText = body.question;
            const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TARGET_FRIEND.id,
                    text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n"${questionText}"\n\n👇 بۆ وەڵامدانەوە، کلیک لەسەر دوگمەی خوارەوە بکە:`,
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "✍️ وەڵامدانەوەی پرسیار", callback_data: `ans_${TARGET_FRIEND.name}` }
                        ]]
                    }
                })
            });

            const telegramResult = await response.json();

            if (telegramResult.ok) {
                global.waitingForAnswer.set(TARGET_FRIEND.id, {
                    question: questionText,
                    name: TARGET_FRIEND.name,
                    status: 'waiting_click'
                });
                return res.status(200).json({ success: true, message: "نامەکە بۆ ئیسماعیل نێردرا" });
            } else {
                return res.status(500).json({ error: 'تێلیگرام ڕەتیکردەوە نامەکە بنێرێت.' });
            }
        }

        // ٢. لۆجیکی کلیککردن لەسەر دوگمەکە
        if (body.callback_query) {
            const chatId = body.callback_query.message.chat.id.toString();
            const callbackData = body.callback_query.data;

            if (callbackData.startsWith('ans_')) {
                const friendName = callbackData.replace('ans_', '');
                
                const userState = global.waitingForAnswer.get(chatId);
                if (userState) {
                    userState.status = 'typing_answer';
                    global.waitingForAnswer.set(chatId, userState);
                }

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `✍️ زۆر باشە ${friendName}، ئێستا وەڵامەکەت لێرە بنووسە و بینێرە:`
                    })
                });

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ callback_query_id: body.callback_query.id })
                });
            }
            return res.status(200).json({ ok: true });
        }

        // ٣. وەرگرتنی وەڵامەکە و ناردنی بۆ گرووپ
        if (body.message && body.message.text) {
            const chatId = body.message.chat.id.toString();
            const answerText = body.message.text;

            const userState = global.waitingForAnswer.get(chatId);

            if (userState && userState.status === 'typing_answer') {
                const groupMessage = `📢 وەڵامێکی نوێ هات!\n\n🤔 پرسیار:\n"${userState.question}"\n\n✍️ وەڵامی (${userState.name}):\n"${answerText}"`;

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_CHAT_ID,
                        text: groupMessage
                    })
                });

                global.waitingForAnswer.delete(chatId);

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `✅ دەستت خۆش ئیسماعیل، وەڵامەکەت نێردرا بۆ گرووپ!`
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
