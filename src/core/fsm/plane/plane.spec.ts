import { createPlaneFsm } from '.'
import { Plane } from '../../entities'

describe('Plane test ', () => {
  it('should return true', async () => {
    const p = new Plane()
    const m = createPlaneFsm(p)

    const initialState = m.initialState
    console.log(initialState.value)

    const newState1 = m.transition(initialState, 'TURN_RIGHT')
    console.log(`turn right:`)
    console.log(newState1.value)

    const newState2 = m.transition(newState1, 'TURN_STOP')
    console.log(`turn stop:`)
    console.log(newState2.value)

    const newState3 = m.transition(newState2, 'CLIMB')
    console.log(`climb:`)
    console.log(newState3.value)

    const newState4 = m.transition(newState3, 'TURN_RIGHT')
    console.log(`turn right:`)
    console.log(newState4.value)

    p.heading = 240
    p.heading_target = 250

    const newState5 = m.transition(initialState, 'TURN_RIGHT')
    console.log(`turn right:`)
    console.log(newState5.value)

    const newState6 = m.transition(initialState, 'TURN_STOP')
    console.log(`turn stop:`)
    console.log(newState6.value)

    const newState7 = m.transition(initialState, 'idle')
    console.log(`going idle:`)
    console.log(newState7.value)

    expect(m).not.toBeNull
    expect(p).toBeInstanceOf(Plane)
    // expect(true).toBe(true)
  })
})
