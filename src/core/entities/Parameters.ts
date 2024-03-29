import { Coordinate } from "../valueObjects"

export class Parameters {
    departuresEnabled: boolean = true
    arrivalsEnabled: boolean = true
    autoSquack: boolean = true
    autoIdent: boolean = true
    maxArrivals: number = 7
    maxDepartures: number = 7
    takeOffInterval: number = 120      // Min Interval in seconds between two take-offs from the same runway
    arrivalInterval: number  = 180     // Min Interval in secondsa between two arrivals
    directorInterval: number = 10      // Min interval in secs between director actions

    latitudeCenter: number = 41
    longitudeCenter: number = 12

    screenCenterX: number = 512
    screenCenterY: number = 384

    currentScale: number = 0
    
    // attributes where saving current mouse and stage coordinates during pressmove
    mouseX: number = 0
    mouseY: number = 0
    currentX: number = 0
    currentY: number = 0

    minCoordinates: Coordinate = new Coordinate(0,0)
    maxCoordinates: Coordinate = new Coordinate(0,0)

    mainTimer: number = 0   // Main tick timer
    lastTimer: number = 0   
    speedX2: boolean = false

    /*
    minLatitude: number = 0
    maxLatitude: number = 0
    minLongitude: number = 0
    maxLongitude: number = 0
    */

    planeRefreshSeconds: number = 0.8
}