import { Scenario } from "../../src/core/entities"
import { Canvas } from "./graphic/canvas"

export const loadScenario = (scenario: Scenario, canvas: Canvas) => {
    void canvas
    console.log( `Received scenario: ${scenario.name}`)
    // Set screen center
    canvas.parameters.latitudeCenter = scenario.latitudeCenter
    canvas.parameters.longitudeCenter = scenario.longitudeCenter
    // Create runways
    scenario.runways &&  scenario.runways.map(runway => {
        canvas.addRunway(runway)
    })
}