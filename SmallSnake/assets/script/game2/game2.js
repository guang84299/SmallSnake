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
        cc.myscene = "game2";
        this.level = storage.getLevel(2);
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
            storage.isHelp(2,this.level,function(r){
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
        if(this.level>config.levelNum2) this.level = config.levelNum2;
        this.tmx = new cc.Node();
        var tmx = this.tmx.addComponent(cc.TiledMap);
        tmx.tmxAsset = res["game2_level_"+this.level];
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
        var data = cc.config.gameAwards[1];
        var time = (new Date().getTime() - this.gameTime)/1000;
        if(time>=data.bad) star = 1;
        else if(time>=data.fine) star = 2;
        return star;
    },

    initSnake: function()
    {
        this.tiledMap = this.tmx.getComponent(cc.TiledMap);
        this.tiledSize = this.tiledMap.getTileSize();
        this.mapSize = this.tiledMap.getMapSize();

        this.roads = [];
        this.blocks = [];
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
            block.setContentSize(cc.size(this.tiledSize.width*0.9,this.tiledSize.height*0.9));
            block.parent = this.maps;
            this.blocks.push(block);

            //var l = new cc.Node();
            //var lb = l.addComponent(cc.Label);
            //lb.string = i;
            //l.parent = block;

            var tip = cc.instantiate(res["prefab_game2_blockTip"]);
            tip.position = pos.sub(subp);
            tip.setContentSize(cc.size(this.tiledSize.width*0.9,this.tiledSize.height*0.9));
            tip.parent = this.maps;
            var ang = 0;
            if(obj.dir == "up") ang = 180;
            else if(obj.dir == "down") ang = 0;
            else if(obj.dir == "left") ang = -90;
            else if(obj.dir == "right") ang = 90;
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
        this.gameTime = new Date().getTime();
        this.currLevel = 0;

        this.gameDt = 0;
        this.snake.sel = false;
        this.points = [];
        this.tishiNum = 0;

        cc.qianqista.event("画蛇关卡_"+this.level);
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

        cc.qianqista.event("画蛇胜利关卡_"+this.level);

        this.state = "stop";

        this.snake.sel = false;
        if(cc.GAME.helpLevel==0)
        {
            this.level+=1;
            storage.setLevel(2,this.level);
        }


        res.openUI("jiesuan",null,"win");
    },

    nextLevel: function()
    {
        this.initMap();
        this.resetData();
    },

    willGameOver: function()
    {
        this.state = "stop";
        cc.qianqista.event("画蛇失败关卡_"+this.level);
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
        this.tishiNum += 4;
        for(var i=0;i<this.tipItems.length;i++)
        {
            if(i>=this.tishiNum)
                break;
            this.tipItems[i].active = true;
        }
    },

    showTips2: function()
    {
        for(var i=0;i<this.tipItems.length;i++)
        {
            this.tipItems[i].active = true;
        }
    },

    updateDir: function()
    {

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

            //if(j == this.lastIndex)
            //    this.snake.updateBody(j,!this.roads[j].line);
            //else
            //    this.snake.updateBody(j,this.roads[j].line);
        }
        if(this.points.length>1)
        {
            var p = this.points[this.points.length-1].pos;
            var p2 = this.points[this.points.length-2].pos;
            var dir = 0;
            if(p.x<p2.x)
                dir = 1;
            else if(p.x>p2.x)
                dir = 2;
            if(p.y<p2.y)
                dir = 3;
            else if(p.y>p2.y)
                dir = 4;
            this.snake.updateHeadDir(dir);
        }
        else
        this.snake.updateHeadDir(3);
        if(this.points.length > 1)
        {
            var p = this.points[0].pos;
            var p2 = this.points[1].pos;
            var dir = 0;
            if(p.x<p2.x)
                dir = 1;
            else if(p.x>p2.x)
                dir = 2;
            if(p.y<p2.y)
                dir = 3;
            else if(p.y>p2.y)
                dir = 4;
            this.snake.updateTailDir(dir);
        }
        else
            this.snake.updateTailDir(4);
        if(b) this.gameWin();
    },

    judgePos: function(pos,isMove)
    {
        var subp = cc.v2(this.mapSize.width*this.tiledSize.width/2,
            this.mapSize.height*this.tiledSize.height/2);
        var w = this.tiledSize.width/2;
        var p1 = pos.add(subp);
        var min = Math.min(this.tiledSize.width,this.tiledSize.height)/2;
        for(var i=0;i<this.roads.length;i++)
        {
            var r = this.roads[i];
            var p2 = cc.v2(r.x, r.y);
            var dis = p2.sub(p1).mag();

            if(dis<min)
            {
                //如果当前格子选中
                if(r.line)
                {
                    //if(!isRemove) return;
                    var num = -1;
                    for(var j=0;j<this.points.length;j++)
                    {
                        var item = this.points[j];
                        var dis = item.pos.sub(p2).mag();
                        if(dis<min)
                        {
                            num = j;
                            break;
                        }
                    }
                    //判断不是最后一格 就删除
                    if(num != -1)
                    {
                        for(var j=this.points.length-1;j>num;j--)
                        {
                            this.roads[this.points[j].index].line = false;
                            if(isMove)
                            {
                                this.points[j].isMove = isMove;
                                this.points[j].lastIndex = this.points[j-1].index;
                                this.removePath(this.points[j],isMove);
                            }
                            else
                            {
                                this.points[j-1].isMove = isMove;
                                this.points[j-1].lastIndex = this.points[j-1].index;
                                this.removePath(this.points[j-1],isMove);
                            }
                        }
                        this.points.splice(num+1,this.points.length-num-1);
                    }



                    //if(isMove)
                    //{
                    //    if(this.points.length>1)
                    //    {
                    //        var item = this.points[this.points.length-2];
                    //        var dis = item.pos.sub(p2).mag();
                    //        if(dis<min)
                    //        {
                    //            var item2 = this.points[this.points.length-1];
                    //            this.roads[item2.index].line = false;
                    //            item2.lastIndex = item.index;
                    //            item2.isMove = true;
                    //            this.removePath(item2,isMove);
                    //            this.points.splice(this.points.length-1,1);
                    //        }
                    //
                    //    }
                    //
                    //}
                    //else
                    //{
                    //    var num = -1;
                    //    for(var j=0;j<this.points.length;j++)
                    //    {
                    //        var item = this.points[j];
                    //        var dis = item.pos.sub(p2).mag();
                    //        if(dis<min)
                    //        {
                    //            num = j;
                    //            break;
                    //        }
                    //    }
                    //    //判断不是最后一格 就删除
                    //    if(num != -1)
                    //    {
                    //        for(var j=this.points.length-1;j>num;j--)
                    //        {
                    //            this.roads[this.points[j].index].line = false;
                    //            this.points[j-1].isMove = false;
                    //            this.removePath(this.points[j-1],isMove);
                    //        }
                    //        this.points.splice(num+1,this.points.length-num-1);
                    //    }
                    //}
                }
                else
                {
                    //如果还没选择，直接加入列表
                    if(this.points.length==0)
                    {
                        //判断是否为开始点附近的格子
                        var lastPos = cc.v2(this.roads[0].x,this.roads[0].y);
                        var dis = lastPos.sub(p2).mag();
                        if(dis<=min*2)
                        {
                            this.roads[0].line = true;

                            var item = {pos:lastPos,index:0};
                            this.points.push(item);
                            this.addPath(item);

                        }
                    }
                    //判断是否是相邻的格子
                    if(this.points.length>0)
                    {
                        var lastItem = this.points[this.points.length-1];
                        var lastPos = lastItem.pos;
                        var dis = lastPos.sub(p2).mag();
                        if(dis<=min*2 && dis > min)
                        {
                            r.line = true;

                            var item = {pos:p2,index:i};
                            this.points.push(item);
                            this.addPath(item);

                        }
                    }

                }

                this.lastPoint = p2;
            }
        }
    },

    addPath: function(item)
    {
        if(this.points.length>1)
        {
            var i = item.index;
            if(i==0) i = 1;
            var block = this.blocks[i-1];
            block.stopAllActions();
            block.scale = 1;
            block.runAction(cc.scaleTo(0.1,0.8).easing(cc.easeSineIn()));

            //cc.log("i=",i,this.points);
        }
        this.snake.playAni(item,true);
    },

    removePath: function(item,isMove)
    {
        if(this.points.length>0)
        {
            for(var i=0;i<this.blocks.length;i++)
            {
                this.blocks[i].stopAllActions();
                this.blocks[i].scale = 1;
            }
            var i = item.index;
            if(i==0) i = 1;
            var block = this.blocks[i-1];
            block.stopAllActions();
            block.scale = 0.8;
            block.runAction(cc.scaleTo(0.1,1).easing(cc.easeSineIn()));

            //cc.log("i=",i,this.points);
            //if(isMove)
            //{
            //
            //}
            //else
            //{
            //    for(var i=0;i<this.blocks.length;i++)
            //    {
            //        this.blocks[i].stopAllActions();
            //        this.blocks[i].scale = 1;
            //    }
            //}

        }
        this.snake.playAni(item,false);
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
                this.judgePos(p);
                this.snake.sel = true;
            }
            else
            {
                this.judgePos(p);
                this.snake.sel = true;
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
                this.judgePos(p,true);
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

    updateTishiAd: function()
    {
        this.useShare = false;
        this.useCoin = false;
        var cost = cc.config.gameAwards[1].cost;
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
            var rad = parseInt(cc.GAME.huaTishiAd);
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
        else if(data == "tip")
        {
            var self = this;
            if(this.useCoin)
            {
                var cost = cc.config.gameAwards[1].cost;
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
                    },"huaTishiAd");
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
                this.showTips2();
            }
            else
            {
                cc.sdk.share(null,"game&snakeId=2&level="+this.level);
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

    }
});