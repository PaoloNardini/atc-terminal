/* Global strip data & functions */
var strips = [];
var arrStrips = 0;
var depStrips = 0;

var arrStripsContainer;
var depStripsContainer;

function checkStripHit(mouseX, mouseY, container) {
    var id = container.id;
    for (var p=0; p<planes.length; p++) {
        if (planes[p].stripPosition >=0 && ((id == 'arrStripsContainer' && planes[p].arrival == true) || (id == 'depStripsContainer' && planes[p].departure == true))) {
            var o_strip = planes[p].getStrip();
            var rectangle = o_strip.getBounds();

            var x = container.scaleX * (o_strip.x - container.regX);
            var y = container.scaleY * (o_strip.y - container.regY);
            var x1 = x + rectangle.width;
            var y1 = y + rectangle.height;
            // console.log('checkStripHit ' + planes[p].callsign + ' x=' + x + ' y=' + y + ' x1=' + x1 + ' y1=' + y1 + ' mouse=' + mouseX + ' - ' + mouseY);
            if (mouseX >= x && mouseX <= x1 && mouseY >= y && mouseY <= y1) {
                console.log('Hit strip ' + planes[p].callsign);
                // o_strip.setMode(STRIP_SELECTED);
                return p;
            }
        }
    }
    return -1;
}

function stripRemove(type, position) {
    var container;
    if (type == STRIP_ARRIVALS ) {
        container = arrStripsContainer;
    }
    else {
        container = depStripsContainer;
    }
    var found = false;
    var o_strip = undefined;
    for(var c=0; c<container.children.length; c++) {
        var ch = container.children[c];
        if (ch instanceof Strip) {
            if (found) {
                ch.position --;
                ch.o_plane.stripPosition = ch.position;
            }
            else if (ch.type == type && ch.position == position) {
                found = true;
                o_strip = ch;
                ch.o_plane.stripPosition = -1;
            }
        }
    }
    if (found) {
        container.removeChild(o_strip);
    }
    if (type == STRIP_ARRIVALS ) {
        arrStrips--;
    }
    else {
        depStrips--;
    }
}


/* The strip object */
function Strip() {

    this.Container_constructor();

    // Strip graphic object
    this.type = '';
    this.position = 0;
    this.callsign = '';
    this.o_plane = undefined;

    this.gStripBox = new createjs.Shape();
    this.gStripBox.graphics.setStrokeStyle(1).beginStroke(STRIP_COLOR).beginFill(STRIP_COLOR).dr(0,0,STRIP_WIDTH,STRIP_HEIGHT);

    this.gStripLine1 = new createjs.Shape();
    this.gStripLine1.graphics.beginStroke(STRIP_TEXT_COLOR).moveTo(60, 0).lineTo(60,STRIP_HEIGHT-10).endStroke();
    this.gStripLine2 = new createjs.Shape();
    this.gStripLine2.graphics.beginStroke(STRIP_TEXT_COLOR).moveTo(155, 0).lineTo(155,STRIP_HEIGHT-35).endStroke();
    this.gStripLine3 = new createjs.Shape();
    this.gStripLine3.graphics.beginStroke(STRIP_TEXT_COLOR).moveTo(350, 0).lineTo(350,STRIP_HEIGHT-10).endStroke();

    this.gStripLabel = new createjs.Text('', "bold 12px Courier", STRIP_TEXT_COLOR);
    this.gStripLabel.x = 10;
    this.gStripLabel.y = 5;

    this.gStripLabel2 = new createjs.Text('', "normal 12px Courier", STRIP_TEXT_COLOR);
    this.gStripLabel2.x = 10;
    this.gStripLabel2.y = 15;

    this.gStripLabel3 = new createjs.Text('', "normal 12px Courier", STRIP_TEXT_COLOR);
    this.gStripLabel3.x = 10;
    this.gStripLabel3.y = 25;

    this.gStripLabel4 = new createjs.Text('', "normal 12px Courier", STRIP_TEXT_COLOR)
    this.gStripLabel4.x = 63;
    this.gStripLabel4.y = 5;
    this.gStripLabel4.lineHeight = 14;

    this.gStripLabel5 = new createjs.Text(this.airp_dep + ' - ' + this.airp_dest + '\n\n' + this.route, "normal 12px Courier", STRIP_TEXT_COLOR);
    this.gStripLabel5.x = 165;
    this.gStripLabel5.y = 5;
    this.gStripLabel5.lineHeight = 14;

    this.gStripLabel6 = new createjs.Text('', "normal 12px Courier", STRIP_TEXT_COLOR);
    this.gStripLabel6.x = 355;
    this.gStripLabel6.y = 5;

    this.addChild(this.gStripBox,this.gStripLine1,this.gStripLine2,this.gStripLine3,this.gStripLabel,this.gStripLabel2,this.gStripLabel3,this.gStripLabel4,this.gStripLabel5,this.gStripLabel6);
    this.setBounds(0,0,STRIP_WIDTH,STRIP_HEIGHT);
}
createjs.extend(Strip, createjs.Container);
createjs.promote(Strip, "Container");

