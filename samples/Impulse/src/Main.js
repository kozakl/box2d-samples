/**
 * @author kozakluke@gmail.com
 */
(function Main()
{
    const STAGE_WIDTH = window.innerWidth, STAGE_HEIGHT = window.innerHeight;
    const METER = 100;

    var tapVec = new Box2D.Common.Math.b2Vec2(0, -5);
    var bodies = [], actors = [];
    var stage, renderer;
    var stats;
    var world;
    
	(function init()
	{
		if (!window.requestAnimationFrame) 
		{
			window.requestAnimationFrame = (function() {
				return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};
			})();
		}
		
		window.onload = onLoad;
	})();
	
	function onLoad()
	{
        const container = document.createElement("div");
        document.body.appendChild(container);
        
        stats = new Stats();
        container.appendChild(stats.domElement);
        stats.domElement.style.position = "absolute";
        
        stage = new PIXI.Stage(0xDDDDDD, true);
        renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, undefined, false);
        document.body.appendChild(renderer.view);
        
        const loader = new PIXI.AssetLoader(["assets/ball.png",
                                             "assets/box.jpg"]);
        loader.onComplete = onLoadAssets;
        loader.load();
	}
    
    function onLoadAssets()
    {
        world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10),  true);
        
        const polyFixture = new Box2D.Dynamics.b2FixtureDef();
        polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        polyFixture.density = 1;
        
        const circleFixture	= new Box2D.Dynamics.b2FixtureDef();
        circleFixture.shape	= new Box2D.Collision.Shapes.b2CircleShape();
        circleFixture.density = 1;
        circleFixture.restitution = 0.7;
        
        const bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        
        //down
        polyFixture.shape.SetAsBox(10, 1);
        bodyDef.position.Set(9, STAGE_HEIGHT / METER + 1);
        world.CreateBody(bodyDef).CreateFixture(polyFixture);
        
        //left
        polyFixture.shape.SetAsBox(1, 100);
        bodyDef.position.Set(-1, 0);
        world.CreateBody(bodyDef).CreateFixture(polyFixture);
        
        //right
        bodyDef.position.Set(STAGE_WIDTH / METER + 1, 0);
        world.CreateBody(bodyDef).CreateFixture(polyFixture);
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        
        for (var i = 0; i < 50; i++)
        {
            var hw = 0.1 + Math.random() * 0.45;
            var hh = 0.1 + Math.random() * 0.45;
            
            bodyDef.position.Set(MathUtil.rndRange(0, STAGE_WIDTH) / METER, -MathUtil.rndRange(50, 5000) / METER);
            var body = world.CreateBody(bodyDef);
            
            if (Math.random() > 0.5)
            {
                circleFixture.shape.SetRadius(hw);
                body.CreateFixture(circleFixture);
                bodies.push(body);
                
                var ball = new PIXI.Sprite(PIXI.Texture.fromFrame("assets/ball.png"));
                stage.addChild(ball);
                ball.mousedown = ball.touchstart = onBegin;
                ball.setInteractive(true);
                ball.i = i;
                ball.anchor.x = ball.anchor.y = 0.5;
                ball.scale.x = ball.scale.y = hw;
                
                actors[actors.length] = ball;
            }
            else
            {
                polyFixture.shape.SetAsBox(hw, hh);
                body.CreateFixture(polyFixture);
                bodies.push(body);
                
                var box = new PIXI.Sprite(PIXI.Texture.fromFrame("assets/box.jpg"));
                stage.addChild(box);
                box.mousedown = box.touchstart = onBegin;
                box.setInteractive(true);
                box.i = i;
                box.anchor.x = box.anchor.y = 0.5;
                box.scale.x = hw;
                box.scale.y = hh;
                
                actors[actors.length] = box;
            }
        }
       
        update();
    }
    
    function onBegin(data)
    {
        bodies[this.i].ApplyImpulse(tapVec, bodies[this.i].GetWorldCenter());
    }
    
	function update()
	{
		requestAnimationFrame(update);
        
        world.Step(1 / 60,  3,  3);
        world.ClearForces();
        
        const n = actors.length;
        for (var i = 0; i < n; i++)
        {
            var body  = bodies[i];
            var actor = actors[i];
            var position = body.GetPosition();
            actor.position.x = position.x * 100;
            actor.position.y = position.y * 100;
            actor.rotation = body.GetAngle();
        }
        
        renderer.render(stage);
        stats.update();
	}
})();
