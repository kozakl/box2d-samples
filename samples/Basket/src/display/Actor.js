/**
 * @author kozakluke@gmail.com
 */
"use strict";
function Actor(world, texture)
{
    PIXI.Sprite.call(this, texture);
    //args;
    this.world = world;
}

Actor.prototype = Object.create(PIXI.Sprite.prototype);
Actor.prototype.constructor = Actor;
