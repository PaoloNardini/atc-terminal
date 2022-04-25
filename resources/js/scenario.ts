import { Scenario } from "../../src/core/entities"
import { Canvas } from "./graphic/canvas"

export const loadScenario = (scenario: Scenario, canvas: Canvas) => {
    void canvas
    console.log( `Received scenario: ${scenario.name}`)
    scenario.runways &&  scenario.runways.map(runway => {
        canvas.addRunway(runway)

    })

}