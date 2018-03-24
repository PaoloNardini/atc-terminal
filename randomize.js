/* Create random scneario */

function randomize() {
    // test();
    var scenery;
    if (parameters.airport) {
        scenery = parameters.airport;
    }
    else {
        scenery = 'ROME';
    }
    loadScenery(scenery).then(function() {
        // loadAirports('LIRF'); // Rome Fiumicino
        // loadAirports('LIRQ'); // Florence Peretola
        // loadAirports('LIRP'); // Pisa San Giusto

        // Add runways to main screen
        for(var r=0; r < runways.length; r++) {
            mainContainer.addChild(runways[r]);
        }

        createGrid();
        // by default show Navaids + Fixes
        updateWaypoints();
        showNav(true);
        showNavLabels(true);
        showFix(true);
        showFixLabels(true);
        showRunways(true);
        showRunwaysLabels(true);

        if (TEST_MODE == 1) {
            testPlanes();
        }
        // randomizePlanes();
        // randomizeAirports();
        // randomizeRunways();
        for (var r=0; r<runways.length; r++) {
            if (Math.random() > 0.6) {
                runways[r].runwayActive(false);
            }
            else {
                runways[r].runwayActive(true);
                if (Math.random() > 0.3) {
                    runways[r].takeoffEnable(false);
                }
                if (Math.random() > 0.6) {
                    runways[r].landingEnable(false);
                }
            }
            // Check for any scenery runway settings
            for (var rs=0; rs<runway_status.length; rs++) {
                if (runway_status[rs].icao == runways[r].icao && runway_status[rs].runway == runways[r].name) {
                    switch (runway_status[rs].status.substr(0,5)) {
                        case 'ARRIV':
                            runways[r].runwayActive(true);
                            runways[r].landingEnable(true);
                            break;
                        case 'DEPAR':
                            runways[r].runwayActive(true);
                            runways[r].landingEnable(false);
                            runways[r].takeoffEnable(true);
                            break;
                        case 'ARRDE':
                            runways[r].runwayActive(true);
                            runways[r].landingEnable(true);
                            runways[r].takeoffEnable(true);
                            break;
                        case 'CLOSE':
                            runways[r].runwayActive(false);
                            runways[r].landingEnable(false);
                            runways[r].takeoffEnable(false);
                            break;
                        default:
                            console.log('Bad runway status ' + runway_status[rs].status);
                            break;
                    }
                }
            }
        }
        sceneryLoaded = true;
    });
}

function testPlanes() {
    // 42.215056,11.732611
    planes[0] = new Plane();
    planes[0].latitude = 42.20; // 42.5;
    planes[0].longitude = 11.70; // 11.4;
    planes[0].heading = 100;
    planes[0].fl = 18000;
    planes[0].fl_cleared = 18000;
    planes[0].climb = 0;
    planes[0].speed = 260;
    planes[0].gLabel.text = planes[p].label;
    planes[0].getTail();
    planes[0].arrival = true;
    planes[0].departure = false;
    planes[0].transit = false;
    planes[0].airp_dest = 'LIRF';
    mainContainer.addChild(planes[0]);
    if (planes[0].arrival) {
        arrStripsContainer.addChild(planes[0].getStrip());
        planes[0].setStripPosition(STRIP_ARRIVALS, arrStrips++);
    }
    else
    {
        depStripsContainer.addChild(planes[0].getStrip());
        planes[0].setStripPosition(STRIP_DEPARTURES, depStrips++);
    }

    //

    // 42.068611,12.167778
    planes[1] = new Plane();
    planes[1].latitude = 42.068611; // 42.2;
    planes[1].longitude = 12.167778; // 11.9;
    planes[1].heading = 100;
    planes[1].fl = 7000;
    planes[1].fl_cleared = 7000;
    planes[1].climb = 0;
    planes[1].speed = 260;
    planes[1].gLabel.text = planes[p].label;
    planes[1].getTail();
    planes[1].arrival = true;
    planes[1].departure = false;
    planes[1].transit = false;
    planes[1].airp_dest = 'LIRF';
    mainContainer.addChild(planes[1]);
    if (planes[1].arrival) {
        arrStripsContainer.addChild(planes[1].getStrip());
        planes[1].setStripPosition(STRIP_ARRIVALS, arrStrips++);
    }
    else
    {
        depStripsContainer.addChild(planes[1].getStrip());
        planes[1].setStripPosition(STRIP_DEPARTURES, depStrips++);
    }


}

