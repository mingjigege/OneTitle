ll.registerPlugin(
    "Title",//直接title其实有一点奇怪，不知道要不要改一下
    "铭记mingji",
    [1, 0, 0],
    {}
);

const configpath = "./plugins/Title/config.json";   //配置文件路径
const defaultconfig = JSON.stringify({  //默认配置文件
    "DefaultTitle": "§a萌新一只"
    //"ShopMoney": "llmoney",
    //"ScoreName": "money"     
});
const config = data.openConfig(configpath, "json", defaultconfig);    //打开配置文件
let db = new KVDatabase("./plugins/Title/playerdb");       //打开数据库
log("数据库打开成功")

mc.listen("onServerStarted", () => {
    let cmds = mc.newCommand("titleshop", "§e称号管理       ---§bTitle", PermType.Any);
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
    fm.setTitle("§1§l称号管理");//我建议一下表单title§1加粗
    fm.setContent("§c请选择");//文字部分§c红色不加粗
    fm.addButton("§e§l个人称号切换","textures/ui/trade_icon");//这个地方可以加图片的
    fm.addButton("§a§l全局称号商店","textures/ui/MCoin");//必要时候换行描述一下看看
//顺便建议写一点注释
    if (pl.isOP()) {
        fm.addButton("§l管理商店数据","textures/ui/timer");
        fm.addButton("§c§l管理玩家数据","textures/ui/op");
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
            case 3:
                op(pl);
                break;
            default:
                break;
        }
    });
}
function titeplayer(pl) {   //个人切换称号
    let player = db.get("use");
    let players = db.get(pl.xuid);
    let fm = mc.newSimpleForm();

    fm.setTitle("§1§l个人管理");
    fm.setContent("§c当前使用称号为:" + player[pl.xuid][0].use);

    players.forEach(i => {
        fm.addButton(`${i.title}`);
    });

    pl.sendForm(fm, (pl, id) => {
        if (id == null) { return };
        if (players[id].title == player[pl.xuid][0].use) {
            pl.tell("当前称号正在使用");
            return;
        }
        if (players[id].title) {
            pl.tell('§d[§eTitle§d] §r您的称号已从"' + player[pl.xuid][0].use + '§r"切换为"' + players[id].title + '"');
            player[pl.xuid].splice(0, 1);
            player[pl.xuid].push({
                "use": players[id].title
            });
            db.set('use', player);
        }
        else {
            pl.tell('§d[§eTitle§d] §r称号切换失败,可能该称号已被移除');
        }
    });
}
function shop(pl) {
    let fm = mc.newSimpleForm();
    let player = db.get(pl.xuid);
    let shop = db.get("shop");

    if (!shop) {
        pl.tell('商店无数据,快让管理员添加吧');
        return;
    }

    fm.setTitle("§1§l称号商店");
    fm.setContent("§c请选购");

    shop.forEach(i => {
        fm.addButton(`${i.title}\n价格:${i.money}`);
    });

    pl.sendForm(fm, (pl, id) => {
        if (id == null) { return };

        let moneys = pl.getMoney();
        let moneyred = parseInt(shop[id].money.toString());

        if (moneys >= moneyred) {
            if (moneyred != 0) {
                money.reduce(pl.xuid, moneyred)
            }

            pl.tell('购买成功');
            player.push({
                "title": shop[id].title
            });
            db.set(pl.xuid, player);
        }
        else {
            pl.tell('购买失败没钱');
        }
    })
}
function admin(pl) {
    let fm = mc.newSimpleForm();

    fm.setTitle("§1§l管理商店数据");
    fm.setContent("§c欢迎管理员" + pl.realName);
    fm.addButton("§a新增称号");
    fm.addButton("§c删除称号");

    pl.sendForm(fm, (pl, id) => {
        switch (id) {
            case 0:
                add(pl);
                break;
            case 1:
                remove(pl);
                break;
            default:
                break;
        }
    });
}
function add(pl) {  //添加称号
    let shop = db.get("shop");

    if (!shop) {
        shop = [];
    }

    let fm = mc.newCustomForm();
    fm.addInput("称号昵称", "", "请输入");
    fm.addInput("所需金币数量", "string");

    pl.sendForm(fm, (pl, dt) => {
        let [title, money] = dt;

        if (dt == null) return;
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
        shop.push({
            "title": title,
            "money": money
        });
        pl.tell('§d[§eTitle§d] §r称号"' + title + '§r"上架成功');
        db.set('shop', shop);
    });
}
function remove(pl) {       //移除称号
    let fm = mc.newSimpleForm();
    let shop = db.get("shop");

    if (!shop) {
        pl.tell('商店无数据');
        return;
    }

    fm.setTitle("§1§l移除称号");
    fm.setContent("§c请选择");

    shop.forEach(i => {
        fm.addButton(`${i.title}`);
    });

    pl.sendForm(fm, (pl, id) => {
        if (id == null) { return };

        if (shop[id]) {
            pl.tell('§d[§eTitle§d] §r称号"' + shop[id].title + '§r"移除成功');
            shop.splice(id, 1);
            db.set('shop', shop);
        }
        else {
            pl.tell('§d[§eTitle§d] §r称号移除失败,可能称号已被移除');
        }
    })
}
function op(pl) {       //OP更改玩家称号大概功能 新增 移除 修改称号名字？
    let fm = mc.newSimpleForm();

    fm.setTitle("§1§l管理玩家称号");
    fm.setContent("§c欢迎管理员" + pl.realName);
    fm.addButton("§1管理在线玩家","textures/ui/icon_steve");
    fm.addButton("§2管理全部玩家","textures/ui/multiplayer_glyph_color");
    fm.addButton("§3搜索玩家昵称","textures/ui/magnifyingGlass");

    pl.sendForm(fm, (pl, id) => {
        switch (id) {
            case 0:
                pl.tell('尽情期待');
                break;
            case 1:
                pl.tell('尽情期待');
                break;
            case 2:
                pl.tell('尽情期待');
                break;
            case 3:
                pl.tell('尽情期待');
                break;
            default:
                break;
        }
    });
}
function title(pl) {     //获取玩家使用称号用于导出API
    let players = db.get('use');

    if (!players) {
        return 'ERROR';
    }
    if (!players[pl.xuid]) {        //在正常使用时不可能为前两项
        return '无数据';
    }
    else {
        return players[pl.xuid][0].use;
    }

}
mc.listen("onJoin", function (pl) {
    if (pl.isSimulatedPlayer()) { return; }

    let DefaultTitle = config.get("DefaultTitle");
    let player = db.get(pl.xuid);

    if (!player) {
        player = [];
        player.push({
            "title": DefaultTitle
        });
        db.set(pl.xuid, player);
    }
    let players = db.get('use');

    if (!players) {
        players = [];
        db.set('use', players);
    }

    if (!players.hasOwnProperty(pl.xuid)) {
        log(players.hasOwnProperty(pl.xuid))
        log('error')
        players[pl.xuid] = [];
        players[pl.xuid].push({
            "use": DefaultTitle
        });
        db.set('use', players);
        pl.tell('§d[§eTitle§d] §r您已获得初始称号§r"' + players[pl.xuid][0].use + '§r" 输入 /tsp 即可管理称号');
    }
});
/*
mc.listen("onChat", function (pl, msg) {
    let use = title(pl);
    mc.broadcast("[" + use + "§r] <" + pl.realName + "§r> " + msg);
    return false;
});
*/
ll.exports(title, "Title", "TitleMsg");

log("插件加载成功 - - - 感谢231项目的支持");
