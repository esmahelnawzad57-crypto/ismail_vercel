// ١. خوێندنەوەی زانیارییەکانی ناو لینکەکە (پرسیار و ناوی هاوڕێکە)
const urlParams = new URLSearchParams(window.location.search);
const origQuestion = urlParams.get('q');
const friendName = urlParams.get('n');

// دۆزینەوەی توخمە سەرەکییەکانی سایتەکە
const inputField = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const statusMessage = document.getElementById('statusMessage');

if (origQuestion && friendName) {
    // ✨ گۆڕینی نووسینەکانی سایتەکە بۆ شێوازی وەڵامدانەوە
    document.querySelector('.title').innerText = "💬 وەڵامدانەوەی پرسیار";
    document.querySelector('.subtitle').innerHTML = `سڵاو <b>${friendName}</b> گیان! <br> وەڵامی ئەم پرسیارە نهێنییە بدەرەوە تا بچێتە گرووپەکەتان. ✨`;
    
    inputField.placeholder = "✍️ وەڵامەکەت لێرە بە جوانی بنووسە...";
    inputField.value = "";
    
    // 🎨 دروستکردنی بۆکسی پرسیارەکە بە شێوازێکی زۆر مۆدێرن
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
    
    // 🔥 گۆڕینی ڕەنگ و فەرمانی دوگمەکە تایبەت بۆ ناردنی وەڵام
    sendBtn.innerText = "🚀 بڵاوکردنەوە لە ناو گرووپ";
    sendBtn.style.background = "linear-gradient(45deg, #28a745, #20c997)";
    
    // پاککردنەوەی هەر فەرمانێکی کۆن و دانانی فەرمانی نوێی وەڵامدانەوە
    sendBtn.onclick = null; 
    sendBtn.addEventListener('click', async function(e) {
        e.preventDefault(); // ڕێگری لە ڕێفرێش بوونی لاپەڕەکە
        
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
                statusMessage.innerHTML = `
                    <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 12px; font-weight: bold; font-size: 1.1rem; line-height: 1.8; text-align:center;">
                        ✅ دەستەکانت خۆش <b>${friendName}</b> گیان!<br>
                        وەڵامەکەت بە سەرکەوتوویی نێردرا بۆ ناو گرووپەکەتان. 🥳🎈
                    </div>
                `;
                document.querySelector('.input-section').style.display = 'none';
            } else {
                alert("کێشەیەک ڕوویدا لە ناردنی نامەکە! ❌");
                sendBtn.disabled = false;
                sendBtn.innerText = "🚀 دووبارە ناردنەوە";
            }
        } catch(err) {
            alert("هەڵەیەک لە پەیوەندی سێرڤەر ڕوویدا! 🌐");
            sendBtn.disabled = false;
            sendBtn.innerText = "🚀 دووبارە ناردنەوە";
        }
    });

} else {
    // 🎲 لۆجیکی ئاسایی سایتەکە ئەگەر لینکەکە هی پرسیار ناردنی ئاسایی بێت
    sendBtn.onclick = null;
    sendBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const question = inputField.value.trim();
        if (!question) {
            alert("تکایە سەرەتا پرسیارێک بنووسە! ✍️");
            return;
        }

        sendBtn.disabled = true;
        sendBtn.innerText = "ناردنی نهێنی... 🚀";

        try {
            const response = await fetch('/api/send-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });

            if (response.ok) {
                statusMessage.innerHTML = `
                    <div style="background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 10px; font-weight: 500; text-align:center;">
                        🎲 پرسیارەکەت بە سەرکەوتوویی پاشەکەوت کرا و بە شێوازی تیروپشک بۆ یەکێک لە هاوڕێکانت نێردرا!
                    </div>
                `;
                inputField.value = "";
            } else {
                statusMessage.innerHTML = "<span style='color:red;'>❌ کێشەیەک لە ناردندا هەیە، دووبارە تاقیکەرەوە.</span>";
            }
        } catch (error) {
            statusMessage.innerHTML = "<span style='color:red;'>❌ ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت.</span>";
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerText = "ناردنی نهێنی 🚀";
        }
    });
}
