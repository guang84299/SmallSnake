/**
 * Created by guang on 19/4/9.
 */

var res = require("res");
var qianqista = require("qianqista");
var sdk = require("sdk");
var storage = require("storage");
var config = require("config");

cc.qianqista = qianqista;
cc.sdk = sdk;
cc.storage = storage;
cc.config = config;
cc.myscene = "load";
cc.res = res;
cc.GAME = {};

cc.Class({
    extends: cc.Component,

    properties: {
        progressBar: {
            default: null,
            type: cc.ProgressBar
        },

        progressTips: {
            default: null,
            type: cc.Label
        },

        progressCar: {
            default: null,
            type: cc.Node
        },

        loadNode: {
            default: null,
            type: cc.Node
        }
    },


    onLoad: function() {

        //cc.sys.os = "web";
        this.resource = null;
        res.initPools();

        this.purls = [
            //"audio/button",
            "conf/tips",
            "conf/pilot",
            "conf/test",
            "prefab/game1/apple",
            "prefab/game1/stone",
            "prefab/game1/trap",

            "prefab/game2/block",
            "prefab/game2/blockTip",

            "prefab/game3/boom",
            "prefab/game3/emitterAni",

            "prefab/ui/jiesuan",
            "prefab/ui/choujiang",
            "prefab/ui/qiandao",
            "prefab/ui/rank",
            "prefab/ui/power",
            "prefab/ui/help",
            "prefab/ui/test",
            "prefab/ui/toast",
            //
            //"prefab/particle/suijinbi",
            "scene/game1"
        ];

        for(var i=1;i<=config.levelNum;i++)
        {
            this.purls.push("maps1/level_"+i);
        }
        for(var i=1;i<=config.levelNum2;i++)
        {
            this.purls.push("maps2/level_"+i);
        }
        for(var i=1;i<=config.levelNum3;i++)
        {
            this.purls.push("maps3/level_"+i);
        }
        this.completedCount = 0;
        this.totalCount = this.purls.length;
        this.loadCount = 0;

        this.nowtime = new Date().getTime();
        for(var i=0;i<3;i++)
            this.loadres();

        var self = this;
        qianqista.init("wx0444b5396e3d18ba","d0c3b794e0680ff86984c9076b73c89a","我的蛇啊",function(){
            var score = storage.getScore();
            sdk.uploadScore(score,self.initNet.bind(self));
        });
        sdk.getUserInfo();
        sdk.videoLoad();
        sdk.closeRank();


        this.loadNode.runAction(cc.repeatForever(cc.rotateBy(1,180)));

        this.isFirst = false;
        if(storage.getFirst() == 0)
        {
            this.isFirst = true;
            storage.setFirst(1);
            storage.setMusic(1);
            storage.setSound(1);
            storage.setVibrate(1);
            storage.setCoin(0);
        }
    },

    loadres: function()
    {
        var self = this;
        if(this.loadCount<this.totalCount)
        {
            var index = this.loadCount;
            cc.loader.loadRes(this.purls[index], function(err, prefab)
            {
                self.progressCallback(self.completedCount,self.totalCount,prefab,index);
            });
            this.loadCount++;
        }
    },


    progressCallback: function (completedCount, totalCount, resource,index) {
        this.progress = completedCount / totalCount;
        this.resource = resource;
        this.completedCount++;
        //this.totalCount = totalCount;

        this.progressBar.progress = this.progress;
        this.progressTips.string = "加载中 " + Math.floor(this.completedCount/this.totalCount*100)+"%";

        if(this.completedCount>=this.totalCount)
        {
            this.completeCallback();
        }
        else{
            this.loadres();
        }

        this.setRes(resource,index);

        this.progressCar.x = this.progress*520-260+20;
        this.progressCar.angle -= 4;
        //cc.log(resource);
    },
    completeCallback: function (error, resource) {
        console.log("-----completeCallback---time:",new Date().getTime()-this.nowtime);
        this.progressTips.string = "加载完成";
        this.progressBar.progress = 1;
        //this.progressTips.string = "加载中";
        //this.progressBar.node.active = true;
        //cc.loader.loadResDir("audio", this.progressCallback.bind(this), this.completeCallback2.bind(this));

        this.startGame();
    },

    startGame: function()
    {
        if(!this.loadNode.active && this.progressBar.progress >= 1)
        {
            cc.director.loadScene("main");
        }

    },

    setRes: function(resource,index)
    {
        var url = this.purls[index];
        var pifx = "";
        if(url.indexOf("audio/") != -1)
            pifx = "audio_";
        else if(url.indexOf("prefab/game1/") != -1)
            pifx = "prefab_game1_";
        else if(url.indexOf("prefab/game2/") != -1)
            pifx = "prefab_game2_";
        else if(url.indexOf("prefab/game3/") != -1)
            pifx = "prefab_game3_";
        else if(url.indexOf("maps1/") != -1)
            pifx = "game1_";
        else if(url.indexOf("maps2/") != -1)
            pifx = "game2_";
        else if(url.indexOf("maps3/") != -1)
            pifx = "game3_";
        else if(url.indexOf("conf/") != -1)
        {
            pifx = "conf_"+resource.name;
            //console.error(url,cc.url.raw("resources/"+url));
            resource = JSON.parse(resource.text);
        }

        if(url.indexOf("conf/") != -1)
            res[pifx] = resource;
        else
            res[pifx+resource.name] = resource;

        //cc.log(res);
    },

    initNet: function()
    {
        var self = this;
        qianqista.datas(function(res){
            console.log('my datas:', res);
            if(res.state == 200)
            {
                self.updateLocalData(res.data);
            }
            self.loadNode.active = false;
            self.startGame();
        });
        //qianqista.pdatas(function(res){
        //    self.updateLocalData2(res);
        //});
        //qianqista.rankScore(function(res){
        //    self.worldrank = res.data;
        //});

        qianqista.control(function(res){
            console.log('my control:', res);
            if(res.state == 200)
            {
                cc.GAME.control = res.data;
            }
        });

        //if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS)
        //{
        //    BK.Script.log(1,1,'---------qianqista.init：');
        //    BK.onEnterForeground(function(){
        //        BK.Script.log(1,1,"---onEnterForeground----");
        //
        //        //storage.playMusic(self.res.audio_bgm);
        //    });
        //}

    },

    updateLocalData: function(data)
    {
        if(data)
        {
            var datas = JSON.parse(data);
            if(datas.hasOwnProperty("first"))
                storage.setFirst(1);
            if(datas.hasOwnProperty("coin"))
                storage.setCoin(Number(datas.coin));
            if(datas.hasOwnProperty("score"))
                storage.setScore(Number(datas.score));
            if(datas.hasOwnProperty("level_1"))
                storage.setLevel(1,Number(datas.level_1));
            if(datas.hasOwnProperty("level_2"))
                storage.setLevel(2,Number(datas.level_2));
            if(datas.hasOwnProperty("level_3"))
                storage.setLevel(3,Number(datas.level_3));


            //if(datas.hasOwnProperty("login_time"))
            //    storage.setLoginTime(Number(datas.login_time));
            if(datas.hasOwnProperty("login_day"))
                storage.setLoginDay(Number(datas.login_day));
            if(datas.hasOwnProperty("game_num"))
                storage.setGameNum(Number(datas.game_num));


            if(datas.hasOwnProperty("ginvitelist"))
                cc.ginvitelist = datas.ginvitelist;
            if(datas.hasOwnProperty("ginvite_lnum"))
                storage.setInviteLnum(Number(datas.ginvite_lnum));


            console.log("datas:",datas);

            var now = new Date().getTime();
            if(datas.hasOwnProperty("login_time"))
                cc.login_time = Number(datas.login_time);
            else
                cc.login_time = now;
            storage.setLoginTime(now);
            storage.uploadLoginTime();

            if(res.isRestTime(cc.login_time,now))
            {
                storage.setLoginDay(parseInt(datas.login_day)+1);
                storage.uploadLoginDay();
            }
        }
        else
        {
            var now = new Date().getTime();
            cc.login_time = now;
            storage.setLoginTime(now);
            storage.setLoginDay(1);
            this.uploadData();
        }
    },

    updateLocalData2: function(res)
    {
        var self = this;
        if(res.state == 1)
        {
            qianqista.paddUser(function(res){
                qianqista.rankScore(function(res2){
                    self.worldrank = res2.data;
                });
            },storage.getCoin());
        }
        else
        {
            var datas = res.data;
            if(datas)
            {

            }
        }
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
    }
});