function randomizePlanes() {
    for (p=0; p < MAXPLANES; p++) {
        planes[p] = new Plane();

        planes[p].latitude = 42.10 + (p/14);
        planes[p].longitude = 12.5 + (p/20);
        planes[p].heading = 90 + (p*50);
        planes[p].fl = 250 + p*10;
        planes[p].speed = 250;
        planes[p].speed_target = 250;
        // planes[p].assignRandomRoute();

        // planes[p].latitude = LATITUDE_CENTER + ((-0.01 + Math.random()) * MAX_LATLONG_RND);
        // planes[p].longitude = LONGITUDE_CENTER + ((-0.01 + Math.random()) * MAX_LATLONG_RND);
        planes[p].gLabel.text = planes[p].label;

        // planes[p].gTail.graphics.beginStroke(PLANE_COLOR).moveTo(15, 15).lineTo(25, 25).endStroke();
        planes[p].getTail();
        mainContainer.addChild(planes[p]);

        if (planes[p].arrival) {
            arrStripsContainer.addChild(planes[p].getStrip());
            planes[p].setStripPosition(STRIP_ARRIVALS, arrStrips++);
        }
        else
        {
            depStripsContainer.addChild(planes[p].getStrip());
            planes[p].setStripPosition(STRIP_DEPARTURES, depStrips++);
        }
    }
}

// NOT USED
/*
function randomizeFixes() {
    var nfix = 1 + (Math.random() * 10);

    for (f=fixes.length; f<nfix; f++) {
        fixes[f] = new Fix();
        fixes[f].name = 'FIX' + f;
        fixes[f].label = 'FIX' + f;
        fixes[f].latitude = LATITUDE_CENTER + ((-0.01 + Math.random()) * MAX_LATLONG_RND);
        fixes[f].longitude = LONGITUDE_CENTER + ((-0.01 + Math.random()) * MAX_LATLONG_RND);
        fixes[f].type = 1 + (Math.random() * 9);
        fixes[f].gLabel.text = fixes[f].label;
        fixes[f].setScreenPosition();
        mainContainer.addChild(fixes[f].gDraw);
    }
}
*/

