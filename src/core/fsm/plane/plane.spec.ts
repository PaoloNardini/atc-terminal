import { createActor } from "xstate";
import { machine } from "./index";

describe("Airplane FSM", () => {
  it("should initialize in Idle state", () => {
    const actor = createActor(machine).start();
    expect(actor.getSnapshot().value).toBe("Idle");
  });

  it("should transition through On Ground phases", () => {
    const actor = createActor(machine).start();

    // Start -> On Ground.EngineStarting
    actor.send({ type: "Start" });
    expect(actor.getSnapshot().value).toEqual({ "On Ground": "EngineStarting" });

    // Ready for ATC Clearence -> Waiting ATC Clearence
    actor.send({ type: "Ready for ATC Clearence" });
    expect(actor.getSnapshot().value).toEqual({
      "On Ground": "Waiting ATC Clearence",
    });

    // ATC Copied -> Ready For Taxing
    actor.send({ type: "ATC Copied" });
    expect(actor.getSnapshot().value).toEqual({
      "On Ground": "Ready For Taxing",
    });

    // Taxi -> Taxing
    actor.send({ type: "Taxi" });
    expect(actor.getSnapshot().value).toEqual({ "On Ground": "Taxing" });

    // Holding Point -> Waiting at holding point
    actor.send({ type: "Holding Point" });
    expect(actor.getSnapshot().value).toEqual({
      "On Ground": "Waiting at holding point",
    });

    // Contact Tower for Take Off -> FREQ TWR
    actor.send({ type: "Contact Tower for Take Off" });
    expect(actor.getSnapshot().value).toEqual({ "On Ground": "FREQ TWR" });
  });

  it("should transition to Departure and Flight", () => {
    const actor = createActor(machine).start();
    actor.send({ type: "Start" });
    actor.send({ type: "Ready for ATC Clearence" });
    actor.send({ type: "ATC Copied" });
    actor.send({ type: "Taxi" });
    actor.send({ type: "Holding Point" });
    actor.send({ type: "Contact Tower for Take Off" });

    // Cleared to Take-off -> Departure.Take-Off.Take-off
    actor.send({ type: "Cleared to Take-off" });
    expect(actor.getSnapshot().value).toEqual({
      Departure: { "Take-Off": "Take-off" },
    });

    // On-Air -> Flight (parallel states)
    actor.send({ type: "On-Air" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { SID: "Set First Waypoint" },
      },
    });
  });

  it("should handle Flight parallel states: Flying", () => {
    const actor = createActor(machine).start();
    // Fast-forward to Flight
    actor.send({ type: "Start" });
    actor.send({ type: "Ready for ATC Clearence" });
    actor.send({ type: "ATC Copied" });
    actor.send({ type: "Taxi" });
    actor.send({ type: "Holding Point" });
    actor.send({ type: "Contact Tower for Take Off" });
    actor.send({ type: "Cleared to Take-off" });
    actor.send({ type: "On-Air" });

    // Test Vertical transitions
    actor.send({ type: "Climb" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Climbing", Horizontal: "Rest" },
        "Flight Routing": { SID: "Set First Waypoint" },
      },
    });

    actor.send({ type: "Level-up" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { SID: "Set First Waypoint" },
      },
    });

    actor.send({ type: "Descent" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Descending", Horizontal: "Rest" },
        "Flight Routing": { SID: "Set First Waypoint" },
      },
    });

    actor.send({ type: "Level-down" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { SID: "Set First Waypoint" },
      },
    });

    // Test Horizontal transitions
    actor.send({ type: "Turn" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Turning" },
        "Flight Routing": { SID: "Set First Waypoint" },
      },
    });

    actor.send({ type: "Stop Turn" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { SID: "Set First Waypoint" },
      },
    });
  });

  it("should handle Flight parallel states: Flight Routing", () => {
    const actor = createActor(machine).start();
    // Fast-forward to Flight
    actor.send({ type: "Start" });
    actor.send({ type: "Ready for ATC Clearence" });
    actor.send({ type: "ATC Copied" });
    actor.send({ type: "Taxi" });
    actor.send({ type: "Holding Point" });
    actor.send({ type: "Contact Tower for Take Off" });
    actor.send({ type: "Cleared to Take-off" });
    actor.send({ type: "On-Air" });

    // Test Flight Routing state transitions
    actor.send({ type: "Waypoint Set" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { SID: "Flying" },
      },
    });

    actor.send({ type: "Waypoint Reached" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { SID: "Get Next Waypoint" },
      },
    });

    actor.send({ type: "Next waypoint set" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { SID: "Flying" },
      },
    });

    actor.send({ type: "Waypoint Reached" });
    actor.send({ type: "No more waypoints" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { EnRoute: "Enroute Flying" },
      },
    });

    actor.send({ type: "Start Descent" });
    expect(actor.getSnapshot().value).toEqual({
      Flight: {
        Flying: { Vertical: "Rest", Horizontal: "Rest" },
        "Flight Routing": { Arrival: { Landing: "New state 1" } },
      },
    });
  });
});

