import { createActor } from "xstate";
import { machine } from "./index";

describe("Airplane FSM", () => {
  it("should initialize in parallel Rest states with default context", () => {
    const actor = createActor(machine).start();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toEqual({
      Vertical: "Rest",
      Horizontal: "Rest",
    });

    expect(snapshot.context).toEqual({
      FL: 0,
      HDG: 0,
      ROC: 0,
      ROT: 0,
    });
  });

  describe("Vertical Flow", () => {
    it("should allow Climbing if ROC > 0 and TARGET_FL > current FL", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0 },
        }),
      }).start();

      actor.send({ type: "Climb", ROC: 1500, TARGET_FL: 300 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Climbing", Horizontal: "Rest" });
      expect(snapshot.context.ROC).toBe(1500);
    });

    it("should reject Climbing if ROC <= 0", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0 },
        }),
      }).start();

      actor.send({ type: "Climb", ROC: -500, TARGET_FL: 300 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest" });
      expect(snapshot.context.ROC).toBe(0);
    });

    it("should reject Climbing if TARGET_FL <= current FL", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest" },
          context: { FL: 300, HDG: 0, ROC: 0, ROT: 0 },
        }),
      }).start();

      actor.send({ type: "Climb", ROC: 1500, TARGET_FL: 100 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest" });
      expect(snapshot.context.ROC).toBe(0);
    });

    it("should transition to Rest and set ROC to 0 on Level from Climbing", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Climbing", Horizontal: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 1500, ROT: 0 },
        }),
      }).start();

      actor.send({ type: "Level" });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest" });
      expect(snapshot.context.ROC).toBe(0);
    });

    it("should allow Descending if ROC < 0 and TARGET_FL < current FL", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest" },
          context: { FL: 300, HDG: 0, ROC: 0, ROT: 0 },
        }),
      }).start();

      actor.send({ type: "Descent", ROC: -1000, TARGET_FL: 100 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Descending", Horizontal: "Rest" });
      expect(snapshot.context.ROC).toBe(-1000);
    });

    it("should transition to Rest and set ROC to 0 on Level from Descending", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Descending", Horizontal: "Rest" },
          context: { FL: 300, HDG: 0, ROC: -1000, ROT: 0 },
        }),
      }).start();

      actor.send({ type: "Level" });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest" });
      expect(snapshot.context.ROC).toBe(0);
    });
  });

  describe("Horizontal Flow", () => {
    it("should allow Turn Right if ROT > 0", () => {
      const actor = createActor(machine).start();

      actor.send({ type: "Turn Right", ROT: 3, TARGET_HDG: 90 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Turning Right" });
      expect(snapshot.context.ROT).toBe(3);
    });

    it("should reject Turn Right if ROT <= 0", () => {
      const actor = createActor(machine).start();

      actor.send({ type: "Turn Right", ROT: -3, TARGET_HDG: 90 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest" });
      expect(snapshot.context.ROT).toBe(0);
    });

    it("should allow Turn Left if ROT < 0", () => {
      const actor = createActor(machine).start();

      actor.send({ type: "Turn Left", ROT: -3, TARGET_HDG: 270 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Turning Left" });
      expect(snapshot.context.ROT).toBe(-3);
    });

    it("should reject Turn Left if ROT >= 0", () => {
      const actor = createActor(machine).start();

      actor.send({ type: "Turn Left", ROT: 3, TARGET_HDG: 270 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest" });
      expect(snapshot.context.ROT).toBe(0);
    });

    it("should transition to Rest and set ROT to 0 on Stop Turn from Turning Right", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Turning Right" },
          context: { FL: 0, HDG: 0, ROC: 0, ROT: 3 },
        }),
      }).start();

      actor.send({ type: "Stop Turn" });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest" });
      expect(snapshot.context.ROT).toBe(0);
    });

    it("should transition to Rest and set ROT to 0 on Stop Turn from Turning Left", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Turning Left" },
          context: { FL: 0, HDG: 0, ROC: 0, ROT: -3 },
        }),
      }).start();

      actor.send({ type: "Stop Turn" });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest" });
      expect(snapshot.context.ROT).toBe(0);
    });
  });
});