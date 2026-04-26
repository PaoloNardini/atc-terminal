import { createPlaneFsm } from '.'
import { Plane } from '../../entities'
import { createActor } from 'xstate'

describe('Plane test ', () => {
  it('should return true', async () => {
    const p = new Plane()
    const m = createPlaneFsm(p)

    const actor = createActor(m)
    actor.start()

    console.log(actor.getSnapshot().value)

    actor.send({ type: 'TURN_RIGHT' })
    console.log(`turn right:`)
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'TURN_STOP' })
    console.log(`turn stop:`)
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'CLIMB' })
    console.log(`climb:`)
    console.log(actor.getSnapshot().value)

    actor.send({ type: 'TURN_RIGHT' })
    console.log(`turn right:`)
    console.log(actor.getSnapshot().value)

    p.heading = 240
    p.heading_target = 250

    // Restarting actor to simulate fresh state with updated plane props if needed
    // though the machine context might be a reference to the plane object.
    const actor2 = createActor(m)
    actor2.start()

    actor2.send({ type: 'TURN_RIGHT' })
    console.log(`turn right:`)
    console.log(actor2.getSnapshot().value)

    actor2.send({ type: 'TURN_STOP' })
    console.log(`turn stop:`)
    console.log(actor2.getSnapshot().value)

    expect(m).not.toBeNull()
    expect(p).toBeInstanceOf(Plane)
  })
})