Strip.prototype.setX = function ( x ) {
    this.x = x;
}

Strip.prototype.setY = function ( y ) {
    this.y = y;
}

Strip.prototype.setCallsign = function(callsign) {
    this.callsign = callsign;
    this.gStripLabel.text = callsign;
}

Strip.prototype.setAircraftType = function(aircraft) {
    this.gStripLabel2.text = aircraft;
}

Strip.prototype.updateStrip = function(position, route_description, speed, altitude, cleared_altitude, airport_departure, airport_destination, runway_assigned, squack, squack_assigned, notes, slot) {

    this.gStripLabel3.text = 'G' + Math.floor(speed);

    var fl = 'FL ' + Math.floor(altitude / 100);

    if (cleared_altitude != undefined && Math.floor(cleared_altitude / 100) != Math.floor(altitude / 100)) {
        fl = fl + ' > ' + Math.floor(cleared_altitude / 100);
    }
    if (route_description.length > 36) {
        route_description = route_description.substr(0,18) + '...' + route_description.substr(-18);
    }
    this.gStripLabel4.text = fl + '\n' + route_description + '\n' + notes;

    if (airport_departure != '' && runway_assigned != '') {
        this.gStripLabel5.text = airport_departure + ' - ' + runway_assigned;
    }
    else if (airport_destination != '' && runway_assigned != '') {
        this.gStripLabel5.text = airport_destination + ' - ' + runway_assigned;
    }
    else {
        this.gStripLabel5.text = airport_departure + ' - ' + airport_destination;
    }

    this.gStripLabel6.text = ' ' + squack;
    if (slot != undefined) {
        this.gStripLabel6.text += '\n\n' + clockFormat(slot.hours,slot.minutes);
    }

    this.setX(10);
    this.setY(this.position * (STRIP_HEIGHT + 4));
}

Strip.prototype.setMode = function(mode) {
    this.gStripBox.graphics.clear();
    switch(mode) {
        case STRIP_ACTIVE:
            this.gStripBox.graphics.setStrokeStyle(1).beginStroke(STRIP_COLOR).beginFill(STRIP_COLOR_ACTIVE).dr(0,0,STRIP_WIDTH,STRIP_HEIGHT);
            break;
        case STRIP_OUT:
            this.gStripBox.graphics.setStrokeStyle(1).beginStroke(STRIP_COLOR).beginFill(STRIP_COLOR_OUT).dr(0,0,STRIP_WIDTH,STRIP_HEIGHT);
            break;
        case STRIP_RELEASE:
            this.gStripBox.graphics.setStrokeStyle(1).beginStroke(STRIP_COLOR).beginFill(STRIP_COLOR_RELEASE).dr(0,0,STRIP_WIDTH,STRIP_HEIGHT);
            break;
        case STRIP_WARNING:
            this.gStripBox.graphics.setStrokeStyle(1).beginStroke(STRIP_COLOR).beginFill(STRIP_COLOR_WARNING).dr(0,0,STRIP_WIDTH,STRIP_HEIGHT);
            break;
        case STRIP_SELECTED:
            this.gStripBox.graphics.setStrokeStyle(1).beginStroke(STRIP_COLOR).beginFill(STRIP_COLOR_SELECTED).dr(0,0,STRIP_WIDTH,STRIP_HEIGHT);
            break;
    }
}

Strip.prototype.destroy = function() {
    this.removeChild(this.gStripBox,this.gStripLine1,this.gStripLine2,this.gStripLine3,this.gStripLabel,this.gStripLabel2,this.gStripLabel3,this.gStripLabel4,this.gStripLabel5,this.gStripLabel6);
}
