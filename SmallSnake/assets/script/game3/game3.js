/**
 * Created by guang on 18/7/18.
 */
var config = require("config");
var storage = require("storage");
var res = require("res");



cc.Class({
    extends: cc.Component,

    properties: {


    },

    onLoad: function() {
        cc.myscene = "game";
        this.level = storage.getLevel(3);
        this.initData();
        this.initUI();
        this.addListener();
        this.yindao = storage.getYinDao();
    },


    initData: function()
    {
        this.state = "stop";
        this.coin = 0;
    },


    initUI: function()
    {
        this.node_game = cc.find("Canvas/node_game");
        this.node_ui = cc.find("Canvas/node_ui");
        this.node_level = cc.find("level/num",this.node_ui).getComponent(cc.Label);
        this.maps = cc.find("maps",this.node_game);
        this.initMap();
        //if(cc.sdk.is_iphonex())
        //{
        //    var topNode = cc.find("top",this.node_ui);
        //    var pro = cc.find("pro",this.node_ui);
        //    topNode.runAction(cc.sequence(
        //        cc.delayTime(0.1),
        //        cc.callFunc(function(){
        //            var s = cc.view.getFrameSize();
        //            var dpi = cc.winSize.width/s.width;
        //            topNode.y -= dpi*30;
        //            pro.y -= dpi*15;
        //        })
        //    ));
        //}

        this.updateUI();
        this.startGame();
    },

    initMap: function()
    {
        this.maps.destroyAllChildren();
        if(this.level>config.levelNum2) this.level = config.levelNum2;
        this.tmx = cc.instantiate(res["prefab_game3_level_"+this.level]);
        this.maps.addChild(this.tmx);
    },

    resetData: function()
    {
        this.updateUI();
        this.initData();
        this.startGame();
    },

    updateUI: function()
    {
        this.node_level.string = this.level+"";
        //this.coinnum.string = storage.castNum(storage.getCoin());
    },

    addCoin: function(num)
    {
        this.coin += num;
        //storage.setCoin(storage.getCoin()+num);
        //this.updateUI();
    },

    initSnake: function()
    {
        this.tiledMap = this.tmx.getComponent(cc.TiledMap);
        this.tiledSize = this.tiledMap.getTileSize();
        this.mapSize = this.tiledMap.getMapSize();

        this.roads = [];
        this.tipItems = [];

        var subp = cc.v2(this.mapSize.width*this.tiledSize.width/2,
            this.mapSize.height*this.tiledSize.height/2);

        var objGroup = cc.find("objLayer",this.tmx).getComponent(cc.TiledObjectGroup);
        var obj1 = objGroup.getObject("startPos");

        var startpos = this.converToRoadPos(cc.v2(obj1.x,obj1.y));
        this.roads.push({x:startpos.x,y:startpos.y,line:false,dir:"down"});

        var tipsObjs = cc.find("tipsLayer",this.tmx).getComponent(cc.TiledObjectGroup);
        var objlen = tipsObjs.getObjects().length;
        for(var i=1;i<=objlen;i++)
        {
            var obj = tipsObjs.getObject(""+i);
            var pos = this.converToRoadPos(cc.v2(obj.x,obj.y));
            this.roads.push({x:pos.x,y:pos.y,line:false,dir:obj.dir});

            var block = cc.instantiate(res["prefab_game2_block"]);
            block.position = pos.sub(subp);
            block.setContentSize(this.tiledSize);
            block.parent = this.maps;

            var tip = cc.instantiate(res["prefab_game2_block"]);
            tip.position = pos.sub(subp);
            tip.setContentSize(this.tiledSize);
            tip.parent = this.maps;
            tip.scale = 0.8;
            var ang = 0;
            if(obj.dir == "up") ang = 0;
            else if(obj.dir == "down") ang = 0;
            else if(obj.dir == "left") ang = 0;
            else if(obj.dir == "right") ang = 0;
            tip.angle = ang;
            tip.active = false;
            this.tipItems.push(tip);
        }

        this.snake = cc.find("snake",this.node_game).getComponent("Snake3");
        this.snake.init(this.tiledSize,this.mapSize);

        var pos = startpos.sub(subp);

        this.snake.initPos(pos);

    },

    startGame: function()
    {
        storage.stopMusic();
        this.initSnake();

        this.state = "start";
        this.gameTime = 0;
        this.currLevel = 0;

        this.gameDt = 0;
        this.lastPoint = null;
        this.snake.sel = false;
        this.points = [];
    },

    converToRoadPos: function(pos)
    {
        return cc.v2((Math.floor(pos.x/this.tiledSize.width)+0.5)*this.tiledSize.width,
            (Math.floor(pos.y/this.tiledSize.height)+0.5)*this.tiledSize.height);
    },

    gameWin: function()
    {
        if(this.state == "stop")
            return;

        this.state = "stop";
        this.level+=1;
        this.lastPoint = null;
        this.snake.sel = false;
        storage.setLevel(3,this.level);
        this.initMap();
        this.resetData();
        //this.node_ui.active = false;
        //
        //this.addCoin();
        //res.openUI("jiesuan",null,"win");
        //
        //storage.playSound(res.audio_1st);
    },

    willGameOver: function()
    {
        this.state = "stop";

        this.resetData();
        //this.node_ui.active = false;
        //this.addCoin();
        //res.openUI("jiesuan",null,"fail");
        //storage.playSound(res.audio_gameover);
    },



    fuhuo: function()
    {

    },

    gameOver: function()
    {

        //res.openUI("jiesuan",null,"fail");


        //storage.playMusic(res.audio_bgm);
    },


    judgeWin: function()
    {

    },


    touchStart: function(event)
    {
        if(this.state == "start")
        {

            var pos = event.getLocation();
            var p = pos.sub(cc.v2(cc.winSize.width/2,cc.winSize.height/2));
            var dis = p.sub(this.snake.head.position).mag();
            if(dis<this.tiledSize.width/2)
            {

            }
        }
    },
    touchMove: function(event)
    {
        if(this.state == "start")
        {
            if(this.snake.sel)
            {
                var pos = event.getLocation();
                //var prp = event.getPreviousLocation();
                var p = pos.sub(cc.v2(cc.winSize.width/2,cc.winSize.height/2));

            }
        }
    },
    touchUp: function(event)
    {

        //if(this.state == "start")
        //{
        //    if(this.snake.sel)
        //    {
        //        var pos = event.getLocation();
        //        var p = pos.sub(cc.v2(cc.winSize.width/2,cc.winSize.height/2));
        //        p = this.judgePos(p);
        //        this.snake.head.position = p;
        //        this.snake.sel = false;
        //    }
        //}
    },


    click: function(event,data)
    {
        if(data == "home")
        {
            cc.director.loadScene("main");
        }
        else if(data == "replay")
        {
            this.resetData();
        }

        cc.log(data);
    },

    addListener: function()
    {
        var s = cc.winSize;
        var self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.touchStart(event);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.touchMove(event);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.touchUp(event);
        }, this);
    },

    update: function(dt) {

    }
});