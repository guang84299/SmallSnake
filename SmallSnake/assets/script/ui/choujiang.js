var storage = require("storage");
var res = require("res");
var sdk = require("sdk");

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
        this.txt_time = cc.find("content/txt_time/num",this.bg).getComponent("cc.Label");
        this.txt_num = cc.find("content/txt_num/num",this.bg).getComponent("cc.Label");
        this.btn_choujiang = cc.find("content/box/choujiang",this.bg).getComponent("cc.Button");
        this.btn_vedio_lingqu = cc.find("content/btns/lingqu2",this.bg).getComponent("cc.Button");
        this.btn_lingqu = cc.find("content/btns/lingqu",this.bg).getComponent("cc.Button");
        this.btn_lingqu_ban = cc.find("content/btns/lingqu",this.bg);


        this.btn_lingqu.node.active = false;
        this.btn_vedio_lingqu.node.active = false;

        this.boxs = cc.find("content/box/boxs",this.bg).children;
        this.awards = cc.config.choujiang;

        for(var i=0;i<this.boxs.length;i++)
        {
            var box = this.boxs[i];
            var data = this.awards[i];
            box.guang = cc.find("box/guang",box);

            box.guang.active = true;
            box.guang.opacity = 0;

            var icon = cc.find("box/icon",box);
            var desc = cc.find("box/desc",box).getComponent(cc.Label);
            desc.string = data.desc;
            icon.width = 40;
            icon.height = 40;
            if(data.type == 1)
            {
                //res.setSpriteFrame("images/common/coin",icon);
                //desc.node.color = cc.color(225,130,6);
            }
        }
    },

    updateUI: function(isAmin)
    {
        var choujiangNum = storage.getChoujiangNum();
        this.txt_num.string = choujiangNum+"/5";
        if(!isAmin)
        this.btn_choujiang.interactable = choujiangNum>0 ? true : false;

        var choujiangTime = storage.getChoujiangTime();
        var now = new Date().getTime();
        if(choujiangNum < 5)
        {
            if(now - choujiangTime>5*60*1000)
            {
                var num = Math.floor((now - choujiangTime)/(5*60*1000));
                choujiangNum += num;
                if(choujiangNum>5) choujiangNum = 5;
                storage.setChoujiangNum(choujiangNum);
                this.txt_num.string = choujiangNum+"/5";
                if(!isAmin)
                this.btn_choujiang.interactable = choujiangNum>0 ? true : false;
            }

            this.updateTime();
        }

        this.useShare = false;
        if(cc.GAME.share)
        {
            var rad = parseInt(cc.GAME.zhuanpanAd);
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.btn_vedio_lingqu.node.getChildByName("share").active = true;
                this.btn_vedio_lingqu.node.getChildByName("video").active = false;
            }
            else
            {
                this.btn_vedio_lingqu.node.getChildByName("share").active = false;
                this.btn_vedio_lingqu.node.getChildByName("video").active = true;
            }
        }
    },

    updateTime: function()
    {
        this.node.stopAllActions();

        var self = this;
        var choujiangNum = storage.getChoujiangNum();
        if(choujiangNum<5)
        {
            var choujiangTime = storage.getChoujiangTime();
            var now = new Date().getTime();
            var time = 5*60*1000 - (now - choujiangTime);

            var h = Math.floor(time/(60*60*1000));
            var m = Math.floor((time - h*60*60*1000)/(60*1000));
            var s = Math.floor(((time - h*60*60*1000 - m*60*1000))/1000);
            //var sh = h < 10 ? "0"+h : h;
            var sm = m < 10 ? "0"+m : m;
            var ss = s < 10 ? "0"+s : s;
            this.txt_time.string = sm+":"+ss;

            if(time<1000)
            {
                choujiangNum+=1;
                storage.setChoujiangNum(choujiangNum);
                storage.setChoujiangTime(now);
                this.txt_num.string = choujiangNum+"/5";
                this.btn_choujiang.interactable = choujiangNum>0 ? true : false;
            }
            this.node.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function(){
                    self.updateTime();
                })
            ));
        }
        else
        {
            this.updateUI();
        }
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



        cc.qianqista.event("抽奖_打开");
        cc.sdk.showBanner(20002);
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

    choujiangAmin: function(num,awardIndex,callback)
    {
        var self = this;
        var t = 0.1;
        var dt = 0.05;
        if(num>5)
        {
            dt = dt + (num-5)*0.05;
        }

        for(var i=0;i<this.boxs.length;i++)
        {
            var box = this.boxs[i];

            var ac = cc.sequence(
                cc.delayTime(dt*i),
                cc.fadeIn(0),
                cc.delayTime(t),
                cc.fadeOut(0)
            );

            if(i == this.boxs.length-1 || num == 8)
            {
                ac = cc.sequence(
                    cc.delayTime(dt*i),
                    cc.fadeIn(0),
                    cc.delayTime(t),
                    cc.fadeOut(0),
                    cc.callFunc(function(){
                        num++;
                        if(num>8)
                        {
                            callback();
                        }
                        else
                        {
                            self.choujiangAmin(num,awardIndex,callback);
                        }
                    })
                );

            }

            box.guang.runAction(ac);

            if(num == 8)
                break;
        }

    },

    choujiang: function()
    {
        var self = this;
        this.btn_choujiang.interactable = false;
        var awardIndex = 0;

        var r = Math.random()*100;
        var weight = 0;
        for(var i=this.awards.length-1;i>=0;i--)
        {
            var award = this.awards[i];
            weight += Number(award.weight);
            if(r<=weight)
            {
                awardIndex = i;
                break;
            }
        }

        this.choujiangAmin(1,awardIndex,function(){
            var box = self.boxs[awardIndex];
            box.guang.opacity = 255;

            if(cc.GAME.share)
            self.btn_vedio_lingqu.node.active = true;
            self.btn_lingqu.node.active = true;
            self.updateUI(true);
        });


        this.awardIndex = awardIndex;
        var choujiangNum = storage.getChoujiangNum();
        storage.setChoujiangNum(choujiangNum-1);
        if(choujiangNum == 5)
        {
            storage.setChoujiangTime(new Date().getTime());
        }

        //storage.setChoujiangToalNum(storage.getChoujiangToalNum()+1);
        //storage.uploadChoujiangToalNum();
        //
        //this.game.task.updateUI();
    },

    lingqu: function(isVedio)
    {
        var awardData = this.awards[this.awardIndex];
        if(awardData.type == 1)
        {
            var award = awardData.award;
            if(isVedio) award*=2;

            var coin = storage.getCoin();
            storage.setCoin(coin+award);
            storage.uploadCoin();
            res.showToast("金币+"+award);
            //cc.res.showCoinAni();
        }


        this.btn_choujiang.interactable = true;
        this.btn_vedio_lingqu.node.active = false;
        this.btn_lingqu.node.active = false;
        this.updateUI();
        this.game.updateUI();
    },

    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "choujiang")
        {
            this.choujiang();
            cc.qianqista.event("抽奖_点击");
        }
        else if(data == "lingqu")
        {
            this.lingqu();
            cc.qianqista.event("抽奖_领取");
        }
        else if(data == "vedio_lingqu")
        {
            var self = this;
            if(this.useShare)
            {
                cc.sdk.share(function(r){
                    if(r)
                    {
                        self.lingqu(true);
                    }
                },"choujiang");
            }
            else
            {
                cc.sdk.showVedio(function(r){
                    if(r)
                    {
                        self.lingqu(true);
                    }
                },10004);
            }
            cc.qianqista.event("抽奖_2倍领取");
        }

        storage.playSound(res.audio_button);
        cc.log(data);
    }


});
