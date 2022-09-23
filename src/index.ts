declare const TELEGRAM_KEY: String;
declare const CRONJOB_KEY: String;
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
      const job: DetailedJob = detailedJobFactory({
        url:url.toString(),
        schedule: scheduleFactory(undefined,[-1], [23], [-1], [9], [-1]),
        requestMethod: RequestMethod.GET,
        title: payload.message.text
      })

      let id: number = -1
      try{
        id = await sendCreateJob(job)
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

/**
 * Sends a request to cron-job to create detailedJob
 * @param detailedJob 
 * @returns Promise<JobId>
 */
async function sendCreateJob(detailedJob: DetailedJob): Promise<number> {
  if (detailedJob.url !== null) {
    const result = await fetch("https://api.cron-job.org/jobs", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${CRONJOB_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({job:detailedJob})
    })
      .then((r) => r.json())
      .then((r) => (r as { jobId: number }).jobId)
      .catch((err) => {throw err})
    console.log(JSON.stringify(detailedJob))
    return result
  } else {
    throw new Error("detailedJob parameter needs to have a URL value")
  }
}
enum JobStatus {
  NOT_EXECUTED,
  OK,
  ERROR_DNS_ERROR,
  ERROR_COULD_NOT_CONNECT_TO_HOST,
  ERROR_HTTP_ERROR,
  ERROR_TIMEOUT,
  ERROR_TOO_MUCH_RESPONSE_DATA,
  ERROR_INVALID_URL,
  ERROR_INTERNAL_ERRORS,
  ERROR_UNKNOWN_REASON,
}
enum JobType {
  DEFAULT,
  MONITORING,
}
enum RequestMethod {
  GET,
  POST,
  OPTIONS,
  HEAD,
  PUT,
  DELETE,
  TRACE,
  CONNECT,
  PATCH,
}
interface JobSchedule {
  timezone: string;
  hours: number[];
  mdays: number[];
  minutes: number[];
  months: number[];
  wdays: number[];
}
interface Job {
  jobId?: number;
  enabled?: boolean;
  title?: string;
  saveResponses?: boolean;
  url?: string;
  lastStatus?: JobStatus;
  lastDuration?: number; //milliseconds
  lastExecution?: number; //unix timestampe in seconds
  nextExecution?: number; //unix timestampe in seconds
  type?: JobType;
  requestTimeout?: number; //seconds
  redirectSuccess?: boolean;
  schedule?: JobSchedule;
  requestMethod?: RequestMethod;
}
interface DetailedJob extends Job {
  auth: {
    enable: boolean;
    user: string;
    password: string;
  };
  notification: {
    onFailure: boolean;
    onSuccess: boolean;
    onDisable: boolean;
  };
  extendedData: {
    headers: object;
    body: string;
  };
}

/**
 * Creates a jobSchedule. By default, it's set to go off at 00:00 every day _(America/Argentina/Buenos_Aires) (GMT-3)_
 *
 * For any of the arrays, means it there are no filters based on that value.
 * @param timezone
 * @param hours
 * @param mdays what days of the month
 * @param minutes
 * @param months what months
 * @param wdays what days of the week. 0 is Sunday, 6 is Satuday
 * @returns
 */
function scheduleFactory(
  timezone: string = "America/Argentina/Buenos_Aires",
  hours: number[] = [0],
  mdays: number[] = [-1],
  minutes: number[] = [0],
  months: number[] = [-1],
  wdays: number[] = [-1]
): JobSchedule {
  return {
    timezone: timezone,
    hours: hours,
    mdays: mdays,
    minutes: minutes,
    months: months,
    wdays: wdays,
  };
}
function jobFactory(
  jobId: number,
  enabled: boolean = true,
  title?: string,
  saveResponses: boolean = true,
  url?: string,
  lastStatus?: number,
  lastDuration?: number, //milliseconds
  lastExecution?: number, //unix timestampe in seconds
  nextExecution?: number, //unix timestampe in seconds
  type: JobType = JobType.DEFAULT,
  requestTimeout?: number, //seconds
  redirectSuccess: boolean = true,
  schedule: JobSchedule = scheduleFactory(),
  requestMethod: RequestMethod = RequestMethod.POST
): Job {
  return {
    jobId: jobId,
    enabled: enabled,
    title: title,
    saveResponses: saveResponses,
    url: url,
    lastStatus: lastStatus,
    lastDuration: lastDuration,
    lastExecution: lastExecution,
    nextExecution: nextExecution,
    type: type,
    requestTimeout: requestTimeout,
    redirectSuccess: redirectSuccess,
    schedule: schedule,
    requestMethod: requestMethod,
  };
}
function detailedJobFactory(
  job: Job,
  auth: {
    enable: boolean;
    user: string;
    password: string;
  } = { enable: false, user: "", password: "" },
  notification: {
    onFailure: boolean;
    onSuccess: boolean;
    onDisable: boolean;
  } = { onFailure: true, onSuccess: false, onDisable: false },
  extendedData: {
    headers: object;
    body: string;
  } = { headers: {}, body: "" }
): DetailedJob {
  if (job.enabled == undefined) {
    job.enabled = true
  }
  return {
    jobId: job.jobId,
    enabled: job.enabled,
    title: job.title,
    saveResponses: job.saveResponses,
    url: job.url,
    lastStatus: job.lastStatus,
    lastDuration: job.lastDuration,
    lastExecution: job.lastExecution,
    nextExecution: job.nextExecution,
    type: job.type,
    requestTimeout: job.requestTimeout,
    redirectSuccess: job.redirectSuccess,
    schedule: job.schedule,
    requestMethod: job.requestMethod,
    auth: auth,
    notification: notification,
    extendedData: extendedData,
  };
}

export {};
