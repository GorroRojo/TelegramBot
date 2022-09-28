declare const CRONJOB_KEY: String;

export enum JobStatus {
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
export enum JobType {
  DEFAULT,
  MONITORING,
}
export enum RequestMethod {
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
export interface JobSchedule {
  timezone: string;
  hours: number[];
  mdays: number[];
  minutes: number[];
  months: number[];
  wdays: number[];
}
export interface Job {
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
export interface DetailedJob extends Job {
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
 * Sends a request to cron-job to create detailedJob
 * @param detailedJob
 * @returns Promise<JobId>
 */
export async function sendCreateJob(detailedJob: DetailedJob): Promise<number> {
  if (detailedJob.url !== null) {
    const result = await fetch("https://api.cron-job.org/jobs", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${CRONJOB_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job: detailedJob }),
    })
      .then((r) => r.json())
      .then((r) => (r as { jobId: number }).jobId)
      .catch((err) => {
        throw err;
      });
    console.log(JSON.stringify(detailedJob));
    return result;
  } else {
    throw new Error("detailedJob parameter needs to have a URL value");
  }
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
export function scheduleFactory(
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
export function jobFactory(
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
export function detailedJobFactory(
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
    job.enabled = true;
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
