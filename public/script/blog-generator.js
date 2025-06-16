const blogForm = document.getElementById("blogForm");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const output = document.getElementById("output");

blogForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const audience = document.getElementById("audience").value;
    const tone = document.getElementById("tone").value;
    const length = document.getElementById("length").value;
    const language = document.getElementById("language").value;
    const cta = document.getElementById("cta").value.trim(); // CTA input
    const keywords = document.getElementById("keywords").value.trim(); // Keywords input

    if (!title) {
        alert("Judul/topik wajib diisi!");
        return;
    }

    let prompt = `
Tulis sebuah artikel blog berjudul "${title}".
Target audiens: ${audience}.
Gaya penulisan: ${tone}.
Panjang artikel: ${length}.
Bahasa: ${language}.
Gunakan struktur paragraf yang jelas dan menarik.
    `.trim();

    if (keywords) {
        prompt += `\nGunakan kata kunci berikut untuk SEO: ${keywords}.`;
    }

    if (cta) {
        prompt += `\nAkhiri artikel dengan ajakan berikut: "${cta}".`;
    }

    // console.log('promnt', prompt)

    loading.classList.remove("hidden");
    result.classList.add("hidden");
    output.innerHTML = "";

    try {
        const res = await fetch("/generate-blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        output.innerHTML = data.blog.replace(/\n/g, "<br>");
        result.classList.remove("hidden");
    } catch (err) {
        output.innerHTML = "<p class='text-red-500'>Terjadi kesalahan. Coba lagi nanti.</p>";
        result.classList.remove("hidden");
    }

    loading.classList.add("hidden");
});

// GENERATE KEYWORD DAN SEO
const generateExtra = async (type) => {
    const title = document.getElementById("title").value.trim();
    if (!title) return alert("Isi dulu judul/topiknya.");

    const btn = type === "cta" ? document.getElementById("generateCtaBtn") : document.getElementById("generateKeywordBtn");
    const input = type === "cta" ? document.getElementById("cta") : document.getElementById("keywords");

    btn.textContent = "⏳ Generating...";
    btn.disabled = true;

    try {
        const res = await fetch("/generate-extra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, title })
        });

        const data = await res.json();
        console.log('data', data)
        input.value = data.result || "Gagal menghasilkan.";
    } catch {
        alert("Gagal mengambil data.");
    }

    btn.textContent = type === "cta" ? "🎯 Generate CTA" : "🔍 Generate Keyword";
    btn.disabled = false;
};
document.getElementById("generateCtaBtn").addEventListener("click", () => generateExtra("cta"));
document.getElementById("generateKeywordBtn").addEventListener("click", () => generateExtra("keyword"));


// Rekomendasi Topik Dinamis
// const titleInput = document.getElementById("title");
// const suggestionBox = document.getElementById("topic-suggestions");

// let debounceTimer;
// titleInput.addEventListener("input", () => {
//   const keyword = titleInput.value.trim();
//   if (keyword.length < 3) {
//     suggestionBox.classList.add("hidden");
//     return;
//   }

//   clearTimeout(debounceTimer);
//   debounceTimer = setTimeout(async () => {
//     try {
//       const res = await fetch("/suggest-topics", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ keyword })
//       });

//       const data = await res.json();
//       console.log('data', data)

//       suggestionBox.innerHTML = "";

//       data.suggestions.forEach(s => {
//         const li = document.createElement("li");
//         li.textContent = s;
//         li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";
//         li.onclick = () => {
//           titleInput.value = s;
//           suggestionBox.classList.add("hidden");
//         };
//         suggestionBox.appendChild(li);
//       });

//       suggestionBox.classList.remove("hidden");
//     } catch (err) {
//       console.error("Gagal mengambil topik:", err);
//       suggestionBox.classList.add("hidden");
//     }
//   }, 400); // debounce input
// });

// document.addEventListener("click", (e) => {
//   if (!suggestionBox.contains(e.target) && e.target !== titleInput) {
//     suggestionBox.classList.add("hidden");
//   }
// });



// Event listener untuk tag rekomendasi topik
document.querySelectorAll(".tag-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.getElementById("title").value = btn.textContent;
    });
});


// Salin Artikel
document.getElementById("copyBtn").addEventListener("click", () => {
    const text = document.getElementById("output").innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Artikel berhasil disalin ke clipboard!");
    }).catch(() => {
        alert("❌ Gagal menyalin artikel.");
    });
});

// Download PDF
document.getElementById("downloadBtn").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = document.getElementById("output").innerText;

    const lines = doc.splitTextToSize(text, 180); // Lebar margin
    doc.text(lines, 15, 20);
    doc.save("artikel-ai.pdf");
});
