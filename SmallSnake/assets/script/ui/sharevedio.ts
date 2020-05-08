
const {ccclass, property} = cc._decorator;
var storage = require("storage");
var res = require("res");
var sdk = require("sdk");
@ccclass
export default class sharevedio extends cc.Component {

    @property(cc.Label)
    descLabel: cc.Label = null;
   
    @property(cc.Node)
    btnNode: cc.Node = null;

    bg = null;
    game = null;
    award = 0;
    callback = null;
    // onLoad () {}

    start () {
        this.btnNode.active = false;

        this.scheduleOnce(function(){
            this.btnNode.active = true;
        },2);
        this.descLabel.string = "x"+this.award;
    }

    lingqu(){
        
        var coin = storage.getCoin();
        storage.setCoin(coin+this.award);

        if(this.callback) this.callback(this.award);
        this.hide();
    }
   
    show(data){
        this.award = 100;
        this.callback = data;
        this.game = cc.find("Canvas").getComponent("game");

        cc.sdk.showBanner();
    }

    hide(){
        this.node.destroy();
    }

    click(event,data){
        if(data == "close")
        {
            if(this.callback) this.callback(0);
            this.hide();
        }
        else if(data == "share")
        {
            var self = this;
            cc.sdk.share(function(r){
                if(r)
                {
                    self.lingqu();
                }
            });
        }
        
        storage.playSound(res.audio_button);
        cc.log(data);
    }

    // update (dt) {}
}
