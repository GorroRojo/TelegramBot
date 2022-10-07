import * as CronJob from "./CronJob";
declare const TELEGRAM_KEY: string;
const WORKER_URL: string = "https://telegrambot.gorro-rojo.workers.dev";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
  if (request.method === "POST") {
    const payload: any = await request.json();
    // Getting the POST request JSON payload
    if ("message" in payload) {
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
