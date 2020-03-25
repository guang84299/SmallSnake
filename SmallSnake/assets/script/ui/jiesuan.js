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
        this.lv_num = cc.find("top/lvbg/num",this.bg).getComponent(cc.Label);
        this.label_name = cc.find("top/name",this.bg).getComponent(cc.Label);
        this.coin_num = cc.find("top/coinbg/num",this.bg).getComponent(cc.Label);
        this.jifen_num = cc.find("top/scorebg/num",this.bg).getComponent(cc.Label);

        this.node_win = cc.find("node_win",this.bg);
        this.node_fail = cc.find("node_fail",this.bg);

        this.btn_lingqu = cc.find("lingqu",this.node_win);

        this.gameIndex = 1;
        if(cc.myscene == "game2") this.gameIndex = 2;
        else if(cc.myscene == "game3") this.gameIndex = 3;

        storage.uploadLevel(this.gameIndex);

        if(cc.sdk.is_iphonex())
        {
            var topNode = cc.find("top",this.bg);
            topNode.runAction(cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(function(){
                    var s = cc.view.getFrameSize();
                    var dpi = cc.winSize.width/s.width;
                    topNode.y -= dpi*30;
                })
            ));
        }
    },

    updateUI: function()
    {
        var lv = this.game.level;
        if(cc.GAME.helpLevel>0)
            this.lv_num.string = lv;
        else
            this.lv_num.string = lv-1;

        this.coin_num.string = storage.getCoin();
        this.jifen_num.string = storage.getScore();

        if(cc.sdk.judgePower())
        {
            this.label_name.string = cc.qianqista.userName;
        }

        if(!this.isLingqu)
        {
            this.coin_num.string = storage.getCoin()+this.award_coin;
            this.jifen_num.string = storage.getScore()+this.award_score;
        }
    },

    win: function()
    {
        this.node_win.active = true;
        this.node_fail.active = false;

        this.isLingqu = false;
        this.useShare = false;
        if(cc.GAME.share)
        {
            var rad = parseInt(cc.GAME.jiesuanAd);
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.btn_lingqu.getChildByName("share").active = true;
                this.btn_lingqu.getChildByName("video").active = false;
            }
            else
            {
                this.btn_lingqu.getChildByName("share").active = false;
                this.btn_lingqu.getChildByName("video").active = true;
            }
        }

        var center = cc.find("center",this.node_win);
        var star = cc.find("star",center);

        var coin_num = cc.find("coinbg/coinbg/num",center).getComponent(cc.Label);
        var jifen_num = cc.find("jifenbg/coinbg/num",center).getComponent(cc.Label);

        var jifen = cc.config.gameScores[this.gameIndex-1];
        jifen_num.string = "+"+jifen;
        this.award_score = jifen;

        var starNum = this.game.getStar();

        var coin = cc.config.gameAwards[this.gameIndex-1].award;
        coin_num.string = "+"+coin;
        this.award_coin = coin;


        for(var i=1;i<=starNum;i++)
        {
            var star1 = cc.find("star"+i,center);

            var star11 = cc.instantiate(star);
            star11.active = true;
            star11.position = star1.position.add(cc.v2(-500,500));
            star11.scale = 3;
            star11.parent = star1.parent;

            star11.runAction(cc.sequence(
                cc.delayTime(i*0.3),
                cc.spawn(
                    cc.scaleTo(0.2,1).easing(cc.easeSineIn()),
                    cc.moveBy(0.2,cc.v2(500,-500)).easing(cc.easeSineIn())
                )
            ));
        }

        if(cc.GAME.helpLevel>0)
        {
            storage.uploadHelp(this.gameIndex,cc.GAME.helpLevel);
        }
    },

    lingqu: function(isX2)
    {
        if(this.isLingqu)
            return;
        this.isLingqu = true;
        this.btn_lingqu.getComponent(cc.Button).interactable = false;
        if(isX2)
        {
            this.award_score *= 2;
            this.award_coin *= 2;
        }
        var score = storage.getScore();
        storage.setScore(score+this.award_score);

        var coin2 = storage.getCoin();
        storage.setCoin(coin2+this.award_coin);

        if(cc.GAME.helpLevel==0)
        {
            var score = storage.getScore();
            cc.sdk.uploadScore(score);
            storage.uploadCoin();
            storage.uploadScore();
        }
        this.updateUI();
        cc.res.showToast("金币+"+this.award_coin+"  积分+"+this.award_score);
    },

    fail: function()
    {
        this.node_win.active = false;
        this.node_fail.active = true;
    },

    next: function()
    {
        this.lingqu();
        if(cc.GAME.helpLevel==0)
            this.game.nextLevel();
        else
        {
            cc.GAME.helpLevel = 0;
            cc.director.loadScene("main");
        }
        this.hide();
    },

    again: function()
    {
        this.game.resetData();
        this.hide();
    },

    home: function()
    {
        this.lingqu();
        cc.GAME.helpLevel = 0;
        cc.director.loadScene("main");

        this.hide();
    },

    show: function(data)
    {
        //this.main.wxQuanState(false);
        this.game = cc.find("Canvas").getComponent(cc.myscene);
        this.node.sc = this;
        this.initUI();

        if(data == "win")
            this.win();
        else
            this.fail();

        this.updateUI();

        this.node.active = true;
        //this.bg.runAction(cc.sequence(
        //        cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
        //        cc.scaleTo(0.2,1).easing(cc.easeSineOut())
        //    ));
        cc.sdk.showBanner(20003);

        storage.playSound(res.audio_win);
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
        else if(data == "again")
        {
            this.again();
        }
        else if(data == "home")
        {
            this.home();
        }
        else if(data == "lingqu")
        {
            var self = this;
            if(this.useShare)
            {
                cc.sdk.share(function(r){
                    if(r)
                    {
                        self.lingqu(true);
                    }
                },"jiesuan");
            }
            else
            {
                cc.sdk.showVedio(function(r){
                    if(r)
                    {
                        self.lingqu(true);
                    }
                },10005);
            }
        }

        this.updateUI();
        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});
