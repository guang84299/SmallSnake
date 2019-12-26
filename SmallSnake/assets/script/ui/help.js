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

        this.desc = cc.find("box/box/desc",this.bg).getComponent(cc.Label);
    },

    updateUI: function()
    {

    },



    show: function(data)
    {
        this.initUI();
        this.desc.string = data;
    },

    hide: function()
    {
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
