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
      PHASE: "Rest",
      TARGET_ROC: 0,
      TARGET_HDG: 0,
      TARGET_FL: 0,
      TARGET_KTS: 0
    });
  });

  describe("Vertical Flow", () => {
    it("should allow Climbing if ROC > 0 and TARGET_FL > current FL and assign targets", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250, GROUND: false, PHASE: "Cruise", V2: 150, MAS: 120, isDeparting: true, TARGET_FL: 0, TARGET_HDG: 0, TARGET_ROC: 0, TARGET_KTS: 0, latitude: 0, longitude: 0 },
        }),
      }).start();

      actor.send({ type: "Climb", ROC: 1500, TARGET_FL: 300 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toMatchObject({ Vertical: "Climbing" });
      expect(snapshot.context.ROC).toBe(1500);
      expect(snapshot.context.TARGET_ROC).toBe(1500);
      expect(snapshot.context.TARGET_FL).toBe(300);
    });

    it("should allow Descending if ROC < 0 and TARGET_FL < current FL and assign targets", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Rest" },
          context: { FL: 300, HDG: 0, ROC: 0, ROT: 0, KTS: 250, GROUND: false, PHASE: "Cruise", V2: 150, MAS: 120, isDeparting: true, TARGET_FL: 0, TARGET_HDG: 0, TARGET_ROC: 0, TARGET_KTS: 0, latitude: 0, longitude: 0 },
        }),
      }).start();

      actor.send({ type: "Descent", ROC: -1000, TARGET_FL: 100 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toMatchObject({ Vertical: "Descending" });
      expect(snapshot.context.ROC).toBe(-1000);
      expect(snapshot.context.TARGET_ROC).toBe(-1000);
      expect(snapshot.context.TARGET_FL).toBe(100);
    });

    it("should reject Climbing if ROC <= 0", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250, GROUND: false, PHASE: "Cruise", V2: 150, MAS: 120, isDeparting: true, TARGET_FL: 0, TARGET_HDG: 0, TARGET_ROC: 0, TARGET_KTS: 0, latitude: 0, longitude: 0 },
        }),
      }).start();

      actor.send({ type: "Climb", ROC: -500, TARGET_FL: 300 });
      expect(actor.getSnapshot().value).toMatchObject({ Vertical: "Rest" });
    });
  });

  describe("Horizontal Flow", () => {
    it("should allow Turn Right if ROT > 0 and assign targets", () => {
      const actor = createActor(machine).start();
      actor.send({ type: "Turn Right", ROT: 3, TARGET_HDG: 90 });
      expect(actor.getSnapshot().value).toMatchObject({ Horizontal: "Turning Right" });
      expect(actor.getSnapshot().context.ROT).toBe(3);
      expect(actor.getSnapshot().context.TARGET_HDG).toBe(90);
    });

    it("should allow Turn Left if ROT < 0 and assign targets", () => {
      const actor = createActor(machine).start();
      actor.send({ type: "Turn Left", ROT: -3, TARGET_HDG: 270 });
      expect(actor.getSnapshot().value).toMatchObject({ Horizontal: "Turning Left" });
      expect(actor.getSnapshot().context.ROT).toBe(-3);
      expect(actor.getSnapshot().context.TARGET_HDG).toBe(270);
    });
  });

  describe("Speed Flow", () => {
    it("should allow Increase Speed if TARGET_KTS > current KTS and assign targets", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 200, GROUND: false, PHASE: "Cruise", V2: 150, MAS: 120, isDeparting: true, TARGET_FL: 0, TARGET_HDG: 0, TARGET_ROC: 0, TARGET_KTS: 0, latitude: 0, longitude: 0 },
        }),
      }).start();

      actor.send({ type: "Increase Speed", TARGET_KTS: 250 });
      expect(actor.getSnapshot().value).toMatchObject({ Speed: "Accelerating" });
      expect(actor.getSnapshot().context.TARGET_KTS).toBe(250);
    });

    it("should allow Decrease Speed if TARGET_KTS < current KTS and assign targets", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest", FlightPhase: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250, GROUND: false, PHASE: "Cruise", V2: 150, MAS: 120, isDeparting: true, TARGET_FL: 0, TARGET_HDG: 0, TARGET_ROC: 0, TARGET_KTS: 0, latitude: 0, longitude: 0 },
        }),
      }).start();

      actor.send({ type: "Decrease Speed", TARGET_KTS: 200 });
      expect(actor.getSnapshot().value).toMatchObject({ Speed: "Decelerating" });
      expect(actor.getSnapshot().context.TARGET_KTS).toBe(200);
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
  });
});
