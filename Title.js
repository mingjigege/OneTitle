ll.registerPlugin(
    "Title",
    "铭记mingji",
    [1, 0, 0],
    {}
);

const configpath = "./plugins/Title/config.json";   //配置文件路径
const defaultconfig = JSON.stringify({  //默认配置文件
    "DefaultTitle": "§a萌新一只",
    "ShopMoney": "llmoney"      //计分板经济暂时不需要
});
const config = data.openConfig(configpath, "json", defaultconfig);    //打开配置文件

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
    fm.addButton("个人称号切换");
    fm.addButton("全局称号商店");

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
    let use = players.get(pl.xuid);
    let db = players.get(pl.uuid);
    log(db)
    log(use)
    fm.setTitle("个人管理");
    fm.setContent("当前使用称号为:" + use.use);

    //db.title.sort();
    db.forEach(i => {
        fm.addButton(`${i.title}}`);
    });

    pl.sendForm(fm, (pl, arg) => {
        if (db.title[arg] == db[use]) {
            pl.tell("当前称号正在使用");
            return;
        }
        if (db.title[arg] != undefined) {
            let data = {
                "use": db.title[arg]
            }
            players.set(pl.xuid, data);
            pl.tell("称号切换成功");
        }
    });
}
function shop(pl) {    
    let fm = mc.newSimpleForm();
    let players = new KVDatabase("./plugins/Title/playerdb");
    let player = players.get(pl.uuid);  
    let db = players.get("shop");

    if (!db) {
        db = [];
        players.set("shop", db);
        pl.tell('商店无数据,快让管理员添加吧');
        return;
    }

    fm.setTitle("称号商店");
    fm.setContent("请选购");

    db.forEach(i => {
        fm.addButton(`${i.title}\n价格:${i.money}`);
    });

    pl.sendForm(fm, (pl, id) => {
        let moneys = pl.getMoney();
        let moneyred = parseInt(db[id].money.toString());

        if (id == null) return;

        if (moneys > moneyred) {
            if (!player[db[id].title]) {
                if (moneyred != 0) {
                    money.reduce(pl.xuid, moneyred)
                }
                pl.tell('购买成功');
                player.push({
                    "title": db[id].title
                });
                players.set(pl.uuid, player);

            }
            else {
                pl.tell('购买失败重复');
            }
        }
        else {
            pl.tell('购买失败没钱');
        }
    })
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
function add(pl) {  //添加称号
    let players = new KVDatabase("./plugins/Title/playerdb");
    let db = players.get("shop");

    if (!db) {
        db = [];
        players.set("shop", db);
    }
    const fm = mc.newCustomForm();

    fm.addInput("称号昵称", "", "请输入");
    fm.addInput("所需金币数量", "string");

    pl.sendForm(fm, (pl, dt) => {
        if (dt == null) return;

        const [title, money] = dt;

        if (!title) {
            pl.tell("未输入称号昵称");
            return;
        }
        if (!money) {
            pl.tell("未输入称号所需金币");
            return;
        }
        if (isNaN(Number(money, 10)) && money != 0) {
            pl.tell("金币请写为数字");
            return;
        }
        db.push({
            "title": title,
            "money": money
        });
        players.set('shop', db);
    });
}
function remove(pl) {       //移除称号

}
function op(pl) {       //OP更改玩家称号大概功能 新增 移除 修改称号名字？

}
mc.listen("onJoin", function (pl) {
    let players = new KVDatabase("./plugins/Title/playerdb");

    if (pl.isSimulatedPlayer()) { return };

    let db = players.get(pl.uuid);
    let dbs = players.get(pl.xuid);

    if (!db) {
        db = [];
        db.push({
            "title": config.get("DefaultTitle")
        });
        players.set(pl.uuid, db);
    }
    if (!dbs) {
        dbs = [];
        dbs.push({
            "ues": config.get("DefaultTitle")
        });
        players.set(pl.xuid, dbs);
    }
    players.close();
});

mc.listen("onChat", function (pl, msg) {
    let players = new KVDatabase("./plugins/Title/playerdb");
    let db = players.get(pl.xuid);
    mc.broadcast("[" + db.use + "§r]<" + pl.realName + "§r> " + msg);
    players.close();
    return false;
});

log("插件加载成功 - - - 感谢231项目的支持");
