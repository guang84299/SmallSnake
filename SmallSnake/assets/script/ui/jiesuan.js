var storage = require("storage");
var res = require("res");

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
        this.num = cc.find("level/num",this.bg).getComponent(cc.Label);

        this.gameIndex = 1;
        if(cc.myscene == "game2") this.gameIndex = 2;
        else if(cc.myscene == "game3") this.gameIndex = 3;
    },

    updateUI: function()
    {
        var lv = storage.getLevel(this.gameIndex);
        this.num.string = lv-1;
    },

    next: function()
    {
        this.game.nextLevel();
        this.hide();
    },

    show: function()
    {
        //this.main.wxQuanState(false);
        this.game = cc.find("Canvas").getComponent(cc.myscene);
        this.node.sc = this;
        this.initUI();
        this.updateUI();

        this.node.active = true;
        this.bg.runAction(cc.sequence(
                cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
                cc.scaleTo(0.2,1).easing(cc.easeSineOut())
            ));
        cc.sdk.showBanner();
    },

    hide: function()
    {
        //this.main.wxQuanState(true);
        var self = this;
        this.bg.runAction(cc.sequence(
                cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
                cc.scaleTo(0.2,0).easing(cc.easeSineOut()),
                cc.callFunc(function(){
                    self.node.destroy();
                })
            ));
        cc.sdk.hideBanner();
    },

    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "next")
        {
            this.next();
        }

        this.updateUI();
        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});
