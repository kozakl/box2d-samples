/**
 * @author kozakluke@gmail.com
 */
"use strict";
function Main()
{
    //protected private
    this.stage     = null;
    this.renderer  = null;
    this.scaleView = null;
    this.world     = null;
    this.meter     = 30;
    this.bullets   = [];
    this.currentBall = null;
    this.balls       = [];
    
    window.b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape;
    window.b2MassData     = Box2D.Collision.Shapes.b2MassData;
    window.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    window.b2Vec2         = Box2D.Common.Math.b2Vec2;
    window.b2Body         = Box2D.Dynamics.b2Body;
    window.b2BodyDef      = Box2D.Dynamics.b2BodyDef;
    window.b2DebugDraw    = Box2D.Dynamics.b2DebugDraw;
    window.b2Fixture      = Box2D.Dynamics.b2Fixture;
    window.b2FixtureDef   = Box2D.Dynamics.b2FixtureDef;
    window.b2World        = Box2D.Dynamics.b2World;
    try {
        window.devicePixelRatio = window["devicePixelRatio"] || 1;
    } catch(event) { }
    
    var innerWidth   = Math.min(window.innerWidth, window.innerHeight);
    var innerHeight  = Math.max(window.innerWidth, window.innerHeight);
    var screenWidth  = screen.width  / window.devicePixelRatio >= innerWidth ?
                       screen.width  / window.devicePixelRatio : screen.width;
    var screenHeight = screen.height / window.devicePixelRatio >= innerHeight ?
                       screen.height / window.devicePixelRatio : screen.height;
    this.scaleView = Math.min(screenWidth  * window.devicePixelRatio / 640,
                              screenHeight * window.devicePixelRatio / 960);
    window.onload = this.onLoad.bind(this);
}

Main.prototype.constructor = Main;

/**
 * @private
 */
Main.prototype.onLoad = function()
{
    var stats = new Stats();
    document.body.appendChild(stats.domElement);
    stats.domElement.style.position = "absolute";
    
    var stage = this.stage = new PIXI.Stage(0x333333);
    stage.worldTransform.a = this.scaleView;
    stage.worldTransform.d = this.scaleView;
    stage.touchstart = stage.mousedown = this.onBegin.bind(this);
    stage.touchend   = stage.mouseup   = this.onEnd.bind(this);
    var renderer = this.renderer = new PIXI.CanvasRenderer();
    document.body.appendChild(renderer.view);
    
    var infoPanel = new InfoPanel();
    stage.addChild(infoPanel);
    infoPanel.position.x = (window.innerWidth - 320) * window.devicePixelRatio / this.scaleView;
    
    var world = this.world = new b2World(new b2Vec2(0, 10), true);
    
    this.drawBorder(window.innerWidth * window.devicePixelRatio / this.scaleView,
                    window.innerHeight * window.devicePixelRatio / this.scaleView);
    this.addBullet();
    
    window.addEventListener("resize", this.onResize.bind(this));
    this.setDebugDraw();
    this.onResize();
    
    var self = this;
    var last = Date.now();
    (function update()
    {
        requestAnimationFrame(update, null);
        
        for (var body = world.GetBodyList(); body; body = body.GetNext())
        {
            var actor = body.GetUserData();
            if (actor)
            {
                actor.rotation   = body.GetAngle() * 180 / Math.PI;
                actor.position.x = body.GetPosition().x * 30;
                actor.position.y = body.GetPosition().y * 30;
            }
        }
        
        world.Step(1 / 60, 10, 10);
        //world.DrawDebugData();
        renderer.render(stage);
        
        var now = Date.now();
        var delta = now - last;
        var interval = 1000 / 30;
        if (delta < interval)
            return;
        last = now - (delta % interval);
        
        if (self.currentBall)
        {
            self.currentBall.scale.x += 2.5;
            self.currentBall.scale.y += 2.5;
            
            var n = self.balls.length;
            for (var i = 0; i < n; ++i)
            {
                if (MathUtil.distancePoint(self.currentBall.position.x,        self.currentBall.position.y,
                                           self.balls[i].GetPosition().x * 30, self.balls[i].GetPosition().y * 30) <
                    self.currentBall.scale.x + self.balls[i].GetUserData().scale.x) {
                        self.onEnd();
                    break;
                }
            }
        }
        stats.update();
    })();
};

