/**
 * @author kozakluke@gmail.com
 */
"use strict";
function InfoPanel()
{
    PIXI.Graphics.call(this);
    //public
    this.col    = null;
    this.row    = null;
    //protected private
    this.offset = 58;
    this.active = null;
    
    this.beginFill(0xFF0000, 1);
    this.drawRect(0, 0, 300, 300);
    this.endFill();
    
    
}

InfoPanel.prototype = Object.create(PIXI.Graphics.prototype);
InfoPanel.prototype.constructor = InfoPanel;
