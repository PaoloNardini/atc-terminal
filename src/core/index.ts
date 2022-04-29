import * as LoadHandleCommand from './usecases/HandleCommand'
import * as LoadScenario from './usecases/LoadScenario'
import * as LoadAirlines from './usecases/LoadAirlines'
import * as LoadProcedures from './usecases/LoadProcedures'
import * as LoadAtsRoutes from './usecases/LoadProcedures'
import * as LoadDispatch from './usecases/Dispatch'

import * as TestPlanes from './usecases/TestPlanes'

import { Deps } from './gateways'

export const initializeUseCases = (deps: Deps) => {

  const dispatch = LoadDispatch.createUseCase({
    ...deps
  })

  const handleCommand = LoadHandleCommand.createUseCase({
    ...deps
  })
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

  const testPlanes = TestPlanes.createUseCase({
    ...deps,
  })

  return {
    dispatch,
    handleCommand,
    loadScenario,
    loadAirlines,
    loadProcedures,
    loadAtsRoutes,
    testPlanes,
  }
}

export type UseCases = ReturnType<typeof initializeUseCases>
