declare const TELEGRAM_KEY: String;
declare const CRONJOB_KEY: String;
import * as CronJob from "./CronJob"
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
  if (request.method === "POST") {
    const payload: any = await request.json();
    // Getting the POST request JSON payload
    if ("message" in payload) {
      // Checking if the payload comes from Telegram
      const chatId = payload.message.chat.id;
      
      //TEMP create job to go off every minute of septembre 23rd
      const taskId: string = payload.message.text
      let url: URL = new URL("https://telegrambot.gorro-rojo.workers.dev")
      url.searchParams.append("taskId",taskId)
      console.log(url.toString())
      const job: CronJob.DetailedJob = CronJob.detailedJobFactory({
        url:url.toString(),
        schedule: CronJob.scheduleFactory(undefined,[-1], [23], [-1], [9], [-1]),
        requestMethod: CronJob.RequestMethod.GET,
        title: payload.message.text
      })

      let id: number = -1
      try{
        id = await CronJob.sendCreateJob(job)
        await sendMessage(chatId, "Success! JobId is " + id)
      } catch (err: any) {
        sendMessage(chatId, 
          `[Error when sending job to Cron-Job]\n`+
          `${err.name}: ${err.message}`
          )
        sendMessage(chatId,
          `[detailedJob]\n`+ JSON.stringify(job))

      }
      console.log(id);
      
    }
  } else if (request.method === "GET") {
    const url = new URL(request.url)
    console.log("Gotten! With taskId: " + url.searchParams.get("taskId"))
  }
  return new Response("OK"); // Doesn't really matter
}

async function sendMessage(chatId: any, text: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_KEY}/sendMessage?chat_id=${chatId}&text=${text}`;
  return await fetch(url).then((resp) => resp.json());
}
export {};
