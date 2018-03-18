function Grid() {

    this.p1_latitude = 0;
    this.p1_longitude = 0;
    this.p2_latitude = 0;
    this.p2_longitude = 0;
    this.visible = true;

    // Graphic object
    this.gDraw = new createjs.Container();

    this.gLabel1 = new createjs.Text("", "normal 10px Courier", RWY_TEXT_COLOR);
    this.gLabel1.x = -20;
    this.gLabel1.y = -10;
    this.gLabel1.lineHeight = 9;

    this.gLine = new createjs.Shape();
    this.gLine.x = 0;
    this.gLine.y = 0;

    this.gLine.graphics.setStrokeStyle(1).beginStroke(GRID_COLOR).moveTo(0,0).lineTo(1,1).endStroke();
    this.gDraw.addChild(this.gLine, this.gLabel1);
}

Grid.prototype.setScreenPosition = function() {

    // var length_miles = Math.feetToMiles(this.length);
    // var width_miles = Math.feetToMiles(this.width);

    // var threshold1 =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, (180 + this.heading) % 360, length_miles / 2);
    var gridP1 = Math.coordsToScreen( this.p1_latitude, this.p1_longitude);

    // var th1Y = (SCREEN_CENTER_Y - ((LATITUDE_CENTER - this.p1_latitude)  * MILESFACT ));
    // var th1X = (SCREEN_CENTER_X - ((LONGITUDE_CENTER - this.p1_longitude)  * MILESFACT ));

    this.gDraw.x = gridP1.x;
    this.gDraw.y = gridP1.y;

    // var threshold2 =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, this.heading, length_miles / 2);
    // var th2Y = (SCREEN_CENTER_Y - ((LATITUDE_CENTER - this.p2_latitude)  * MILESFACT ));
    // var th2X = (SCREEN_CENTER_X - ((LONGITUDE_CENTER - this.p2_longitude)  * MILESFACT ));

    gridP2 = Math.coordsToScreen( this.p2_latitude, this.p2_longitude);

    // console.log(this.latitude, this.longitude, threshold1.lat, threshold1.lon);

    this.gLine.graphics.clear();
    this.gLine.graphics.setStrokeStyle(3).beginStroke(GRID_COLOR).moveTo(0,0).lineTo(gridP2.x - gridP1.x, gridP2.y - gridP1.y).endStroke();

    this.gLabel1.text = this.p1_latitude + ' - ' + this.p1_longitude;

}

Grid.prototype.show = function(visible) {
    this.visible = visible;
    this.gDraw.visible = visible;
}


