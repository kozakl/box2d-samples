/**
 * @author kozakluke@gmail.com
 */
"use strict";
function Main()
{
    //protected private
    this.stage    = null;
    this.renderer = null;
    this.world    = null;
    
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
    
    var screenWidth  = Math.max(screen.width, screen.height);
    var screenHeight = Math.min(screen.width, screen.height);
    var innerWidth   = Math.max(window.innerWidth, window.innerHeight);
    var innerHeight  = Math.min(window.innerWidth, window.innerHeight);
    var width  = screenWidth  / window.devicePixelRatio >= innerWidth ?
                 screenWidth  / window.devicePixelRatio : screenWidth;
    var height = screenHeight / window.devicePixelRatio >= innerHeight ?
                 screenHeight / window.devicePixelRatio : screenHeight;
    Main.scaleView  = DetectDevice.isDesktop() || Math.min(width  * window.devicePixelRatio / 960,
                                                           height * window.devicePixelRatio / 640);
    Main.scaleAsset = DetectDevice.isDesktop() ? MathUtil.clamp(Math.round(window.devicePixelRatio * 2) / 2, 0.5, 2) :
                                                 MathUtil.clamp(Math.round(Main.scaleView          * 4) / 4, 0.5, 2);
    Main.meter      = 30;
    
    window.onload = this.onLoad.bind(this);
}

Main.prototype.constructor = Main;

/**
 * @private
 */
Main.prototype.onLoad = function()
{
    var stats = this.stats = new Stats();
    document.body.appendChild(stats.domElement);
    stats.domElement.style.position = "absolute";
    
    var stage = this.stage = new PIXI.Stage(0x333333);
    stage.worldTransform.a = Main.scaleView;
    stage.worldTransform.d = Main.scaleView;
    var renderer = this.renderer = PIXI.autoDetectRenderer();
    document.body.appendChild(renderer.view);
    renderer.view.style.position = "absolute";
    
    var world = this.world = new b2World(new b2Vec2(0, 10),  true);
    
    this.createBorder(window.innerWidth  * window.devicePixelRatio / Main.scaleView,
                      window.innerHeight * window.devicePixelRatio / Main.scaleView);
    
    var circle = new PIXI.Graphics();
    stage.addChild(circle);
    circle.beginFill(0x00FF00, 0.5);
    circle.drawCircle(0, 0, 100);
    circle.endFill();
    
    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2CircleShape();
    fixDef.shape.SetRadius(100 / Main.meter);
    var bodyDef = new b2BodyDef();
    bodyDef.type     = b2Body.b2_dynamicBody;
    bodyDef.userData = circle;
    bodyDef.position.x = 250 / Main.meter;
    bodyDef.position.y = 250 / Main.meter;
    
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    
    window.addEventListener("resize", this.onResize.bind(this));
    this.setDebugDraw();
    this.onResize();
    
    var last = Date.now();
    (function update()
    {
        requestAnimationFrame(update, null);
        world.Step(1 / 30, 8, 3);
        world.DrawDebugData();
        
        for (var body = world.GetBodyList(); body; body = body.GetNext())
        {
            var actor = body.GetUserData();
            if (actor) {
                actor.rotation   = body.GetAngle();
                actor.position.x = body.GetPosition().x * Main.meter;
                actor.position.y = body.GetPosition().y * Main.meter;
            }
        }
        renderer.render(stage);
        
        var now = Date.now();
        var delta = now - last;
        var interval = 1000 / 30;
        if (delta < interval)
            return;
        last = now - (delta % interval);
        stats.update();
    })();
};

/**
 * @private
 */
Main.prototype.setDebugDraw = function()
{
    var debugCanvas = document.createElement("canvas");
    document.body.appendChild(debugCanvas);
    debugCanvas.style.position      = "absolute";
    debugCanvas.style.pointerEvents = "none";
    debugCanvas.style.width  = window.innerWidth  + "px";
    debugCanvas.style.height = window.innerHeight + "px";
    debugCanvas.width  = window.innerWidth;
    debugCanvas.height = window.innerHeight;
    
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(debugCanvas.getContext("2d"));
    debugDraw.SetDrawScale(Main.meter);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit |
                       b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
};

/**
 * @private
 */
Main.prototype.createBorder = function(width, height)
{
    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2PolygonShape();
    
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;
    
    var body = this.body = this.world.CreateBody(bodyDef);
    
    //up
    fixDef.shape.SetAsOrientedBox(width * 0.5 / Main.meter,
                                  2     * 0.5 / Main.meter, new b2Vec2(width * 0.5 / Main.meter));
    body.CreateFixture(fixDef);
    
    //down
    fixDef.shape.SetAsOrientedBox(width * 0.5 / Main.meter,
                                  2     * 0.5 / Main.meter, new b2Vec2(width * 0.5 / Main.meter,
                                                                       height      / Main.meter));
    body.CreateFixture(fixDef);
    
    //left
    fixDef.shape.SetAsOrientedBox(2      * 0.5 / Main.meter,
                                  height * 0.5 / Main.meter, new b2Vec2(0, height * 0.5 / Main.meter));
    body.CreateFixture(fixDef);
    
    //right
    fixDef.shape.SetAsOrientedBox(2      * 0.5 / Main.meter,
                                  height * 0.5 / Main.meter, new b2Vec2(width        / Main.meter,
                                                                        height * 0.5 / Main.meter));
    body.CreateFixture(fixDef);
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
