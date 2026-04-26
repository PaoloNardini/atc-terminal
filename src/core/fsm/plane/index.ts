import { setup } from "xstate";

export const machine = setup({
  types: {
    context: {} as {},
    events: {} as
      | { type: "Taxi" }
      | { type: "Climb" }
      | { type: "Start" }
      | { type: "On-Air" }
      | { type: "Descent" }
      | { type: "ROD Set" }
      | { type: "ROC  Set" }
      | { type: "ATC Copied" }
      | { type: "Waypoint Set" }
      | { type: "CalcUlate ROC" }
      | { type: "Calculate ROD" }
      | { type: "Holding Point" }
      | { type: "Start Descent" }
      | { type: "Maintaining FL" }
      | { type: "Waypoint Reached" }
      | { type: "Next waypoint set" }
      | { type: "No more waypoints" }
      | { type: "Cleared to Take-off" }
      | { type: "Ready for ATC Clearence" }
      | { type: "Reached descent target FL" }
      | { type: "Contact Tower for Take Off" }
      | { type: "Reached climbing target FL" },
  },
  actions: {
    EngineStarted: function () {
      // Add your action code here
      // ...
    },
  },
}).createMachine({
  context: {},
  id: "Airplane",
  initial: "Idle",
  states: {
    Idle: {
      on: {
        Start: {
          target: "On Ground",
        },
      },
    },
    "On Ground": {
      initial: "EngineStarting",
      states: {
        EngineStarting: {
          on: {
            "Ready for ATC Clearence": {
              target: "Waiting ATC Clearence",
            },
          },
          exit: "EngineStarted",
        },
        "Waiting ATC Clearence": {
          on: {
            "ATC Copied": {
              target: "Ready For Taxing",
            },
          },
        },
        "Ready For Taxing": {
          on: {
            Taxi: {
              target: "Taxing",
            },
          },
        },
        Taxing: {
          on: {
            "Holding Point": {
              target: "Waiting at holding point",
            },
          },
        },
        "Waiting at holding point": {
          on: {
            "Contact Tower for Take Off": {
              target: "FREQ TWR",
            },
          },
        },
        "FREQ TWR": {
          on: {
            "Cleared to Take-off": {
              target: "#Airplane.Departure",
            },
          },
        },
      },
    },
    Departure: {
      initial: "Take-Off",
      states: {
        "Take-Off": {
          initial: "Take-off",
          states: {
            "Take-off": {
              on: {
                "On-Air": {
                  target: "#Airplane.In flight",
                },
              },
            },
          },
        },
      },
    },
    "In flight": {
      type: "parallel",
      states: {
        Flying: {
          initial: "Rest",
          states: {
            Rest: {
              on: {
                Climb: {
                  target: "Set climb target FL",
                },
                "Reached climbing target FL": {
                  target: "Set ROC = 0",
                },
                Descent: {
                  target: "Set descent target FL",
                },
                "Reached descent target FL": {
                  target: "Set ROD = 0",
                },
              },
              description: "Maintain current state until an event occurs",
            },
            "Set climb target FL": {
              on: {
                "CalcUlate ROC": {
                  target: "Set ROC",
                },
              },
            },
            "Set ROC = 0": {
              on: {
                "Maintaining FL": {
                  target: "Rest",
                },
              },
            },
            "Set descent target FL": {
              on: {
                "Calculate ROD": {
                  target: "Set ROD",
                },
              },
            },
            "Set ROD = 0": {
              on: {
                "Maintaining FL": {
                  target: "Rest",
                },
              },
            },
            "Set ROC": {
              on: {
                "ROC  Set": {
                  target: "Rest",
                },
              },
            },
            "Set ROD": {
              on: {
                "ROD Set": {
                  target: "Rest",
                },
              },
            },
          },
        },
        "Flight Routing": {
          initial: "SID",
          states: {
            SID: {
              initial: "Set First Waypoint",
              states: {
                "Set First Waypoint": {
                  on: {
                    "Waypoint Set": {
                      target: "Flying",
                    },
                  },
                },
                Flying: {
                  on: {
                    "Waypoint Reached": {
                      target: "Get Next Waypoint",
                    },
                  },
                },
                "Get Next Waypoint": {
                  on: {
                    "No more waypoints": {
                      target: "#Airplane.In flight.Flight Routing.EnRoute",
                    },
                    "Next waypoint set": {
                      target: "Flying",
                    },
                  },
                },
              },
            },
            EnRoute: {
              initial: "Enroute Flying",
              on: {
                "Start Descent": {
                  target: "Arrival",
                },
              },
              states: {
                "Enroute Flying": {},
              },
            },
            Arrival: {
              initial: "Landing",
              states: {
                Landing: {
                  initial: "New state 1",
                  states: {
                    "New state 1": {},
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});