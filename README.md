# atc-terminal
ATC Terminal Area Simulator - Air Traffic Control Radar e RNAV realistic simulation

This is a radar console simulation for ATC (air traffic control) of a TMA (terminal area)

This is not a game, but a real simulation of what an air traffic controller is required to manage every day, handling arrivals and departures in more than one airport in the same area.

The planes follows the standard RNAV routes as published by the international authorities, and the database coverage is almost worldwide.
   
The operator is required to interact with planes sending commands and instructions based on the real radio communications and phraseology.

A future audio expansion, will allow to hear the voices of pilots to increase the realism of simulation (a raw test is present in current version)

The simulation works fully in the browser and could not require any server installation.

The software is written in plain Javscript and make use of the following dependant libraries:
- createjs: a powerful canvas base graphic library to handle all the aspects of the screen rendering and future audio playing - www.createjs.com
- jQuery + jQuery mousewheel: to handle mouse interactions and others minor aspects
- Geo mathematical functions by Chris Veness - www.movable-type.co.uk


# Project Status

The project is now in a pre-beta phase with about 60% of planned functionalities already implemented.

The current RNAV database is derived from a real plane database and is updated at Dec 2017.

A demo web site will be available soon.

# Installation

At the moment, due to Cross Origin limitations of browsers that doesn't allow loading files from the local disk, it's required to install the software on a basic http server and open the index.html page.

No dependencies installation procedure is present at the moment, all the required libraries are included in the project (TODO)

The airports to be loaded in the simulation (up to 3), are passed in the URL by the "airport" parameter by their 4 letters ICAO code. 

The first release includes only the following TMA scenarios:
- index.html?airport=LIMC,LIML,LIME       (Milan TMA, Malpensa / Linate / Orio al serio)
- index.html?airport=LIRF,LIRA,LIRE       (Rome TMA, Fiumicino / Ciampino / Pratica di mare)
- index.html?airport=EGLL,EGKK,EGLC       (London TMA, Heatrow / Gatwick / London City)
- index.html?airport=KJFK,KLGA,KEWR       (New York TMA, Kennedy / La Guardia / Newark)
- index.html?airport=LFPO,LFPG,LFPB       (Paris TMA, Charles De Gaulle / Orly / Le Bourget)

If no airports are specified, the default scenery based on ROME/ITALY TMA will be loaded. The scenery file includes also a more realistic configuration of runways status (to be implemented in a configuration panel).
By loading other airports, the runways status (open/close, used for takeoff / landing /both) will be selected randomly.

The config.js file contains all the customizable parameters, you can experiment with.

# Current features

Recognized commands:

- < plane > REL -> Accept plane release from TWR or ATC
- < plane > F < flight level > -> climb or descent to the indicated flight level (in feet/1000). Example F 120 = 12,000 feet
- < plane > H < heading > -> set heading to magnetic coarse indicated
- < plane > L < heading > -> turn left to heading
- < plane > R < heading > -> turn right to headinf
- < plane > S < speed in knots >
- < plane > C < fix or waypoint >
- < plane > C TO (take off)
- < plane > C < rwy > -> Clear to the final approach to runway
- < plane > CH TWR -> Change radio frequency to TWR (for landing when estabilished on the runway final path)
- < plane > CH ATC -> Change radio frequency to ATC (for departures when outside control zone)
- < plane > HOLD  <fix > < radial > -> Hold over a fix, radial indicates coarse of inbound leg of the holding pattern
- < plane > RAD  <radial > TO/FROM < fix > -> Intercept and follow the radial to / from the indicated fix
- < plane > GA -> Go Around, abort landing and follow the missed approach standard procedure
- < plane > SQ  <trasponder > -> Squack the trasponder code, i.e. insert the given 4 digits code in the plane transponder (not used if AUTOSQUACK = 1)
- < plane > ID -> Squack Ident, i.e. identify the plane on the radar screen by its callsing instead of trasponder code (not used if AUTOIDENT = 1)

Note: You can't interact and send instructions with a plane until you have accepted the release (REL command) from the tower or other ATC.

Departures planes, follows a random selected SID route (standard instrument departure).

Arrivals planes, follows a random selected STAR route (standard approach route).

Note: planes without instructions usually holds over the last waypoint of their cleared route. You must avoid this!

# Console switches
The first line of switches control the show/hide status of the following screen elements:
- NAV -> navigation aids (vor/dme/ndb/ils markers)
- FIX -> main fix
- WPT -> minor waypoints
- RWY -> runways
- CEN -> runways centerline extensions
- ATS -> ATS RNAV routes (cruise high level routes)
- GRD -> Lat/Lon grid

The second line of switches control the show/hide status of the labels of the corresponding switch

The third line of switches includes:
- [P] - Pause / Resume simulation
- x2 - Double speed the simulation (the upper left timer run twice faster)

You can move the screen by dragging it with the mouse, and zooming in/out with mouse wheel.

By clicking a plane strip or the plane itself on the screen the planned route will be showed.

# Current limitations and known bugs
- The top message bar is almost unuseful at the moment and need great improvement
- All planes are B737-800 (same performances)
- No airlines prefix are used, all planes have numeric callsign
- Departure planes hold on the last fix of their SID route if have no further instructions, even if released to ATC (with CH ATC command)
- Final descend path is very steep and usually the plane level shows zero sligthly before the runway


# Planned features
- Parameters configuration panel
- Runway status configuration panel with wind indication
- Departures clearence must include final ATS route to intercept and follow
- Planes clearence (sid/star/ats) selected by operator
- Audio playback of pilots voices
- Airlines prefix to planes callsign
- Different plane models with different performances
- ... more