/**
 * @private
 */
Main.prototype.onBegin = function(event)
{
    this.currentBall = new PIXI.Graphics();
    this.stage.addChild(this.currentBall);
    this.currentBall.beginFill(0xFF0000, 2);
    this.currentBall.drawCircle(0, 0, 1);
    this.currentBall.endFill();
    this.currentBall.position.x = event.global.x / this.scaleView;
    this.currentBall.position.y = event.global.y / this.scaleView;

    var n = this.balls.length;
    for (var i = 0; i < n; ++i)
    {
        console.log(MathUtil.distancePoint(this.currentBall.position.x,        this.currentBall.position.y,
                this.balls[i].GetPosition().x * 30, this.balls[i].GetPosition().y * 30))
    }
};

/**
 * @private
 */
Main.prototype.onEnd = function()
{
    if (this.currentBall)
    {
        this.addBall(this.currentBall.scale.x,
                     this.currentBall.position.x,
                     this.currentBall.position.y);
        
        this.currentBall = null;  
    }
    
};

/**
 * @private
 */
Main.prototype.drawBorder = function(width, height)
{
    //up
    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(width * 0.5 / this.meter,
                          10    * 0.5 / this.meter);
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = width * 0.5 / this.meter;
    bodyDef.position.y = 10    * 0.5 / this.meter;
    
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
    
    //down
    fixDef.shape.SetAsBox(width * 0.5 / this.meter,
                          10    * 0.5 / this.meter);
    bodyDef.position.x = width * 0.5 / this.meter;
    bodyDef.position.y = height      / this.meter - 10 * 0.5 / this.meter;
    
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
    
    //left
    fixDef.shape.SetAsBox(10     * 0.5 / this.meter,
                          height * 0.5 / this.meter);
    bodyDef.position.x = 10     * 0.5 / this.meter;
    bodyDef.position.y = height * 0.5 / this.meter;
    
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
    
    //right
    fixDef.shape.SetAsBox(10     * 0.5 / this.meter,
                          height * 0.5 / this.meter);
    bodyDef.position.x = width        / this.meter - 10 * 0.5 / this.meter;
    bodyDef.position.y = height * 0.5 / this.meter;
    
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
};

/**
 * @private
 */
Main.prototype.addBall = function(r, x, y)
{
    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2CircleShape();
    fixDef.shape.SetRadius(r / this.meter);
    fixDef.restitution = 0;
    fixDef.density = 100;
    fixDef.friction = 1;
    
    var bodyDef = new b2BodyDef();
    bodyDef.type     = b2Body.b2_dynamicBody;
    bodyDef.userData = this.currentBall;
    //bodyDef.linearVelocity = new b2Vec2(0.1, 0);
    bodyDef.position.x = x / this.meter;
    bodyDef.position.y = y / this.meter;
    
    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    this.balls.push(body);
};

/**
 * @private
 */
Main.prototype.addBullet = function()
{
    var ball = new PIXI.Graphics();
    this.stage.addChild(ball);
    ball.beginFill(0x00FF00, 1);
    ball.drawCircle(0, 0, 10);
    ball.endFill();
    
    var fixDef  = new b2FixtureDef();
    
    fixDef.shape = new b2CircleShape();
    fixDef.shape.SetRadius(10 / this.meter);
    fixDef.restitution = 1;
    fixDef.friction = 0;
    //fixDef.density = 1;

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.userData = ball;
    //bodyDef.bullet = true;
    bodyDef.position.x = 250 / this.meter;
    bodyDef.position.y = 20 / this.meter;
    bodyDef.linearVelocity = new b2Vec2(45, 45)

    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    //body.SetLinearVelocity(new b2Vec2(10, 10))
};

/**
 * @private
 */
Main.prototype.setDebugDraw = function()
{
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(this.renderer.context);
    debugDraw.SetDrawScale(this.meter);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit |
                       b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
};

/**
 * @private
 */
Main.prototype.onResize = function()
{
    this.renderer.view.style.width  = window.innerWidth  + "px";
    this.renderer.view.style.height = window.innerHeight + "px";
    this.renderer.resize(window.innerWidth  * window.devicePixelRatio,
                         window.innerHeight * window.devicePixelRatio);
    this.renderer.render(this.stage);
    window.scrollTo(0, 0);
};

Main.instance = new Main();
