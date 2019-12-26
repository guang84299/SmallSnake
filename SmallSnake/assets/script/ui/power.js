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

    },

    updateUI: function()
    {

    },

    show: function()
    {
        //this.main.wxQuanState(false);
        this.game = cc.find("Canvas").getComponent("main");
        this.node.sc = this;
        this.initUI();
        this.updateUI();

        this.node.active = true;
        //this.bg.runAction(cc.sequence(
        //        cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
        //        cc.scaleTo(0.2,1).easing(cc.easeSineOut())
        //    ));

        cc.qianqista.event("授权_打开");
        //storage.playSound(res.audio_win);
    },

    hide: function()
    {
        //this.main.wxQuanState(true);
        var self = this;
        //this.bg.runAction(cc.sequence(
        //        cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
        //        cc.scaleTo(0.2,0).easing(cc.easeSineOut()),
        //        cc.callFunc(function(){
        //            self.node.destroy();
        //        })
        //    ));
        self.node.destroy();
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
