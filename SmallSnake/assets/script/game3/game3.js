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
        cc.myscene = "game3";
        this.level = storage.getLevel(3);
        if(cc.GAME.helpLevel>0)
            this.level = cc.GAME.helpLevel;
        cc.qianqista.showcallback = this.initEnd;
        this.initData();
        this.initUI();
        this.addListener();
        this.yindao = storage.getYinDao();


    },


    initData: function()
    {
        this.state = "stop";
        this.coin = 0;
        this.eatCoinNum = 0;

        this.updateHelp();
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
            storage.isHelp(3,this.level,function(r){
                if(r)
                {
                    res.setSpriteFrame("images/common/btn_ask",self.btn_share);
                    self.isHasHelp = true;
                }
            });
        }
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
        this.rocker = cc.find("rocker",this.node_ui);
        this.rocker_ball = cc.find("ball",this.rocker);
        //this.rocker.active = false;

        this.virkey = cc.find("virkey",this.node_ui);
        this.virkey_up = cc.find("top",this.virkey);
        this.virkey_down = cc.find("down",this.virkey);
        this.virkey_left = cc.find("left",this.virkey);
        this.virkey_right = cc.find("right",this.virkey);

        this.virkeys = [this.virkey_up,this.virkey_down,this.virkey_left,this.virkey_right];

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
        if(this.level>config.levelNum3) this.level = config.levelNum3;
        this.tmx = new cc.Node();
        var tmx = this.tmx.addComponent(cc.TiledMap);
        tmx.tmxAsset = res["game3_level_"+this.level];
        this.maps.addChild(this.tmx);
    },

    resetData: function()
    {
        this.initMap();
        this.updateUI();
        this.initData();
        this.startGame();
    },

    updateUI: function()
    {
        this.node_level.string = this.level+"";
        this.coin_num.string = storage.getCoin();
        this.score_num.string = storage.getScore();
        //this.coinnum.string = storage.castNum(storage.getCoin());
    },

    addCoin: function(num)
    {
        num = 10;
        this.coin += num;
        storage.setCoin(storage.getCoin()+num);
        this.eatCoinNum ++;
        //this.updateUI();
    },

    getStar: function()
    {
        var pre = this.eatCoinNum/this.coinNum;
        var star = 3;
        var data = cc.config.gameAwards[2];
        if(pre<=data.bad) star = 1;
        else if(pre<=data.fine) star = 2;
        return star;
    },

    initSnake: function()
    {
        this.tiledMap = this.tmx.getComponent(cc.TiledMap);
        this.tiledSize = this.tiledMap.getTileSize();
        this.mapSize = this.tiledMap.getMapSize();
        this.layer = this.tiledMap.getLayer("layer2").getComponent(cc.TiledLayer);
        this.layer3 = this.tiledMap.getLayer("layer3").getComponent(cc.TiledLayer);

        var subp = cc.v2(this.mapSize.width*this.tiledSize.width/2,
            this.mapSize.height*this.tiledSize.height/2);

        var objGroup = cc.find("objLayer",this.tmx).getComponent(cc.TiledObjectGroup);
        var obj1 = objGroup.getObject("startPos");

        var startpos = this.converToRoadPos(cc.v2(obj1.x,obj1.y));



        this.snake = cc.find("snake",this.node_game).getComponent("Snake3");
        this.snake.init(this.tiledSize,this.mapSize);

        var pos = startpos.sub(subp);

        this.snake.initPos(pos);

        //获取激光
        this.emitters = [];

        var objs = objGroup.getObjects();
        for(var i=0;i<objs.length;i++)
        {
            var obj = objs[i];
            if(obj.name == "jiguang")
            {
                var emitterAni = cc.instantiate(res["prefab_game3_emitterAni"]);
                emitterAni.position = this.converToRoadPos(cc.v2(obj.x,obj.y)).sub(subp);
                emitterAni.parent = this.maps;
                emitterAni.dir = obj.dir;
                emitterAni.pos = emitterAni.position;
                this.emitters.push(emitterAni);
            }
        }

        this.updateEmitter();


        //获取金币个数
        this.coinNum = 0;
        var coinId = config.getTiledId("coin");
        for(var i=0;i<this.mapSize.width;i++)
        {
            for(var j=0;j<this.mapSize.height;j++)
            {
                var tileGid = this.layer.getTileGIDAt(i,j);
                if(coinId == tileGid)
                {
                    this.coinNum++;
                }
            }
        }

        //this.updatevirkey();
    },

    updatevirkey: function()
    {
        var maxGid = 0;
        var n = Math.floor(this.mapSize.height/2) + 1;
        for(var j=n;j<this.mapSize.height;j++)
        {
            var b = false;
            for(var i=0;i<this.mapSize.width;i++)
            {
                var tileGid = this.layer.getTileGIDAt(i,j);
                if(tileGid>0)
                {
                    b = true;
                    cc.log(i,tileGid);
                    break;
                }
            }
            if(!b)
            {
                maxGid = j;
                break;
            }
        }
        if(maxGid*this.tiledSize.height<900)
        {
            cc.find("virkey2",this.node_ui).active = false;

            this.virkey = cc.find("virkey",this.node_ui);
            this.virkey_up = cc.find("top",this.virkey);
            this.virkey_down = cc.find("down",this.virkey);
            this.virkey_left = cc.find("left",this.virkey);
            this.virkey_right = cc.find("right",this.virkey);
            this.virkey.active = true;
            this.virkeys = [this.virkey_up,this.virkey_down,this.virkey_left,this.virkey_right];
        }
        else
        {
            cc.find("virkey",this.node_ui).active = false;
            this.virkey = cc.find("virkey2",this.node_ui);
            this.virkey_up = cc.find("top",this.virkey);
            this.virkey_down = cc.find("down",this.virkey);
            this.virkey_left = cc.find("left",this.virkey);
            this.virkey_right = cc.find("right",this.virkey);
            this.virkey.active = true;
            this.virkeys = [this.virkey_up,this.virkey_down,this.virkey_left,this.virkey_right];
        }
    },

    startGame: function()
    {
        storage.stopMusic();
        this.initSnake();

        this.state = "start";
        this.gameTime = 0;
        this.currLevel = 0;

        this.gameDt = 0;
        this.node.stopAllActions();

        cc.qianqista.event("爆炸蛇关卡_"+this.level);

        if(this.level<=9)
        {
            res.openUI("help",null,res.conf_pilot[this.level-1].text);
        }
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

        cc.qianqista.event("爆炸蛇胜利关卡_"+this.level);

        this.state = "stop";
        this.rocker.active = false;
        this.dir = "";
        if(cc.GAME.helpLevel==0)
        {
            this.level+=1;
            storage.setLevel(3,this.level);
        }


        res.openUI("jiesuan",null,"win");
    },

    nextLevel: function()
    {
        this.resetData();
    },

    willGameOver: function()
    {
        if(this.state == "stop")
            return;

        cc.qianqista.event("爆炸蛇失败关卡_"+this.level);

        this.state = "stop";

        var self = this;
        var node = res.playAnim("images/game3/die",16,0.1,1,function(){
            var node = res.playAnim("images/game3/die2",7,0.1,1,function(){
                self.resetData();
            },true);
            node.position = self.snake.head.position;
            node.zIndex = 100;
            self.maps.addChild(node);

        },true);
        node.anchorY = 0;
        node.position = this.snake.head.position;
        node.zIndex = 100;
        this.maps.addChild(node);
        this.snake.head.active = false;


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


    judgeWin: function()
    {

    },

    getTiledGid: function(pos)
    {
        var subp = cc.v2(this.mapSize.width*this.tiledSize.width/2,
            this.mapSize.height*this.tiledSize.height/2);
        var p = pos.add(subp);
        var x = Math.floor(p.x/this.tiledSize.width);
        var y = this.mapSize.height - Math.floor(p.y/this.tiledSize.height) - 1;

        if(x>=this.mapSize.width || x < 0 || y < 0 || y>=this.mapSize.height)
            return 0;
        var tileGid =  this.layer.getTileGIDAt(x,y);
        return tileGid;
    },

    getTiledPos: function(pos)
    {
        var subp = cc.v2(this.mapSize.width*this.tiledSize.width/2,
            this.mapSize.height*this.tiledSize.height/2);
        var p = pos.add(subp);
        var x = Math.floor(p.x/this.tiledSize.width);
        var y = this.mapSize.height - Math.floor(p.y/this.tiledSize.height) - 1;
        return cc.v2(x,y);
    },

    getTiled: function(pos)
    {
        var p = this.getTiledPos(pos);
        return this.layer.getTiledTileAt(p.x, p.y,true);
    },

    getTiled3: function(pos)
    {
        var p = this.getTiledPos(pos);
        return this.layer3.getTiledTileAt(p.x, p.y,true);
    },

    eatCoin: function(pos)
    {
        var tiled = this.getTiled(pos);
        tiled.gid = 0;

        var tiled2 = this.getTiled3(pos.add(cc.v2(0,this.tiledSize.height)));
        tiled2.gid = 0;
        //tiled.node.position = pos.add(cc.v2(-this.tiledSize.width/2,-this.tiledSize.height/2));
        //tiled.node.runAction(cc.scaleTo(0.5,0));
        //cc.log(tiled.node);
        this.addCoin(1);
    },

    eatExit: function(pos)
    {
        var tiled = this.getTiled(pos);
        tiled.gid = 0;
    },


    eatKey: function(pos)
    {
        var tiled = this.getTiled(pos);
        tiled.gid = 0;

        var gid = config.getTiledId("lock");
        for(var i=0;i<this.mapSize.width;i++)
        {
            for(var j=0;j<this.mapSize.height;j++)
            {
                var tileGid =  this.layer.getTileGIDAt(i,j);
                if(tileGid == gid)
                {
                    tiled = this.layer.getTiledTileAt(i, j,true);
                    tiled.gid = 0;
                    break;
                }
            }
        }
    },

    jedgeBoom: function(p,p2)
    {
        var self = this;
        var gid = this.getTiledGid(p);
        if(gid>0)
        {
            var name = config.getTiledName(gid-1);
            if(name == "brick")
            {
                var tiled = this.getTiled(p);
                tiled.gid = 0;

                var node = res.playAnim("images/game3/brick",8,0.05,1,null,true);
                node.position = p;
                node.zIndex = 100;
                this.maps.addChild(node);
            }
            else if(name == "bomb")
            {
                var tiled = this.getTiled(p);
                tiled.gid = 0;
                this.bombBoom(p);

                var boom = res.playAnim("images/game3/tailboom",16,0.05,1,null,true);
                boom.position = p;
                boom.zIndex = 100;
                boom.parent = this.maps;
            }
            else if(name == "tnt")
            {
                var tiled = this.getTiled(p);
                tiled.gid = 0;

                var tiled2 = this.getTiled3(p.add(cc.v2(0,this.tiledSize.height)));
                tiled2.gid = 0;

                this.tntBoom(p);

                var boom = res.playAnim("images/game3/tailboom",16,0.05,1,null,true);
                boom.position = p;
                boom.zIndex = 100;
                boom.parent = this.maps;
            }
            else if(name == "damStone")
            {
                var tiled = this.getTiled(p);
                tiled.gid = 0;

                var node = res.playAnim("images/game3/stone",8,0.08,1,null,true);
                node.position = p;
                node.zIndex = 100;
                this.maps.addChild(node);
            }
            else if(name == "intactStone")
            {
                var tiled = this.getTiled(p);
                tiled.gid = config.getTiledId("damStone");
                tiled.node.position = p.add(cc.v2(-this.tiledSize.width/2,-this.tiledSize.height/2));
            }
            else if(name == "moveStone")
            {
                var p3 = cc.v2(0,0);
                if(p.x>p2.x)
                    p3 = cc.v2(this.tiledSize.width,0);
                else if(p.x<p2.x)
                    p3 = cc.v2(-this.tiledSize.width,0);
                else if(p.y>p2.y)
                    p3 = cc.v2(0,this.tiledSize.height);
                else if(p.y<p2.y)
                    p3 = cc.v2(0,-this.tiledSize.height);
                p3 = p.add(p3);
                var gid2 = this.getTiledGid(p3);
                if(gid2 == 0)
                {
                    if(!this.snake.judgeHaveSnake(p3))
                    {
                        var tiled = this.getTiled(p);
                        tiled.gid = 0;
                        tiled = this.getTiled(p3);
                        tiled.gid = config.getTiledId("moveStone");
                        tiled.node.position = p3.add(cc.v2(-this.tiledSize.width/2,-this.tiledSize.height/2));
                    }
                }
            }
            else if(name == "chest")
            {
                var tiled = this.getTiled(p);
                tiled.gid = config.getTiledId("coin");
                tiled.node.position = p.add(cc.v2(-this.tiledSize.width/2,-this.tiledSize.height/2));

                var node = res.playAnim("images/game3/chest",9,0.08,1,null,true);
                node.position = p;
                node.zIndex = 100;
                this.maps.addChild(node);
            }

            this.updateEmitter();
        }
    },

    tailBoom: function(pos)
    {
        //四个方向
        var p1 = pos.add(cc.v2(0,this.tiledSize.height));
        var p2 = pos.add(cc.v2(0,-this.tiledSize.height));
        var p3 = pos.add(cc.v2(this.tiledSize.width,0));
        var p4 = pos.add(cc.v2(-this.tiledSize.width,0));

        var ps = [p1,p2,p3,p4];
        for(var i=0;i<ps.length;i++)
        {
            var p = ps[i];
            this.jedgeBoom(p,pos);
        }

    },

    //普通炸弹
    bombBoom: function(pos)
    {
        //多个格子
        var p1 = pos.add(cc.v2(0,this.tiledSize.height));
        var p2 = pos.add(cc.v2(0,-this.tiledSize.height));
        var p3 = pos.add(cc.v2(this.tiledSize.width,0));
        var p4 = pos.add(cc.v2(-this.tiledSize.width,0));

        var ps = [p1,p2,p3,p4];
        var self = this;
        this.node.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(function(){
                for(var i=0;i<ps.length;i++)
                {
                    var p = ps[i];
                    self.jedgeBoom(p,pos);
                }
            })
        ));
    },

    //超级炸弹
    tntBoom: function(pos)
    {
        //多个格子
        var p1 = pos.add(cc.v2(0,this.tiledSize.height));
        var p2 = pos.add(cc.v2(0,-this.tiledSize.height));
        var p3 = pos.add(cc.v2(this.tiledSize.width,0));
        var p4 = pos.add(cc.v2(-this.tiledSize.width,0));

        var p5 = pos.add(cc.v2(this.tiledSize.width,this.tiledSize.height));
        var p6 = pos.add(cc.v2(-this.tiledSize.width,this.tiledSize.height));
        var p7 = pos.add(cc.v2(-this.tiledSize.width,-this.tiledSize.height));
        var p8 = pos.add(cc.v2(this.tiledSize.width,this.tiledSize.height));

        var p9 = pos.add(cc.v2(0,this.tiledSize.height*2));
        var p10 = pos.add(cc.v2(0,-this.tiledSize.height*2));
        var p11= pos.add(cc.v2(this.tiledSize.width*2,0));
        var p12 = pos.add(cc.v2(-this.tiledSize.width*2,0));

        var ps = [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12];

        var self = this;
        this.node.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(function(){
                for(var i=0;i<ps.length;i++)
                {
                    var p = ps[i];
                    self.jedgeBoom(p,pos);
                }
            })
        ));

    },

    updateEmitter: function()
    {
        this.emitterPoints = [];
        var tntId = config.getTiledId("tnt");
        var bombId = config.getTiledId("bomb");
        for(var i=0;i<this.emitters.length;i++)
        {
            var emitter = this.emitters[i];
            if(emitter.dir == "right")
            {
                emitter.angle = 90;
                emitter.x = emitter.pos.x + this.tiledSize.width/2;
                //查找向右的坐标
                var b = true;
                var n = 1;

                while(b && n<this.mapSize.width)
                {
                    var p = emitter.pos.add(cc.v2(this.tiledSize.width*n,0));
                    var gid = this.getTiledGid(p);
                    if(gid == 0)
                    {
                        this.emitterPoints.push(p);
                        n++;
                    }
                    else if(gid == tntId || gid == bombId)
                    {
                        this.emitterPoints.push(p);
                        this.jedgeBoom(p);
                        b = false;
                    }
                    else
                    {
                        b = false;
                        n--;
                    }
                }

                emitter.scaleY = this.tiledSize.width*n/emitter.height;
            }
            else if(emitter.dir == "left")
            {
                emitter.angle = -90;
                emitter.x = emitter.pos.x - this.tiledSize.width/2;
                //查找坐标
                var b = true;
                var n = 1;
                while(b && n<this.mapSize.width)
                {
                    var p = emitter.pos.add(cc.v2(-this.tiledSize.width*n,0));
                    var gid = this.getTiledGid(p);
                    if(gid == 0)
                    {
                        this.emitterPoints.push(p);
                        n++;
                    }
                    else if(gid == tntId || gid == bombId)
                    {
                        this.emitterPoints.push(p);
                        this.jedgeBoom(p);
                        b = false;
                    }
                    else
                    {
                        b = false;
                        n--;
                    }
                }

                emitter.scaleY = this.tiledSize.width*n/emitter.height;
            }
            else if(emitter.dir == "up")
            {
                emitter.angle = 180;
                emitter.y = emitter.pos.y + this.tiledSize.height/2;
                //查找坐标
                var b = true;
                var n = 1;
                while(b && n<this.mapSize.width)
                {
                    var p = emitter.pos.add(cc.v2(0,this.tiledSize.height*n));
                    var gid = this.getTiledGid(p);
                    if(gid == 0)
                    {
                        this.emitterPoints.push(p);
                        n++;
                    }
                    else if(gid == tntId || gid == bombId)
                    {
                        this.emitterPoints.push(p);
                        this.jedgeBoom(p);
                        b = false;
                    }
                    else
                    {
                        b = false;
                        n--;
                    }
                }

                emitter.scaleY = this.tiledSize.height*n/emitter.height;
            }
            else if(emitter.dir == "down")
            {
                emitter.angle = 0;
                emitter.y = emitter.pos.y - this.tiledSize.height/2;
                //查找坐标
                var b = true;
                var n = 1;
                while(b && n<this.mapSize.width)
                {
                    var p = emitter.pos.add(cc.v2(0,-this.tiledSize.height*n));
                    var gid = this.getTiledGid(p);
                    if(gid == 0)
                    {
                        this.emitterPoints.push(p);
                        n++;
                    }
                    else if(gid == tntId || gid == bombId)
                    {
                        this.emitterPoints.push(p);
                        this.jedgeBoom(p);
                        b = false;
                    }
                    else
                    {
                        b = false;
                        n--;
                    }
                }

                emitter.scaleY = this.tiledSize.height*n/emitter.height;
            }
        }
    },

    judgePassEmitter: function(pos)
    {
        if(this.emitterPoints && this.emitterPoints.length>0)
        {
            var min = Math.min(this.tiledSize.height/2,this.tiledSize.width/2);
            for(var i=0;i<this.emitterPoints.length;i++)
            {
                var p = this.emitterPoints[i];
                var dis = p.sub(pos).mag();
                if(dis<min) return false;
            }
        }
        return true;
    },

    move: function(dir)
    {
        var ang = 180/Math.PI * dir.signAngle(cc.v2(0,1));
        if(ang>-45 && ang < 45)
        {
            this.dir = "top";
        }
        else if(ang<-135 || ang > 135)
        {
            this.dir = "down";
        }
        else if(ang>-135 && ang < -45)
        {
            this.dir = "left";
        }
        else if(ang<135 && ang > 45)
        {
            this.dir = "right";
        }

    },

    showTips: function()
    {
        //res.showToast(res.conf_tips[this.level-1].text);
        res.openUI("help",null,res.conf_tips[this.level-1].text);
    },


    touchStart: function(event)
    {
        if(this.state == "start")
        {
            var pos = event.getLocation();
            var p = pos.sub(cc.v2(cc.winSize.width/2,cc.winSize.height/2));
            //this.rocker.active = true;
            //this.rocker.position = p;
            //this.rocker_ball.position = cc.v2(0,0);
            this.lastPoint = pos;
            this.dir = "";


            for(var i=0;i<this.virkeys.length;i++)
            {
                var key = this.virkeys[i];
                var dis = p.sub(key.position.add(this.virkey.position)).mag();
                if(dis<100)
                {
                    this.dir = key.name;
                    key.scale = 0.9;

                    cc.sdk.vibrate();
                    break;
                }
            }
        }
    },
    touchMove: function(event)
    {
        //if(this.state == "start")
        //{
        //    var pos = event.getLocation();
        //    var dis = pos.sub(this.lastPoint).mag();
        //    if(dis>10)
        //    {
        //        var dir = pos.sub(this.lastPoint).normalize();
        //        if(dis>this.rocker.width/2)
        //            dis = this.rocker.width/2;
        //        this.rocker_ball.position = dir.mul(dis);
        //        this.move(dir);
        //    }
        //}
    },
    touchUp: function(event)
    {

        //if(this.state == "start")
        //{
        //
        //}
        //this.rocker.active = false;
        //this.rocker_ball.position = cc.v2(0,0);
        this.dir = "";

        for(var i=0;i<this.virkeys.length;i++)
        {
            var key = this.virkeys[i];
            key.scale =1;
        }
    },

    updateTishiAd: function()
    {
        this.useShare = false;
        this.useCoin = false;
        var cost = cc.config.gameAwards[2].cost;
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
            var rad = parseInt(cc.GAME.baozhaTishiAd);
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
            cc.director.loadScene("main");
        }
        else if(data == "replay")
        {
            this.resetData();
        }
        else if(data == "tishi")
        {
            var self = this;
            if(this.useCoin)
            {
                var cost = cc.config.gameAwards[2].cost;
                var coin = storage.getCoin();
                if(coin>=cost)
                {
                    coin -= cost;
                    storage.setCoin(coin);
                    storage.uploadCoin();
                    this.updateUI();
                    this.showTips();
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
                            self.showTips();
                        }
                    },"baozhaTishiAd");
                }
                else
                {
                    cc.sdk.showVedio(function(r){
                        if(r)
                        {
                            self.showTips();
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
                this.showTips();
            }
            else
            {
                cc.sdk.share(null,"game&snakeId=3&level="+this.level);
            }

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

        if(this.state == "start")
        {
            if(this.dir != "")
            {
                this.snake.toMove(this.dir);
            }
        }
    }
});