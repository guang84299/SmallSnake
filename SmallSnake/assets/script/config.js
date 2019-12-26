/**
 * Created by guang on 18/7/18.
 */

module.exports = {

    levelNum:40,
    levelNum2:99,
    levelNum3:38,

    game3TiledIds:[
        {id:0,name:"moveStone",desc:"可移动石块"},
        {id:1,name:"bomb",desc:"炸弹"},
        {id:2,name:"key",desc:"钥匙"},
        {id:3,name:"lock",desc:"锁"},
        {id:4,name:"damStone",desc:"损坏的石块"},
        {id:5,name:"intactStone",desc:"完好的石块"},
        {id:6,name:"chest",desc:"宝箱"},
        {id:7,name:"emitter",desc:"激光发射器"},
        {id:53,name:"tnt",desc:"超级炸弹"},
        {id:9,name:"brick",desc:"砖块"},
        {id:10,name:"wall",desc:"墙"},
        {id:52,name:"coin",desc:"金币"},
        {id:12,name:"exit",desc:"出口"}
    ],

    getTiledId: function(name)
    {
        for(var i=0;i<this.game3TiledIds.length;i++)
        {
            if(name == this.game3TiledIds[i].name)
                return this.game3TiledIds[i].id+1;
        }
        return 0;
    },

    getTiledName: function(id)
    {
        for(var i=0;i<this.game3TiledIds.length;i++)
        {
            if(id == this.game3TiledIds[i].id)
                return this.game3TiledIds[i].name;
        }
        return 0;
    },

    choujiang:[
        {id:1,desc:"少量金币",type:1,weight:20,award:200},
        {id:2,desc:"大量金币",type:1,weight:15,award:400},
        {id:3,desc:"巨量金币",type:1,weight:10,award:600},
        {id:4,desc:"海量金币",type:1,weight:5,award:800},
        {id:5,desc:"少量金币",type:1,weight:20,award:200},
        {id:6,desc:"大量金币",type:1,weight:15,award:400},
        {id:7,desc:"巨量金币",type:1,weight:10,award:600},
        {id:8,desc:"海量金币",type:1,weight:5,award:800}
    ],

    qiandao:[
        {id:1,desc:"第1天",award:100},
        {id:2,desc:"第2天",award:200},
        {id:3,desc:"第3天",award:300},
        {id:4,desc:"第4天",award:400},
        {id:5,desc:"第5天",award:500},
        {id:6,desc:"第6天",award:600},
        {id:7,desc:"第7天",award:700},
    ],

    gameScores:[300,100,300],

    gameAwards: [
        {id:1,bad:3,fine:2,perfect:1,award:150,cost:600,desc:"苹果蛇"},
        {id:2,bad:60,fine:40,perfect:20,award:50,cost:200,desc:"一笔画蛇"},
        {id:3,bad:0.3,fine:0.6,perfect:1,award:150,cost:400,desc:"爆炸蛇"}
    ]

};