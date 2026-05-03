import { Plane, planeMove } from './Plane'

describe('Plane', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('Should assign flight parameters', () => {
    const plane = new Plane()
    plane.setHeading(90, undefined)
    plane.setCurrentFL(170000)
    plane.setCurrentSpeedKts(250)

    const ctx = plane.actor.getSnapshot().context
    expect(ctx.FL).toBe(170000)
    expect(ctx.KTS).toBe(250)
    expect(ctx.HDG).toBe(90)
  })

  it('Should move', () => {
    const plane = new Plane()
    plane.setHeading(90, undefined)
    plane.setCurrentFL(170000)
    plane.setCurrentSpeedKts(250)

    plane.setHeading(270, 3)
    plane.setNewFL(180000)
    plane.setSpeedKts(270)

    planeMove(plane, 10)

    const ctx = plane.actor.getSnapshot().context
    expect(ctx.FL).toBe(170333)
    expect(ctx.KTS).toBe(265)
    expect(ctx.HDG).toBe(120)
  })
})
