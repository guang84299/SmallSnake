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
        cc.myscene = "game1";
        this.level = storage.getLevel(1);
        this.initData();
        this.initUI();
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
        this.btn_replay = cc.find("replay",this.node_ui);
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
        if(this.level>config.levelNum) this.level = config.levelNum;
        this.tmx = new cc.Node();
        var tmx = this.tmx.addComponent(cc.TiledMap);
        tmx.tmxAsset = res["game1_level_"+this.level];
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
        this.tmxLayers = this.tmx.getComponent(cc.TiledMap).getLayers();
        this.tiledSize = this.tmx.getComponent(cc.TiledMap).getTileSize();
        this.snake = cc.find("snake",this.node_game).getComponent("Snake");
        this.snake.init(this.tiledSize);
        this.exit = cc.find("exit",this.node_game);

        var exit_left = cc.find("exit_left",this.node_game);
        var exit_right = cc.find("exit_right",this.node_game);

        var objGroup = cc.find("objLayer",this.tmx).getComponent(cc.TiledObjectGroup);

        var obj1 = objGroup.getObject("startPos1");
        var obj2 = objGroup.getObject("startPos2");
        var obj3 = objGroup.getObject("startPos3");
        var exit = objGroup.getObject("exit");

        var subp = cc.v2(640/2,1136/2);

        var pos1 = this.converToRoadPos(cc.v2(obj1.x,obj1.y)).sub(subp);
        var pos2 = this.converToRoadPos(cc.v2(obj2.x,obj2.y)).sub(subp);
        var pos3 = this.converToRoadPos(cc.v2(obj3.x,obj3.y)).sub(subp);

        this.exit.position = cc.v2(exit.x,exit.y).sub(subp);
        exit_left.position = this.exit.position;
        exit_right.position = this.exit.position;

        if(this.apples && this.apples.length>0)
        {
            for(var i=0;i<this.apples.length;i++)
                this.apples[i].destroy();
        }
        if(this.stones && this.stones.length>0)
        {
            for(var i=0;i<this.stones.length;i++)
                this.stones[i].destroy();
        }
        if(this.traps && this.traps.length>0)
        {
            for(var i=0;i<this.traps.length;i++)
                this.traps[i].destroy();
        }
        this.apples = [];
        this.stones = [];
        this.traps = [];
        var objs = objGroup.getObjects();
        for(var i=0;i<objs.length;i++)
        {
            var obj = objs[i];
            if(obj.name == "apple")
            {
                var apple = cc.instantiate(res["prefab_game1_apple"]);
                apple.position = this.converToRoadPos(cc.v2(obj.x,obj.y)).sub(subp);
                this.node_game.addChild(apple);

                this.apples.push(apple);
            }
            else if(obj.name == "stone")
            {
                var stone = cc.instantiate(res["prefab_game1_stone"]);
                stone.position = this.converToRoadPos(cc.v2(obj.x,obj.y)).sub(subp);
                this.node_game.addChild(stone);

                this.stones.push(stone);
            }
            else if(obj.name == "trap")
            {
                var trap = cc.instantiate(res["prefab_game1_trap"]);
                trap.position = this.converToRoadPos(cc.v2(obj.x,obj.y)).sub(subp);
                this.node_game.addChild(trap);

                if(obj.dir == "down")
                    trap.angle = 180;
                else if(obj.dir == "left")
                    trap.angle = 90;
                else if(obj.dir == "right")
                    trap.angle = -90;
                this.traps.push(trap);
            }
        }

        this.snake.initPos(pos1,pos2,pos3);
    },

    converToRoadPos: function(pos)
    {
        return cc.v2((Math.floor(pos.x/this.tiledSize.width)+0.5)*this.tiledSize.width,
            (Math.floor(pos.y/this.tiledSize.height)+0.5)*this.tiledSize.height);
    },

    startGame: function()
    {
        storage.stopMusic();
        this.initSnake();

        this.state = "reday";
        this.gameTime = 0;
        this.currLevel = 0;

        this.gameDt = 0;
        this.btn_replay.stopAllActions();

        cc.qianqista.event("蛇求生关卡_"+this.level);
    },

    judgePass: function(pos)
    {
        var subp = cc.v2(640/2,1136/2);
        pos = pos.add(subp);
        pos.y = 1136-pos.y;
        var b = true;
        for(var i=0;i<this.tmxLayers.length;i++)
        {
            var tiledLayer = this.tmxLayers[i];
            var s = tiledLayer.getMapTileSize();
            var x = parseInt(pos.x/s.width);
            var y = parseInt(pos.y/s.height);
            var s2 = tiledLayer.getLayerSize();
            if(x<0 || x>=s2.width || y<0 || y>=s2.height)
            {
                b = false;
                break;
            }
            var tileGid = tiledLayer.getTileGIDAt(x,y);
            if(tileGid != 0)
            {
                b = false;
                break;
            }
        }

        return b;
    },


    gameWin: function()
    {
        if(this.state == "stop")
            return;

        cc.qianqista.event("蛇求生胜利关卡_"+this.level);

        this.state = "stop";
        this.level+=1;
        storage.setLevel(1,this.level);


        res.openUI("jiesuan");


        //storage.playSound(res.audio_1st);
    },

    nextLevel: function()
    {
        this.initMap();
        this.resetData();
    },

    willGameOver: function()
    {
        this.state = "stop";

        cc.qianqista.event("蛇求生失败关卡_"+this.level);
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

    playReplayAni: function()
    {
        if(this.btn_replay.getActionByTag(1))
            return;
        var ac = cc.repeatForever(cc.sequence(
            cc.scaleTo(0.2,1.3).easing(cc.easeSineIn()),
            cc.scaleTo(0.2,1).easing(cc.easeSineIn()),
            cc.delayTime(0.2)
        ));
        ac.setTag(1);
        this.btn_replay.runAction(ac);
    },


    updateLevel: function(dt)
    {
        this.gameTime+=dt;
        this.levelDt += dt;
        //var level = Math.floor(this.gameTime/60);
        //if(level>=config.carLevel.length) level = config.carLevel.length-1;
        //this.currLevel = level;
        if(this.levelDt>1)
        {
            this.levelDt = 0;

        }


    },


    click: function(event,data)
    {
        if(data == "home")
        {
            cc.director.loadScene("main");
        }
        else if(data == "top")
        {
            this.snake.toTop();
        }
        else if(data == "bottom")
        {
            this.snake.toBottom();
        }
        else if(data == "left")
        {
            this.snake.toLeft();
        }
        else if(data == "right")
        {
            this.snake.toRight();
        }
        else if(data == "replay")
        {
            this.resetData();
        }
        cc.log(data);
    },


    update: function(dt) {

    }
});