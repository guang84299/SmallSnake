/**
 * Created by guang on 19/4/9.
 */

module.exports = {
    pcarPools:null,
    proadPools:[],

    audio_music:"audio/music",
    audio_button:"audio/button",
    audio_win:"audio/win",
    audio_baozha:"audio/baozha",


    initPools: function()
    {
        for (var i = 0; i < 11; i++)
        {
            var pool = new cc.NodePool();
            this.proadPools.push(pool);
        }

        this.pcarPools = new cc.NodePool();

    },

    initRoadPools: function(type,num)
    {
        for (var i = 0; i < num; i++) {
            var road = cc.instantiate(this.proad[type-1]);
            this.proadPools[type-1].put(road);
        }
    },



    getRoad: function(type)
    {
        var road = null;
        if (this.proadPools[type-1].size() > 0) {
            road = this.proadPools[type-1].get();
        } else {
            road = cc.instantiate(this.proad[type-1]);
        }
        road.type = type;
        //box.getComponent('box').initType(type);
        return road;
    },

    putRoad: function(road)
    {
        this.proadPools[road.type-1].put(road);
    },






    getCoin: function()
    {
        var coin = null;
        if (this.pcoinPools.size() > 0) {
            coin = this.pcoinPools.get();
        } else {
            coin = cc.instantiate(this.pcoin);
        }
        coin.die = false;
        return coin;
    },

    putCoin: function(coin)
    {
        this.pcoinPools.put(coin);
    },

    getToastCoin: function()
    {
        var coin = null;
        if (this.ptoastcoinPools.size() > 0) {
            coin = this.ptoastcoinPools.get();
        } else {
            coin = cc.instantiate(this.ptoastcoin);
        }
        return coin;
    },

    putToastCoin: function(coin)
    {
        this.ptoastcoinPools.put(coin);
    },

    playAnim: function(path,frameNum,time,loop,callback,isRemove,isFlip)
    {
        if(loop == -1) loop = 999999999;

        var node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);
        sp.trim = false;
        sp.sizeMode = cc.Sprite.SizeMode.RAW;
        var self = this;

        var play = function(){
            var i = 1;
            if(isFlip) i = frameNum;
            sp.schedule(function(){
               self.setSpriteFrame(path+"/"+i,sp);
                if(isFlip) i--;
                else i++;
            },time,frameNum);
        };

        var num = 1;
        if(loop>0)
        {
            play();
            num ++;
        }
        sp.schedule(function(){
            if(num>loop)
            {
                if(callback) callback();
                if(isRemove) node.destroy();
            }
            else
                play();
            num ++;
        },time*(frameNum+1),loop);

        return node;
    },


    setSpriteFrame: function(url,sp)
    {
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            if(!err && sp && cc.isValid(sp))
            {
                sp.getComponent("cc.Sprite").spriteFrame = spriteFrame;
            }
        });
    },

    loadPic: function(url,sp)
    {
        cc.loader.load({url: url, type: 'png'}, function (err, tex) {
            if(err)
            {
                cc.log(err);
            }
            else
            {
                if(cc.isValid(sp))
                {
                    var spriteFrame = new cc.SpriteFrame(tex);
                    sp.getComponent("cc.Sprite").spriteFrame = spriteFrame;
                }
            }
        });
    },

    showToast: function(str)
    {
        var toast = cc.instantiate(this.ptoast);
        cc.find("label",toast).getComponent("cc.Label").string = str;
        cc.find("Canvas").addChild(toast,10000);
        toast.opacity = 0;
        toast.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(2),
            cc.fadeOut(0.3),
            cc.removeSelf()
        ));
    },

    showCoin: function(coin,pos,parent)
    {
        var self = this;
        var node = this.getToastCoin();
        var label = node.getComponent("cc.Label");
        label.fontSize = 30;
        label.string = coin;
        //var outline = node.addComponent(cc.LabelOutline);
        if(pos)
            node.position = pos;
        if(!parent)parent = cc.find("Canvas");
        parent.addChild(node,10000);

        node.opacity = 255;
        node.runAction(cc.sequence(
            cc.moveBy(0.7,0,50).easing(cc.easeSineOut()),
            cc.spawn(
                cc.moveBy(0.3,0,20).easing(cc.easeSineOut()),
                cc.fadeOut(0.3)
            ),
            cc.callFunc(function(){
                self.putToastCoin(node);
            })
        ));
    },

    showCoinAni: function()
    {
        var toast = cc.instantiate(this.pjinbipenfa);
        cc.find("Canvas").addChild(toast,10000);
        toast.runAction(cc.sequence(
            cc.delayTime(3),
            cc.removeSelf()
        ));
    },

    openUI: function(name,parent,showType)
    {
        if(!parent) parent = cc.find("Canvas");
        if(parent)
        {
            var node = parent.getChildByName(name);
            if(node)
            {
                node.active = true;
                return;
            }
        }
        cc.loader.loadRes("prefab/ui/"+name, function(err, prefab)
        {
            if(err)
            {
                console.log("init error "+name,err);
            }
            else
            {
                var node = cc.instantiate(prefab);
                node.name = name;
                parent.addChild(node);
                node.getComponent(name).show(showType);
            }
        });
    },

    closeUI: function(name,parent)
    {
        if(!parent) parent = cc.find("Canvas");
        if(parent)
        {
            var node = parent.getChildByName(name);
            if(node)
            {
                node.destroy();
            }
        }
    },

    openPrefab: function(path,parent,callback)
    {
        if(!parent) parent = cc.find("Canvas");
        cc.loader.loadRes("prefab/"+path, function(err, prefab)
        {
            if(err)
            {
                console.log("init error "+path,err);
            }
            else
            {
                var node = cc.instantiate(prefab);
                parent.addChild(node);
                if(callback)callback(node);
            }
        });
    },

    isRestTime: function(time1,time2)
    {
        time1 = new Date(time1);
        time2 = new Date(time2);


        if(time2.getFullYear() != time1.getFullYear())
        {
            return true;
        }
        else if(time2.getMonth() != time1.getMonth())
        {
            return true;
        }
        else if(time2.getDate() != time1.getDate())
        {
            return true;
        }
        else
        {
            return false;
        }
    }


};