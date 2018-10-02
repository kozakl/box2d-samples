/**
 * @author kozakluke@gmail.com
 */
"use strict";
function Ball(world)
{
    Actor.call(this, world, PIXI.Texture.fromFrame("ball"));
    //public
    this.body = null;
    
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    
    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2CircleShape();
    fixDef.shape.SetRadius(this.width * 0.5 / Main.meter);
    fixDef.restitution = 0.8;
    fixDef.friction    = 0.2;
    fixDef.density     = 1;
    
    var bodyDef = new b2BodyDef();
    bodyDef.type   = b2Body.b2_dynamicBody;
    bodyDef.bullet = true;
    
    var body = this.body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
}

Ball.prototype = Object.create(Actor.prototype);
Ball.prototype.constructor = Ball;

Ball.prototype.setPosition = function(x, y)
{
    var v = ObjectPool.getObject(b2Vec2);
    ObjectPool.disposeObject(v, b2Vec2);
    v.Set(x / Main.meter, y / Main.meter);
    this.body.SetPosition(v);
    
    this.position.x = x;
    this.position.y = y;
};
