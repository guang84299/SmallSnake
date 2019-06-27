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
        this.level = storage.getLevel(2);
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
        this.tmx = cc.instantiate(res["prefab_game2_level_"+this.level]);
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

        this.snake = cc.find("snake",this.node_game).getComponent("Snake2");
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
        storage.setLevel(2,this.level);
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

    showTips: function()
    {
        if(!this.isShowTips)
        {
            this.isShowTips = true;

            for(var i=0;i<this.tipItems.length;i++)
            {
                this.tipItems[i].active = true;
            }
        }
        else
        {
            this.isShowTips = false;

            for(var i=0;i<this.tipItems.length;i++)
            {
                this.tipItems[i].active = false;
            }
        }
    },

    judgeWin: function()
    {
        var b = true;
        for(var j=0;j<this.roads.length;j++)
        {
            if(!this.roads[j].line)
            {
                b = false;
            }
            if(j == this.lastIndex)
                this.snake.updateBody(j,!this.roads[j].line);
            else
                this.snake.updateBody(j,this.roads[j].line);
        }
        if(this.points.length>0)
        {
            var p = this.points[this.points.length-1];
            var dir = 0;
            if(p.x<this.lastPoint.x)
                dir = 1;
            else if(p.x>this.lastPoint.x)
                dir = 2;
            if(p.y<this.lastPoint.y)
                dir = 3;
            else if(p.y>this.lastPoint.y)
                dir = 4;
            this.snake.updateHeadDir(dir);
        }
        else
        this.snake.updateHeadDir(this.lastDir);
        if(this.points.length == 1)
        {
            var p = this.points[0];
            var dir = 0;
            if(p.x<this.lastPoint.x)
                dir = 1;
            else if(p.x>this.lastPoint.x)
                dir = 2;
            if(p.y<this.lastPoint.y)
                dir = 3;
            else if(p.y>this.lastPoint.y)
                dir = 4;
            this.snake.updateTailDir(dir);
        }
        if(b) this.gameWin();
    },

    judgePos: function(pos)
    {
        var subp = cc.v2(this.mapSize.width*this.tiledSize.width/2,
            this.mapSize.height*this.tiledSize.height/2);
        var p1 = pos.add(subp);
        var w = this.tiledSize.width/2;
        var min = Math.min(this.tiledSize.width,this.tiledSize.height)/2;
        for(var i=0;i<this.roads.length;i++)
        {
            var r = this.roads[i];
            var p2 = cc.v2(r.x, r.y);
            var dis = p2.sub(p1).mag();

            if(dis<min)
            {
                if(!this.lastPoint)
                {
                    this.lastPoint = p2;
                    this.lastIndex = i;
                    this.lastDir = 0;
                    this.firstIndex = i;
                    r.line = true;
                    if(p2.x>this.lastPoint.x)
                        this.lastDir = 1;
                    else if(p2.x<this.lastPoint.x)
                        this.lastDir = 2;
                    if(p2.y>this.lastPoint.y)
                        this.lastDir = 3;
                    else if(p2.y<this.lastPoint.y)
                        this.lastDir = 4;
                }
                else
                {
                    //不允许斜边
                    if(p2.x!=this.lastPoint.x && p2.y!=this.lastPoint.y)
                        return this.snake.head.position;
                    //不允许跨格
                    if(this.lastPoint.sub(p2).mag()>w*2)
                        return this.snake.head.position;
                    //过滤相同点
                    if(p2.x==this.lastPoint.x && p2.y==this.lastPoint.y)
                        return this.snake.head.position;

                    var r2 = this.roads[this.lastIndex];
                    //不允许回退除了上个节点外的节点
                    if(r.line && this.points.length>0)
                    {
                        var lp = this.points[this.points.length-1];
                        if(p2.x == lp.x && p2.y == lp.y)
                        {
                            this.points.splice(this.points.length-1,1);
                        }
                        else
                        {
                            return this.snake.head.position;
                        }
                    }
                    else
                    {
                        if(this.points.length>0)
                        {
                            var lp = this.points[this.points.length-1];
                            if(p2.x!=lp.x || p2.y!=lp.y)
                            {
                                r2.line = true;
                                this.lastDir = 0;
                            }
                        }
                        else
                        {
                            this.lastDir = 0;
                            r2.line = true;
                        }

                        //cc.log(this.points,p2);
                        this.points.push(this.lastPoint);
                    }

                    //右
                    if(p2.x>this.lastPoint.x)
                    {
                        if(this.lastDir == 3 || this.lastDir == 4)
                        {
                            this.lastDir = 0;
                            if(!r.line) r2.line = true;
                        }
                        r.line = (this.lastDir == 0 || this.lastDir == 1) ? r2.line : !r2.line;
                        this.lastDir = 1;
                    }
                    else if(p2.x<this.lastPoint.x)
                    {
                        if(this.lastDir == 3 || this.lastDir == 4)
                        {
                            this.lastDir = 0;
                            if(!r.line) r2.line = true;
                        }
                        r.line = (this.lastDir == 0 || this.lastDir == 2) ? r2.line : !r2.line;
                        this.lastDir = 2;
                    }

                    //上
                    if(p2.y>this.lastPoint.y)
                    {
                        if(this.lastDir == 1 || this.lastDir == 2)
                        {
                            this.lastDir = 0;
                            if(!r.line) r2.line = true;
                        }
                        r.line = (this.lastDir == 0 || this.lastDir == 3) ? r2.line : !r2.line;
                        this.lastDir = 3;
                    }
                    else if(p2.y<this.lastPoint.y)
                    {
                        if(this.lastDir == 1 || this.lastDir == 2)
                        {
                            this.lastDir = 0;
                            if(!r.line) r2.line = true;
                        }
                        r.line = (this.lastDir == 0 || this.lastDir == 4) ? r2.line : !r2.line;
                        this.lastDir = 4;
                    }
                    //cc.log(r.line,r2.line);
                    if(r.line != r2.line)
                    {
                        r2.line = !r2.line;
                    }

                    this.lastPoint = p2;
                    this.lastIndex = i;

                    if(i == this.firstIndex) r.line = true;
                }
                pos = p2.sub(subp);

                return pos;
            }
        }
        return this.snake.head.position;
    },

    touchStart: function(event)
    {
        if(this.state == "start")
        {
            this.snake.sel = false;

            var pos = event.getLocation();
            var p = pos.sub(cc.v2(cc.winSize.width/2,cc.winSize.height/2));
            var dis = p.sub(this.snake.head.position).mag();
            if(dis<this.tiledSize.width/2)
            {
                p = this.judgePos(p,p);
                this.snake.head.position = p;
                this.snake.sel = true;
                this.judgeWin();
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
                p = this.judgePos(p);
                this.snake.head.position = p;
                if(this.lastPoint.x != p.x || this.lastPoint.y != p.y)
                    this.judgeWin();
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
        else if(data == "tip")
        {
            this.showTips();
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