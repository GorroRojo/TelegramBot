type ChatID = number;
type SessionType = string;

interface User {
  chat: ChatID;
}
interface TelegramUser extends User {
  // id: UUID
  first_name: string;
  last_name: string;
  username: string;
}
interface Relation {
  d: number;
  s: number;
  dTitle: string;
  sTitle: string;
  isW: boolean;
}
export interface Dynamic {
  groupchatId: number;
  events: Array<RoutineEvent | SingleEvent>;
  tasks: Array<Task | RoutineTask | DeadlineTask>;
  sessions: Array<Session>;
  sessionPresets: Array<SessionPreset>;
  sessionTypes: Array<SessionType>;
}
// EVENTS
interface Event {
  name: string;
  desciption?: string;
}
interface RoutineEvent extends Event {
  schedule: DateSchedule;
}
interface SingleEvent extends Event {
  date: Date;
}

interface Task {
  name: string;
  description: string;
  chat: ChatID;
  debtAmount?: number;
  unit: Unit;
}
interface RoutineTask extends Task {
  baseAmount: number;
  maxPerDay: number;
  consequences: Action[];
  carryOver: boolean;
  schedule: DateSchedule;
  endDate: Date;
}
interface DeadlineTask extends Task {
  deadline: Date;
  consequences: Action[];
}
interface SessionPreset {
  name: string;
  sessionType: SessionType;
  description: string;
}
interface Session extends SessionPreset {
  cause: string;
  amount: number;
  unit: Unit;
  createdDate: Date;
}
interface DateSchedule {
  wdays: number[];
  mdays: number[];
  months: number[];
  counters: CounterSchedule[];
}
interface Unit {
  isFloat: boolean;
  unitString: string;
}

interface Action {
  type: ActionType;
  data: any;
}
enum ActionType {
  RESET_COUNTER,
  ADD_SESSION,
}
interface CounterSchedule {
  amount: number;
  type: CounterType;
  start: Date;
}
enum CounterType {
  MONTHS = "months",
  DAYS = "days",
  WEEKS = "weeks",
}
