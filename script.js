// ١. پشکێنینی ئەوەی ئایا لینکەکە بۆ وەڵامدانەوەی هاوڕێکان کراوەتەوە یان نا
const urlParams = new URLSearchParams(window.location.search);
const origQuestion = urlParams.get('q');
const friendName = urlParams.get('n');

if (origQuestion && friendName) {
    // ✨ گۆڕینی سەردێڕی سایتەکە بۆ شێوازێکی زۆر شیرین و دۆستانە
    document.querySelector('.title').innerText = "💬 وەڵامدانەوەی پرسیار";
    document.querySelector('.subtitle').innerHTML = `سڵاو <b>${friendName}</b> گیان، کاتت شاد! <br> هاوڕێیەک پۆستێکی نهێنی بۆ ناردوویت، وەڵامەکەت لێرە بنووسە تا بچێتە گرووپەکەتان. ✨`;
    
    // گۆڕینی ناوەڕۆکی ناو بۆکسی نووسینەکە
    const inputField = document.getElementById('questionInput');
    inputField.placeholder = "✍️ وەڵامەکەت لێرە بە جوانی بنووسە...";
    inputField.value = "";
    
    // 🎨 دروستکردنی بۆکسێکی زۆر سەرنجڕاکێش بۆ پیشاندانی پرسیارە نهێنییەکە
    const qBox = document.createElement('div');
    qBox.innerHTML = `
        <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); 
                    padding: 18px; 
                    border-radius: 12px; 
                    margin-bottom: 20px; 
                    border-left: 5px solid #ffc107; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    text-align: right;
                    direction: rtl;">
            <span style="color: #856404; font-size: 0.9rem; font-weight: bold; display: block; margin-bottom: 5px;">🤔 پرسیارە هاتووەکە:</span>
            <p style="color: #533f03; font-size: 1.1rem; font-weight: 600; margin: 0; line-height: 1.6;">"${origQuestion}"</p>
        </div>
    `;
    document.querySelector('.input-section').insertBefore(qBox, inputField);
    
    // 🔥 گۆڕینی دیزاین و نووسینی دوگمەی ناردن بۆ هاوڕێکە
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.innerText = "🚀 بڵاوکردنەوە لە ناو گرووپ";
    sendBtn.style.background = "linear-gradient(45deg, #28a745, #20c997)";
    
    sendBtn.onclick = async function() {
        const answer = inputField.value.trim();
        if(!answer) {
            alert("تکایە سەرەتا وەڵامەکەت بنووسە! ⚠️");
            return;
        }
        
        sendBtn.disabled = true;
        sendBtn.innerText = "کەمێک چاوەڕێ بە... ⏳";
        
        try {
            const res = await fetch('/api/send-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer, origQuestion, friendName })
            });
            
            if(res.ok) {
                // 🎉 پەیامی سەرکەوتنی یەکجاری زۆر مۆدێرن دوای ناردن
                document.getElementById('statusMessage').innerHTML = `
                    <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 12px; font-weight: bold; font-size: 1.1rem; line-height: 1.8; box-shadow: 0 4px 12px rgba(40,167,69,0.1);">
                        ✅ دەستەکانت خۆش <b>${friendName}</b> گیان!<br>
                        وەڵامەکەت بە سەرکەوتوویی و بە شێوازێکی زۆر ناوازە نێردرا بۆ ناو گرووپەکەتان. 🥳🎈
                    </div>
                `;
                document.querySelector('.input-section').style.display = 'none';
            } else {
                alert("کێشەیەک ڕوویدا لە ناردنی نامەکە! ❌");
                sendBtn.disabled = false;
                sendBtn.innerText = "🚀 دووبارە ناردنەوە";
            }
        } catch(e) {
            alert("هەڵەیەک لە پەیوەندی سێرڤەر ڕوویدا! 🌐");
            sendBtn.disabled = false;
            sendBtn.innerText = "🚀 دووبارە ناردنەوە";
        }
    }
}

// ٢. لۆجیکی ئاسایی و پێشووی سایتەکە کاتێک بەکارهێنەرێک دێت پرسیار دەنوسێت
async function startRandomSelection() {
    const question = document.getElementById('questionInput').value.trim();
    if (!question) {
        alert("تکایە سەرەتا پرسیارێک بنووسە! ✍️");
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
            document.getElementById('statusMessage').innerHTML = `
                <div style="background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 10px; font-weight: 500;">
                    🎲 پرسیارەکەت بە سەرکەوتوویی پاشەکەوت کرا و بە شێوازی تیروپشکی بەختی، بۆ یەکێک لە هاوڕێکانت نێردرا!
                </div>
            `;
            document.getElementById('questionInput').value = "";
        } else {
            document.getElementById('statusMessage').innerHTML = "<span style='color:red;'>❌ کێشەیەک لە ناردندا هەیە، دووبارە تاقیکەرەوە.</span>";
        }
    } catch (error) {
        document.getElementById('statusMessage').innerHTML = "<span style='color:red;'>❌ ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت.</span>";
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = "ناردنی نهێنی 🚀";
    }
}
