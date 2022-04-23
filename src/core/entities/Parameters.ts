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

    latitudeCenter: number = 0
    longitudeCenter: number = 0

    screenCenterX: number = 512
    screenCenterY: number = 384

    minLatitude: number = 0
    maxLatirìtude: number = 0
    minLongitude: number = 0
    maxLongitude: number = 0

    planeRefreshSeconds: number = 0.8
}