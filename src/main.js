import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { ogg } from "./ogg.js";
import { openAi } from "./openAi.js";
// Передаємо Токін, який будемо отримувати від самого телеграма
const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.on(message("voice"), async (context) => {
  try {
    const link = await context.telegram.getFileLink(
      context.message.voice.file_id
    );
    const userId = String(context.message.from.id);
    console.log(link.href);

    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);
    const text = await openAi.transcription(mp3Path);
    // const response = await openAi.chat(text);

    await context.reply(text);
  } catch (error) {
    console.log("error voice message", error.message);
  }
});

bot.command("start", async (context) => {
  await context.reply(JSON.stringify(context.message, null, 2));
});
bot.launch();

//Якщо node.js завершується то :
process.once("SIGINIT", () => bot.stop("SIGINIT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