function randomizeAirports() {
    var nairp = 1 + (Math.random() * 2);

    // First airport is located always in the center of the control area
    airports[0] = new Airport();
    airports[0].name = 'AIRP-A';
    airports[0].icao = 'LZZZ';

    airports[0].latitude = LATITUDE_CENTER + ((-0.01 + Math.random()) * MAX_LATLONG_RND);
    airports[0].longitude = LONGITUDE_CENTER + ((-0.01 + Math.random()) * MAX_LATLONG_RND);

    // Generate up to 3 runways
    runways[0] = new Runway();
    runways[0].name = 'RWY-A'
    runways[0].label1 = 'RWY-AN';
    runways[0].label2 = 'RWY-AS';
    runways[0].heading = Math.floor(Math.random() * 360);
    runways[0].latitude = airports[0].latitude;
    runways[0].longitude = airports[0].longitude;
    runways[0].type = 1 + (Math.random() * 9);
    runways[0].length = Math.floor(3000 + (Math.random() * 7000));
    runways[0].width = Math.floor(200 + (Math.random() * 500));
    runways[0].gLabel1.text = runways[0].label1;
    runways[0].gLabel2.text = runways[0].label2 + '\n' + runways[0].heading + '\n' + runways[0].length;
    runways[0].setScreenPosition();
    mainContainer.addChild(runways[0].gDraw);
    this.runways[0] = runways[0];

    runways[1] = new Runway();
    runways[1].name = 'RWY-B'
    runways[1].label1 = 'RWY-BN';
    runways[1].label2 = 'RWY-BS';
    runways[1].heading = (runways[0].heading + 90 % 360);
    runways[1].latitude = airports[0].latitude + 0.01;
    runways[1].longitude = airports[0].longitude + 0.01;
    runways[1].type = 1 + (Math.random() * 9);
    runways[1].length = Math.floor(3000 + (Math.random() * 7000));
    runways[1].width = Math.floor(200 + (Math.random() * 500));
    runways[1].gLabel1.text = runways[1].label1;
    runways[1].gLabel2.text = runways[1].label2 + '\n' + runways[1].heading + '\n' + runways[1].length;
    runways[1].setScreenPosition();
    mainContainer.addChild(runways[1].gDraw);
    this.runways[1] = runways[1];

}
function randomizeRunways() {
    var nrwy = 1 + (Math.random() * 2);

    for (f=0; f<nrwy; f++) {
        runways[f] = new Runway();
        runways[f].name = 'RWY' + f;
        runways[f].label1 = 'RWY' + f + 'N';
        runways[f].label2 = 'RWY' + f + 'S';
        runways[f].heading = Math.floor(Math.random() * 360);
        runways[f].latitude = LATITUDE_CENTER + ((-0.01 + Math.random()) * MAX_LATLONG_RND);
        runways[f].longitude = LONGITUDE_CENTER + ((-0.01 + Math.random()) * MAX_LATLONG_RND);
        runways[f].type = 1 + (Math.random() * 9);
        runways[f].length = Math.floor(3000 + (Math.random() * 7000));
        runways[f].width = Math.floor(200 + (Math.random() * 500));
        runways[f].gLabel1.text = runways[f].label1;
        runways[f].gLabel2.text = runways[f].label2 + '\n' + runways[f].heading + '\n' + runways[f].length;
        runways[f].setScreenPosition();
        mainContainer.addChild(runways[f].gDraw);
    }
}


function test() {

    // First airport is located always in the center of the control area
    airports[0] = new Airport();
    airports[0].name = 'TEST';
    airports[0].icao = 'TEST';

    airports[0].latitude = LATITUDE_CENTER; //  + ((-0.01 + Math.random()) * MAX_LATLONG_RND);
    airports[0].longitude = LONGITUDE_CENTER; // + ((-0.01 + Math.random()) * MAX_LATLONG_RND);

    runways[0] = new Runway();
    runways[0].name = 'RWY-A'
    runways[0].label1 = 'N';
    runways[0].label2 = 'S';
    runways[0].heading = 70;
    runways[0].latitude = airports[0].latitude;
    runways[0].longitude = airports[0].longitude;
    runways[0].type = 1 + (Math.random() * 9);
    runways[0].length = 7000;
    runways[0].width = 500;
    runways[0].gLabel1.text = runways[0].label1;
    runways[0].gLabel2.text = runways[0].label2 + '\n' + runways[0].heading + '\n' + runways[0].length;
    runways[0].setScreenPosition();
    mainContainer.addChild(runways[0].gDraw);
    this.runways[0] = runways[0];

    runways[1] = new Runway();
    runways[1].name = 'RWY-A'
    runways[1].label1 = 'E';
    runways[1].label2 = 'W';
    runways[1].heading = 340;
    runways[1].latitude = airports[0].latitude;
    runways[1].longitude = airports[0].longitude;
    runways[1].type = 1 + (Math.random() * 9);
    runways[1].length = 7000;
    runways[1].width = 500;
    runways[1].gLabel1.text = runways[1].label1;
    runways[1].gLabel2.text = runways[1].label2 + '\n' + runways[1].heading + '\n' + runways[1].length;
    runways[1].setScreenPosition();
    mainContainer.addChild(runways[1].gDraw);
    this.runways[1] = runways[1];

}