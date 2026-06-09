const fetch = require('node-fetch');

// زانیارییە چاککراوەکان
const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '-1003385254039'; // 👈 لێرە نیشانەی منهای کورت و ١٠٠ زیادکرا بۆ ئەوەی ببێتە ئایدی گرووپ

const FRIENDS = [
    { name: "شەنیار", id: "5285811533" },
    { name: "عبدالباست", id: "8094239190" },
    { name: "اسماعیل", id: "8471929492" },
    { name: "سۆنیا", id: "8356643097" },
    { name: "شەهین", id: "8294302530" },
    { name: "ڕاز", id: "6675931933" }
];

global.activeQuestions = global.activeQuestions || {};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;

        // ١. ناردنی پرسیاری نوێ لە وێبسایتەکەوە
        if (body.question) {
            const questionText = body.question;

            // تێکەڵکردنی لیستی هاوڕێکان بە شێوازی هەڕەمەکی بۆ ئەوەی دادپەروەرانە بێت
            const shuffledFriends = [...FRIENDS].sort(() => Math.random() - 0.5);
            
            let messageSent = false;
            let telegramResult = null;
            let selectedFriend = null;

            // گەڕان بەدوای یەکەم هاوڕێدا کە بۆتەکەی بلۆک نەکردووە
            for (const friend of shuffledFriends) {
                const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
                const response = await fetch(telegramUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: friend.id,
                        text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n"${questionText}"\n\n👇 بۆ وەڵامدانەوە، تەنها Reply (وەڵام)ی ئەم نامەیە بدەرەوە.`
                    })
                });

                telegramResult = await response.json();

                if (telegramResult.ok) {
                    messageSent = true;
                    selectedFriend = friend;
                    break; // نامەکە ڕۆشت، ئیتر ناچێت بۆ کەسی تر
                }
            }

            if (messageSent && telegramResult && selectedFriend) {
                const messageId = telegramResult.result.message_id;
                global.activeQuestions[messageId] = {
                    question: questionText,
                    friendName: selectedFriend.name
                };

                return res.status(200).json({ success: true, message: "نامەکە نێردرا" });
            } else {
                // ئەگەر چاتی هیچکام لە هاوڕێکان دەستپێنەکردبوو
                return res.status(500).json({ error: 'هەموو هاوڕێکان پێویستە سەرەتا بۆتەکە ستارت بکەن!' });
            }
        }

        // ٢. وەڵامدانەوە لە تیلیگرامەوە (Webhook)
        if (body.message && body.message.reply_to_message) {
            const replyToMsgId = body.message.reply_to_message.message_id;
            const answerText = body.message.text;

            if (global.activeQuestions[replyToMsgId]) {
                const savedData = global.activeQuestions[replyToMsgId];
                
                const groupMessage = `📢 **وەڵامێکی نوێ هات!**\n\n🤔 **پرسیار:**\n"${savedData.question}"\n\n✍️ **وەڵامی (${savedData.friendName}):**\n"${answerText}"`;

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_CHAT_ID,
                        text: groupMessage,
                        parse_mode: 'Markdown'
                    })
                });

                delete global.activeQuestions[replyToMsgId];
            }

            return res.status(200).json({ ok: true });
        }

        return res.status(400).json({ error: 'Bad Request' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
