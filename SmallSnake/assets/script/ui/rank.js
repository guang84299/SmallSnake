var storage = require("storage");
var res = require("res");
var sdk = require("sdk");
var config = require("config");

cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    onLoad: function()
    {

        
    },
    initUI: function()
    {
        this.bg = cc.find("bg",this.node);

        this.scroll = cc.find("box/scroll",this.bg);

        this.item = cc.find("item",this.scroll);

        this.content = cc.find("view/content",this.scroll);

        //this.open();
        //var self = this;
        //cc.qianqista.rankScore(function(res2){
        //    self.worldrank = res2.data;
        //    self.open();
        //});
    },

    updateUI: function()
    {

    },

    open: function()
    {

        this.addItem();
    },


    addItem: function()
    {
        var n = this.content.childrenCount;
        if(n<this.worldrank.length)
        {
            var data = this.worldrank[n];
            var item = cc.instantiate(this.item);
            item.active = true;

            var rank = cc.find("rank",item).getComponent(cc.Label);
            var name = cc.find("name",item).getComponent(cc.Label);
            var score = cc.find("coinbg/score",item).getComponent(cc.Label);
            var icon = cc.find("icon",item);
            var rankIcon = cc.find("rankIcon",item);

            rank.string = data.id;
            name.string = storage.getLabelStr(data.nick,8);
            score.string = storage.castNum(data.score*config.totalCoinRate);
            res.loadPic(data.avatarUrl,icon);

            if(data.id<=3)
            {
                rankIcon.active = true;
                rank.node.active = false;
                res.setSpriteFrame("images/rank/rank"+data.id,rankIcon);
            }

            this.content.addChild(item);

            this.scheduleOnce(this.addItem.bind(this),0.1);
        }
    },



    show: function()
    {
        //this.main.wxQuanState(false);
        this.game = cc.find("Canvas").getComponent("main");
        //this.node.sc = this;
        //this.initUI();
        //this.updateUI();
        //
        //this.node.active = true;
        //this.bg.runAction(cc.sequence(
        //        cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
        //        cc.scaleTo(0.2,1).easing(cc.easeSineOut())
        //    ));

        this.game.display.active = true;
        sdk.openRank();
        var self = this;
        this.scheduleOnce(function(){
            self.game.display.getComponent("cc.WXSubContextView").reset();
            //self.game.display.getComponent("cc.WXSubContextView").updateSubContextViewport();
        },0.2);
        cc.qianqista.event("排行_打开");
    },

    hide: function()
    {
        //this.main.wxQuanState(true);
        //var self = this;
        //this.bg.runAction(cc.sequence(
        //        cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
        //        cc.scaleTo(0.2,0).easing(cc.easeSineOut()),
        //        cc.callFunc(function(){
        //            self.node.destroy();
        //        })
        //    ));
        //cc.sdk.hideBanner();
        sdk.closeRank();
        this.game.display.active = false;
        this.node.destroy();
    },




    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }

        storage.playSound(res.audio_button);
        cc.log(data);
    }


});
