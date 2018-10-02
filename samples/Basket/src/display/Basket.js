/**
 * @author kozakluke@gmail.com
 */
"use strict";
function Basket(world)
{
    Actor.call(this, world, PIXI.Texture.fromFrame("basket"));
    //public
    this.body = null;
    
    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2PolygonShape();
    
    var bodyDef = new b2BodyDef();
    bodyDef.type     = b2Body.b2_staticBody;
    bodyDef.userData = this;
    
    var body = this.body = world.CreateBody(bodyDef);
    
    //rim
    fixDef.shape.SetAsOrientedBox(10 * 0.5 / Main.meter,
                                  10 * 0.5 / Main.meter, new b2Vec2(3   / Main.meter,
                                                                    139 / Main.meter));
    body.CreateFixture(fixDef);
    
    //desk
    fixDef.shape.SetAsOrientedBox(23  * 0.5 / Main.meter,
                                  180 * 0.5 / Main.meter, new b2Vec2(134 / Main.meter,
                                                                      91 / Main.meter));
    body.CreateFixture(fixDef);
}

Basket.prototype = Object.create(Actor.prototype);
Basket.prototype.constructor = Basket;

Basket.prototype.setPosition = function(x, y)
{
    var v = ObjectPool.getObject(b2Vec2);
    ObjectPool.disposeObject(v, b2Vec2);
    v.Set(x / Main.meter, y / Main.meter);
    this.body.SetPosition(v);
    
    this.position.x = x;
    this.position.y = y;
};
