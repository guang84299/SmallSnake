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

        this.page1 = cc.find("bg/page1",this.bg);
        this.page2 = cc.find("bg/page2",this.bg);
        this.page3 = cc.find("bg/page3",this.bg);


        this.page1.active = true;
        this.page2.active = false;
        this.page3.active = false;
        //this.desc = cc.find("box/box/desc",this.bg).getComponent(cc.Label);

        var toggle = cc.find("toggle",this.page1).getComponent(cc.Toggle);
        var test = storage.getTest();
        if(test == 0)
        {
            storage.setTest(1);
        }
        else if(test == 2)
        {
            toggle.isChecked = true;
        }
    },

    updateUI: function()
    {

    },

    totest: function()
    {
        this.page1.active = false;
        this.page2.active = true;
        this.page3.active = false;

        this.timuLabel = cc.find("timu/str",this.page2).getComponent(cc.Label);
        this.titleLabel = cc.find("title",this.page2).getComponent(cc.Label);
        this.sel1 = cc.find("toggles/toggle1/str",this.page2).getComponent(cc.Label);
        this.sel2 = cc.find("toggles/toggle2/str",this.page2).getComponent(cc.Label);
        this.sel3 = cc.find("toggles/toggle3/str",this.page2).getComponent(cc.Label);
        this.timuIndex = 0;

        this.datas = [];
        var data1 = [];
        var data2 = [];
        for(var i=0;i<res.conf_test.length;i++)
        {
            var data = res.conf_test[i];
            if(data.type == "0")
                data1.push(data);
            else
                data2.push(data);
        }

        var n = Math.floor(Math.random()*data1.length);
        this.datas.push(data1[n]);
        data1.splice(n,1);
        n = Math.floor(Math.random()*data1.length);
        this.datas.push(data1[n]);

        n = Math.floor(Math.random()*data2.length);
        this.datas.push(data2[n]);

        this.selJieguo = "A";
        this.nextTimu();
    },

    nextTimu: function()
    {
        if(this.timuIndex>=3)
        {
            this.openJieguo();
            return;
        }
        var data = this.datas[this.timuIndex];

        this.timuLabel.string = "第"+(this.timuIndex+1)+"题、共3题";
        this.titleLabel.string = data.title;
        this.sel1.string = data.option1;
        this.sel2.string = data.option2;
        this.sel3.string = data.option3;

        this.timuIndex++;


    },

    next: function()
    {
        this.nextTimu();
    },

    sel: function(jieguo)
    {
        this.selJieguo = jieguo;
    },

    openJieguo: function()
    {
        this.page1.active = false;
        this.page2.active = false;
        this.page3.active = true;

        var jieguo = cc.find("jieguo",this.page3).getComponent(cc.Label);
        var jieguo2 = cc.find("jieguo2",this.page3).getComponent(cc.Label);
        var she = cc.find("she",this.page3);

        var data = this.datas[2];
        cc.log(data.answer , this.selJieguo);
        //对
        if(data.answer == this.selJieguo)
        {
            var rs = ["爱因斯坦","你还是人类吗？","秀外慧中","我村高材生","我只服你","突破银河边际"];
            var n = Math.floor(Math.random()*rs.length);
            jieguo.string = "测试结果："+rs[n];

            if(Math.random()<0.4)
            {
                jieguo2.string = "游戏推荐：休闲模式";
            }
            else
            {
                if(Math.random()<0.5)
                    jieguo2.string = "游戏推荐：益智模式";
                else
                    jieguo2.string = "游戏推荐：冒险模式";
            }

            cc.res.setSpriteFrame("images/test/she01",she);
        }
        else
        {
            var rs = ["村里傻强","你很可爱","系统拒绝回答","大愚若智"];
            var n = Math.floor(Math.random()*rs.length);
            jieguo.string = "测试结果："+rs[n];

            if(Math.random()<0.8)
            {
                jieguo2.string = "游戏推荐：休闲模式";
            }
            else
            {
                if(Math.random()<0.5)
                    jieguo2.string = "游戏推荐：益智模式";
                else
                    jieguo2.string = "游戏推荐：冒险模式";
            }

            cc.res.setSpriteFrame("images/test/she02",she);
        }
    },

    logintest: function(target)
    {
        var ck = target.isChecked;
        if(ck)
        {
            storage.setTest(2);
        }
        else
        {
            storage.setTest(1);
        }
    },


    show: function(data)
    {
        this.initUI();
        //this.desc.string = data;
    },

    hide: function()
    {
        sdk.showBanner();
        this.node.destroy();
    },




    click: function(event,data)
    {
        if(data == "start")
        {
            this.hide();
        }
        else if(data == "totest")
        {
            this.totest();
        }
        else if(data == "next")
        {
            this.next();
        }
        else if(data == "sel1")
        {
            this.sel("A");
        }
        else if(data == "sel2")
        {
            this.sel("B");
        }
        else if(data == "sel3")
        {
            this.sel("C");
        }
        else if(data == "share")
        {
            sdk.share(null,"test");
        }
        else if(data == "logintest")
        {
            this.logintest(event);
        }

        storage.playSound(res.audio_button);
        cc.log(data);
    }


});
