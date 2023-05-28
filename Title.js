//先跑起来写完了再重构一下

ll.registerPlugin(
    "Title",
    "铭记mingji",
    [1, 0, 0],
    {}
);

const configpath = "./plugins/Title/config.json";   //配置文件路径
let players = new KVDatabase("./plugins/Title/playerdb");   //  打开数据库
const defaultconfig = JSON.stringify({  //默认配置文件
    "DefaultTitle": "§a萌新一只",
    "ShopMoney": "llmoney"      //计分板经济暂时不需要
});
const config = data.openConfig(configpath, "json", defaultconfig);    //打开配置文件
const defaultplayer = {  //默认玩家数据文件
    "title": [config.get("DefaultTitle"), '测试', 'a', '测试'],     //默认根据配置文件而定
    "use": config.get("DefaultTitle")
};

mc.listen("onServerStarted", () => {
    let cmds = mc.newCommand("titleshop", "§e称号管理", PermType.Any);
    cmds.setAlias("tsp");
    cmds.overload();
    cmds.setCallback((cmd, ori, out, res) => {
        if (ori.player == null) {
            return out.error("该命令只能由玩家执行！");
        }
        else {
            main(ori.player);
        }
    });
    cmds.setup();
});

function main(pl) {     //主表单
    let fm = mc.newSimpleForm();
    fm.setTitle("称号管理");
    fm.setContent("请选择");
    fm.addButton("个人管理");
    fm.addButton("称号商店");
    if (pl.isOP()) {
        fm.addButton("管理玩家称号");
    }
    pl.sendForm(fm, (pl, id) => {
        switch (id) {
            case 0:
                titeplayer(pl);
                break;
            case 1:
                shop(pl);
                break;
            case 2:
                admin(pl);
                break;
            default:
                break;
        }
    });
}
function titeplayer(pl) {   //个人切换称号
    let fm = mc.newSimpleForm();
    let players = new KVDatabase("./plugins/Title/playerdb");
    let db = players.get(pl.uuid);
    fm.setTitle("个人管理");
    fm.setContent("当前使用称号为:" + db.use);

    db.title.sort();

    for (let i = 0; i < db.title.length; i++) {
        fm.addButton(db.title[i]);
    }
    pl.sendForm(fm, (pl, arg) => {
        if (db.title[arg] == db.use) {
            pl.tell("当前称号正在使用");
            return;
        }
        if (db.title[arg] != undefined) {
            let data = {
                "title": db.title,
                "use": db.title[arg]
            };
            players.set(pl.uuid, data);
            pl.tell("称号切换成功");
        }
        else {
            pl.tell("未拥有此称号");
        }
        return;
    });
}
function shop(pl) {     //待完善
    let tname = "默认名字";
    let fm = mc.newSimpleForm();
    let players = new KVDatabase("./plugins/Title/playerdb");
    let player = players.get(pl.uuid);
    let defaultshop = {  // 商店数据文件
        "title": tname,
        "money": 1
    };
    let db = players.get('shop');
    if (!db) {
        players.set('shop', defaultshop);
        db = defaultshop;
    }
    if (typeof db.title === 'undefined') {
        pl.tell("称号商店无数据,快让服主添加几个吧");
        return;
    }
    log(db);
    fm.setTitle("称号商店");
    fm.setContent("请选购");

    player.title.sort();
    fm.addButton(db.title + " §e价格§d:§r " + db.money);

    pl.sendForm(fm, (pl, arg) => {
        if (player.title.includes(db.title[arg])) {
            pl.tell("该称号已拥有,请勿重复购买");
            return;
        }
        if (db.title[arg] != undefined) {
            let money = pl.getMoney();
            log(db[arg].money);
            log(money);
            if (money > db.title[arg].money) {
                pl.reduceMoney(money);
                pl.tell("购买成功,以获得" + db[arg] + "称号\n消耗金币数量:" + db[arg].tmoney)
            }
            else {
                pl.tell("购买失败,j");
            }
        }
        else {
            pl.tell("该称号已下架");
        }
        players.close();
        return;
    }
    );
}
function admin(pl) {    //优先
    let fm = mc.newSimpleForm();
    let players = new KVDatabase("./plugins/Title/playerdb");
    let db = players.get(pl.uuid);

    fm.setTitle("管理玩家称号");
    fm.setContent("欢迎管理员" + pl.realName);
    fm.addButton("商店新增称号");
    fm.addButton("商店删除称号");
    fm.addButton("管理所有玩家");

    pl.sendForm(fm, (pl, id) => {
        switch (id) {
            case 0:
                add(pl);
                break;
            case 1:
                remove(pl);
                break;
            case 2:
                op(pl);
                break;
            default:
                break;
        }
    });

}
function add(pl) {      //新增称号
    let players = new KVDatabase("./plugins/Title/playerdb");
    let db = players.get("shop");
}
function remove(pl) {       //移除称号

}
function op(pl) {       //更改称号名字?

}
mc.listen("onJoin", function (pl) {
    let players = new KVDatabase("./plugins/Title/playerdb");
    if (pl.isSimulatedPlayer()) { return };
    let db = players.get(pl.uuid);
    if (!db) {
        players.set(pl.uuid, defaultplayer);
    }
    players.close();
});
mc.listen("onChat", function (pl, msg) {
    let players = new KVDatabase("./plugins/Title/playerdb");
    let db = players.get(pl.uuid);
    mc.broadcast("[" + db.use + "§r]<" + pl.realName + "§r> " + msg);
    players.close();
    return false;
});

log("插件加载成功 --- 感谢231项目的支持");
