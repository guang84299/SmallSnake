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

        this.items = cc.find("content/items",this.bg).children;
        this.btn_lingqu = cc.find("content/btns/lingqu",this.bg).getComponent(cc.Button);
        this.btn_lingqu2 = cc.find("content/btns/lingqu2",this.bg).getComponent(cc.Button);

        this.btn_lingqu.mcolor = this.btn_lingqu.node.color;
        this.btn_lingqu2.mcolor = this.btn_lingqu2.node.color;

        this.useShare = false;
        if(cc.GAME.share)
        {
            var rad = parseInt(cc.GAME.qiandaoAd);
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.btn_lingqu2.node.getChildByName("share").active = true;
                this.btn_lingqu2.node.getChildByName("video").active = false;
            }
            else
            {
                this.btn_lingqu2.node.getChildByName("share").active = false;
                this.btn_lingqu2.node.getChildByName("video").active = true;
            }
        }
    },

    updateUI: function()
    {
        var loginDay = storage.getLoginDay();
        var qiandaoNum = storage.getQianDaoNum();
        this.qiandaoNum = qiandaoNum;
        var canSign = false;
        if(loginDay>qiandaoNum && qiandaoNum<7)
        {
            canSign = true;
        }

        for(var i=0;i<this.items.length;i++)
        {
            var item = this.items[i];
            var award = cc.find("award",item).getComponent(cc.Label);
            var desc = cc.find("desc",item);
            var box = cc.find("box",item);
            var mask = cc.find("mask",item);

            var data = cc.config.qiandao[i];

            award.string = "x"+data.award;
            if(i==qiandaoNum)
            {
                if(canSign)
                {
                    box.active = true;
                    mask.active = false;
                    //award.node.color = cc.color(196,124,30);
                    //desc.color = cc.color(196,124,30);
                }
            }
            else if(i<qiandaoNum)
            {
                box.active = false;
                mask.active = true;
                award.string = "已领取";
                //award.node.color = cc.color(124,121,114);
                //desc.color = cc.color(124,121,114);
            }
            else
            {
                box.active = false;
                mask.active = false;
                //award.node.color = cc.color(196,124,30);
                //desc.color = cc.color(124,121,114);
            }
        }

        this.btn_lingqu.interactable = canSign;
        this.btn_lingqu2.interactable = canSign;
        //if(canSign)
        //{
        //    this.btn_lingqu.node.color = this.btn_lingqu.mcolor;
        //    this.btn_lingqu2.node.color = this.btn_lingqu2.mcolor;
        //}
        //else
        //{
        //    this.btn_lingqu.node.color = cc.color(180,180,180);
        //    this.btn_lingqu2.node.color = cc.color(180,180,180);
        //}

        this.btn_lingqu2.node.active = cc.GAME.share;
    },

    lingqu: function(x2)
    {
        var award = cc.config.qiandao[this.qiandaoNum].award;
        if(x2) award *= 2;
        var coin = storage.getCoin();
        storage.setCoin(coin+award);

        storage.setQianDaoNum((this.qiandaoNum+1));
        storage.uploadQianDaoNum();

        res.showToast("金币+"+award);
        this.updateUI();

        //this.game.task.updateUI();
        //cc.res.showCoinAni();
    },

    show: function(award)
    {
        this.award = award;
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
        cc.sdk.showBanner();

    },

    hide: function()
    {
        //this.game.updateRed();
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
        //cc.sdk.hideBanner();
    },

    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "lingqu")
        {
            this.lingqu();
        }
        else if(data == "lingqu2")
        {
            var self = this;
            if(this.useShare)
            {
                cc.sdk.share(function(r){
                    if(r)
                    {
                        self.lingqu(true);
                    }
                },"qiandao");
            }
            else
            {
                cc.sdk.showVedio(function(r){
                    if(r)
                    {
                        self.lingqu(true);
                    }
                });
            }

        }
        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});
