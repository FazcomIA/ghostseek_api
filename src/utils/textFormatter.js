/**
 * Limpa e formata o texto recebido do DeepSeek.
 * Remove excesso de quebras de linha e espaços.
 * @param {string} text 
 * @returns {string}
 */
function cleanText(text) {
    if (!text) return '';

    // Remove espaços no início e fim
    let cleaned = text.trim();

    // Substitui 3 ou mais quebras de linha por 2 (parágrafo padrão)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Remove espaços em branco repetidos excessivos (opcional, cuidado com código)
    // cleaned = cleaned.replace(/[ \t]+/g, ' '); 

    return cleaned;
}

module.exports = { cleanText };
