import * as CronJob from "./CronJob";
import * as KVManager from "./KVManager"
declare const TELEGRAM_KEY: string;
const WORKER_URL: string = "https://telegrambot.gorro-rojo.workers.dev";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
//-----temp-----
type Message = any;
type CallbackQuery = any;
type Poll = any;
//------end temp-----

interface Update {
  update_id: number;
  message?: Message;
  edited_message?: Message;
  callback_query?: CallbackQuery;
  poll: Poll;
}

async function handleRequest(request: Request): Promise<Response> {
  if (request.method === "POST") {
    // TODO chequar si vino de telegram
    const update: Update = await request.json();

    if (update.update_id == await KVManager.getLastUpdate()) {
      return new Response("Update already recieved")
    }
    
    


    
  } else if (request.method === "GET") {
    const url = new URL(request.url);
    console.log("Gotten! With taskId: " + url.searchParams.get("taskId"));
  }
  return new Response("OK"); // Doesn't really matter
}

async function sendMessage(chatId: number, text: string): Promise<any> {
  let url = new URL(
    "/sendMessage",
    `https://api.telegram.org/bot${TELEGRAM_KEY}`
  );

  url.searchParams.append("chat_id", chatId.toString());
  url.searchParams.append("text", text);

  return await fetch(url.href).then((resp) => resp.json());
}
export {};
