function startRandomSelection() {
    const questionText = document.getElementById('questionInput').value.trim();
    const statusMessage = document.getElementById('statusMessage');
    const sendBtn = document.getElementById('sendBtn');
    const cards = document.querySelectorAll('.friend-card');

    if (!questionText) {
        statusMessage.textContent = "تکایە سەرەتا پرسیارێک بنووسە! ⚠️";
        statusMessage.className = "status-box error";
        return;
    }

    // دەستپێکردنی پرۆسەکە
    sendBtn.disabled = true;
    sendBtn.textContent = "خەریکە هاوڕێیەک هەڵدەبژێردرێت... 🎲";
    statusMessage.style.display = "none";

    let currentIndex = 0;
    let shuffleCount = 0;
    
    // ئەنیمەیشنی گەڕان بەسەر ناوەکاندا
    const interval = setInterval(() => {
        cards.forEach(card => card.classList.remove('active'));
        cards[currentIndex].classList.add('active');
        
        currentIndex = (currentIndex + 1) % cards.length;
        shuffleCount++;

        if (shuffleCount > 20) {
            clearInterval(interval);
            cards.forEach(card => card.classList.remove('active')); // لادانی ڕووناکی ناوەکان بۆ ئەوەی ئاشکرا نەبێت
            
            // ناردنی پرسیارەکە بۆ سێرڤەر
            submitQuestionToServer(questionText);
        }
    }, 100);
}

async function submitQuestionToServer(question) {
    const statusMessage = document.getElementById('statusMessage');
    const sendBtn = document.getElementById('sendBtn');

    try {
        const response = await fetch('/api/send-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question }),
        });

        if (response.ok) {
            // گۆڕینی پەیامەکە ڕێک بۆ ئەوەی کە تۆ داوات کردووە
            statusMessage.textContent = "نامەکە نێردرا";
            statusMessage.className = "status-box success";
            document.getElementById('questionInput').value = ""; // پاککردنەوەی سندوقی پرسیارەکە
        } else {
            statusMessage.textContent = "کێشەیەک لە سێرڤەر ڕوویدا، تکایە دووبارە تاقیکەرەوە. ❌";
            statusMessage.className = "status-box error";
        }
    } catch (error) {
        statusMessage.textContent = "هەڵە: ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت. 🌐";
        statusMessage.className = "status-box error";
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "ناردنی نهێنی 🚀";
    }
}