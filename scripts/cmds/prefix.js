const { config } = global.GoatBot;
const path = require("path");
const fs = require("fs-extra");
const { utils } = global;
const axios = require("axios");

const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
};

function applyFont(text) {
    return text.split('').map(char => fontMapping[char] || char).join('');
}

function createBox(content) {
    const lines = content.split('\n');
    let result = `╭─━━━━━━━━━━━━━─╮\n   ${applyFont("𝗖𝗛𝗥𝗜𝗦𝗧𝗨𝗦 𝗕𝗢𝗧")} \n╰─━━━━━━━━━━━━━─╯\n`;
    
    for (const line of lines) {
        if (line.trim() === '') continue;
        result += `╭─━━━━━━━━━━━━━─╮\n ${applyFont(line)}\n╰─━━━━━━━━━━━━━─╯\n`;
    }
    
    return result;
}

module.exports = {
    config: {
        name: "prefix",
        version: "1.4",
        author: "messie osango",
        countDown: 5,
        role: 0,
        shortDescription: applyFont("Changer le prefix du bot"),
        longDescription: applyFont("Modifier la commande prefix du bot dans votre boîte de discussion ou sur tout le système bot (admin uniquement)"),
        category: "config",
        guide: {
            en: createBox(`${applyFont("{pn} <nouveau prefix>: changer le prefix dans votre boîte de discussion")}\n${applyFont("Exemple:")}\n${applyFont("{pn} #")}\n\n${applyFont("{pn} <nouveau prefix> -g: changer le prefix du système bot (admin uniquement)")}\n${applyFont("Exemple:")}\n${applyFont("{pn} # -g")}\n\n${applyFont("{pn} reset: réinitialiser le prefix dans votre boîte de discussion")}`)
        }
    },

    langs: {
        en: {
            reset: createBox(applyFont(`Votre prefix a été réinitialisé à la valeur par défaut: %1`)),
            onlyAdmin: createBox(applyFont(`Seul l'admin peut modifier le prefix du système bot`)),
            confirmGlobal: createBox(applyFont(`Veuillez réagir à ce message pour confirmer la modification du prefix du système bot`)),
            confirmThisThread: createBox(applyFont(`Veuillez réagir à ce message pour confirmer la modification du prefix dans votre boîte de discussion`)),
            successGlobal: createBox(applyFont(`Prefix du système bot modifié en: %1`)),
            successThisThread: createBox(applyFont(`Prefix de votre groupe modifié en: %1`)),
            myPrefix: createBox(`${applyFont("𝗣𝗥𝗘𝗙𝗜𝗫 𝗦𝗬𝗦𝗧𝗘̀𝗠𝗘 : %1")}\n${applyFont("𝗣𝗥𝗘𝗙𝗜𝗫 𝗚𝗥𝗢𝗨𝗣𝗘 : %2")}\n\n${applyFont("𝗧𝗮𝗽𝗲𝘇 %2help 𝗽𝗼𝘂𝗿 𝘃𝗼𝗶𝗿 𝘁𝗼𝘂𝘁𝗲𝘀 𝗹𝗲𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝗲𝘀 𝗱𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀")}`)
        }
    },

    onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
        if (!args[0])
            return message.SyntaxError();

        if (args[0] == 'reset') {
            await threadsData.set(event.threadID, null, "data.prefix");
            return message.reply(getLang("reset", global.GoatBot.config.prefix));
        }
        else if (args[0] == "file") {
            const isAdmin = config.adminBot.includes(event.senderID);
            if (!isAdmin) {
                message.reply(createBox(applyFont(`❌ Vous devez être admin du bot.`)));
            }
            else {
                const fileUrl = event.messageReply && event.messageReply.attachments[0].url;

                if (!fileUrl) {
                    return message.reply(createBox(applyFont(`❌ Aucun fichier joint valide trouvé.`)));
                }

                const folderPath = 'scripts/cmds/prefix';

                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }

                try {
                    const files = await fs.readdir(folderPath);
                    for (const file of files) {
                        await fs.unlink(path.join(folderPath, file));
                    }
                } catch (error) {
                    return message.reply(createBox(applyFont(`❌ Erreur lors du vidage du dossier: ${error}`)));
                }
        
                const response = await axios.get(fileUrl, {
                    responseType: "arraybuffer",
                    headers: {
                        'User-Agent': 'axios'
                    }
                });
        
                const contentType = response.headers['content-type'];
                if (contentType.includes('image')) {
                    const imagePath = path.join(folderPath, 'image.jpg');
                    fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));
                } else if (contentType.includes('video') || contentType.includes('gif')) {
                    const ext = contentType.includes('video') ? '.mp4' : '.gif';
                    const mediaPath = path.join(folderPath, 'media' + ext);
                    fs.writeFileSync(mediaPath, Buffer.from(response.data, 'binary'));
                } else {
                    return message.reply(createBox(applyFont(`❌ Format de fichier invalide. Répondez uniquement avec une image, vidéo ou gif`)));
                }
        
                message.reply(createBox(applyFont(`✅ Fichier enregistré avec succès.`)));
            }
        }
        else if (args == "clear") {
            const isAdmin = config.adminBot.includes(event.senderID);
            if (!isAdmin) {
                message.reply(createBox(applyFont(`❌ Vous devez être admin du bot.`)));
            }
            else {
                try {
                    const folderPath = 'scripts/cmds/prefix';
        
                    if (fs.existsSync(folderPath)) {
                        const files = await fs.readdir(folderPath);
                        for (const file of files) {
                            await fs.unlink(path.join(folderPath, file));
                        }
                        message.reply(createBox(applyFont(`✅ Dossier vidé avec succès.`)));
                    } else {
                        return message.reply(createBox(applyFont(`❌ Le dossier n'existe pas.`)));
                    }
                } catch (error) {
                    return message.reply(createBox(applyFont(`❌ Erreur lors du vidage du dossier: ${error}`)));
                }
            }
        }

        const newPrefix = args[0];
        const formSet = {
            commandName,
            author: event.senderID,
            newPrefix
        };

        if (args[1] === "-g")
            if (role < 2)
                return message.reply(getLang("onlyAdmin"));
            else
                formSet.setGlobal = true;
        else
            formSet.setGlobal = false;

        return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
            formSet.messageID = info.messageID;
            global.GoatBot.onReaction.set(info.messageID, formSet);
        });
    },

    onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
        const { author, newPrefix, setGlobal } = Reaction;
        if (event.userID !== author)
            return;
        if (setGlobal) {
            global.GoatBot.config.prefix = newPrefix;
            fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
            return message.reply(getLang("successGlobal", newPrefix));
        }
        else {
            await threadsData.set(event.threadID, newPrefix, "data.prefix");
            return message.reply(getLang("successThisThread", newPrefix));
        }
    },

    onChat: async function ({ event, message, getLang }) {
        const folderPath = 'scripts/cmds/prefix';

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const files = await fs.readdir(folderPath);

        const attachments = [];
        
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const fileStream = fs.createReadStream(filePath);
            attachments.push(fileStream);
        }

        const messageContent = {
            attachment: attachments
        };

        if (event.body) {
            const prefixesToCheck = ["bot", "prefix"];
            const lowercasedMessage = event.body.toLowerCase();
      
            if (prefixesToCheck.includes(lowercasedMessage.trim())) {
                return () => {
                    return message.reply({ 
                        body: getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID)), 
                        attachment: messageContent.attachment
                    });
                };
            }
        }
    }
};
