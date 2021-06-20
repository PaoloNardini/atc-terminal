import * as LoadScenario from './usecases/LoadScenario'
import * as LoadAirlines from './usecases/LoadAirlines'
import * as LoadProcedures from './usecases/LoadProcedures'
import * as LoadAtsRoutes from './usecases/LoadProcedures'

// import { Deps } from './entitygateway'

export const initializeUseCases = (deps: any) => {
  const loadScenario = LoadScenario.createUseCase({
    ...deps,
  })
  const loadAirlines = LoadAirlines.createUseCase({
    ...deps,
  })
  const loadProcedures = LoadProcedures.createUseCase({
    ...deps,
  })
  const loadAtsRoutes = LoadAtsRoutes.createUseCase({
    ...deps,
  })

  return {
    loadScenario,
    loadAirlines,
    loadProcedures,
    loadAtsRoutes,
  }
}

export type UseCases = ReturnType<typeof initializeUseCases>
