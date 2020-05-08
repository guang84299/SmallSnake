/**
 * Created by guang on 18/7/19.
 */
module.exports = {
    pice:['k','m','b','t','a','aa','ab','ac','ad','ae','af','ag','ah','ai','aj','ak','al','am','an','ao','ap','aq','ar','as','at'],
    audioContext: null,
    effectContext: null,
    pfix: "snake_",
    n2AddSpeed:false,
    playSoundTime:0,
    playMusic: function(music)
    {
        if(this.getMusic() == 1)
        {
            this.stopMusic();

            cc.loader.loadRes(music, function (err, clip)
            {
                if(!err)
                {
                    cc.audioEngine.play(clip, true, 0.3);
                }
                else
                {
                    console.log(err);
                }
            });
            //if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS)
            //{
            //    if(this.audioContext == null)
            //    {
            //        this.audioContext = BK.createAudioContext();
            //        this.audioContext.loop = true;
            //        this.audioContext.src = "GameRes://"+music;
            //    }
            //    this.audioContext.play();
            //}
            //else
            //{
            //    cc.audioEngine.play(music,true,1);
            //}
        }
    },

    pauseMusic: function()
    {
        if(this.getMusic() == 1)
            cc.audioEngine.pauseAll();
    },

    resumeMusic: function()
    {
        if(this.getMusic() == 1)
            cc.audioEngine.resumeAll();
    },

    stopMusic: function()
    {
        //if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS)
        //{
        //    if(this.audioContext)
        //        this.audioContext.pause();
        //}
        //else
        //{
            cc.audioEngine.stopAll();
        //}
    },

    playSound: function(sound)
    {
        if(this.getSound() == 1)
        {
            var now = new Date().getTime();
            if(now-this.playSoundTime>200)
            {
                this.playSoundTime = now;
                cc.loader.loadRes(sound, function (err, clip)
                {
                    if(!err)
                    {
                        cc.audioEngine.play(clip, false, 1);
                    }
                    else
                    {
                        //console.log(err);
                    }
                });
            }

            //if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS)
            //{
            //    if(this.effectContext == null)
            //    {
            //        this.effectContext = BK.createAudioContext({'type':'effect'});
            //    }
            //    //播放多个音效
            //    this.effectContext.src = "GameRes://"+sound;
            //    this.effectContext.play()
            //}
            //else
            //{
            //    cc.audioEngine.play(sound,false,1);
            //}
        }
    },

    setFirst: function(first)
    {
        cc.sys.localStorage.setItem(this.pfix+"first",first);
    },

    getFirst: function()
    {
        var first = cc.sys.localStorage.getItem(this.pfix+"first");
        first = first ? first : 0;
        return Number(first);
    },

    setCoin: function(coin)
    {
        cc.sys.localStorage.setItem(this.pfix+"coin",Math.floor(coin));

    },

    getCoin: function()
    {
        var coin = cc.sys.localStorage.getItem(this.pfix+"coin");
        coin = coin ? coin : 0;
        return Number(coin);
    },

    uploadCoin: function()
    {
        var datas = {};
        datas.coin = this.getCoin();
        var data = JSON.stringify(datas);
        cc.qianqista.uploaddatas(data);
    },

    setScore: function(score)
    {
        cc.sys.localStorage.setItem(this.pfix+"score",Math.floor(score));

    },

    getScore: function()
    {
        var score = cc.sys.localStorage.getItem(this.pfix+"score");
        score = score ? score : 0;
        return Number(score);
    },

    uploadScore: function()
    {
        var datas = {};
        datas.score = this.getScore();
        var data = JSON.stringify(datas);
        cc.qianqista.uploaddatas(data);
    },

    setChoujiangNum: function(num)
    {
        cc.sys.localStorage.setItem(this.pfix+"choujiang_num",num);
    },

    getChoujiangNum: function()
    {
        var num = cc.sys.localStorage.getItem(this.pfix+"choujiang_num");
        num = num ? num : 0;
        return Number(num);
    },

    setChoujiangTime: function(time)
    {
        cc.sys.localStorage.setItem(this.pfix+"choujiang_time",time);
    },

    getChoujiangTime: function()
    {
        var time = cc.sys.localStorage.getItem(this.pfix+"choujiang_time");
        time = time ? time : 0;
        return Number(time);
    },

    setLevel: function(type,lv)
    {
        cc.sys.localStorage.setItem(this.pfix+type+"_level",lv);
    },

    getLevel: function(type)
    {
        var lv = cc.sys.localStorage.getItem(this.pfix+type+"_level");
        lv = lv ? lv : 1;
        return Number(lv);
    },

    uploadLevel: function(type)
    {
        var datas = {};
        datas["level_"+type] = this.getLevel(type);
        var data = JSON.stringify(datas);
        cc.qianqista.uploaddatas(data);
    },


    setLoginTime: function(time)
    {
        cc.sys.localStorage.setItem(this.pfix+"login_time",time);
    },

    getLoginTime: function()
    {
        var time = cc.sys.localStorage.getItem(this.pfix+"login_time");
        time = time ? time : 0;
        return Number(time);
    },

    uploadLoginTime: function()
    {
        var datas = {};
        datas.login_time = this.getLoginTime();
        var data = JSON.stringify(datas);
        cc.qianqista.uploaddatas(data);
    },

    setLoginDay: function(day)
    {
        cc.sys.localStorage.setItem(this.pfix+"login_day",day);
    },

    getLoginDay: function()
    {
        var day = cc.sys.localStorage.getItem(this.pfix+"login_day");
        day = day ? day : 0;
        return Number(day);
    },

    uploadLoginDay: function()
    {
        var datas = {};
        datas.login_day = this.getLoginDay();
        var data = JSON.stringify(datas);
        cc.qianqista.uploaddatas(data);
    },

    setQianDaoNum: function(num)
    {
        cc.sys.localStorage.setItem(this.pfix+"qiandao_num",num);
    },

    getQianDaoNum: function()
    {
        var num = cc.sys.localStorage.getItem(this.pfix+"qiandao_num");
        num = num ? num : 0;
        return Number(num);
    },

    uploadQianDaoNum: function()
    {
        var datas = {};
        datas.qiandao_num = this.getQianDaoNum();
        var data = JSON.stringify(datas);
        cc.qianqista.uploaddatas(data);
    },

    //setHelp: function(help)
    //{
    //    cc.sys.localStorage.setItem(this.pfix+"help",help);
    //},

    isHelp: function(snakeId,level,callback)
    {
        cc.qianqista.datas(function(res){
            console.log('my datas:', res);
            if(res.state == 200)
            {
                var datas = JSON.parse(res.data);
                var help = [];
                if(datas.hasOwnProperty("help"))
                {
                    help = datas.help;
                    if(typeof help != "object")
                        help = JSON.parse(help);
                    var b = false;
                    for(var i=0;i<help.length;i++)
                    {
                        if(help[i].snakeId == snakeId && help[i].level == level)
                        {
                            b = true;
                            break;
                        }
                    }
                    if(callback)callback(b);
                }
                else
                {
                    if(callback)callback(false);
                }
            }
            else
            {
                if(callback)callback(false);
            }
        });

        //var help = this.getHelp();
        //var b = false;
        //for(var i=0;i<help.length;i++)
        //{
        //    if(help[i].snakeId == snakeId && help[i].level == level)
        //    {
        //        b = true;
        //        break;
        //    }
        //}
        //return b;
    },

    //getHelp: function()
    //{
    //    var help = cc.sys.localStorage.getItem(this.pfix+"help");
    //    help = help ? help : "[]";
    //    if(typeof help == "object")
    //        return help;
    //    return JSON.parse(help);
    //},

    uploadHelp: function(snakeId,level)
    {
        if(snakeId && level)
        {
            cc.qianqista.uploadHelpDatas(snakeId,level);
        }
    },


    setGameNum: function(num)
    {
        cc.sys.localStorage.setItem(this.pfix+"game_num",num);
    },

    getGameNum: function()
    {
        var num = cc.sys.localStorage.getItem(this.pfix+"game_num");
        num = num ? num : 0;
        return Number(num);
    },


    setTest: function(test)
    {
        cc.sys.localStorage.setItem(this.pfix+"test",test);
    },
    getTest: function()
    {
        var test = cc.sys.localStorage.getItem(this.pfix+"test");
        test = test ? test : 0;
        return Number(test);
    },



    setMusic: function(music)
    {
        cc.sys.localStorage.setItem(this.pfix+"music",music);
    },
    getMusic: function()
    {
        var music = cc.sys.localStorage.getItem(this.pfix+"music");
        music = music ? music : 0;
        return Number(music);
    },

    setSound: function(sound)
    {
        cc.sys.localStorage.setItem(this.pfix+"sound",sound);
    },
    getSound: function()
    {
        var sound = cc.sys.localStorage.getItem(this.pfix+"sound");
        sound = sound ? sound : 0;
        return Number(sound);
    },

    setVibrate: function(vibrate)
    {
        cc.sys.localStorage.setItem(this.pfix+"vibrate",vibrate);
    },
    getVibrate: function()
    {
        var vibrate = cc.sys.localStorage.getItem(this.pfix+"vibrate");
        vibrate = vibrate ? vibrate : 0;
        return Number(vibrate);
    },

    setYinDao: function(yindao)
    {
        cc.sys.localStorage.setItem(this.pfix+"yindao",yindao);
    },
    getYinDao: function()
    {
        var yindao = cc.sys.localStorage.getItem(this.pfix+"yindao");
        yindao = yindao ? yindao : 0;
        return Number(yindao);
    },

    setInviteLnum: function(num)
    {
        cc.sys.localStorage.setItem(this.pfix+"invite_lnum",num);
    },
    getInviteLnum: function()
    {
        var num = cc.sys.localStorage.getItem(this.pfix+"invite_lnum");
        num = num ? num : 0;
        return Number(num);
    },

    setVideoPath: function(path)
    {
        cc.sys.localStorage.setItem(this.pfix+"videoPath",path);
    },
    getVideoPath: function()
    {
        var path = cc.sys.localStorage.getItem(this.pfix+"videoPath");
        path = path ? path : undefined;
        return path;
    },

    scientificToNumber: function(num) {
        var str = num.toString();
        /*6e7或6e+7 都会自动转换数值*/
        var index = str.indexOf("e+");
        if (index == -1) {
            return str;
        } else {
            /*6e-7 需要手动转换*/
            var head = str.substr(0,index);
            var zero = '';
            var len = parseInt(str.substr(index+2,str.length));
            if(head.indexOf(".")>=0)
            {
                var h = head.split(".");
                head = h[0]+h[1];
                len = len - h[1].length;
            }
            for(var i=0;i<len;i++)
            {
                zero += '0';
            }
            return head + zero;
        }
    },


    castNum: function(coin)
    {
        coin = Math.floor(coin);
        var str = this.scientificToNumber(coin);
        var s = '';
        var n = 0;
        if(str.length>3)
            n = parseInt((str.length-1)/3);
        if(n>0)
        {
            coin = parseFloat(coin/Math.pow(1000,n)).toFixed(2);
        }
        str = coin+"";
        var l = str.split(".")[0].split("").reverse();
        for (var i = 0; i < l.length; i++) {
            s += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        s = s.split("").reverse().join("");
        if(n>0)
        {
            var r = str.split(".")[1];
            s = s + "." + r;
            s += this.pice[n-1];
        }
        return s;
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
};