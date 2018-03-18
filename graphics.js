/* Additional graphics functions */

createjs.Graphics.prototype.dashedLineTo = function( x1 , y1 , x2 , y2 , dashLen ){
    this.moveTo( x1 , y1 );

    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt( dX * dX + dY * dY ) / dashLen );
    var dashX = dX / dashes;
    var dashY = dY / dashes;

    var q = 0;
    while( q++ < dashes ){
        x1 += dashX;
        y1 += dashY;
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
    return this;
}

createjs.Graphics.prototype.drawDashedRect = function( x1 , y1 , w , h , dashLen ){
    this.moveTo(x1, y1);
    var x2 = x1 + w;
    var y2 = y1 + h;
    this.dashedLineTo( x1 , y1 , x2 , y1 , dashLen );
    this.dashedLineTo( x2 , y1 , x2 , y2 , dashLen );
    this.dashedLineTo( x2 , y2 , x1 , y2 , dashLen );
    this.dashedLineTo( x1 , y2 , x1 , y1 , dashLen );
    return this;
}

createjs.Graphics.prototype.drawResizableDashedRect = function( x1 , y1 , w , h , dashLen , offset ){
    this.moveTo(x1, y1);
    var x2 = x1 + w;
    var y2 = y1 + h;
    this.dashedLineTo(x1 + offset, y1, x2 - offset, y1, dashLen);
    this.dashedLineTo(x2, y1 + offset, x2, y2 - offset, dashLen);
    this.dashedLineTo(x2 - offset, y2, x1 + offset, y2, dashLen);
    this.dashedLineTo(x1, y2 - offset, x1, y1 + offset, dashLen);
    return this;
}

