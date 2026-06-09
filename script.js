// ١. پشکێنینی لینک بۆ وەڵامدانەوەی هاوڕێکان
const urlParams = new URLSearchParams(window.location.search);
const origQuestion = urlParams.get('q');
const friendName = urlParams.get('n');

const inputField = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const statusMessage = document.getElementById('statusMessage');

if (origQuestion && friendName) {
    document.querySelector('.title').innerText = "💬 وەڵامدانەوەی پرسیار";
    document.querySelector('.subtitle').innerHTML = `سڵاو <b>${friendName}</b> گیان، وەڵامی ئەم پرسیارە بدەرەوە تا بچێتە گرووپەکە. ✨`;
    inputField.placeholder = "✍️ وەڵامەکەت لێرە بنووسە...";
    
    const qBox = document.createElement('div');
    qBox.innerHTML = `<div style="background:#fff3cd; padding:15px; border-radius:8px; margin-bottom:15px; font-weight:bold; color:#856404; border-right: 5px solid #ffc107;">🤔 پرسیار: "${origQuestion}"</div>`;
    document.querySelector('.input-section').insertBefore(qBox, inputField);
    
    sendBtn.innerText = "🚀 ناردنی وەڵام بۆ گرووپ";
    sendBtn.onclick = async () => {
        const answer = inputField.value.trim();
        if(!answer) return alert("وەڵامێک بنووسە!");
        sendBtn.disabled = true;
        sendBtn.innerText = "لۆدین بەڕێوەیە... ⏳";
        const res = await fetch('/api/send-question', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ answer, origQuestion, friendName })
        });
        if(res.ok) {
            statusMessage.innerHTML = "✅ وەڵامەکەت سەرکەوتووانە نێردرا!";
            document.querySelector('.input-section').style.display = 'none';
        }
    };
}

// ٢. لۆجیکی تیروپشک (ئەو ئەنیمەیشنەی کە خۆت دەتویست)
async function startRandomSelection() {
    const question = inputField.value.trim();
    if (!question) return alert("تکایە سەرەتا پرسیارێک بنووسە!");

    sendBtn.disabled = true;
    sendBtn.innerText = "🎲 بە گەڕان بەدوای هاوڕێدا...";
    statusMessage.innerHTML = '<div class="spinner"></div>'; // ئەنیمەیشنی گەڕانەکە

    try {
        const response = await fetch('/api/send-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        if (response.ok) {
            statusMessage.innerHTML = "🎲 پرسیارەکەت بە تیروپشک بۆ یەکێک لە هاوڕێکانت نێردرا! 🚀";
            inputField.value = "";
        }
    } catch (e) {
        statusMessage.innerText = "❌ هەڵەیەک ڕوویدا!";
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = "ناردنی نهێنی 🚀";
    }
}
