
import fetch from 'node-fetch'; // Ensure node-fetch is installed
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = (await import('@adiwajshing/baileys')).default;

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!(args[0] || '').match(new RegExp(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/, 'gi'))) {
    return m.reply(`Contoh penggunaan: *${usedPrefix}${command}* https://www.youtube.com/watch?v=K9_VFxzCuQ0`);
  }
  await m.reply(wait);

  try {
    // Fetch video data from API
    const apiUrl = `https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(args[0])}&apikey=konto`;
    let response = await fetch(apiUrl);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return m.reply('Gagal mendapatkan data video. Respon dari server tidak dalam format JSON.');
    }

    let data = await response.json();
    
    if (!data.result) {
      return m.reply('Gagal mendapatkan data video.');
    }

    // Destructure the result from the API response
    let { title, description, duration, image, mp3, mp4, timestamp, ago, views, name, channel } = data.result;
    
    // Construct the message text
    let txt = `*${title}*\n\n`
        + `📝 Deskripsi: ${description}\n\n`
        + `⌲ Durasi: ${timestamp} (${duration} detik)\n`
        + `📅 Rilis: ${ago}\n`
        + `🎤 Channel: ${name}\n`
        + `🔗 [Kunjungi Channel](${channel})`;

    // Prepare media for the header with thumbnail URL
    const header = proto.Message.InteractiveMessage.Header.create({
      ...(await prepareWAMessageMedia({ image: { url: image } }, { upload: conn.waUploadToServer })),
      title: '',
      gifPlayback: false,
      subtitle: 'Thumbnail',
      hasMediaAttachment: true
    });

    // Create interactive message with buttons, header, and thumbnail URL
    const msg = generateWAMessageFromContent(m.key.remoteJid, {
      viewOnceMessage: {
        message: {
          "messageContextInfo": {
            "deviceListMetadata": {},
            "deviceListMetadataVersion": 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            header,
            body: proto.Message.InteractiveMessage.Body.create({
              text: txt
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: global.info.namebot // Replace with your bot's name
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  "name": "quick_reply",
                  "buttonParamsJson": JSON.stringify({ "display_text": "📹 VIDEO", "id": `${usedPrefix}ytv ${args[0]}` })
                },
                {
                  "name": "quick_reply",
                  "buttonParamsJson": JSON.stringify({ "display_text": "🎵 AUDIO", "id": `${usedPrefix}yta ${args[0]}` })
                }
              ]
            })
          })
        }
      }
    }, {});

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error(e);
    m.reply("Sistem Chiyo *Error*\n _Jika eror coba fitur *.dl <url>*_");
  }
};

handler.help = ['youtube'].map(v => v + ' url');
handler.command = /^(yt|youtube)$/i;
handler.register = false;
handler.limit = true;

export default handler;
