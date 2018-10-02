/**
 * @author kozakluke@gmail.com
 */
"use strict";
function Main()
{
    //protected private
    this.stage    = null;
    this.renderer = null;
    this.loader   = null;
    this.isInitH  = null;
    this.world    = null;
    this.stats    = null;
    this.anchor   = null;
    this.ball     = null;
    this.isBegin  = null;
    this.wasThrow = null;
    this.boxes    = [];
    
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
    
    var loader = this.loader = new PIXI.AssetLoader([
        "assets/graphics/{0}x/ball.png".replace("{0}",   Main.scaleAsset),
        "assets/graphics/{0}x/basket.png".replace("{0}", Main.scaleAsset),
        "assets/graphics/{0}x/box.png".replace("{0}",    Main.scaleAsset)
    ], false);
    loader.onComplete = this.onLoadAssets.bind(this);
    loader.load();
    
    window.addEventListener("resize", this.onResize.bind(this));
    setTimeout(this.onResize.bind(this), 0);
    window.addEventListener("touchstart", function() {
        if (screenfull.enabled && !screenfull.isFullscreen)
            screenfull.request();
    });
};

/**
 * @private
 */
Main.prototype.onLoadAssets = function()
{
    PIXI.Texture.addTextureToCache(
        PIXI.Texture.removeTextureFromCache("assets/graphics/{0}x/ball.png".replace("{0}", Main.scaleAsset)), "ball");
    PIXI.Texture.fromFrame("ball").setScale(1 / Main.scaleAsset);
    PIXI.Texture.addTextureToCache(
        PIXI.Texture.removeTextureFromCache("assets/graphics/{0}x/basket.png".replace("{0}", Main.scaleAsset)), "basket");
    PIXI.Texture.fromFrame("basket").setScale(1 / Main.scaleAsset);
    PIXI.Texture.addTextureToCache(
        PIXI.Texture.removeTextureFromCache("assets/graphics/{0}x/box.png".replace("{0}", Main.scaleAsset)), "box");
    PIXI.Texture.fromFrame("box").setScale(1 / Main.scaleAsset);
    
    this.onResize();
};

/**
 * @private
 */
Main.prototype.initHorizontal = function()
{
    var world = this.world = new b2World(new b2Vec2(0, 9.8), true);
    
    this.createBorder(window.innerWidth  * window.devicePixelRatio / Main.scaleView,
                      window.innerHeight * window.devicePixelRatio / Main.scaleView);
    this.createBoxes();
    
    var anchor = this.anchor = new PIXI.Graphics();
    this.stage.addChild(anchor);
    anchor.beginFill(0xFF0000, 1);
    anchor.drawCircle(0, 0, 5);
    anchor.endFill();
    anchor.position.x = 200;
    anchor.position.y = 500;
    
    var ball = this.ball = new Ball(this.world);
    this.stage.addChild(ball);
    ball.body.SetType(b2Body.b2_staticBody);
    ball.setPosition(anchor.position.x,
                     anchor.position.y);
    
    var basket = new Basket(this.world);
    this.stage.addChild(basket);
    basket.setPosition(window.innerWidth * window.devicePixelRatio / Main.scaleView - 160, 100);
    
    var self = this;
    (function update()
    {
        requestAnimationFrame(update, null);
        world.Step(1 / 30, 8, 3);
        world.ClearForces();
        //world.DrawDebugData();
        
        for (var body = world.GetBodyList(); body; body = body.GetNext())
        {
            var actor = body.GetUserData();
            if (actor) {
                actor.rotation   = body.GetAngle();
                actor.position.x = body.GetPosition().x * Main.meter;
                actor.position.y = body.GetPosition().y * Main.meter;
            }
        }
        self.renderer.render(self.stage);
        self.stats.update();
    })();
    
    //this.setDebugDraw();
    this.stage.mousedown = this.stage.touchstart = this.onBegin.bind(this);
    this.stage.mouseup   = this.stage.touchend   = this.onEnd.bind(this);
    this.stage.mousemove = this.stage.touchmove  = this.onMove.bind(this);
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
    
    var body = this.world.CreateBody(bodyDef);
    
    //down
    fixDef.shape.SetAsOrientedBox(width * 0.5 / Main.meter,
                                  2     * 0.5 / Main.meter, new b2Vec2(width * 0.5 / Main.meter,
                                                                       height      / Main.meter));
    body.CreateFixture(fixDef);
    
    //left
    fixDef.shape.SetAsOrientedBox(2 * 0.5 / Main.meter,
                                  height  / Main.meter, new b2Vec2());
    body.CreateFixture(fixDef);
    
    //right
    fixDef.shape.SetAsOrientedBox(2 * 0.5 / Main.meter,
                                  height  / Main.meter, new b2Vec2(width / Main.meter));
    body.CreateFixture(fixDef);
};

