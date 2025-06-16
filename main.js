const resultImage = document.getElementById("result-image");
    const deleteIcon = document.getElementById("delete-icon");

    deleteIcon.addEventListener("click", () => {
        resultImage.src = "";
        resultImage.style.display = "none";
        deleteIcon.style.display = "none";
        document.getElementById("download-link").style.display = "none";
        document.getElementById("download-link").removeAttribute("href");
        document.getElementById("result-text").innerText = "🗑️ Image removed.";
        resultImage.style.transform = "scale(1)";
        currentScale = 1;
    });

    let currentScale = 1;
    const minScale = 0.5;
    const maxScale = 3;

    resultImage.addEventListener("wheel", (e) => {
        e.preventDefault();

        const zoomStep = 0.1;

        if (e.deltaY < 0) {
            // Scroll up = zoom in
            if (currentScale < maxScale) {
                currentScale += zoomStep;
            }
        } else if (e.deltaY > 0) {
            // Scroll down = zoom out
            if (currentScale > minScale) {
                currentScale -= zoomStep;
            }
        }

        resultImage.style.transform = `scale(${currentScale})`;
    });



    async function generate() {
        const prompt = document.getElementById("prompt").value;
        // const size = document.getElementById("size").value;
        const size = document.querySelector('input[name="size"]:checked').value;
        const resultText = document.getElementById("result-text");
        const resultImage = document.getElementById("result-image");
        const downloadLink = document.getElementById("download-link");

        // Cek jika prompt kosong
        if (!prompt) {
            resultText.innerText = "❌ Prompt tidak boleh kosong.";
            return;
        }

        resultText.innerText = "Generating image...";
        // Sembunyikan aspect ratio preview
        document.getElementById("aspect-preview").style.display = "none";
        resultImage.style.display = "none";
        downloadLink.style.display = "none";

        try {
        const response = await fetch("/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, size })
        });

        const data = await response.json();
        const base64Image = `data:image/png;base64,${data.image}`;

        resultText.innerText = data.text = "Image Result";
        resultImage.src = base64Image;
        resultImage.style.display = "block";
        currentScale = 1;
        resultImage.style.transform = "scale(1)";
        deleteIcon.style.display = "block";
        
        // Set link untuk download
        downloadLink.href = base64Image;
        downloadLink.style.display = "inline-block";
        } catch (err) {
        console.error(err);
        resultText.innerText = "❌ Failed to generate image.";
        }
    }

    
    function updatePreview() {
        // const size = document.getElementById("size").value;
        document.getElementById("aspect-preview").style.display = "block";
        const size = document.querySelector('input[name="size"]:checked').value;

        const preview = document.getElementById("aspect-preview");

        preview.className = "aspect-box"; // Reset classes
        preview.setAttribute("data-label", "");

        if (size === "landscape") {
            preview.classList.add("aspect-landscape");
            preview.setAttribute("data-label", "Preview: Landscape 16:9");
        } else if (size === "portrait") {
            preview.classList.add("aspect-portrait");
            preview.setAttribute("data-label", "Preview: Portrait 9:16");
        } else if (size === "square") {
            preview.classList.add("aspect-square");
            preview.setAttribute("data-label", "Preview: Square 1:1");
        }
    }

    // Jalankan saat halaman pertama kali dibuka
    window.onload = updatePreview;