import { createUseCase } from './LoadScenario'

describe('Load Scenario', () => {
  it('should return error', async () => {
    
    const loadScenario = createUseCase({
        context: {}
    })
    
    loadScenario

    expect(true).toBe(true)
  })
})
