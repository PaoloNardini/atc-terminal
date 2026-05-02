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
      | { type: "ATC Copied" }
      | { type: "Waypoint Set" }
      | { type: "Holding Point" }
      | { type: "Start Descent" }
      | { type: "Waypoint Reached" }
      | { type: "Next waypoint set" }
      | { type: "No more waypoints" }
      | { type: "Cleared to Take-off" }
      | { type: "Ready for ATC Clearence" }
      | { type: "Contact Tower for Take Off" }
      | { type: "Level-up" }
      | { type: "Level-down" }
      | { type: "Turn" }
      | { type: "Stop Turn" },
  },
  actions: {
    EngineStarted: function () {
      // Add your action code here
    },
    "set ROD": function (_, _params: { ROD: string | number; TARGET_FL?: string }) {
      // Add your action code here
    },
    "set ROC": function (_, _params: { ROC: string | number; TARGET_FL?: string }) {
      // Add your action code here
    },
    "set ROT": function (_, _params: { ROT: string | number; TARGET_HDG?: string }) {
      // Add your action code here
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
                  target: "#Airplane.Flight",
                },
              },
            },
          },
        },
      },
    },
    Flight: {
      type: "parallel",
      states: {
        Flying: {
          type: "parallel",
          states: {
            Vertical: {
              initial: "Rest",
              states: {
                Rest: {
                  on: {
                    Descent: {
                      target: "Descending",
                      actions: {
                        type: "set ROD",
                        params: {
                          ROD: "",
                          TARGET_FL: "",
                        },
                      },
                    },
                    Climb: {
                      target: "Climbing",
                      actions: {
                        type: "set ROC",
                        params: {
                          ROC: "",
                          TARGET_FL: "",
                        },
                      },
                    },
                  },
                },
                Descending: {
                  on: {
                    "Level-down": {
                      target: "Rest",
                      actions: {
                        type: "set ROD",
                        params: {
                          ROD: 0,
                        },
                      },
                    },
                  },
                },
                Climbing: {
                  on: {
                    "Level-up": {
                      target: "Rest",
                      actions: {
                        type: "set ROC",
                        params: {
                          ROC: 0,
                        },
                      },
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
                    Turn: {
                      target: "Turning",
                      actions: {
                        type: "set ROT",
                        params: {
                          ROT: "",
                          TARGET_HDG: "",
                        },
                      },
                    },
                  },
                },
                Turning: {
                  on: {
                    "Stop Turn": {
                      target: "Rest",
                      actions: {
                        type: "set ROT",
                        params: {
                          ROT: 0,
                        },
                      },
                    },
                  },
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
                      target: "#Airplane.Flight.Flight Routing.EnRoute",
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