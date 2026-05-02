import { setup, assign } from "xstate";

export interface AirplaneContext {
  FL: number; // 0...420
  HDG: number; // 0...359
  ROC: number; // feet/minute
  ROT: number; // degrees/minute
}

export type AirplaneEvents =
  | { type: "Climb"; ROC: number; TARGET_FL: number }
  | { type: "Descent"; ROC: number; TARGET_FL: number }
  | { type: "Turn Right"; ROT: number; TARGET_HDG: number }
  | { type: "Turn Left"; ROT: number; TARGET_HDG: number }
  | { type: "Level" }
  | { type: "Stop Turn" };

export const machine = setup({
  types: {
    context: {} as AirplaneContext,
    events: {} as AirplaneEvents,
  },
  actions: {
    startClimb: assign({
      ROC: ({ event }) => {
        if (event.type === "Climb") return event.ROC;
        return 0;
      },
    }),
    startDescent: assign({
      ROC: ({ event }) => {
        if (event.type === "Descent") return event.ROC;
        return 0;
      },
    }),
    levelOff: assign({
      ROC: 0,
    }),
    startTurnRight: assign({
      ROT: ({ event }) => {
        if (event.type === "Turn Right") return event.ROT;
        return 0;
      },
    }),
    startTurnLeft: assign({
      ROT: ({ event }) => {
        if (event.type === "Turn Left") return event.ROT;
        return 0;
      },
    }),
    stopTurn: assign({
      ROT: 0,
    }),
  },
  guards: {
    isValidClimb: ({ context, event }) => {
      if (event.type !== "Climb") return false;
      return event.ROC > 0 && event.TARGET_FL > context.FL;
    },
    isValidDescent: ({ context, event }) => {
      if (event.type !== "Descent") return false;
      return event.ROC < 0 && event.TARGET_FL < context.FL;
    },
    isValidTurnRight: ({ event }) => {
      if (event.type !== "Turn Right") return false;
      return event.ROT > 0;
    },
    isValidTurnLeft: ({ event }) => {
      if (event.type !== "Turn Left") return false;
      return event.ROT < 0;
    },
  },
}).createMachine({
  id: "Airplane",
  type: "parallel",
  context: {
    FL: 0,
    HDG: 0,
    ROC: 0,
    ROT: 0,
  },
  states: {
    Vertical: {
      initial: "Rest",
      states: {
        Rest: {
          on: {
            Climb: {
              target: "Climbing",
              guard: "isValidClimb",
              actions: "startClimb",
            },
            Descent: {
              target: "Descending",
              guard: "isValidDescent",
              actions: "startDescent",
            },
          },
        },
        Climbing: {
          on: {
            Level: {
              target: "Rest",
              actions: "levelOff",
            },
          },
        },
        Descending: {
          on: {
            Level: {
              target: "Rest",
              actions: "levelOff",
            },
          },
        },
      },
    },
    Horizontal: {
      initial: "Rest",
      states: {
        Rest: {
          on: {
            "Turn Right": {
              target: "Turning Right",
              guard: "isValidTurnRight",
              actions: "startTurnRight",
            },
            "Turn Left": {
              target: "Turning Left",
              guard: "isValidTurnLeft",
              actions: "startTurnLeft",
            },
          },
        },
        "Turning Right": {
          on: {
            "Stop Turn": {
              target: "Rest",
              actions: "stopTurn",
            },
          },
        },
        "Turning Left": {
          on: {
            "Stop Turn": {
              target: "Rest",
              actions: "stopTurn",
            },
          },
        },
      },
    },
  },
});