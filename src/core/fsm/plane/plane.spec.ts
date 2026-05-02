import { createActor } from "xstate";
import { machine } from "./index";

describe("Airplane FSM", () => {
  it("should initialize in parallel Rest states with default context", () => {
    const actor = createActor(machine).start();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toEqual({
      Vertical: "Rest",
      Horizontal: "Rest",
      Speed: "Rest",
    });

    expect(snapshot.context).toEqual({
      FL: 0,
      HDG: 0,
      ROC: 0,
      ROT: 0,
      KTS: 0,
    });
  });

  describe("Vertical Flow", () => {
    it("should allow Climbing if ROC > 0 and TARGET_FL > current FL", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Climb", ROC: 1500, TARGET_FL: 300 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Climbing", Horizontal: "Rest", Speed: "Rest" });
      expect(snapshot.context.ROC).toBe(1500);
    });

    it("should transition to Rest on 'Reached target FL' from Climbing", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Climbing", Horizontal: "Rest", Speed: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 1500, ROT: 0, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Reached target FL" });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" });
      expect(snapshot.context.ROC).toBe(0);
    });

    it("should allow Descending if ROC < 0 and TARGET_FL < current FL", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" },
          context: { FL: 300, HDG: 0, ROC: 0, ROT: 0, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Descent", ROC: -1000, TARGET_FL: 100 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Descending", Horizontal: "Rest", Speed: "Rest" });
      expect(snapshot.context.ROC).toBe(-1000);
    });
  });

  describe("Horizontal Flow", () => {
    it("should allow Turn Right if ROT > 0", () => {
      const actor = createActor(machine).start();

      actor.send({ type: "Turn Right", ROT: 3, TARGET_HDG: 90 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Turning Right", Speed: "Rest" });
      expect(snapshot.context.ROT).toBe(3);
    });

    it("should transition to Rest on 'Reached target HDG' from Turning Right", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Turning Right", Speed: "Rest" },
          context: { FL: 0, HDG: 0, ROC: 0, ROT: 3, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Reached target HDG" });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" });
      expect(snapshot.context.ROT).toBe(0);
    });

    it("should allow Turn Left if ROT < 0", () => {
      const actor = createActor(machine).start();

      actor.send({ type: "Turn Left", ROT: -3, TARGET_HDG: 270 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Turning Left", Speed: "Rest" });
      expect(snapshot.context.ROT).toBe(-3);
    });
  });

  describe("Speed Flow", () => {
    it("should allow Increase Speed if TARGET_KTS > current KTS", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 200 },
        }),
      }).start();

      actor.send({ type: "Increase Speed", TARGET_KTS: 250 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest", Speed: "Accelerating" });
    });

    it("should reject Increase Speed if TARGET_KTS <= current KTS", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Increase Speed", TARGET_KTS: 200 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" });
    });

    it("should allow Decrease Speed if TARGET_KTS < current KTS", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Decrease Speed", TARGET_KTS: 200 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest", Speed: "Decelerating" });
    });

    it("should reject Decrease Speed if TARGET_KTS >= current KTS", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Decrease Speed", TARGET_KTS: 300 });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" });
    });

    it("should transition to Rest on 'Reached target KTS' from Accelerating", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Accelerating" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Reached target KTS" });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" });
    });

    it("should transition to Rest on 'Reached target KTS' from Decelerating", () => {
      const actor = createActor(machine, {
        state: machine.resolveState({
          value: { Vertical: "Rest", Horizontal: "Rest", Speed: "Decelerating" },
          context: { FL: 100, HDG: 0, ROC: 0, ROT: 0, KTS: 250 },
        }),
      }).start();

      actor.send({ type: "Reached target KTS" });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ Vertical: "Rest", Horizontal: "Rest", Speed: "Rest" });
    });
  });
});
