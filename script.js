// پشکێنینی لینک
const urlParams = new URLSearchParams(window.location.search);
const origQuestion = urlParams.get('q');
const friendName = urlParams.get('n');

const inputField = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const statusBox = document.getElementById('statusMessage');

// ١. حاڵەتی وەڵامدانەوە (سوپرایز)
if (origQuestion && friendName) {
    document.querySelector('h1').innerText = "💌 پەیامێکی نهێنی!";
    document.querySelector('.subtitle').innerHTML = `سڵاو <b>${friendName}</b>، شتێکی تایبەتت بۆ هاتووە... ✨`;
    document.querySelector('.friends-grid').style.display = 'none';
    
    const surpriseBox = document.createElement('div');
    surpriseBox.style.cssText = "background: #0f172a; padding: 25px; border-radius: 20px; border: 2px solid #38bdf8; margin-bottom: 25px; animation: popIn 0.6s ease-out;";
    surpriseBox.innerHTML = `<p style="color: #94a3b8; font-size: 14px; margin-bottom: 10px;">پرسیارەکە بۆ تۆیە:</p><h2 style="color: #fff; font-size: 20px;">"${origQuestion}"</h2>`;
    document.querySelector('.input-section').prepend(surpriseBox);
    
    inputField.placeholder = "وەڵامەکەت لێرە بنووسە...";
    sendBtn.innerText = "ناردنی وەڵام بۆ گرووپ 📢";
    
    sendBtn.onclick = async () => {
        const answer = inputField.value.trim();
        if(!answer) return alert("وەڵامێک بنووسە!");
        sendBtn.disabled = true;
        sendBtn.innerText = "دەنێردرێت... ⏳";
        
        const res = await fetch('/api/send-question', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ answer, origQuestion, friendName })
        });
        
        if(res.ok) {
            statusBox.className = "status-box success";
            statusBox.innerText = "✅ وەڵامەکەت بە سەرکەوتوویی نێردرا!";
            inputField.style.display = 'none';
            sendBtn.style.display = 'none';
        }
    };
} else {
    // ٢. حاڵەتی پرسیار ناردنی ئاسایی (تیروپشکەکە)
    sendBtn.onclick = async () => {
        const question = inputField.value.trim();
        if(!question) return alert("تکایە سەرەتا پرسیارێک بنووسە!");
        
        sendBtn.disabled = true;
        sendBtn.innerText = "🎲 بە گەڕان بەدوای هاوڕێدا...";
        
        const res = await fetch('/api/send-question', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ question })
        });
        
        if(res.ok) {
            statusBox.className = "status-box success";
            statusBox.innerText = "🎲 پرسیارەکەت بە تیروپشک بۆ هاوڕێکانت نێردرا!";
            inputField.value = "";
        }
        sendBtn.disabled = false;
        sendBtn.innerText = "ناردنی نهێنی 🚀";
    };
}
