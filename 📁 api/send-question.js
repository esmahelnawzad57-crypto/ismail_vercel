const fetch = require('node-fetch');

// ⚠️ لێرەدا زانیارییە ڕاستەقینەکانی خۆت دابنێ
const BOT_TOKEN = '8329299504:AAFQbJKcvsEZQzyOwgD5G7eJJRaU810hmpI';
const GROUP_CHAT_ID = '3385254039'; // وەک -100123456789

// لیستی هاوڕێکان و ناسنامەی چاتیان لە تیلیگرام (Chat ID)
// پێویستە پێشتر لەگەڵ بۆتەکە چاتیان دەستپێکردبێت
const FRIENDS = [
    { name: "شەنیار", id: "5285811533" },
    { name: "عبدالباست", id: "8094239190" },
    { name: "اسماعیل", id: "8471929492" },
    { name: "سۆنیا", id: "8356643097" },
    { name: "شەهین", id: "8294302530" },
    { name: "ڕاز", id: "6675931933" }
];

// بۆ ئەم پڕۆژەیە پێویستمان بە داتابەیسێکی کاتی دەبێت بۆ ئەوەی بزانین کام وەڵام بۆ کام پرسیارە
// تێبینی: لە Vercel Serverless ئەم گۆڕاوە لە بیرگەدا دەمێنێتەوە بۆ ماوەیەکی کورت، بۆ گروپێکی بچووک بەسە
global.activeQuestions = global.activeQuestions || {};

module.exports = async (req, res) => {
    // ڕێگەپێدان بە ناردنی زانیاری لە وێبسایتەکەوە
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

        // ١. ئەگەر داواکارییەکە لە لایەن وێبسایتەکەوە هاتبێت (ناردنی پرسیاری نوێ)
        if (body.question) {
            const questionText = body.question;

            // هەڵبژاردنی یەکێک لە هاوڕێکان بە شێوازی هەڕەمەکی (Random)
            const randomIndex = Math.floor(Math.random() * FRIENDS.length);
            const selectedFriend = FRIENDS[randomIndex];

            // ناردنی پرسیارەکە بۆ هاوڕێ هەڵبژێردراوەکە لە چاتی تایبەت
            const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: selectedFriend.id,
                    text: `❓ پرسیارێکی نوێی نهێنت بۆ هاتووە:\n\n"${questionText}"\n\n👇 بۆ وەڵامدانەوە، تەنها Reply (وەڵام)ی ئەم نامەیە بدەرەوە.`
                })
            });

            const telegramResult = await response.json();

            if (telegramResult.ok) {
                // پاشەکەوتکردنی ناسنامەی نامەکە بۆ ئەوەی بزانین کاتێک وەڵام دەداتەوە وەڵامی کام پرسیارەیە
                const messageId = telegramResult.result.message_id;
                global.activeQuestions[messageId] = {
                    question: questionText,
                    friendName: selectedFriend.name
                };

                return res.status(200).json({ success: true, message: "نامەکە نێردرا" });
            } else {
                return res.status(500).json({ error: 'Failed to send to Telegram' });
            }
        }

        // ٢. ئەگەر داواکارییەکە لە لایەن تیلیگرامەوە هاتبێت (Webhook - کاتێک هاوڕێکەت وەڵام دەداتەوە)
        if (body.message && body.message.reply_to_message) {
            const replyToMsgId = body.message.reply_to_message.message_id;
            const answerText = body.message.text;

            // پشکینین کە ئایا ئەم وەڵامە بۆ یەکێک لە پرسیارە چالاکەکانە؟
            if (global.activeQuestions[replyToMsgId]) {
                const savedData = global.activeQuestions[replyToMsgId];
                
                // ناردنی پرسیار و وەڵامەکە بۆ ناو گرووپی سەرەکی
                const groupMessage = `📢 وەڵامێکی نوێ هات!\n\n**پرسیار:**\n"${savedData.question}"\n\n**وەڵامی (${savedData.friendName}):**\n"${answerText}"`;

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_CHAT_ID,
                        text: groupMessage,
                        parse_mode: 'Markdown'
                    })
                });

                // سڕینەوەی پرسیارەکە لە لیستی چالاکەکان دوای وەڵامدانەوە
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