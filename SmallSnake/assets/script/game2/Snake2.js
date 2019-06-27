
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

    init: function(tiledSize,mapSize)
    {
        this.tiledSize = tiledSize;
        this.mapSize = mapSize;
        this.game = cc.find("Canvas").getComponent("game2");

        this.head = cc.find("head",this.node);
        this.tail = cc.find("tail",this.node);
        this.body = cc.find("body",this.node);
        this.head.zIndex = 999;
        this.tail.zIndex = 998;
        this.body.active = false;


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
            this.node.addChild(body);
            this.bodys.push(body);
        }
    },

    initPos: function(pos)
    {
        this.head.position = pos;
        this.body.position = pos;
        this.tail.position = pos;

        this.head.angle = -90;
        this.body.angle = 0;
        this.tail.angle = -90;
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
        if(dir == 2) ang = 180;
        else if(dir == 3) ang = 90;
        else if(dir == 4) ang = -90;
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

    }
});
