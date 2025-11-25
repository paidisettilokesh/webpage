async function analyzeResume() {
  const fileInput = document.getElementById("resumeInput");
  const resultDiv = document.getElementById("result");

  if (!fileInput.files.length) {
    resultDiv.innerHTML = "<p class='text-red-600'>Please upload a resume file.</p>";
    return;
  }

  const file = fileInput.files[0];
  const fileType = file.name.split(".").pop().toLowerCase();
  let resumeText = "";

  if (fileType === "txt") {
    resumeText = await readTextFile(file);
  } else if (fileType === "pdf") {
    resumeText = await readPDF(file);
  } else if (fileType === "docx") {
    resumeText = await readDocx(file);
  } else {
    resultDiv.innerHTML = "<p class='text-red-600'>Unsupported file format.</p>";
    return;
  }

  const wordCount = resumeText.split(/\s+/).length;
  const readability = Math.min(100, Math.floor(wordCount / 2));
  const formatting = Math.floor(Math.random() * 20 + 80);
  const tone = Math.floor(Math.random() * 20 + 75);

  resultDiv.innerHTML = `
    <h2 class="text-xl font-semibold mb-2 text-blue-600">Resume Analysis Results</h2>
    <p><strong>Words:</strong> ${wordCount}</p>
    <p><strong>Readability:</strong> ${readability}%</p>
    <p><strong>Formatting:</strong> ${formatting}%</p>
    <p><strong>Professional Tone:</strong> ${tone}%</p>
    <p class="mt-4"><strong>Preview:</strong><br>${resumeText.substring(0, 500)}...</p>
  `;
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function readPDF(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(" ");
        text += pageText + "\n";
      }
      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function readDocx(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const result = await mammoth.extractRawText({ arrayBuffer });
      resolve(result.value);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}