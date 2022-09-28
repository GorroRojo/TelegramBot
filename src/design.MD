- [Roadmap y diseño](#roadmap-y-diseño)
  - [Features](#features)
  - [Arquitectura del programa y de los KV](#arquitectura-del-programa-y-de-los-kv)
  - [DataTypes](#datatypes)
    - [Event](#event)
    - [RoutineEvent](#routineevent)
    - [SingleEvent](#singleevent)
    - [Task](#task)
    - [RoutineTask](#routinetask)
    - [DeadlineTask](#deadlinetask)
    - [DateSchedule](#dateschedule)
    - [Action](#action)
    - [ActionType](#actiontype)
    - [SessionPreset](#sessionpreset)
    - [Session](#session)
    - [Unit](#unit)
    - [User](#user)
    - [TelegramUser](#telegramuser)
    - [Dynamic](#dynamic)
    - [Relation](#relation)

# Roadmap y diseño

## Features

- v0.1
  - [ ] Tareas diarias
  - [ ] Eventos
  - [ ] Sesiones Pendientes
  - [ ] Agenda concurrente
  - [ ] Reporte diario con botones faciles de castigo/recompensa

- [ ] Sync calendario
- [ ] Modular??
  - [ ] Tumblr queue
  - [ ] Fetch gaumont movies
  - [ ] Timer tiempo sin cadena
  - [ ] Merciless Chance

## Arquitectura del programa y de los KV

TODO Rewards? Treats?

- programa
  - ActionType[] *¿y alguna forma de interpretarlas?*
  - TelegramUser[] `KV`
  - Relation[] `KV`
  - Dynamic[] `KV`
    - Array<Event|RoutineEvent|SingleEvent>
      - DateSchedule
      - Unit
    - Array<Task|RoutineTask|DeadlineTask>
      - DateSchedule
      - Action[]
      - Unit
    - SessionPreset[]
    - Session[]

PrefixKey

- kv
  - PrefixKey
    - TelegramUserPrefix
    - RelationPrefix
    - DynamicPrefix
  - PrefixKey + ":" + DynamicPrefix
    - EventPrefix
    - TaskPrefix
    - SessionPresetPrefix
    - SessionPrefix
  - PrefixKey + ":" + DynamicPrefix + ":" + TaskPrefix
    - ActionPrefix

Bajo PrefixKey están todos los prefijos. después uniendo esos prefijos después de PrefixKey con un ":", podemos de cada uno ver si tienen sub-prefijos y así hasta que no haya más.

Después la verdadera información está con en esos prefijos, unidos con ":" con los sub-prefijos si hace falta, y con un ":"+ID al final.

## DataTypes

### Event

`Event`

| type                 | desc                   |
| :------------------- | :--------------------- |
| `const name: string` | Nombre del evento      |
| `const desc: string` | Descripción del evento |

### RoutineEvent

`RoutineEvent extends Event`

| type                           | desc                |
| :----------------------------- | :------------------ |
| `const schedule: DateSchedule` | Los días que sucede |

### SingleEvent

`SingleEvent extends Event`

| type                  | desc                      |
| :-------------------- | :------------------------ |
| `const date: date(?)` | La fecha en la que sucede |

### Task

`Task`

| type                     | desc                                   |
| :----------------------- | :------------------------------------- |
| `const name: string`     | Nombre de tarea                        |
| `const desc: string`     | Descripción de la tarea                |
| `const ChatId: number`   | Usuarie que debe                       |
| `let quantitative: bool` | Si tiene una "cantidad"                |
| `let debtAmount: number` | Cuantas veces debe. 1,2,3...           |
| `const unit: Unit`       | Unidad de las veces. "hs", "veces",... |

### RoutineTask

`RoutineTask extends Task`

| type                           | desc                                             |
| :----------------------------- | :----------------------------------------------- |
| `const baseAmount: number`     | Cuantas veces tiene de base cada día             |
| `const int`                    | Max de veces antes de consecuencia               |
| `const consequences: Action[]` | Consecuencias                                    |
| `const carryOver: boolean`     | Si suma a la deuda cuando no fue hecho           |
| `const schedule: DateSchedule` | Los días que tiene que hacerse                   |
| `const endDate: date(?)`       | Fecha donde deja de repetirse. default undefined |

### DeadlineTask

`DeadlineTask extends Task`

| type                           | desc                    |
| :----------------------------- | :---------------------- |
| `const deadline: date(?)`      | El deadline de la tarea |
| `const consequences: Action[]` | Consecuencias           |

### DateSchedule

`DateSchedule`

[-1] en cualquier array significa todos los días

| type                                               | desc                                         |
| :------------------------------------------------- | :------------------------------------------- |
| `let wdays: number[]`                              | qué días de la semana, 0 = sabado            |
| `let mdays: number[]`                              | qué días del mes                             |
| `let months: number[]`                             | qué meses                                    |
| `let counterRoutine: Array<[number,boolean,date]>` | every [num] [months(0)/days(1)] since [date] |

```ts
enum Periodicity {
  type: PeriodicityType,
  start: date,
  amount: number
}

enum PeriodicityType {
  DAYS,MONTHS
}
```

### Action

`Action`

| type                     | desc                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| `const type: ActionType` | Tipo de acción                                                    |
| `let data: any`          | Los datos necesarios, ej una sesión si la acción es "ADD_SESSION" |

### ActionType

`enum ActionType { RESET_COUNTER, ADD_SESSION }`

```ts
switch (action.type) {
  case ActionType.RESET_COUNTER: { 
    debtAmount = 0;
    break }
  case ActionType.ADD_SESSION: {
    // TODO does user want to modify it ? use modified : use action.data
    break }
  default: {break}
}
```

### SessionPreset

`SessionPreset`

| type                        | desc           |
| :-------------------------- | :------------- |
| `const sessionType: string` | Tipo de sesión | pseudo-enum, "castigo", "recompensa", "pago", "diversion"
| `const name: string`        | Nombre         |
| `const desc: string`        | Descripción    |

### Session

`Session extends SessionPreset`

| type                       | desc                            | note                                                   |
| -------------------------- | ------------------------------- | ------------------------------------------------------ |
| `const cause: string`      | Causante                        | Lo que está siendo castigado, recompensado, o pagado   |
| `const unit: Unit`         | Unidad                          | "hs","días","veces". Además de si es entero o decimal. |
| `let amount: number`       | Cantidad, en unidades de `unit` |                                                        |
| `let createdDate: Date(?)` | Fecha de creación               |                                                        |

### Unit

`Unit`

| type                       | desc                                             |
| -------------------------- | ------------------------------------------------ |
| `const isFloat: bool`      | Si es decimal. Por predeterminado no, es entero. |
| `const unitString: string` | unidad: "hs", "días", "veces"                    |

### User

`User`

| type                   | desc                                       |
| :--------------------- | :----------------------------------------- |
| `const chatId: number` | Identificador del chat privado con usuarie |

### TelegramUser

`TelegramUser extends User`

| type                       | desc                     |
| :------------------------- | :----------------------- |
| `const id: number`         | Identificador de usuarie |
| `const first_name: string` | Nombre                   |
| `const last_name: string`  | Apellido                 |
| `const username: string`   | Nombre de usuarie        |

### Dynamic

`Dynamic`

| type                                                | desc                            |
| --------------------------------------------------- | ------------------------------- |
| `let events: Array<RoutineEvent\|SingleEvent>`      | eventos                         |
| `let tasks: Array<Task\|RoutineTask\|DeadlineTask>` | tareas                          |
| `let sessions: Session[]`                           | sesiones pendientes             |
| `let sessionPresets: SessionPreset[]`               | sesiones predefinidas           |
| `let sessionTypes: string[]`                        | tipos de sesiones               |
| `const groupchatId: number`                         | Identificador del chat de grupo |

### Relation

`Relation`

Le usuarie D es quien generalmente "controla" a S. Si la relación no tiene diferencia de poder, se dice que es una relacion W.

| type                    | desc                         |
| ----------------------- | ---------------------------- |
| `const dUserId: number` | Usuarie D                    |
| `const sUserId: number` | Usuarie S                    |
| `const dTitle: number`  | Título de D (opt)            |
| `const sTitle: string`  | Título de S (opt)            |
| `const isW: boolean`    | Si es una relación de tipo W |


