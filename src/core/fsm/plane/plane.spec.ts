import { createActor } from "xstate";
import { machine } from "./index";

describe("Airplane FSM", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should initialize in parallel Rest states with default context", () => {
    const actor = createActor(machine).start();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toEqual({
      Vertical: "Rest",
      Horizontal: "Rest",
      Speed: "Rest",
      FlightPhase: "Rest"
    });

    expect(snapshot.context).toMatchObject({
      FL: 0,
      HDG: 0,
      ROC: 0,
      ROT: 0,
      KTS: 0,
      GROUND: true,
      PHASE: "Rest"
    });
  });

  describe("Vertical Flow", () => {
    it("should allow Climbing if ROC > 0 and TARGET_FL > current FL", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250, GROUND: false, PHASE: "Cruise", V2: 150, MAS: 120, isDeparting: true },
        }),
      }).start();

      actor.send({ type: "Climb", ROC: 1500, TARGET_FL: 300 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toMatchObject({ Vertical: "Climbing" });
      expect(snapshot.context.ROC).toBe(1500);
    });

    it("should reject Climbing if ROC <= 0", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250, GROUND: false, PHASE: "Cruise", V2: 150, MAS: 120, isDeparting: true },
        }),
      }).start();

      actor.send({ type: "Climb", ROC: -500, TARGET_FL: 300 });
      expect(actor.getSnapshot().value).toMatchObject({ Vertical: "Rest" });
    });
  });

  describe("Horizontal Flow", () => {
    it("should allow Turn Right if ROT > 0", () => {
      const actor = createActor(machine).start();
      actor.send({ type: "Turn Right", ROT: 3, TARGET_HDG: 90 });
      expect(actor.getSnapshot().value).toMatchObject({ Horizontal: "Turning Right" });
      expect(actor.getSnapshot().context.ROT).toBe(3);
    });
  });

  describe("Speed Flow", () => {
    it("should allow Increase Speed if TARGET_KTS > current KTS", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 200, GROUND: false, PHASE: "Cruise", V2: 150, MAS: 120, isDeparting: true },
        }),
      }).start();

      actor.send({ type: "Increase Speed", TARGET_KTS: 250 });
      expect(actor.getSnapshot().value).toMatchObject({ Speed: "Accelerating" });
    });
  });

  describe("Flight Phase Flow", () => {
    it("should transition through flight phases via events", () => {
      const actor = createActor(machine).start();

      actor.send({ type: "Clear to Taxi" });
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Taxi" });

      actor.send({ type: "Hold position" });
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Hold" });

      actor.send({ type: "Clear to Take-Off", TARGET_KTS: 150 });
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Take-Off-Run" });
    });

    it("should reject Clear to Take-Off if TARGET_KTS is not V2", () => {
      const actor = createActor(machine).start();
      actor.send({ type: "Clear to Taxi" });
      actor.send({ type: "Hold position" });

      actor.send({ type: "Clear to Take-Off", TARGET_KTS: 100 });
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Hold" });
    });

    it("should handle timer transitions for outbound flight", () => {
      const actor = createActor(machine).start();

      // Clear to Taxi starts the Taxi timer
      actor.send({ type: "Clear to Taxi" });
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Taxi" });

      // Taxi -> Hold (3 mins)
      jest.advanceTimersByTime(180000);
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Hold" });

      // Hold -> Take-Off-Run (1 min)
      jest.advanceTimersByTime(60000);
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Take-Off-Run" });

      // Take-Off-Run -> Take-Off (30 secs)
      jest.advanceTimersByTime(30000);
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Take-Off" });
    });

    it("should handle timer transitions for inbound flight", () => {
      // Mock guards to allow entering Landed easily from another state
      const mockMachine = machine.provide({
        guards: {
          canLanding: () => true,
          canLanded: () => true,
          canTaxiToPark: () => true
        }
      });
      
      const actor = createActor(mockMachine, {
        state: mockMachine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Landing" },
          context: { FL: 10, HDG: 0, ROC: 0, ROT: 0, KTS: 130, GROUND: false, PHASE: "Landing", V2: 150, MAS: 120, isDeparting: false },
        })
      }).start();

      // Land the plane normally to trigger Landed timers
      actor.send({ type: "Landed" });
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Landed" });
      expect(actor.getSnapshot().context.PHASE).toBe("Landed");

      // Landed -> Taxi (1 min)
      jest.advanceTimersByTime(60000);
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Taxi" });
      expect(actor.getSnapshot().context.isDeparting).toBe(false);

      // Taxi -> Rest (3 mins)
      jest.advanceTimersByTime(180000);
      expect(actor.getSnapshot().value).toMatchObject({ FlightPhase: "Rest" });
    });
  });
});
