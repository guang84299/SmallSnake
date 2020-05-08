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

        if(cc.GAME.helpLevel>0)
            this.level = cc.GAME.helpLevel;
        cc.qianqista.showcallback = this.initEnd;

        this.initData();
        this.initUI();
        this.yindao = storage.getYinDao();
        this.replayNum = 0;
    },

    initEnd: function()
    {
        if(cc.qianqista.isUpdate && cc.qianqista.channel == "game" && cc.qianqista.fromid)
        {
            cc. qianqista.isUpdate = false;
            var snakeId = cc.qianqista.queryData.snakeId;
            var level = cc.qianqista.queryData.level;

            if(snakeId && level)
            {
                cc.GAME.helpLevel = level;
                cc.director.loadScene("game"+snakeId);
            }

        }
    },

    updateHelp: function()
    {
        if(cc.GAME.helpLevel==0 && !this.isHasHelp)
        {
            var self = this;
            storage.isHelp(1,this.level,function(r){
                if(r)
                {
                    res.setSpriteFrame("images/common/btn_ask",self.btn_share);
                    self.isHasHelp = true;
                }
            });
        }
    },


    initData: function()
    {
        this.state = "stop";
        this.coin = 0;
        this.tishiNum = -1;
        this.isShowTishi = false;
        this.isAdTishi = false;

        this.updateHelp();
    },


    initUI: function()
    {
        this.node_game = cc.find("Canvas/node_game");
        this.node_ui = cc.find("Canvas/node_ui");
        this.node_top = cc.find("Canvas/node_top");
        this.node_level = cc.find("lvbg/num",this.node_top).getComponent(cc.Label);
        this.coin_num = cc.find("coinbg/num",this.node_top).getComponent(cc.Label);
        this.score_num = cc.find("scorebg/num",this.node_top).getComponent(cc.Label);
        this.maps = cc.find("maps",this.node_game);
        this.btn_replay = cc.find("replay",this.node_ui);
        this.btn_share = cc.find("share",this.node_ui);
        this.btn_tishi = cc.find("tishi",this.node_ui);
        this.initMap();
        if(cc.sdk.is_iphonex())
        {
            var topNode = this.node_top;
            topNode.runAction(cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(function(){
                    var s = cc.view.getFrameSize();
                    var dpi = cc.winSize.width/s.width;
                    topNode.y -= dpi*30;
                })
            ));
        }

        this.updateUI();
        this.startGame();

        this.updateTishiAd();
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
        this.coin_num.string = storage.getCoin();
        this.score_num.string = storage.getScore();
    },

    addCoin: function(num)
    {
        this.coin += num;
        //storage.setCoin(storage.getCoin()+num);
        //this.updateUI();
    },

    getStar: function()
    {
        var star = 3;
        var data = cc.config.gameAwards[0];
        if(this.replayNum>=data.bad) star = 1;
        else if(this.replayNum>=data.fine) star = 2;
        return star;
    },

    initSnake: function()
    {
        this.tmxLayers = this.tmx.getComponent(cc.TiledMap).getLayers();
        this.tiledSize = this.tmx.getComponent(cc.TiledMap).getTileSize();
        this.snake = cc.find("snake",this.node_game).getComponent("Snake");
        this.snake.init(this.tiledSize);
        this.exit = cc.find("exit",this.node_game);
        this.exit_mask = cc.find("exit/mask",this.node_game);
        this.exit.zIndex = 99;

        var exit_ani = cc.find("exit_ani",this.node_game);
        exit_ani.stopAllActions();
        exit_ani.runAction(cc.repeatForever(cc.rotateBy(2,-180)));

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
        exit_ani.position = this.exit.position.add(cc.v2(0,0));

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
                var apple = res.playAnim("images/game1/apples",3,0.1,-1);
                //var apple = cc.instantiate(res["prefab_game1_apple"]);
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
        this.initTips();
    },

    initTips: function()
    {
        this.tipItems = [];
        var objGroup = cc.find("tipsLayer",this.tmx).getComponent(cc.TiledObjectGroup);
        var objs = objGroup.getObjects();

        var subp = cc.v2(640/2,1136/2);

        for(var i=0;i<objs.length;i++)
        {
            var obj = objs[i];
            var p = this.converToRoadPos(cc.v2(obj.x,obj.y)).sub(subp);

            var tip = cc.instantiate(res["prefab_game2_blockTip"]);
            tip.position = p;
            tip.setContentSize(cc.size(this.tiledSize.width*0.9,this.tiledSize.height*0.9));
            tip.parent = this.node_game;
            tip.zIndex = 99;
            var ang = 0;
            if(obj.dir == "up") ang = 180;
            else if(obj.dir == "down") ang = 0;
            else if(obj.dir == "left") ang = -90;
            else if(obj.dir == "right") ang = 90;
            tip.angle = ang;
            tip.active = false;
            this.tipItems.push(tip);
        }
        //cc.log(objGroup);
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

        cc.sdk.gameRecorderStop(function(){
            cc.sdk.gameRecorderStart();
        });
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

        if(cc.GAME.helpLevel==0)
        {
            this.level+=1;
            storage.setLevel(1,this.level);
        }


        cc.sdk.gameRecorderStop(function(){
            res.openUI("jiesuan",null,"win");
        });
        
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

        res.openUI("jiesuan",null,"fail");


        //storage.playMusic(res.audio_bgm);
    },

    showTips: function()
    {
        if(this.isShowTishi)
        {
            if(this.tishiNum>=0)
            {
                this.tipItems[this.tishiNum].runAction(cc.fadeOut(0.8));
                //this.tipItems[this.tishiNum].active = false;
            }

            this.tishiNum ++;
            if(this.tishiNum>=this.tipItems.length)
            {
                this.tishiNum = -1;
                this.isShowTishi = false;
                return;
            }
            this.tipItems[this.tishiNum].stopAllActions();
            this.tipItems[this.tishiNum].opacity = 255;
            this.tipItems[this.tishiNum].active = true;

            //cc.log(this.tishiNum,this.tipItems[this.tishiNum]);
        }
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

    updateTishiAd: function()
    {
        this.useShare = false;
        this.useCoin = false;
        var cost = cc.config.gameAwards[0].cost;
        var coin = storage.getCoin();
        if(coin>=cost)
        {
            this.useCoin = true;
            this.btn_tishi.getChildByName("share").active = false;
            this.btn_tishi.getChildByName("video").active = false;
            this.btn_tishi.getChildByName("coin").active = true;
            cc.find("coin/num",this.btn_tishi).getComponent(cc.Label).string = cost;
            return;
        }

        if(cc.GAME.share)
        {
            var rad = parseInt(cc.GAME.appleTishiAd);
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.btn_tishi.getChildByName("share").active = true;
                this.btn_tishi.getChildByName("video").active = false;
                this.btn_tishi.getChildByName("coin").active = false;
            }
            else
            {
                this.btn_tishi.getChildByName("share").active = false;
                this.btn_tishi.getChildByName("video").active = true;
                this.btn_tishi.getChildByName("coin").active = false;
            }
        }
    },


    click: function(event,data)
    {
        if(data == "home")
        {
            cc.sdk.gameRecorderStop(function(){
                cc.director.loadScene("main");
            });
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
            this.replayNum ++;
            this.resetData();
        }
        else if(data == "tishi")
        {
            var self = this;
            if(this.useCoin)
            {
                var cost = cc.config.gameAwards[0].cost;
                var coin = storage.getCoin();
                if(coin>=cost)
                {
                    coin -= cost;
                    storage.setCoin(coin);
                    storage.uploadCoin();
                    this.updateUI();
                    if(!this.isShowTishi)
                    {
                        this.isShowTishi = true;
                        this.schedule(this.showTips.bind(this),0.2,this.tipItems.length);
                    }
                }
                else
                {
                    cc.res.showToast("金币不足！");
                }
            }
            else
            {
                if(this.useShare)
                {
                    cc.sdk.share(function(r){
                        if(r)
                        {
                            self.isShowTishi = true;
                            self.schedule(self.showTips.bind(self),0.2,self.tipItems.length);
                        }
                    },"appleTishiAd");
                }
                else
                {
                    cc.sdk.showVedio(function(r){
                        if(r)
                        {
                            //self.isAdTishi = true;
                            self.isShowTishi = true;
                            self.schedule(self.showTips.bind(self),0.2,self.tipItems.length);
                        }
                    });
                }
            }
            this.updateTishiAd();
        }
        else if(data == "share")
        {
            if(this.isHasHelp)
            {
                this.isShowTishi = true;
                this.schedule(this.showTips.bind(this),0.2,this.tipItems.length);
            }
            else
            {
                cc.sdk.gameRecorderStop(function(){
                    cc.sdk.share();
                });
                // cc.sdk.share(null,"game&snakeId=1&level="+this.level);
            }

        }
        cc.log(data);
    },


    update: function(dt) {

    }
});