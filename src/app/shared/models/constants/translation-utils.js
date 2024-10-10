const optionsTemplate = (text) => ({
  method: 'POST',
  headers: {
    'api-subscription-key': 'Sarvam-api-subscription-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    source_language_code: "en-IN",
    target_language_code: "od-IN",
    input: text
  })
});

const isAllCaps = (str) => {
  return str === str.toUpperCase();
};

const toTitleCase = (str) => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

// Add JSON data to translate [{"":""}]
const data =



async function translateToOdia(data) {
  for (let i = 0; i < data.length; i++) {
    let enText = data[i].en;

    let textToTranslate = isAllCaps(enText) ? toTitleCase(enText) : enText;
    const options = optionsTemplate(textToTranslate);

    try {
      const response = await fetch('https://api.sarvam.ai/translate', options);
      const result = await response.json();

      data[i].od = result.translated_text;

    } catch (err) {
      console.error(`Error translating entry ${i}:`, err);
    }
  }

  console.log("Final JSON with translations:", JSON.stringify(data, null, 2));
}

translateToOdia(data);
