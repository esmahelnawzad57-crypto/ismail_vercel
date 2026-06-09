// پشکێنینی لینک بۆ وەڵامدانەوە
const urlParams = new URLSearchParams(window.location.search);
const origQuestion = urlParams.get('q');
const friendName = urlParams.get('n');

const inputField = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const statusBox = document.getElementById('statusMessage');

// ئەگەر هاوڕێکە لینکەکەی کردبێتەوە
if (origQuestion && friendName) {
    document.querySelector('.subtitle').innerHTML = `سڵاو <b>${friendName}</b>، وەڵامی ئەم پرسیارە بدەرەوە بۆ گرووپ:`;
    inputField.placeholder = "وەڵامەکەت لێرە بنووسە...";
    sendBtn.innerText = "ناردنی وەڵام 📢";
    
    sendBtn.onclick = async () => {
        const answer = inputField.value.trim();
        if(!answer) return alert("وەڵامێک بنووسە!");
        
        sendBtn.disabled = true;
        sendBtn.innerText = "چاوەڕێ بە... ⏳";
        
        const res = await fetch('/api/send-question', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ answer, origQuestion, friendName })
        });
        
        if(res.ok) {
            statusBox.className = "status-box success";
            statusBox.innerText = "✅ وەڵامەکەت بە سەرکەوتوویی نێردرا بۆ گرووپ!";
            inputField.style.display = 'none';
            sendBtn.style.display = 'none';
        }
    };
}

// 🎲 لۆجیکی تیروپشکی (ئەنیمەیشنەکە)
async function startRandomSelection() {
    const question = inputField.value.trim();
    if (!question) return alert("تکایە سەرەتا پرسیارێک بنووسە!");

    const cards = document.querySelectorAll('.friend-card');
    sendBtn.disabled = true;
    
    // ئەنیمەیشنی ڕووناککردنەوەی کارتی هاوڕێکان
    for (let i = 0; i < 3; i++) { // ٣ خول ئەنیمەیشن
        for (let card of cards) {
            card.classList.add('active');
            await new Promise(r => setTimeout(r, 100));
            card.classList.remove('active');
        }
    }

    sendBtn.innerText = "ناردنی نهێنی... 🚀";

    try {
        const response = await fetch('/api/send-question', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ question })
        });

        if (response.ok) {
            statusBox.className = "status-box success";
            statusBox.innerText = "🎲 پرسیارەکەت بە سەرکەوتوویی نێردرا!";
            inputField.value = "";
        }
    } catch (e) {
        statusBox.className = "status-box error";
        statusBox.innerText = "❌ هەڵەیەک ڕوویدا!";
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = "ناردنی نهێنی 🚀";
    }
}
