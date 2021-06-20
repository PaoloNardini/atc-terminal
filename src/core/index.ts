import * as LoadScenario from './usecases/LoadScenario'

// import { Deps } from './entitygateway'

export const initializeUseCases = (deps: any) => {
  const loadScenario = LoadScenario.createUseCase({
    ...deps,
  })

  return {
    loadScenario,
  }
}

export type UseCases = ReturnType<typeof initializeUseCases>