/**
 * @private
 */
Main.prototype.createBoxes = function()
{
    for (var i = 0; i < 11; ++i)
    {
        var box = new Box(this.world);
        this.stage.addChild(box);
        box.setPosition(window.innerWidth  * window.devicePixelRatio / Main.scaleView - 350,
                        window.innerHeight * window.devicePixelRatio / Main.scaleView - 50 - i * 50);
        box.origin.x = box.position.x;
        box.origin.y = box.position.y;
        
        this.boxes.push(box);
    }
};

/**
 * @private
 */
Main.prototype.onBegin = function()
{
    if (this.wasThrow)
    {
        this.wasThrow = false;
        
        this.ball.body.SetType(b2Body.b2_staticBody);
        this.ball.body.SetUserData(null);
        this.ball.setPosition(this.anchor.position.x,
                              this.anchor.position.y);
        
        var n = this.boxes.length;
        for (var i = 0; i < n; ++i)
        {
            var box = this.boxes[i];
            box.body.SetType(b2Body.b2_staticBody);
            box.body.SetAngle(0);
            box.setPosition(box.origin.x, box.origin.y);
        }
        
        this.world.Step(1 / 30, 8, 3);
        this.world.ClearForces();
        for (i = this.boxes.length - 1; i >= 0; --i)
            this.boxes[i].body.SetType(b2Body.b2_dynamicBody);
    }
    else
        this.isBegin = true;
};

/**
 * @private
 */
Main.prototype.onEnd = function(event)
{
    if (this.isBegin)
    {
        this.isBegin  = false;
        this.wasThrow = true;
        
        this.ball.body.SetType(b2Body.b2_dynamicBody);
        this.ball.body.SetUserData(this.ball);
        this.ball.setPosition(this.ball.position.x,
                              this.ball.position.y);
        
        var dx = event.global.x / Main.scaleView - this.anchor.position.x;
        var dy = event.global.y / Main.scaleView - this.anchor.position.y;
        var dir = ObjectPool.getObject(b2Vec2);
        dir.Set(dx * -1, dy * -1);
        dir.Normalize();
        
        var impulse = ObjectPool.getObject(b2Vec2);
        impulse.Set(dir.x, dir.y);
        impulse.Multiply(this.ball.body.m_mass);
        impulse.Multiply(MathUtil.distancePoint(this.ball.position.x,   this.ball.position.y,
                                                this.anchor.position.x, this.anchor.position.y) * 0.6);
        
        var v = ObjectPool.getObject(b2Vec2);
        ObjectPool.disposeObject(dir,     b2Vec2);
        ObjectPool.disposeObject(impulse, b2Vec2);
        ObjectPool.disposeObject(v,       b2Vec2);
        v.Set(0, 0);
        this.ball.body.ApplyImpulse(impulse, this.ball.body.GetWorldPoint(v));
    }
};

/**
 * @private
 */
Main.prototype.onMove = function(event)
{
    if (this.isBegin)
    {
        var dx = event.global.x / Main.scaleView - this.anchor.position.x;
        var dy = event.global.y / Main.scaleView - this.anchor.position.y;
        var d  = MathUtil.clamp(Math.sqrt(dx * dx + dy * dy) / 500, -0.5, 0.5);
        var d2 = 1 - Math.abs(d);
        
        this.ball.position.x = this.anchor.position.x + 200 * Math.cos(Math.atan2(dy, dx)) * d * d2;
	    this.ball.position.y = this.anchor.position.y + 200 * Math.sin(Math.atan2(dy, dx)) * d * d2;
    }
};

/**
 * @private
 */
Main.prototype.onResize = function()
{
    if (window.innerWidth > window.innerHeight)
    {
        if (!this.isInitH && !this.loader.loadCount)
        {
            if (DetectDevice.isDesktop() || !screenfull.enabled) {
                this.isInitH = true;
                this.initHorizontal();
            }
            else if (screenfull.isFullscreen) {
                this.isInitH = true;
                setTimeout(this.initHorizontal.bind(this), 100);
            }
        }
        this.stage.visible = true;
    }
    else
        this.stage.visible = false;
    
    this.renderer.view.style.width  = window.innerWidth  + "px";
    this.renderer.view.style.height = window.innerHeight + "px";
    this.renderer.resize(window.innerWidth  * window.devicePixelRatio,
                         window.innerHeight * window.devicePixelRatio);
    this.renderer.render(this.stage);
    window.scrollTo(0, 0);
};

Main.instance = new Main();
