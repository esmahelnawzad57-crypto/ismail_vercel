async function startRandomSelection() {
    const questionInput = document.getElementById('questionInput');
    const sendBtn = document.getElementById('sendBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    const question = questionInput.value.trim();
    if (!question) {
        alert("تکایە سەرەتا پرسیارێک بنووسە! ✍️");
        return;
    }

    sendBtn.disabled = true;
    sendBtn.innerText = "ناردنی نهێنی... 🚀";
    statusMessage.innerText = "";

    try {
        const response = await fetch('/api/send-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        if (response.ok) {
            statusMessage.innerHTML = "<span style='color: green; font-weight: bold;'>✅ پرسیارەکەت بە سەرکەوتوویی ڕاستەوخۆ نێردرا بۆ ناو گرووپ!</span>";
            questionInput.value = "";
        } else {
            statusMessage.innerHTML = "<span style='color: red;'>❌ کێشەیەک لە ناردندا هەیە، دووبارە تاقیکەرەوە.</span>";
        }
    } catch (error) {
        statusMessage.innerHTML = "<span style='color: red;'>❌ ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت.</span>";
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = "ناردنی نهێنی 🚀";
    }
}
