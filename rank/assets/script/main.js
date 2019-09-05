
cc.Class({
    extends: cc.Component,

    properties: {

    },


    onLoad: function()
    {

        this.initUI();

        this.kvdata = {
            wxgame:
            {
                score: 0,
                update_time: 0
            }
        };

        this.userInfo = null;
        this.friendRank = null;
        var self = this;


        wx.onMessage(function(data){
            if(data.message == "closeFuhuo")
            {
                //self.node_fuhuo_bg.runAction(cc.sequence(
                //    cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
                //    cc.scaleTo(0.18,0).easing(cc.easeSineOut()),
                //    cc.callFunc(function(){
                //        self.node_fuhuo.active = false;
                //    })
                //));
            }
            else if(data.message == "closeRank")
            {
                self.node_rank.active = false;
                //self.bg.runAction(cc.sequence(
                //    cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
                //    cc.scaleTo(0.2,0).easing(cc.easeSineOut()),
                //    cc.callFunc(function(){
                //        self.node_rank.active = false;
                //    })
                //));
            }
            else if(data.message == "friendRank"){ //好友排行榜
                //self.worldrank = data.worldrank;
                self.showPaiming();
            }
            else if(data.message == "fuhuoRank"){ //3人排行榜
                //self.uploadScore(data.score);
                //self.showOverRank(data.score);
            }
            else if(data.message == "loginSuccess")
            {
                self.userInfo = data.userInfo;
                self.getUserRank();
                self.getFriendRank();
            }
            else if(data.message == "updateScore")
            {
                self.updateScore(data.score);
            }

            console.log(data.message);
        });

    },


    initUI: function()
    {
        this.node_rank = cc.find("Canvas/node_rank");
        this.bg = cc.find("bg",this.node_rank);
        this.content = cc.find("box/scroll/view/content",this.bg);
        this.item = cc.find("box/scroll/item",this.bg);
        //this.page_last = cc.find("bottom/page_last",this.bg);
        //this.page_next = cc.find("bottom/page_next",this.bg);
        //this.page_num = cc.find("bottom/num",this.bg).getComponent("cc.Label");
        //
        //var self = this;
        //this.page_last.on(cc.Node.EventType.TOUCH_END, function ()
        //{
        //    self.click(null,"last");
        //});
        //this.page_next.on(cc.Node.EventType.TOUCH_END, function ()
        //{
        //    self.click(null,"next");
        //});
        //this.page = 0;
        //this.pageToal = 1;
    },

    updateUI: function()
    {
        //this.page_last.active = (this.page != 0);
        //this.page_next.active = (this.page+1 < this.pageToal);
        //this.page_num.string = (this.page+1)+"/"+this.pageToal;
    },

    additem: function()
    {
        var self = this;
        var i = this.content.childrenCount;
        if(i<this.friendRank.length)
        {
            var data = this.friendRank[i];
            var car_rank = data.KVDataList[0].value;
            var rankdata  = JSON.parse(car_rank);

            var id = i;
            var item = cc.instantiate(this.item);
            var num = cc.find("rank",item).getComponent("cc.Label");
            var name = cc.find("name",item).getComponent("cc.Label");
            var score = cc.find("score",item).getComponent("cc.Label");
            var head = cc.find("icon",item);
            //var rankIcon = cc.find("rankIcon",item);
            item.tid = id;
            num.string = (i+1);
            name.string = this.getLabelStr(data.nickname,8);
            score.string = "积分："+rankdata.wxgame.score;
            if(data.avatarUrl && data.avatarUrl.length>10)
                this.loadPic(head,data.avatarUrl);

            //this.setSpriteFrame("images/rank/bg_"+(this.content.childrenCount+1),item);

            item.active = true;
            this.content.addChild(item);

            self.additem();

            //this.scheduleOnce(this.addItem.bind(this),0.1);
        }
    },

    showPaiming: function()
    {
        this.node_rank.active = true;
        //this.bg.runAction(cc.sequence(
        //    cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
        //    cc.scaleTo(0.2,1).easing(cc.easeSineOut())
        //));
        this.updateUI();
        this.content.removeAllChildren();
        this.additem();
    },



    click: function(event,data)
    {
        if(data == "last")
        {
            this.page --;
            this.updateUI();
            this.content.removeAllChildren();
            this.additem();
        }
        else if(data == "next")
        {
            this.page ++;
            this.updateUI();
            this.content.removeAllChildren();
            this.additem();
        }

        console.log(data);
    },

    updateScore: function(score)
    {
        if(this.friendRank && this.userInfo)
        {
            this.uploadScore(score);
        }
    },


    loadPic: function(sp,url)
    {
        cc.loader.load({url: url, type: 'png'}, function (err, tex) {
            if(err)
            {
                console.log(err);
            }
            else
            {
                var spriteFrame = new cc.SpriteFrame(tex);
                sp.getComponent("cc.Sprite").spriteFrame = spriteFrame;
            }
        });
    },

    setSpriteFrame: function(url,sp)
    {
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            if(!err && sp)
            {
                sp.getComponent("cc.Sprite").spriteFrame = spriteFrame;
            }
        });
    },



    getUserRank: function()
    {
        var self = this;
        wx.getUserCloudStorage({
            keyList:["snake_rank"],
            success: function(res)
            {
                console.log(res);
                if(res.KVDataList.length == 0)
                {
                    self.setUserRank(0,new Date().getTime(),0,0,0);
                }
                else
                {
                    var feiji_rank = res.KVDataList[0].value;
                    self.kvdata = JSON.parse(feiji_rank);
                    cc.log(self.kvdata);

                }
            }
        });
    },

    uploadScore: function(score)
    {
        if(this.kvdata)
        {
            if(score > this.kvdata.wxgame.score)
            {
                this.kvdata.wxgame.score = score;
                this.setUserRank(score,new Date().getTime());
            }
        }
        else
        {
            this.getUserRank();
        }
    },

    setUserRank: function(score,update_time)
    {
        var self = this;
        var data = {
            key: "snake_rank",
            value: "{\"wxgame\":{\"score\":"+score+",\"update_time\": "+update_time+"}}"
        };

        var kvDataList = [data];
        wx.setUserCloudStorage({
            KVDataList: kvDataList,
            success: function(res)
            {
                self.kvdata.wxgame.score = score;
                self.getFriendRank();
                cc.log(res);
            },
            fail: function(res)
            {
                cc.log(res);
            }
        });
    },


    getFriendRank: function(callback)
    {
        var self = this;
        wx.getFriendCloudStorage({
            keyList:["snake_rank"],
            success: function(res)
            {
                console.log(res);
                self.friendRank = res.data;
                self.sortFriendRank();

                if(callback)
                    callback();
            }
        });
    },

    sortFriendRank: function()
    {
        if(this.friendRank)
        {
            this.friendRank.sort(function(a,b){
                var a_rank =JSON.parse(a.KVDataList[0].value);
                var AMaxScore=a_rank.wxgame.score;

                var b_rank =JSON.parse(b.KVDataList[0].value);
                var BMaxScore = b_rank.wxgame.score;

                return parseInt(BMaxScore) - parseInt(AMaxScore);
            });

            this.pageToal = Math.ceil(this.friendRank.length/4);
        }
    },

    getLabelStr: function(str,num)
    {
        var s = "";
        var len = 0;
        for (var i=0; i<str.length; i++) {
            var c = str.charCodeAt(i);
            //单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
                len++;
                if(len>=num-2)
                {
                    if(i != str.length-1)
                        s += "...";
                    break;
                }
                else
                {
                    s += str.charAt(i);
                }
            }
            else {
                len+=2;
                if(len>=num-2)
                {
                    if(i != str.length-1)
                        s += "...";
                    break;
                }
                else
                {
                    s += str.charAt(i);
                }
            }
        }
        return s;
    }


});
