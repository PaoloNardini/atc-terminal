/* The VideoTrack object */
function VideoTrack() {

    this.type = '';
    this.from_latitude = 0;
    this.from_longitude = 0;
    this.to_latitude = 0;
    this.to_longitude = 0;

    this.from_x = 0;
    this.from_y = 0;
    this.to_x = 0;
    this.to_y = 0;
    
    // Graphic object
    this.gDraw = new createjs.Container();

    this.gTrack = new createjs.Shape();

    this.gTrack.graphics.setStrokeStyle(1).beginStroke(PLANE_BODY_COLOR).moveTo(0,0).lineTo(1,1).endStroke();

    this.gDraw.addChild(this.gTrack);
}

VideoTrack.prototype.setX = function ( x ) {
    this.from_x = x;
    this.gDraw.x = x;
}

VideoTrack.prototype.setY = function ( y ) {
    this.from_y = y;
    this.gDraw.y = y;
}

VideoTrack.prototype.setScreenPosition = function() {

    var length_miles = Math.feetToMiles(this.length);
    // var width_miles = Math.feetToMiles(this.width);

    var t1 = Math.coordsToScreen( this.from_latitude, this.from_longitude);

    this.setX(t1.x);
    this.setY(t1.y);

    var t2 = Math.coordsToScreen( this.to_latitude, this.to_longitude);

    this.to_x = t2.x - t1.x;
    this.to_y = t2.y - t1.y;

    this.gTrack.graphics.clear();
    if (this.type == 'ATS') {
        // Ats track
        this.gTrack.graphics.setStrokeStyle(1).beginStroke(ATS_COLOR).setStrokeDash([5,5],0).moveTo(0, 0).lineTo(this.to_x, this.to_y).endStroke();
    }
    else {
        // Normal track
        this.gTrack.graphics.setStrokeStyle(2).beginStroke(PLANE_BODY_COLOR).setStrokeDash([5, 5], 0).moveTo(0, 0).lineTo(this.to_x, this.to_y).endStroke();
    }

}

