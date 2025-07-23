const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: `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`
});

module.exports = {
    openai: openai,
}