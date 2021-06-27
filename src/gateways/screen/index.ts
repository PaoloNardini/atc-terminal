import { UseCases } from "../../core";
import D from 'debug'
const debug = D('app:gateways:screen')
// const trace = D('app:trace')

interface ScreenConfig {
    isProduction: boolean
    useCases: UseCases
}
 
export interface Screen {
    status: () => string
}
  
export function createNewScreen(screenConfig: ScreenConfig) {
    const {
        isProduction,
        useCases
    } = screenConfig

    if (isProduction) {}
    if (useCases) {}
    
    debug(`screen initialized`)

    return screen

} 

export const screen: Screen = {
    status: () => { return 'status ok'} 
}