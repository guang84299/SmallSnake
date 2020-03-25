/**
 * Created by guang on 18/7/18.
 */
var storage = require("storage");
module.exports = {
    isConec: true,

    is_iphonex: function()
    {
        if(!this._initiphonex)
        {
            this._initiphonex = true;
            if(true) {
                var bl = (cc.view.getFrameSize().width / cc.view.getFrameSize().height);
                var bt = cc.view.getFrameSize().height/cc.view.getFrameSize().width;
                if (bl == (1125/2436) || bl == (1080/2280) || bl == (720/1520) || bl == (1080/2340) || bt > 2.0) {
                    this.isIphoneX = true;
                } else {
                    this.isIphoneX = false;
                }
            }
        }
        return this.isIphoneX;
    },

    vibrate: function(isLong)
    {
        if(storage.getVibrate() == 1)
        {
            if(window["wx"])
            {
                if(isLong) wx.vibrateLong({});
                else wx.vibrateShort({});
            }
            else
            {
                if(isLong) $SF.Ga.startVib (100);
                else $SF.Ga.startVib (1000);
            }
        }
    },

    uploadScore: function(score,callback)
    {
        if(window["wx"])
        {
            wx.postMessage({ message: "updateScore",score:Math.floor(score) });
            if(callback)
                callback();
        }
        else
        {
            if(callback)
                callback();
        }
    },

    openRank: function(worldrank)
    {
        if(window["wx"])
        {
            wx.postMessage({ message: "friendRank",worldrank:worldrank });
        }
    },
    closeRank: function()
    {
        if(window["wx"])
        {
            wx.postMessage({ message: "closeRank" });
        }
    },

    openFuhuoRank: function(score)
    {
        if(window["wx"])
        {
            //wx.postMessage({ message: "fuhuoRank",score:Math.floor(score) });
        }
    },
    closeFuhuoRank: function()
    {
        if(window["wx"])
        {
            //wx.postMessage({ message: "closeFuhuo" });
        }
    },

    getRankList: function(callback)
    {
        if(window["wx"])
        {
            if(callback)
                callback(null);
        }
        else
        {
            if(callback)
                callback(null);
        }
    },

    getChaoyueRank: function(callback,score)
    {
        var self = this;
        if(window["wx"])
        {
            if(callback)
                callback(null);
        }
        else
        {
            if(callback)
                callback(null);
        }
    },

    videoLoad: function()
    {
        var self = this;
        if(window["wx"])
        {
            this.rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId:'adunit-af6fe34f36bab058'});
            this.rewardedVideoAd.onLoad(function(){
                console.log('激励视频 广告加载成功')
            });
            this.rewardedVideoAd.onClose(function(res){
                // 用户点击了【关闭广告】按钮
                // 小于 2.1.0 的基础库版本，res 是一个 undefined
                if (res && res.isEnded || res === undefined) {
                    if(self.videocallback)
                        self.videocallback(true);
                }
                else {
                    if(self.videocallback)
                        self.videocallback(false);
                    cc.res.showToast("视频未看完！");
                }
                //storage.playMusic(cc.sdk.main.res.audio_mainBGM);
            });
            this.rewardedVideoAd.onError(function(res){
                if(self.videocallback)
                    self.videocallback(false);
                cc.res.showToast("视频播放失败！");//+JSON.stringify(res)
                console.error(res);
            });
        }
    },

    showVedio: function(callback,postId)
    {
        var self = this;
        this.videocallback = callback;
        if(window["wx"])
        {
            this.rewardedVideoAd.show().catch(function(err){
                self.rewardedVideoAd.load().then(function(){
                    self.rewardedVideoAd.show();
                });
            });

            //if(cc.GAME.share)
            //    this.share(callback,"prop");
            //else
            //{
            //    if(callback)
            //        callback(false);
            //    cc.res.showToast("暂未开放！");
            //}
        }
        else
        {
            cc.GAME.hasVideo = true;
            cc.res.openUI("vedio");
            $SF.Ga.playRewardVideo(postId, function(r){
                if(r == 2)
                {
                    if(callback)
                        callback(true);
                }
                else
                {
                    if(callback)
                        callback(false);
                    cc.res.showToast("视频准备中...请稍后再试");
                }

                var comp  = cc.find("Canvas").getComponent("main") || cc.find("Canvas").getComponent("game1")
                || cc.find("Canvas").getComponent("game2") || cc.find("Canvas").getComponent("game3");
                comp.scheduleOnce(function(){
                    cc.res.closeUI("vedio");
                },0.2);
            },false);
        }
    },

    showBanner: function(postId,node,callback,isHide)
    {
        this.hideBanner();
        if(window["wx"])
        {
            //var dpi = cc.view.getDevicePixelRatio();
            var s = cc.view.getFrameSize();
            var dpi = cc.winSize.width/s.width;

            this.bannerAd = wx.createBannerAd({
                adUnitId: 'adunit-100ed2aa9c7e0733',
                style: {
                    left: 0,
                    top: s.height/dpi-300/3.5,
                    width: s.width*0.92
                }
            });
            var bannerAd = this.bannerAd;
            this.bannerAd.onResize(function(res){
                bannerAd.style.left = s.width/2-res.width/2;
                bannerAd.style.top = s.height-res.height-1;
                bannerAd.res = res;
                if(node && callback)
                {
                    node.runAction(cc.sequence(
                        cc.delayTime(0.4),
                        cc.callFunc(function(){
                            var y = node.parent.convertToWorldSpace(node.position).y;
                            var dis = y - res.height*dpi;
                            //console.log(dis,y,res.height,dpi,node.y,node.height,cc.winSize.height/2);
                            callback(dis);
                        })
                    ));
                }
                if(isHide)
                {
                    bannerAd.style.top = s.height+20;
                }
            });
            this.bannerAd.onError(function(res){
                console.error(res);
            });
            this.bannerAd.show();
        }
        else
        {
            $SF.Ga.showBa(postId, false, function(r){});
        }
    },

    hideBanner: function()
    {
        if(window["wx"])
        {
            if(this.bannerAd)
                this.bannerAd.destroy();
        }
        else
        {
            $SF.Ga.hideBa();
        }
    },

    getBannerDis: function(node)
    {
        if(window["wx"])
        {
            if(this.bannerAd && node)
            {
                var s = cc.view.getFrameSize();
                var dpi = cc.winSize.width/s.width;
                var y = node.parent.convertToWorldSpace(node.position).y;
                var dis = y - this.bannerAd.res.height*dpi;
                return dis;
            }
        }
        return 0;
    },

    moveBanner: function()
    {
        if(window["wx"])
        {
            if(this.bannerAd && this.bannerAd.res)
            {
                var s = cc.view.getFrameSize();
                this.bannerAd.style.top = s.height-this.bannerAd.res.height-1;
            }
        }
    },

    share: function(callback,channel)
    {
        if(window["wx"])
        {
            var query = "fromid="+cc.qianqista.openid+"&channel="+channel;
            var title = "我家的蛇动了凡心，让您贱笑了！";
            var imageUrl = "https://game.7q7q.top/img/wxgame/2307c4c4fb1945dfa51e9ba7d2adb2f6.jpg";//cc.url.raw("resources/zhuanfa.jpg");
            if(cc.GAME.shares.length>0)
            {
                var i = Math.floor(Math.random()*cc.GAME.shares.length);
                var sdata = cc.GAME.shares[i];
                if(sdata && sdata.title && sdata.imageUrl)
                {
                    title = sdata.title;
                    imageUrl = sdata.imageUrl;
                }
            }
            wx.shareAppMessage({
                query:query,
                title: title,
                imageUrl: imageUrl,
                success: function(res)
                {
                    if(callback)
                        callback(true);
                    cc.log(res);
                },
                fail: function()
                {
                    if(callback)
                        callback(false);
                }
            });
            this.shareJudge(callback);
        }
        else
        {
            if(callback)
                callback(true);
        }
    },

    shareJudge: function(callback)
    {
        cc.qianqista.sharetime = new Date().getTime();
        cc.qianqista.sharecallback = callback;
    },

    skipGame: function(gameId,url)
    {
        if(window["wx"])
        {
            if(gameId)
            {
                var pathstr = 'pages/main/main?channel=drifty';
                wx.navigateToMiniProgram({
                    appId: gameId,
                    path: pathstr,
                    extraData: {
                        foo: 'bar'
                    },
                    // envVersion: 'develop',
                    success: function(res) {
                        // 打开成功
                    }
                });
            }
            //else if(url && url.length > 5)
            //{
            //    //BK.MQQ.Webview.open(url);
            //}
        }
    },

    shortcut: function()
    {
        if(window["wx"])
        {
            //var extendInfo = "shortcut";//扩展字段
            //BK.QQ.createShortCut(extendInfo)
        }
    },

    getUserInfo: function()
    {
        if(window["wx"])
        {
            wx.getSetting({
                success: function (res) {
                    console.log(res.authSetting);
                    if(!res.authSetting["scope.userInfo"])
                    {
                        //cc.sdk.openSetting();
                        cc.qianqista.login(false);
                    }
                    else
                    {
                        wx.getUserInfo({
                            success: function(res) {
                                cc.sdk.userInfo = res.userInfo;
                                cc.qianqista.login(true,res.userInfo);
                                wx.postMessage({ message: "loginSuccess",userInfo:res.userInfo });
                            }
                        });
                    }
                }
            });


            wx.showShareMenu({
                withShareTicket: true,
                success: function (res) {
                    // 分享成功
                },
                fail: function (res) {
                    // 分享失败
                }
            });


            wx.onShareAppMessage(function (ops){
                return {
                    query:"channel=sharemenu",
                    withShareTicket: true,
                    title: "我家的蛇动了凡心，让您贱笑了！",
                    imageUrl: "https://game.7q7q.top/img/wxgame/2307c4c4fb1945dfa51e9ba7d2adb2f6.jpg"
                }
            });

            wx.updateShareMenu({
                withShareTicket: true,
                success: function (res) {
                    // 分享成功
                },
                fail: function (res) {
                    // 分享失败
                }
            })
        }
        else
        {
            cc.qianqista.login(false);
        }
    },

    judgePower: function()
    {
        if(window["wx"])
        {
            return cc.qianqista.power == 1 ? true : false;
        }
        return true;
    },

    openSetting: function(callback)
    {
        if(window["wx"])
        {
            //cc.sdk.main.openQuanXian();
            //var quan = self.node_quanxian.quan;
            //var openDataContext = wx.getOpenDataContext();
            //var sharedCanvas = openDataContext.canvas;
            //var sc = sharedCanvas.width/this.dsize.width;
            //var dpi = cc.view._devicePixelRatio;

            var s = cc.view.getFrameSize();

            var pos = cc.v2(s.width/2, s.height/2);

            var button = wx.createUserInfoButton({
                type: 'text',
                text: '获取用户信息',
                style: {
                    left: pos.x-60,
                    top: pos.y+15,
                    width: 120,
                    height: 30,
                    lineHeight: 30,
                    backgroundColor: '#1779a6',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 12,
                    borderRadius: 4
                }
            });
            button.onTap(function(res){
                console.log(res);
                if (res.errMsg.indexOf('auth deny') > -1 ||     res.errMsg.indexOf('auth denied') > -1 ) {
                    //cc.qianqista.login(false);
                    if(callback) callback(false);
                }
                else
                {
                    cc.sdk.userInfo = res.userInfo;
                    cc.qianqista.login(true,res.userInfo);
                    wx.postMessage({ message: "loginSuccess",userInfo:res.userInfo });
                    var score = storage.getScore();
                    cc.sdk.uploadScore(score);
                    if(callback) callback(true);
                    //if(cc.sdk.main.quanxiansc)
                    //    cc.sdk.main.quanxiansc.hide();
                }
                button.destroy();
            });
        }
    },

    showClub: function()
    {
        if(window["wx"])
        {
            if(!this.clubBtn)
            {
                var s = cc.view.getFrameSize();
                //var dpi = cc.winSize.width/s.width;

                this.clubBtn = wx.createGameClubButton({
                    icon: 'green',
                    style: {
                        left: s.width*0.03,
                        top: s.height*0.03,
                        width: 40,
                        height: 40
                    }
                });
            }
            else
            {
                this.clubBtn.show();
            }

        }
    },

    hideClub: function()
    {
        if(this.clubBtn)
            this.clubBtn.hide()
    },

    getNicks: function()
    {
        return ["惜爱","符号","GA","Wu","Vincent","刚","世界","Mr","Dick","陈俊士","虾仁","袁伟","misty","逆水寒"];
    }
};