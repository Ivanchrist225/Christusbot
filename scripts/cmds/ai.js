const axios = require('axios');

const API_KEY = "AIzaSyBQeZVi4QdrnGKPEfXXx1tdIqlMM8iqvZw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function getAIResponse(input) {
    try {
        const systemPrompt = "Tu es Voldigo Bot, une IA créée et développée par Voldigo Anos. Tu réponds sur ton créateur et ta création que si tu es questionné sur ça. ";
        const fullInput = systemPrompt + input;
        
        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: fullInput }] }]
        }, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas de réponse.";
    } catch (error) {
        console.error("Erreur API:", error);
        return "Erreur de connexion à l'IA";
    }
}

function formatResponse(content) {
    const styledContent = content.split('').map(char => {
        const styleMap = {
            'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍',
            'G': '𝘎', 'H': '𝘏', 'I': '𝘐', 'J': '𝘑', 'K': '𝘒', 'L': '𝘓',
            'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙',
            'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟',
            'Y': '𝘠', 'Z': '𝘡',
            'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧',
            'g': '𝘨', 'h': '𝘩', 'i': '𝘪', 'j': '𝘫', 'k': '𝘬', 'l': '𝘭',
            'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳',
            's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹',
            'y': '𝘺', 'z': '𝘻'
        };
        return styleMap[char] || char;
    }).join('');

    return `╭─━━━━━━━━━━━━━─╮
   𝙑𝙊𝙇𝘿𝙄𝙂𝙊 𝘽𝙊𝙏 
 ╰─━━━━━━━━━━━━━─╯ 
   ${styledContent}
  

╰─━━━━━━━━━━━━━─╯`;
}

module.exports = { 
    config: { 
        name: 'ai',
        author: 'Messie Osango',
        version: '2.0',
        role: 0,
        category: 'AI',
        shortDescription: 'ia répondant aux questions',
        longDescription: 'Voldigo Bot est une IA avancée développée par Voldigo Anos, capable de répondre à diverses questions et demandes. Elle répond au sujet de ses créateurs et sa création seulement quand elle est questionnée sur ce sujet.',
    },
    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        if (!input) {
            return api.sendMessage(formatResponse("Présent ! Je suis Voldigo Bot. Posez-moi vos questions et j'y répondrai avec plaisir !"), event.threadID);
        }

        try {
            const aiResponse = await getAIResponse(input);
            api.sendMessage(formatResponse(aiResponse), event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage(formatResponse("Une erreur s'est produite lors du traitement de votre demande"), event.threadID);
        }
    },
    onChat: async function ({ event, message }) {
        if (!event.body.toLowerCase().startsWith("ai")) return;
        
        const input = event.body.slice(2).trim();
        if (!input) {
            return message.reply(formatResponse("Présent ! Je suis Voldigo Bot, votre assistant IA. Comment puis-je vous aider aujourd'hui?"));
        }

        try {
            const aiResponse = await getAIResponse(input);
            message.reply(formatResponse(aiResponse));
        } catch (error) {
            message.reply(formatResponse("Désolé, une erreur est survenue. Veuillez réessayer plus tard."));
        }
    }
};
