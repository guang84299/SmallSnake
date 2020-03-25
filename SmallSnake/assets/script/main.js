/**
 * Created by guang on 18/7/18.
 */
var config = require("config");
var storage = require("storage");
var qianqista = require("qianqista");
var sdk = require("sdk");
var res = require("res");


cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function() {
        cc.ginvitelist = [];
        cc.myscene = "main";

        storage.playMusic(res.audio_music);

        this.initData();

        this.initUI();
        this.updateUI();

        this.initEnd();

        cc.qianqista.showcallback = this.initEnd;
        //sdk.showClub();

        //sdk.showBanner();

        var test = storage.getTest();
        if(test == 0 || test == 2)
            res.openUI("test");
        else
            sdk.showBanner(20001);
    },


    uploadData: function()
    {
        var datas = {};
        datas.first = storage.getFirst();
        datas.coin = storage.getCoin();
        datas.level_1 = storage.getLevel(1);
        datas.level_2 = storage.getLevel(2);
        datas.level_3 = storage.getLevel(3);
        datas.login_time = storage.getLoginTime();
        datas.login_day = storage.getLoginDay();
        datas.game_num = storage.getGameNum();
        datas.ginvite_lnum = storage.getInviteLnum();


        console.log("uploadData:",datas);
        var data = JSON.stringify(datas);
        var self = this;
        qianqista.uploaddatas(data,function(res){
            console.log("--uploaddatas:",res);
            //if(res && res.state == 200)
            //    self.updateData();
        });

        //qianqista.uploadScore(storage.getMaxPoint());
    },

    updateUIControl: function()
    {
        cc.GAME.helpLevel = 0;
        cc.GAME.skipgame = null;
        cc.GAME.share = false;
        cc.GAME.lixianswitch = false;
        cc.GAME.shares = [];
        if(cc.GAME.control.length>0)
        {
            for(var i=0;i<cc.GAME.control.length;i++)
            {
                var con = cc.GAME.control[i];
                if(con.id == "skipgame")
                {
                    if(con.value)
                    {
                        var s = con.value.replace(/\'/g,"\"");
                        cc.GAME.skipgame = JSON.parse(s);
                    }
                }
                else if(con.id.indexOf("share") != -1)
                {
                    if(con.id == "share")
                    {
                        cc.GAME.share = con.value == 1 ? true : false;
                    }
                    else
                    {
                        if(con.value)
                        {
                            var s = con.value.replace(/\'/g,"\"");
                            cc.GAME.shares.push(JSON.parse(s));
                        }
                    }

                }
                else if(con.id == "lixian")
                {
                    cc.GAME.lixianswitch = con.value == 1 ? true : false;
                }
                else
                {
                    cc.GAME[con.id] = con.value;
                }
            }

        }
        this.share_btn.active = cc.GAME.share;
    },


    initData: function()
    {


    },

    initUI: function()
    {
        this.node_main = cc.find("node_main",this.node);
        this.display = cc.find("display",this.node);

        this.share_btn = cc.find("share",this.node_main);
        this.share_btn.active = false;

        this.display.active = false;

        this.coin_num = cc.find("top/coinbg/num",this.node_main).getComponent(cc.Label);
        this.score_num = cc.find("top/scorebg/num",this.node_main).getComponent(cc.Label);
        //if(sdk.is_iphonex())
        //{
        //    var topNode = cc.find("top",this.node_main);
        //    var buttons = cc.find("buttons",this.node_main);
        //    topNode.runAction(cc.sequence(
        //        cc.delayTime(0.1),
        //        cc.callFunc(function(){
        //            var s = cc.view.getFrameSize();
        //            var dpi = cc.winSize.width/s.width;
        //            topNode.y -= dpi*30;
        //            buttons.y -= dpi*15;
        //        })
        //    ));
        //}

        this.updateUIControl();
        this.updateHead();
    },

    initEnd: function()
    {
        if(qianqista.isUpdate && qianqista.channel == "game" && qianqista.fromid)
        {
            qianqista.isUpdate = false;
            var snakeId = qianqista.queryData.snakeId;
            var level = qianqista.queryData.level;

            if(snakeId && level)
            {
                sdk.hideBanner();
                cc.GAME.helpLevel = level;
                cc.director.loadScene("game"+snakeId);
            }

        }
    },

    updateHead: function()
    {
        if(sdk.judgePower())
        {
            var head = cc.find("top/headbg/mask/head",this.node_main);
            var name = cc.find("top/name",this.node_main).getComponent(cc.Label);

            res.loadPic(qianqista.avatarUrl,head);
            name.string = qianqista.userName;
        }
    },

    updateUI: function()
    {
        this.coin_num.string = storage.getCoin();
        this.score_num.string = storage.getScore();
    },



    click: function(event,data)
    {
        var self = this;
        if(data == "game1")
        {
            sdk.hideBanner();
            cc.director.loadScene("game1");
        }
        else if(data == "game2")
        {
            sdk.hideBanner();
            cc.director.loadScene("game2");
        }
        else if(data == "game3")
        {
            sdk.hideBanner();
            cc.director.loadScene("game3");
        }
        else if(data == "setting")
        {
            res.openUI("setting");
        }
        else if(data == "rank")
        {
            if(sdk.judgePower())
                res.openUI("rank");
            else
            {
                res.openUI("power");
                sdk.openSetting(function(r){
                    res.closeUI("power");
                    if(r){
                        res.showToast("成功获取权限！");
                        self.updateHead();
                        cc.qianqista.event("授权_允许");
                    }
                    else
                    {
                        res.showToast("请允许授权！");
                        cc.qianqista.event("授权_拒绝");
                    }
                });
            }
        }
        else if(data == "share")
        {
            sdk.share(null,"main");
            cc.qianqista.event("分享有礼_打开");
        }
        else if(data == "zhuanpan")
        {
            res.openUI("choujiang");
        }
        else if(data == "qiandao")
        {
            res.openUI("qiandao");
        }
        storage.playSound(res.audio_button);
        cc.log(data);
    },




    update: function(dt) {

    }
});