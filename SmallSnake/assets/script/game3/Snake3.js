
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function() {

    },

    init: function(tiledSize,mapSize)
    {
        this.tiledSize = tiledSize;
        this.mapSize = mapSize;
        this.game = cc.find("Canvas").getComponent("game3");

        this.head = cc.find("head",this.node);
        this.tail = cc.find("tail",this.node);
        this.body = cc.find("body",this.node);
        this.head.zIndex = 999;
        this.head.active = true;
        this.tail.active = false;
        this.body.active = false;

        this.head.stopAllActions();
        this.body.stopAllActions();

        this.head.setContentSize(tiledSize);
        this.body.setContentSize(tiledSize);
        this.tail.setContentSize(tiledSize);


        if(this.bodys && this.bodys.length>0)
        {
            for(var i=0;i<this.bodys.length;i++)
            {
                if(this.bodys[i] != this.body)
                this.bodys[i].destroy();
            }
        }
        this.bodys = [];
    },

    initPos: function(pos)
    {
        this.head.position = pos;
        this.body.position = pos;
        this.tail.position = pos;

        this.head.angle = -90;
        this.body.angle = 0;
        this.tail.angle = -90;
        this.isMing = false;
        this.dir = "";
        this.speed = 0.2;
        this.boomSpeed = 1.3;
        this.isCanBoom = false;
        this.isFirstBoom = true;
        this.isPass = false;
        this.boomDt = 0;
    },

    toMove: function(dir)
    {
        if(!this.isMing && !this.isPass)
        {
            this.isMing = true;

            var pos = null;
            var canMove = true;
            if(dir == "top")
            {
                pos = this.head.position.add(cc.v2(0,this.tiledSize.height));
                if(this.isCanBoom && this.dir == "down") canMove = false;
            }
            else if(dir == "down")
            {
                pos = this.head.position.add(cc.v2(0,-this.tiledSize.height));
                if(this.isCanBoom && this.dir == "top") canMove = false;
            }
            else if(dir == "left")
            {
                pos = this.head.position.add(cc.v2(-this.tiledSize.width,0));
                if(this.isCanBoom && this.dir == "right") canMove = false;
            }
            else if(dir == "right")
            {
                pos = this.head.position.add(cc.v2(this.tiledSize.width,0));
                if(this.isCanBoom && this.dir == "left") canMove = false;
            }
            if(pos && canMove)
            {
                var tileGid = this.game.getTiledGid(pos);

                if(tileGid == 0)
                    canMove = true;
                else
                {
                    var name = cc.config.game3TiledIds[tileGid-1].name;
                    if(name == "key")
                    {
                        canMove = true;
                    }
                    else if(name == "coin")
                    {
                        canMove = true;
                    }
                    else if(name == "exit")
                    {
                        canMove = true;
                    }
                    else
                    {
                        canMove = false;
                    }
                    cc.log(name);
                }

                if(canMove)
                {
                    this.move(pos,tileGid);
                    this.dir = dir;
                    this.updateHeadDir(dir);
                }
                else
                {
                    this.isMing = false;
                }
            }
            else
            {
                this.isMing = false;
            }
        }
    },

    judgePassBody: function()
    {
        if(this.bodys.length>1)
        {
            var min = cc.v2(this.tiledSize.width,this.tiledSize.height).mag();
            var body = this.bodys[this.bodys.length-1];
            //身体和头
            var dis = this.head.position.sub(body.position).mag();
            if(dis<=min && !this.isPass)
            {
                this.game.willGameOver();
                return;
            }
            //身体和身体
            var n = -1;
            for(var i=0;i<this.bodys.length-2;i++)
            {
                var body1 = this.bodys[i];
                var dis = body1.position.sub(body.position).mag();
                if(dis<=min)
                {
                    n = i;
                    break;
                }
            }

            if(n!=-1)
            {
                var bs = [];
                for(var i=n;i<this.bodys.length;i++)
                {
                    bs.push(this.bodys[i]);
                }
                this.bodys.splice(n,bs.length);
                this.boomBody(bs);
            }
        }

    },

    move: function(pos,tileGid)
    {
        var self = this;
        var ac = cc.sequence(
            cc.moveTo(this.speed,pos),
            cc.callFunc(function(){
                self.isMing = false;
                var b = self.game.judgePassEmitter(pos);
                if(!b) self.game.willGameOver();

            })
        );
        this.head.runAction(ac);
        for(var i=0;i<this.bodys.length;i++)
        {
            var body = this.bodys[i];
            var p = null;
            if(i ==0) p = this.head.position;
            else p = this.bodys[i-1].position;
            var ac = cc.moveTo(this.speed,p);
            body.runAction(ac);
        }

        var body = cc.instantiate(this.body);

        var p = null;
        if(this.bodys.length==0) p = this.head.position;
        else p = this.bodys[this.bodys.length-1].position;

        body.position = p;
        body.active = true;
        this.node.addChild(body);
        this.bodys.push(body);

        if(!this.isCanBoom)
        {
            this.isFirstBoom = true;
            this.isCanBoom = true;
        }


        if(tileGid>0)
        {
            var name = cc.config.game3TiledIds[tileGid-1].name;
            if(name == "coin")
            {
                this.game.eatCoin(pos);
            }
            else if(name == "exit")
            {
                this.isPass = true;
                var boom = cc.res.playAnim("images/game3/exit",8,0.05,1,function(){
                    var boom = cc.res.playAnim("images/game3/exit",8,0.05,1,null,false,true);
                    boom.position = pos;
                    boom.parent = self.game.maps;
                    self.head.active = false;
                    boom.scale = self.tiledSize.width/80;
                },true);
                boom.position = pos;
                boom.parent = this.node;
                boom.zIndex = this.head.zIndex+1;
                boom.scale = this.tiledSize.width/80;
                this.scheduleOnce(function(){
                    self.game.gameWin();
                },this.boomSpeed*this.bodys.length);
                this.game.eatExit(pos);
            }
            else if(name == "key")
            {
                this.game.eatKey(pos);
            }
        }

    },

    boom: function()
    {
        var self = this;
        if(this.bodys.length>0)
        {
            var body = this.bodys[this.bodys.length-1];
            var pos = body.position;

            var boom = cc.res.playAnim("images/game3/tailboom",16,0.05,1,null,true);
            boom.position = body.position;
            boom.parent = this.node;

            this.node.runAction(cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(function(){
                    self.game.tailBoom(pos);
                })
            ));

            body.destroy();
            this.bodys.splice(this.bodys.length-1,1);

            self.judgePassBody();
        }
        else
        {
            var boom = cc.res.playAnim("images/game3/tailboom",16,0.05,1,null,true);
            boom.position = this.head.position;
            boom.parent = this.node;

            if(!this.isPass)
                this.game.willGameOver();

            this.isCanBoom = false;
        }
    },

    boomBody: function(bodys)
    {
        if(bodys && bodys.length>0)
        {
            var body = bodys[0];

            var boom = cc.res.playAnim("images/game3/tailboom",16,0.05,1,null,true);
            boom.position = body.position;
            boom.parent = this.node;


            bodys.splice(0,1);
            body.destroy();

            if(bodys.length>0)
            {
                body = bodys[bodys.length-1];

                var boom = cc.res.playAnim("images/game3/tailboom",16,0.05,1,null,true);
                boom.position = body.position;
                boom.parent = this.node;

                bodys.splice(bodys.length-1,1);

                body.destroy();
            }

            this.scheduleOnce(function(){
                this.boomBody(bodys);
            },0.2);
        }
    },


    updateBody: function(index,isShow)
    {
        for(var i=0;i<this.bodys.length;i++)
        {
            if(this.bodys[i].index == index)
            {
                this.bodys[i].active = isShow;
                break;
            }
        }
    },

    updateHeadDir: function(dir)
    {
        var ang = 0;
        if(dir == "left") ang = 180;
        else if(dir == "top") ang = 90;
        else if(dir == "down") ang = -90;
        this.head.angle = ang;
    },

    updateTailDir: function(dir)
    {
        var ang = 0;
        if(dir == 2) ang = 180;
        else if(dir == 3) ang = 90;
        else if(dir == 4) ang = -90;
        this.tail.angle = ang;
    },

    update: function(dt) {
        if(this.isCanBoom)
        {
            this.boomDt += dt;
            var t = this.boomSpeed;
            if(this.isFirstBoom) t = 2;
            if(this.boomDt>t)
            {
                this.boomDt = 0;
                this.boom();
                this.isFirstBoom = false;
            }
        }
    }
});
