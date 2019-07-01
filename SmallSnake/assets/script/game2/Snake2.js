
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
        this.game = cc.find("Canvas").getComponent("game2");

        this.head = cc.find("head",this.node);
        this.tail = cc.find("tail",this.node);
        this.body = cc.find("body",this.node);
        this.head.zIndex = 992;
        this.tail.zIndex = 990;
        this.body.active = false;

        this.headAni = cc.find("head/ani",this.node);
        this.headAni.zIndex = 993;
        this.tailAni = cc.find("tail/ani",this.node);
        this.tailAni.zIndex = 991;


        this.head.setContentSize(cc.size(this.tiledSize.width*0.9,this.tiledSize.height*0.9));
        this.body.setContentSize(cc.size(this.tiledSize.width*0.9,this.tiledSize.height*0.9));
        this.tail.setContentSize(cc.size(this.tiledSize.width*0.9,this.tiledSize.height*0.9));

        cc.find("head/di",this.node).setContentSize(this.head.getContentSize());
        cc.find("tail/di",this.node).setContentSize(this.tail.getContentSize());

        //this.node.scale = this.tiledSize.width/116;
        if(this.bodys && this.bodys.length>0)
        {
            for(var i=0;i<this.bodys.length;i++)
            {
                if(this.bodys[i] != this.body)
                this.bodys[i].destroy();
            }
        }
        this.bodys = [];
        var roads = this.game.roads;

        var subp = cc.v2(this.mapSize.width*this.tiledSize.width/2,
            this.mapSize.height*this.tiledSize.height/2);

        for(var i=0;i<roads.length;i++)
        {
            var r = roads[i];

            var body = cc.instantiate(this.body);
            body.position = cc.v2(r.x,r.y).sub(subp);
            body.index = i;
            body.active = false;
            body.pos = body.position;
            this.node.addChild(body);
            this.bodys.push(body);
        }
    },

    initPos: function(pos)
    {
        this.head.position = pos;
        this.body.position = pos;
        this.tail.position = pos;

        this.head.angle = 0;
        this.body.angle = 0;
        this.tail.angle = 0;

        this.anipos = [];



        this.tailAni.destroyAllChildren();
        var node2 = cc.res.playAnim("images/game2/tail",20,0.08,-1,null,true);
        node2.y = this.tiledSize.height*0.8;
        this.tailAni.addChild(node2);
        node2.scale = this.tiledSize.width/116;
        this.playIdleAni();
    },

    playIdleAni: function()
    {
        this.isRunAni = false;
        this.headAni.destroyAllChildren();
        var node = cc.res.playAnim("images/game2/idle",30,0.08,-1,null,true);
        this.headAni.addChild(node);
        node.scale = this.tiledSize.width/116;
    },

    playRunAni: function()
    {
        if(!this.isRunAni)
        {
            this.isRunAni = true;
            var self = this;
            this.headAni.destroyAllChildren();
            var node = cc.res.playAnim("images/game2/run",20,0.08,1,function(){
                self.playIdleAni();
            },true);
            this.headAni.addChild(node);
            node.scale = this.tiledSize.width/116;
        }
    },


    updateHeadAni: function(pos)
    {
        this.anipos.push(pos);
        this.playAni();
    },

    playAni: function(item,isAdd,callback)
    {
        var self = this;
        if(!this.isPlayAni)
        {
            this.isPlayAni = true;
            this.playRunAni();
            var pos = this.bodys[item.index].pos;
            if(!isAdd && item.isMove)
            {
                pos = this.bodys[item.lastIndex].pos;
            }
            var t = 0.1;
            if(isAdd)  self.updateBodyDir(item.index,isAdd,1);
            this.head.runAction(cc.sequence(
                cc.moveTo(t,pos).easing(cc.easeSineIn()),
                cc.callFunc(function(){
                    //self.bodys[item.index].active = isAdd;
                    //self.updateBody();
                    //if(!isAdd)
                    self.updateBodyDir(item.index,isAdd,2);
                    self.isPlayAni = false;
                    self.game.judgeWin();
                    //if(callback) callback();
                    //cc.log(item.index,isAdd);
                })
            ));

            this.lastItemPos = pos;
            this.lastItemIndex = item.index;
            this.lastItemAdd = isAdd;

        }
        else
        {
            this.head.stopAllActions();
            this.head.position = this.lastItemPos;
            this.bodys[this.lastItemIndex].active = this.lastItemAdd;
            this.updateBodyDir(this.lastItemIndex,this.lastItemAdd);
            this.isPlayAni = false;
            this.playAni(item,isAdd);
        }

    },


    updateBody: function(index,isShow)
    {

        //if(isShow)
        //{
        //    var pos = this.bodys[index].pos;
        //    if(pos.x == this.head.x && pos.y == this.head.y)
        //        isShow = false;
        //}
        this.bodys[index].active = isShow;
    },

    updateHeadDir: function(dir)
    {
        var ang = -90;
        if(dir == 2) ang = 90;
        else if(dir == 3) ang = 0;
        else if(dir == 4) ang = 180;
        this.head.angle = ang;

        //this.headAni.angle = ang;
        cc.log(dir,ang);
    },

    updateTailDir: function(dir)
    {
        var ang = 90;
        if(dir == 2) ang = -90;
        else if(dir == 3) ang = 180;
        else if(dir == 4) ang = 0;
        this.tail.angle = ang;
    },

    updateBodyDir: function(index,isAdd,num)
    {
        var subp = cc.v2(this.mapSize.width*this.tiledSize.width/2,
            this.mapSize.height*this.tiledSize.height/2);
        var bodys = [];
        for(var i=0;i<this.game.points.length;i++)
        {
            var p1 = this.game.points[i].pos;
            for(var j=0;j<this.bodys.length;j++)
            {
                var p2 = this.bodys[j].pos.add(subp);
                if(p1.x == p2.x && p1.y == p2.y)
                {
                    bodys.push(this.bodys[j]);
                    break;
                }
            }
        }

        if(bodys.length>1)
        {
            var p1 = bodys[bodys.length-1];
            for(var i=bodys.length-2;i>=0;i--)
            {
                var body = bodys[i];
                if(i!=bodys.length-1)
                    p1 = bodys[i+1].pos;
                var p2 = body.pos;

                body.position = body.pos;

                var isTail = false;
                if(p2.x == this.tail.x && p2.y == this.tail.y)
                    isTail = true;

                if(p1.x != p2.x)
                {
                    body.setContentSize(cc.size(this.tiledSize.width * 1.2, this.tiledSize.height * 0.9));
                    var dis = this.tiledSize.width*0.15;
                    if(p1.x < p2.x)
                        dis = -dis;
                    if(isTail) dis *= 2;
                    body.x += dis;
                }
                else
                {
                    body.setContentSize(cc.size(this.tiledSize.width*0.9,this.tiledSize.height*1.2));
                    var dis = this.tiledSize.height*0.15;
                    if(p1.y < p2.y)
                        dis = -dis;
                    if(isTail) dis *= 2;
                    body.y += dis;
                }
            }

        }

        for(var i=0;i<this.bodys.length;i++)
        {
            var body = this.bodys[i];
            body.active = this.game.roads[i].line;
            if(i == index) body.active = false;
            //if(body.pos.x == this.head.x && body.pos.y == this.head.y)
            //    body.active = false;
        }

        //cc.log(bodys);
        if(bodys.length > 0 && !isAdd)
        {
            bodys[bodys.length-1].active = false;
        }
    },

    update: function(dt) {

    }
});
