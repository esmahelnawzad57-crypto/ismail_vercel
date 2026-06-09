async function startRandomSelection() {
    const questionInput = document.getElementById('questionInput');
    const sendBtn = document.getElementById('sendBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    const question = questionInput.value.trim();
    if (!question) {
        alert("تکایە پرسیارێک بنووسە! ✍️");
        return;
    }

    // ئەنیمەیشنی لۆدین (لێرەدا دەست پێدەکات)
    sendBtn.disabled = true;
    sendBtn.innerText = "ناردنی نهێنی... 🚀";
    statusMessage.innerHTML = '<div class="loader"></div>'; 

    try {
        const response = await fetch('/api/send-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        if (response.ok) {
            statusMessage.innerHTML = "<span style='color:green; font-weight:bold;'>✅ پرسیارەکەت بە سەرکەوتوویی نێردرا! 🥳</span>";
            questionInput.value = "";
        } else {
            statusMessage.innerHTML = "<span style='color:red;'>❌ کێشەیەک ڕوویدا.</span>";
        }
    } catch (error) {
        statusMessage.innerHTML = "<span style='color:red;'>❌ هەڵە لە پەیوەندی.</span>";
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = "ناردنی نهێنی 🚀";
    }
}
