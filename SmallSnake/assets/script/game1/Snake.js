
cc.Class({
    extends: cc.Component,

    properties: {
        bodySp1:{
            type:cc.SpriteFrame,
            default: []
        },
        bodySp2:{
            type:cc.SpriteFrame,
            default: []
        },
        bodySp:{
            type:cc.SpriteFrame,
            default: null
        }
    },

    onLoad: function() {

    },

    init: function(tiledSize)
    {
        this.moveSize = tiledSize;
        this.game = cc.find("Canvas").getComponent("game1");

        this.head = cc.find("head",this.node);
        this.tail = cc.find("tail",this.node);
        this.body = cc.find("body",this.node);

        cc.res.setSpriteFrame("images/game1/head",this.head);

        this.head.zIndex = 3;
        this.tail.zIndex = 3;
        this.body.zIndex = 1;


        if(this.bodys && this.bodys.length>0)
        {
            for(var i=0;i<this.bodys.length;i++)
            {
                if(this.bodys[i] != this.body)
                this.bodys[i].destroy();
            }
        }
        this.bodys = [];
        this.bodys.push(this.body);

        this.head.stopAllActions();
        this.body.stopAllActions();
        this.tail.stopAllActions();
        this.dropNum = 1;

        this.isPass = false;
        this.isOver = false;
    },

    initPos: function(pos1,pos2,pos3)
    {
        this.head.dir = "right";
        this.body.dir = "right";
        this.tail.dir = "right";

        this.head.ldir = "right";
        this.body.ldir = "right";
        this.tail.ldir = "right";

        this.head.position = pos1;
        this.body.position = pos2;
        this.tail.position = pos3;

        this.head.opacity = 255;
        this.body.opacity = 255;
        this.tail.opacity = 255;

        //this.body.scale = 1;
        //this.tail.scale = 1;

        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;

        if(pos1.x>pos2.x && Math.abs(pos1.x-pos2.x)>min)
            this.head.dir = "right";
        if(pos1.x<pos2.x && Math.abs(pos1.x-pos2.x)>min)
            this.head.dir = "left";
        if(pos1.y>pos2.y && Math.abs(pos1.y-pos2.y)>min)
            this.head.dir = "top";
        if(pos1.y<pos2.y && Math.abs(pos1.y-pos2.y)>min)
            this.head.dir = "bottom";

        if(pos3.x>pos2.x && Math.abs(pos3.x-pos2.x)>min)
            this.tail.dir = "left";
        if(pos3.x<pos2.x && Math.abs(pos3.x-pos2.x)>min)
            this.tail.dir = "right";
        if(pos3.y>pos2.y && Math.abs(pos3.y-pos2.y)>min)
            this.tail.dir = "bottom";
        if(pos3.y<pos2.y && Math.abs(pos3.y-pos2.y)>min)
            this.tail.dir = "top";

        this.body.ldir = this.tail.dir;
        this.body.dir = this.head.dir;

        this.updateDir(this.head.dir,true);
    },




    toTop: function()
    {
        if(this.judgeMove("top"))
        {
            this.move("top");
        }

    },

    toBottom: function()
    {
        if(this.judgeMove("bottom"))
        {
            this.move("bottom");
        }
    },

    toLeft: function()
    {
        if(this.judgeMove("left"))
        {
            this.move("left");
        }
    },

    toRight: function()
    {
        if(this.judgeMove("right"))
        {
            this.move("right");
        }
    },

    judgeMove: function(dir)
    {
        if(!this.isMoving && !this.isPass && !this.isOver)
        {
            this.isMoving = true;
            var b = this.judgePassBody(dir);
            if(b) b = this.judgePassStone(dir);
            if(!b) this.isMoving = false;
            return b;
        }
        return false;
    },

    judgePassBody: function(dir)
    {
        var pos = this.head.position;
        var pos2 = cc.v2(0,this.moveSize.height);
        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;
        if(dir == "top")
        {
            pos2 = cc.v2(0,this.moveSize.height);
        }
        else if(dir == "bottom")
        {
            pos2 = cc.v2(0,-this.moveSize.height);
        }
        else if(dir == "left")
        {
            pos2 = cc.v2(-this.moveSize.width,0);
        }
        else if(dir == "right")
        {
            pos2 = cc.v2(this.moveSize.width,0);
        }

        pos = pos.add(pos2);
        var dis = this.tail.position.sub(pos).mag();
        if(dis<min)
            return false;
        for(var i=0;i<this.bodys.length;i++)
        {
            dis = this.bodys[i].position.sub(pos).mag();
            if(dis<min)
                return false;
        }

        return this.game.judgePass(pos);
    },

    judgePassStone: function(dir,isTishi)
    {
        var pos = this.head.position;
        var pos2 = cc.v2(0,this.moveSize.height);
        var pos3 = cc.v2(0,this.moveSize.height);
        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;
        if(dir == "top")
        {
            pos2 = cc.v2(0,this.moveSize.height);
            pos3 = cc.v2(0,this.moveSize.height*2);
        }
        else if(dir == "bottom")
        {
            pos2 = cc.v2(0,-this.moveSize.height);
            pos3 = cc.v2(0,-this.moveSize.height*2);
        }
        else if(dir == "left")
        {
            pos2 = cc.v2(-this.moveSize.width,0);
            pos3 = cc.v2(-this.moveSize.width*2,0);
        }
        else if(dir == "right")
        {
            pos2 = cc.v2(this.moveSize.width,0);
            pos3 = cc.v2(this.moveSize.width*2,0);
        }

        var pos4 = pos.add(pos3);
        pos = pos.add(pos2);


        var b = true;
        var index = -1;
        for(var i=0;i<this.game.stones.length;i++)
        {
            var dis = this.game.stones[i].position.sub(pos).mag();
            if(dis<min)
            {
                b = false;
                index = i;
                break;
            }
        }
        //判断箱子后面是否有箱子或者墙
        if(!b)
        {
            b = true;
            for(var i=0;i<this.game.stones.length;i++)
            {
                var dis = this.game.stones[i].position.sub(pos4).mag();
                if(dis<min)
                {
                    b = false;
                    break;
                }
            }
            //没有箱子看是否有墙
            if(b)
            {
                b = this.game.judgePass(pos4);
            }

            //后面都没有  移动石头
            if(b && index != -1 && !isTishi)
            {
                var self = this;

                var stone = this.game.stones[index];
                stone.isMing = true;
                stone.runAction(cc.sequence(
                    cc.moveTo(0.12,pos4),
                    cc.callFunc(function(){
                        self.stoneDrop(stone,dir,1);
                    })
                ));
            }
        }
        return b;
    },

    stoneDrop: function(stone,dir,num)
    {
        var pos = stone.position;
        var pos2 = cc.v2(0,-this.moveSize.height*num);
        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;

        pos = pos.add(pos2);

        var b = true;
        //是否有石头
        for(var i=0;i<this.game.stones.length;i++)
        {
            var dis = this.game.stones[i].position.sub(pos).mag();
            if(dis<min)
            {
                b = false;
                break;
            }
        }
        //是否有身体
        if(b)
        {
            //头
            var dis = this.head.position.sub(pos).mag();
            b = dis<min ? false : true;
            if(b)
            {
                dis = this.tail.position.sub(pos).mag();
                b = dis<min ? false : true;
                if(b)
                {
                    for(var i=0;i<this.bodys.length;i++)
                    {
                        var dis = this.bodys[i].position.sub(pos).mag();
                        if(dis<min)
                        {
                            b = false;
                            break;
                        }
                    }
                }
            }
        }

        //是否有苹果
        if(b)
        {
            for(var i=0;i<this.game.apples.length;i++)
            {
                var dis = this.game.apples[i].position.sub(pos).mag();
                if(dis<min)
                {
                    b = false;
                    break;
                }
            }
        }

        //是否有路
        if(b)
        {
            b = this.game.judgePass(pos);
        }

        if(b)
        {
            cc.log("======");
            var self = this;
            stone.runAction(cc.sequence(
                cc.moveTo(0.1,pos),
                cc.callFunc(function(){
                    self.stoneDrop(stone,dir, num++);
                })
            ));
        }
    },

    judgeTrap: function(toPos)
    {
        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;
        var b = true;
        for(var i=0;i<this.game.traps.length;i++)
        {
            var pos = this.head.position;
            if(toPos) pos = toPos;
            var dis = this.game.traps[i].position.sub(pos).mag();
            b = dis<min ? false : true;
            if(!b) break;
        }
        //判断是否有石头
        if(b)
        {
            for(var i=0;i<this.game.stones.length;i++)
            {
                var pos = this.head.position;
                var dis = this.game.stones[i].position.sub(pos).mag();
                b = dis<min ? false : true;
                if(!b) break;
            }

            //判断尾部
            if(b)
            {
                for(var i=0;i<this.game.traps.length;i++)
                {
                    var pos = this.tail.position;
                    var dis = this.game.traps[i].position.sub(pos).mag();
                    b = dis<min ? false : true;
                    if(!b) break;
                }
                //判断是否有石头
                if(b)
                {
                    for(var i=0;i<this.game.stones.length;i++)
                    {
                        var pos = this.tail.position;
                        var dis = this.game.stones[i].position.sub(pos).mag();
                        b = dis<min ? false : true;
                        if(!b) break;
                    }

                    //判断身体
                    if(b)
                    {
                        for(var i=0;i<this.game.traps.length;i++)
                        {
                            for(var j=0;j<this.bodys.length;j++)
                            {
                                var pos = this.bodys[j].position;
                                var dis = this.game.traps[i].position.sub(pos).mag();
                                b = dis<min ? false : true;
                                if(!b) break;
                            }
                            if(!b) break;
                        }

                        //判断是否有石头
                        if(b)
                        {
                            for(var i=0;i<this.game.stones.length;i++)
                            {
                                for(var j=0;j<this.bodys.length;j++)
                                {
                                    var pos = this.bodys[j].position;
                                    var dis = this.game.stones[i].position.sub(pos).mag();
                                    b = dis<min ? false : true;
                                    if(!b) break;
                                }
                                if(!b) break;
                            }
                        }
                    }

                }
            }
        }
        return !b;
    },

    judgeDrop: function()
    {
        var pos = this.head.position.add(cc.v2(0,-this.moveSize.height*this.dropNum));
        //出口也可以行走
        var dis = this.game.exit.position.sub(pos).mag();
        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;
        var b = dis<min ? false : true;
        //苹果
        if(b)
        {
            for(var i=0;i<this.game.apples.length;i++)
            {
                dis = this.game.apples[i].position.sub(pos).mag();
                b = dis<min ? false : true;
                if(!b) break;
            }
        }
        //石头
        if(b)
        {
            for(var i=0;i<this.game.stones.length;i++)
            {
                dis = this.game.stones[i].position.sub(pos).mag();
                b = dis<min ? false : true;
                if(!b) break;
            }
        }
        if(b) b = this.game.judgePass(pos);
        if(b)
        {
            for(var i=0;i<this.bodys.length;i++)
            {
                pos = this.bodys[i].position.add(cc.v2(0,-this.moveSize.height*this.dropNum));
                b = this.game.judgePass(pos);
                if(b)
                {
                    dis = this.game.exit.position.sub(pos).mag();
                    b = dis<min ? false : true;

                    if(b)
                    {
                        for(var j=0;j<this.game.apples.length;j++)
                        {
                            dis = this.game.apples[j].position.sub(pos).mag();
                            b = dis<min ? false : true;
                            if(!b) break;
                        }

                        if(b)
                        {
                            for(var j=0;j<this.game.stones.length;j++)
                            {
                                dis = this.game.stones[j].position.sub(pos).mag();
                                b = dis<min ? false : true;
                                if(!b) break;
                            }
                        }
                    }
                }
                if(!b) break;
            }

            if(b)
            {
                pos = this.tail.position.add(cc.v2(0,-this.moveSize.height*this.dropNum));
                b = this.game.judgePass(pos);

                if(b)
                {
                    dis = this.game.exit.position.sub(pos).mag();
                    b = dis<min ? false : true;

                    if(b)
                    {
                        for(var i=0;i<this.game.apples.length;i++)
                        {
                            dis = this.game.apples[i].position.sub(pos).mag();
                            b = dis<min ? false : true;
                            if(!b) break;
                        }

                        if(b)
                        {
                            for(var i=0;i<this.game.stones.length;i++)
                            {
                                dis = this.game.stones[i].position.sub(pos).mag();
                                b = dis<min ? false : true;
                                if(!b) break;
                            }
                        }
                    }
                }
            }
        }
        if(b) this.dropNum ++;
        if(this.dropNum>8 || !b)
            return this.dropNum;
        if(b) return this.judgeDrop();
    },

    judgeNextEat: function(dir,isEat)
    {
        if(!dir) dir = this.head.dir;
        var pos = this.head.position;
        var pos2 = cc.v2(0,this.moveSize.height);
        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;
        if(dir == "top")
        {
            pos2 = cc.v2(0,this.moveSize.height);
        }
        else if(dir == "bottom")
        {
            pos2 = cc.v2(0,-this.moveSize.height);
        }
        else if(dir == "left")
        {
            pos2 = cc.v2(-this.moveSize.width,0);
        }
        else if(dir == "right")
        {
            pos2 = cc.v2(this.moveSize.width,0);
        }

        pos = pos.add(pos2);
        for(var i=0;i<this.game.apples.length;i++)
        {
            var dis = this.game.apples[i].position.sub(pos).mag();
            if(dis<min)
            {
                if(isEat)
                {
                    this.game.apples[i].destroy();
                    this.game.apples.splice(i,1);
                    this.eat();
                }
                return true;
            }

        }
        return false;
    },

    judgeEat: function(pos)
    {
        //var pos = this.head.position;
        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;
        for(var i=0;i<this.game.apples.length;i++)
        {
            var dis = this.game.apples[i].position.sub(pos).mag();
            if(dis<min*2.2)
                return true;
        }
        return false;
    },

    judgeReplay: function()
    {
        var b = false;

        var b1 = this.judgePassBody("top");
        if(b1) b1 = this.judgePassStone("top",true);

        var b2 = this.judgePassBody("bottom");
        if(b2) b2 = this.judgePassStone("bottom",true);

        var b3 = this.judgePassBody("left");
        if(b3) b3 = this.judgePassStone("left",true);

        var b4 = this.judgePassBody("right");
        if(b4) b4 = this.judgePassStone("right",true);

        if(!b1 && !b2 && !b3 && !b4)
            b = true;
        var b5 = false;
        if(!b)
        {
            //判断竖着只能向上的情况
            if(!b3 && !b4)
            {
                var min = Math.min(this.moveSize.width,this.moveSize.height)/2;
                for(var i=0;i<this.bodys.length;i++)
                {
                    var dis = Math.abs(this.head.x - this.bodys[i].x);
                    if(dis>min)
                    {
                        b5 = true;
                        break;
                    }
                }
                if(!b5)
                {
                    for(var i=0;i<this.bodys.length;i++)
                    {
                        var dis = Math.abs(this.tail.x - this.bodys[i].x);
                        if(dis>min)
                        {
                            b5 = true;
                            break;
                        }
                    }
                }

                if(!b5)
                    b = true;
            }
        }


        if(b)
        {
            this.game.playReplayAni();
        }
    },

    judgeWin: function(pos,dir)
    {
        if(this.judgeTrap(pos))
        {
            this.isOver = true;
            cc.res.setSpriteFrame("images/game1/head_tarp",this.head);
            this.scheduleOnce(function(){
                //this.game.willGameOver();
                this.game.playReplayAni();
            },0.5);

        }
        else
        {
            //var pos = this.head.position;
            var min = Math.min(this.moveSize.width,this.moveSize.height)/2;
            var dis = pos.sub(this.game.exit.position).mag();
            if(dis<min)
            {
                this.isMoving = true;
                //this.head.opacity = 0;
                //this.scheduleOnce(function(){
                //    this.willpass();
                //},0.2);
                this.willpass(pos,dir);
                return true;
            }

        }
        return false;
    },

    eat: function()
    {
        var body = cc.instantiate(this.body);
        body.position = this.tail.position;
        body.ldir = this.tail.ldir;
        body.dir = this.tail.dir;
        body.parent = this.node;

        this.bodys.push(body);
    },

    move: function(dir)
    {
        var isEat = this.judgeNextEat(dir,true);
        var pos = this.head.position;
        var addPos = cc.v2(0,0);
        if(dir == "top") addPos = cc.v2(0,this.moveSize.height);
        else if(dir == "bottom") addPos = cc.v2(0,-this.moveSize.height);
        else if(dir == "left") addPos = cc.v2(-this.moveSize.width,0);
        else if(dir == "right") addPos = cc.v2(this.moveSize.width,0);

        var toPos = pos.add(addPos);

        if(this.judgeEat(toPos))
            cc.res.setSpriteFrame("images/game1/head_apple",this.head);
        else
            cc.res.setSpriteFrame("images/game1/head",this.head);

        var iswin = this.judgeWin(toPos,dir);

        if(!iswin)
        {
            var mTime = 0.1;

            var toPos2 = toPos.sub(pos).mul(0.5).add(pos);
            var ac = cc.sequence(
                cc.moveTo(0,toPos2),
                cc.moveTo(mTime,toPos)
            );
            this.head.runAction(ac);
            for(var i=0;i<this.bodys.length;i++)
            {
                var ac2 = cc.moveTo(0,pos);
                if(i != 0)
                    ac2 = cc.moveTo(0,this.bodys[i-1].position);
                this.bodys[i].runAction(ac2);
            }
            if(!isEat)
            {
                var tp = this.bodys[this.bodys.length-1].position;
                var tp2 = tp.sub(this.tail.position).mul(0.9).add(this.tail.position);
                var ac3 = cc.sequence(
                    cc.moveTo(mTime,tp2),
                    cc.moveTo(0,tp)
                );
                this.tail.runAction(ac3);
            }
            this.updateDir(dir);
        }


        this.isMoving = true;
        this.dropNum = 1;

        var self = this;
        this.scheduleOnce(function(){
            self.isMoving = false;

            if(iswin)
            {

            }
            else
            {
                if(self.judgeDrop()>1)
                {
                    self.updateDropDir();
                    self.drop();
                }
                else
                {
                    self.judgeReplay();
                }
            }

            //判断石头掉落
            for(var i=0;i<this.game.stones.length;i++)
            {
                if(!this.game.stones[i].isMing)
                    self.stoneDrop(this.game.stones[i],dir,1);
                this.game.stones[i].isMing = false;
            }
        },mTime*2);


        cc.sdk.vibrate();
    },

    drop: function()
    {
        this.dropNum -= 1;
        var pos = this.head.position;
        var toPos = pos.add(cc.v2(0,-this.moveSize.height*this.dropNum));
        var isFail = false;
        if(this.dropNum>7)
        {
            this.dropNum = cc.winSize.height/2/this.moveSize.height+8;
            toPos = pos.add(cc.v2(0,-this.moveSize.height*this.dropNum));
            isFail = true;
        }
        var mTime = 0.1*this.dropNum;
        var ac = cc.moveTo(mTime,toPos);
        this.head.runAction(ac);
        for(var i=0;i<this.bodys.length;i++)
        {
            var ac2 = cc.moveTo(mTime,this.bodys[i].position.add(cc.v2(0,-this.moveSize.height*this.dropNum)));
            this.bodys[i].runAction(ac2);
        }
        var ac3 = cc.moveTo(mTime,this.tail.position.add(cc.v2(0,-this.moveSize.height*this.dropNum)));
        this.tail.runAction(ac3);

        this.isMoving = true;
        var self = this;
        var stime = mTime*2;
        if(isFail)stime = mTime;
        this.scheduleOnce(function(){
            self.isMoving = false;
            if(isFail)
            {
                self.game.willGameOver();
            }
            else
            {
                if(self.judgeTrap())
                {
                    self.game.willGameOver();
                }
                else
                {
                    //判断是否提示重玩
                    self.judgeReplay();
                }
            }
            //判断石头掉落
            for(var i=0;i<this.game.stones.length;i++)
            {
                if(!this.game.stones[i].isMing)
                    self.stoneDrop(this.game.stones[i],this.head.dir,1);
                this.game.stones[i].isMing = false;
            }
        },stime);

        cc.log("drop");
    },

    willpass: function(pos,dir)
    {
        this.node.parent = this.game.exit_mask;
        this.head.position = this.head.position.sub(this.game.exit.position);
        this.head.stopAllActions();
        for(var i=0;i<this.bodys.length;i++)
        {
            this.bodys[i].position = this.bodys[i].position.sub(this.game.exit.position);
            this.bodys[i].stopAllActions();
        }
        this.tail.position = this.tail.position.sub(this.game.exit.position);
        this.tail.stopAllActions();
        this.passPos = pos.sub(this.game.exit.position);
        this.head.dir = dir;
        this.pass();
    },

    pass: function()
    {
        var dir = this.head.dir;
        var pos = this.head.position;
        this.updateDir(dir);

        //var addPos = cc.v2(0,0);
        //if(dir == "top") addPos = cc.v2(0,this.moveSize.height);
        //else if(dir == "bottom") addPos = cc.v2(0,-this.moveSize.height);
        //else if(dir == "left") addPos = cc.v2(-this.moveSize.width,0);
        //else if(dir == "right") addPos = cc.v2(this.moveSize.width,0);
        //
        //var toPos = pos.add(addPos);

        var mTime = 0.1;
        var ac = cc.moveTo(mTime, this.passPos);
        this.head.runAction(ac);
        for(var i=0;i<this.bodys.length;i++)
        {
            var ac2 = cc.moveTo(0,pos);
            if(i != 0)
                ac2 = cc.moveTo(0,this.bodys[i-1].position);
            this.bodys[i].runAction(ac2);
        }
        var ac3 = cc.moveTo(mTime,this.bodys[this.bodys.length-1].position);
        this.tail.runAction(ac3);


        var self = this;

        this.scheduleOnce(function(){
            if(self.tail.position.sub(self.passPos).mag()> 10)
            {
                self.pass();
            }
            else
            {
                self.node.parent = self.game.node_game;
                self.game.gameWin();
                self.isMoving = false;
            }
        },mTime);
    },

    updateDir: function(dir,isInit)
    {
        if(!isInit)
        {
            this.head.ldir = this.head.dir;
            this.head.dir = dir;

            var bdir = dir;
            for(var i=0;i<this.bodys.length;i++)
            {
                var body = this.bodys[i];

                body.ldir = body.dir;
                if(i == 0)
                    body.dir = bdir;
                else
                    body.dir = this.bodys[i-1].ldir;
            }

            this.tail.ldir = this.tail.dir;
            this.tail.dir = this.bodys[this.bodys.length-1].ldir;
        }

        //var isNextEat = this.judgeNextEat();


        //蛇头
        if(dir == "top")
        {
            this.head.angle = 90;
        }
        else if(dir == "bottom")
        {
            this.head.angle = -90;
        }
        else if(dir == "left")
        {
            this.head.angle = 180;
        }
        else if(dir == "right")
        {
            this.head.angle = 0;
        }
        //蛇身
        for(var i=0;i<this.bodys.length;i++)
        {
            var body = this.bodys[i];
            var dir1 = "";
            if(i==0)
            {
                dir1 = this.head.dir;
            }
            else
            {
                dir1 = this.bodys[i-1].ldir;
            }
            var dir2 = body.ldir;
            //cc.log(dir1,dir2,this.tail.dir);

            if(dir1 == dir2)
            {
                if(!isInit)
                {
                    this.updateSp(body);
                    if(i==this.bodys.length-1)
                    {
                        //this.updateSp(body);
                    }
                }


                if(dir2 == "top")
                {
                    body.angle = 90;
                }
                else if(dir2 == "bottom")
                {
                    body.angle = -90;
                }
                else if(dir2 == "left")
                {
                    body.angle = 180;
                }
                else if(dir2 == "right")
                {
                    body.angle = 0;
                }

                body.getComponent("cc.Sprite").spriteFrame = this.bodySp;
            }
            else
            {
                var b = this.isLeftRotate(dir1,dir2);
                var index = 0;
                if(dir1 == "top")
                {
                    if(dir2 == "left")
                        index = 1;
                    else if(dir2 == "right")
                        index = 4;
                }
                else if(dir1 == "bottom")
                {
                    if(dir2 == "left")
                        index = 2;
                    else if(dir2 == "right")
                        index = 3;
                }
                else if(dir1 == "left")
                {
                    if(dir2 == "top")
                        index = 3;
                    else if(dir2 == "bottom")
                        index = 4;
                }
                else if(dir1 == "right")
                {
                    if(dir2 == "top")
                        index = 2;
                    else if(dir2 == "bottom")
                        index = 1;
                }
                var spf = null;
                if(b)
                    spf = this.bodySp2[index-1];
                else
                {
                    spf = this.bodySp1[index-1];
                    //if(index == 4)
                    //{
                    //    var node = cc.res.playAnim("images/game1/body_4ani",5,0.01,1,null,true);
                    //    node.scale = 46/58;
                    //    body.addChild(node);
                    //}
                }

                if(!isInit)
                {
                    this.updateSp(body);
                    if(i==this.bodys.length-1)
                    {
                        //this.updateSp(body,true);
                    }
                }

                body.angle = 0;
                body.getComponent("cc.Sprite").spriteFrame = spf;

            }



        }

        //蛇尾
        dir = this.tail.dir;
        var tailAng = 0;
        if(dir == "top")
        {
            //this.tail.angle = 90;
            tailAng = 90;
        }
        else if(dir == "bottom")
        {
            //this.tail.angle = -90;
            tailAng = -90;
        }
        else if(dir == "left")
        {
            //this.tail.angle = 180;
            tailAng = 180;
        }
        else if(dir == "right")
        {
            //this.tail.angle = 0;
        }
        this.tail.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.rotateTo(0,tailAng)
        ));
    },

    updateSp: function(body,isTail)
    {
        var body2 = cc.instantiate(body);
        if(isTail)
        {
            body2.scale = 0.9;
        }
        //body2.getComponent("cc.Sprite").spriteFrame = spf;
        //body2.opacity=0;
        //cc.res.setSpriteFrame("images/game1/body_c",body2);
        body2.position = body.position;
        body2.parent = body.parent;
        body2.zIndex = 2;
        body2.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.removeSelf()
        ));

    },

    isLeftRotate: function(dir1,dir2)
    {
        if(dir1 == "top")
        {
            if(dir2 == "left")
                return true;
        }
        else if(dir1 == "bottom")
        {
            if(dir2 == "right")
                return true;
        }
        else if(dir1 == "left")
        {
            if(dir2 == "bottom")
                return true;
        }
        else if(dir1 == "right")
        {
            if(dir2 == "top")
                return true;
        }
        return false;
    },

    updateDropDir: function()
    {
        var min = Math.min(this.moveSize.width,this.moveSize.height)/2;

        var pos3 = this.tail.position;
        var pos2 = this.bodys[this.bodys.length-1].position;

        if(pos3.x>pos2.x && Math.abs(pos3.x-pos2.x)>min)
            this.tail.dir = "left";
        if(pos3.x<pos2.x && Math.abs(pos3.x-pos2.x)>min)
            this.tail.dir = "right";
        if(pos3.y>pos2.y && Math.abs(pos3.y-pos2.y)>min)
            this.tail.dir = "bottom";
        if(pos3.y<pos2.y && Math.abs(pos3.y-pos2.y)>min)
            this.tail.dir = "top";

        this.bodys[this.bodys.length-1].ldir = this.tail.dir;

        this.updateDir(this.head.dir,true);
    },

    update: function(dt) {

    }
});
