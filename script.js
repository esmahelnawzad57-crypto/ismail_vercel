// پشکێنینی ئەوەی ئایا لینکەکە بۆ وەڵامدانەوە کراوەتەوە یان نا
const urlParams = new URLSearchParams(window.location.search);
const origQuestion = urlParams.get('q');
const friendName = urlParams.get('n');

if (origQuestion && friendName) {
    // ئەگەر ئیسماعیل لینکەکەی کردبێتەوە، دیزاینی سایتەکە دەگۆڕێت بۆ بۆکسی وەڵامدانەوە
    document.querySelector('.subtitle').innerText = `سڵاو ${friendName}، وەڵامی ئەم پرسیارە بدەرەوە تا بچێتە گرووپە کۆنەکەتان.`;
    document.getElementById('questionInput').placeholder = "وەڵامەکەت لێرە بنووسە... 💬";
    document.getElementById('questionInput').value = "";
    
    // پیشاندانی دەقی پرسیارەکە لە سەرەوەی بۆکسەکە
    const qBox = document.createElement('div');
    qBox.innerHTML = `<p style="background:#fff3cd; padding:15px; border-radius:8px; margin-bottom:15px; font-weight:bold; color:#856404;">🤔 پرسیارەکە: "${origQuestion}"</p>`;
    document.querySelector('.input-section').insertBefore(qBox, document.getElementById('questionInput'));
    
    // گۆڕینی فەرمانی دوگمەکە بۆ ناردنی وەڵام
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.innerText = "ناردنی وەڵام بۆ گرووپ 📢";
    sendBtn.onclick = async function() {
        const answer = document.getElementById('questionInput').value.trim();
        if(!answer) return alert("تکایە وەڵامێک بنووسە!");
        
        sendBtn.disabled = true;
        sendBtn.innerText = "لۆدین بەڕێوەیە... ⏳";
        
        try {
            const res = await fetch('/api/send-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer, origQuestion, friendName })
            });
            
            if(res.ok) {
                document.getElementById('statusMessage').innerText = "✅ وەڵامەکەت بە سەرکەوتوویی نێردرا بۆ ناو گرووپی کۆن!";
                document.querySelector('.input-section').style.display = 'none';
            } else {
                alert("کێشەیەک ڕوویدا!");
            }
        } catch(e) {
            alert("هەڵە لە پەیوەندی سێرڤەر!");
        }
    }
}

// لۆجیکی ئاسایی سایتەکە کاتێک کەسێک دەیەوێت پرسیار بنێرێت
async function startRandomSelection() {
    const question = document.getElementById('questionInput').value.trim();
    if (!question) {
        alert("تکایە سەرەتا پرسیارێک بنووسە!");
        return;
    }

    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    sendBtn.innerText = "ناردنی نهێنی... 🚀";

    try {
        const response = await fetch('/api/send-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        if (response.ok) {
            document.getElementById('statusMessage').innerText = "🎲 پرسیارەکەت بە سەرکەوتوویی بۆ ئیسماعیل نێردرا!";
            document.getElementById('questionInput').value = "";
        } else {
            document.getElementById('statusMessage').innerText = "❌ کێشەیەک لە ناردندا هەیە.";
        }
    } catch (error) {
        document.getElementById('statusMessage').innerText = "❌ ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت.";
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = "ناردنی نهێنی 🚀";
    }
}
