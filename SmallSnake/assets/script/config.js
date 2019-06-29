/**
 * Created by guang on 18/7/18.
 */

module.exports = {

    levelNum:30,
    levelNum2:51,
    levelNum3:11,

    game3TiledIds:[
        {id:0,name:"moveStone",desc:"可移动石块"},
        {id:1,name:"bomb",desc:"炸弹"},
        {id:2,name:"key",desc:"钥匙"},
        {id:3,name:"lock",desc:"锁"},
        {id:4,name:"damStone",desc:"损坏的石块"},
        {id:5,name:"intactStone",desc:"完好的石块"},
        {id:6,name:"chest",desc:"宝箱"},
        {id:7,name:"emitter",desc:"激光发射器"},
        {id:8,name:"tnt",desc:"超级炸弹"},
        {id:9,name:"brick",desc:"砖块"},
        {id:10,name:"wall",desc:"墙"},
        {id:11,name:"coin",desc:"金币"},
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
    }

};