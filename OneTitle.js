// LiteLoader-AIDS automatic generated
/// <reference path="d:\LLSETEST/dts/HelperLib-master/src/index.d.ts"/> 
const PLUGIN_NAME = "OneTitle";
const Register = require("./lib/Register.js");
Register.info(PLUGIN_NAME, "称号插件", [1, 0, 3, Version.Dev], {
    Author: "铭记mingji,EpsilonZunsat,Minimouse"
});
const configpath = "./plugins/OneTitle/config.json";   //配置文件路径
const gmoney = require("./lib/gmoney.js");
const defaultconfig = JSON.stringify({  //默认配置文件
    "EnabledChat": true,
    "DefaultTitle": "§a萌新一只",
    "economy_type": "llmoney",
    "economy_name": "money",
    "ShopOutput": true
});
const SimpleFormCallback = require("./lib/SimpleFormCallback.js");
const config = data.openConfig(configpath, "json", defaultconfig);    //打开配置文件
let EnabledChat = config.get("EnabledChat");        //获取是否启动聊天功能
const Economy = new gmoney(config.get("economy_type"), config.get("economy_name"));//获取经济单位
let db = new KVDatabase("./plugins/OneTitle/playerdb");       //打开数据库
log("数据库打开成功");       //这个调试口到时候统一上面写个调试内容

mc.listen("onServerStarted", () => {
    let cmds = mc.newCommand("titleshop", "§e称号管理       --- §bOneTitle", PermType.Any);
    cmds.setAlias("tsp");
    cmds.overload();
    cmds.setCallback((cmd, ori, out, res) => {

        if (ori.player == null) {
            EnabledChat = config.get("EnabledChat");
            return out.success("§d[§eOneTitle§d] §r配置文件已重载");        //设置重载,这个没啥用
        }
        else {
            main(ori.player);
        }
    });
    cmds.setup();
    let PAPI = require('../../lib/BEPlaceholderAPI-JS.js').PAPI;
    if (!PAPI) {
        log('PAPI称号变量未被注册');
    }
    else {
        PAPI.registerPlayerPlaceholder(title, "OneTitle", "player_title");
        PAPI.getValue('player_title');
        log('PAPI称号变量注册成功');
    }

});

function main(pl) {     //主表单，这个经常要改我就不动了
    let fm = mc.newSimpleForm();
    fm.setTitle("§1§l称号管理");
    fm.setContent("§c请选择");
    fm.addButton("§e§l个人称号切换", "textures/ui/trade_icon");
    fm.addButton("§a§l全局称号商店", "textures/ui/MCoin");
    if (pl.isOP()) {
        fm.addButton("§l管理商店数据", "textures/ui/timer");
        fm.addButton("§c§l管理玩家数据", "textures/ui/op");
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
        if (id == null) {
            main(pl);
            return;
        }
        if (players[id].title == player[pl.xuid][0].use) {
            pl.tell("§d[§eOneTitle§d] §r当前称号正在使用");
            return;
        }
        if (players[id].title) {
            pl.tell('§d[§eOneTitle§d] §r您的称号已从"' + player[pl.xuid][0].use + '§r"切换为"' + players[id].title + '"');
            player[pl.xuid].splice(0, 1);
            player[pl.xuid].push({
                "use": players[id].title
            });
            db.set('use', player);
        }
        else {
            pl.tell('§d[§eOneTitle§d] §r称号切换失败,可能该称号已被移除');
        }
    });
}
function shop(pl) {
    let fm = mc.newSimpleForm();
    let player = db.get(pl.xuid);
    let shop = db.get("shop");

    if (!shop) {
        pl.tell('§d[§eOneTitle§d] §r商店无数据,快让管理员添加吧');
        return;
    }

    fm.setTitle("§1§l称号商店");
    fm.setContent("§c请选购");

    shop.forEach(i => {
        fm.addButton(`${i.title}\n价格:${i.money}`);
    });

    pl.sendForm(fm, (pl, id) => {
        if (id == null) {
            main(pl);
            return;
        }

        let moneys = Economy.get(pl);
        let moneyred = parseInt(shop[id].money);
        let targetObj = player.find(obj => obj.title == shop[id].title);

        if (targetObj) {
            pl.tell('§d[§eOneTitle§d] §r购买失败,请勿重复购买');
            return;
        }
        pl.sendModalForm("购买称号", `你确定要购买 ${shop[id].title} 吗？\n\n本操作不可撤销!`, "我确定", "我再想想", (pl, arg) => {
            if (arg == null) { return; }
            if (arg == 1) {
                if (moneys >= moneyred) {
                    if (moneyred != 0) {
                        Economy.reduce(pl, moneyred);
                    }
                    pl.tell('§d[§eOneTitle§d] §r购买成功' + shop[id].title);
                    player.push({
                        "title": shop[id].title
                    });
                    db.set(pl.xuid, player);
                    let ShopOutput = config.get("ShopOutput");

                    if (ShopOutput == true) {
                        mc.broadcast("§d[§eOneTitle§d] §r恭喜玩家" + pl.realName + "购买称号" + shop[id].title);
                    }
                    pl.sendModalForm("称号商店", `你已购买 ${shop[id].title} \n是否立即使用`, "我确定", "我再想想", (pl, arg) => {
                        if (arg == null) {
                            return;
                        }
                        if (arg == 1) {
                            let player = db.get('use');

                            pl.tell('§d[§eOneTitle§d] §r您的称号已从"' + player[pl.xuid][0].use + '§r"切换为"' + shop[id].title + '"');
                            player[pl.xuid].splice(0, 1);
                            player[pl.xuid].push({
                                "use": shop[id].title
                            });
                            db.set('use', player);
                        }
                    });
                }
                else {
                    pl.tell('§d[§eOneTitle§d] §r余额不足,购买失败');
                }
            }
        });
    });
}
function admin(pl) {
    //引入依赖
    let fm = new SimpleFormCallback("§1§l管理商店数据", "§c欢迎管理员" + pl.realName);
    fm.addButton("返回", () => { main(pl) }, "textures/ui/arrow_icon")
    fm.addButton("§a新增称号", () => { add(pl) }, "textures/ui/dark_plus");
    fm.addButton("§c删除称号", () => { remove(pl) }, "textures/ui/crossout");
    fm.addButton("§b修改称号", () => { modify(pl) }, "textures/ui/crossout");
    fm.send(pl);
}
function add(pl) {  //商店添加称号
    let shop = db.get("shop");

    if (!shop) {
        shop = [];
    }

    let fm = mc.newCustomForm();
    fm.setTitle("§l§1添加称号");
    fm.addInput("称号昵称", "请输入");
    fm.addInput("所需金币数量", "Number");//这个地方改一下改成数字

    pl.sendForm(fm, (pl, dt) => {
        if (dt == null) {
            admin(pl);
            return;
        };

        let [title, money] = dt;

        if (!title) {
            pl.tell("§d[§eOneTitle§d] §r未输入称号昵称");
            return;
        }
        if (!money) {
            pl.tell("§d[§eOneTitle§d] §r未输入称号所需金币");
            return;
        }
        if (isNaN(Number(money, 10)) && money != 0) {
            pl.tell("§d[§eOneTitle§d] §r金币请写为数字");
            return;
        }
        shop.push({
            "title": title,
            "money": money
        });
        pl.tell('§d[§eOneTitle§d] §r称号"' + title + '§r"上架成功');
        db.set('shop', shop);
    });
}
function addplayer(pl, pldt) {  //添加玩家称号
    let player = db.get(pldt.xuid);

    let fm = mc.newCustomForm();
    fm.setTitle("§l§1添加称号");
    fm.addInput("称号昵称", "请输入");

    pl.sendForm(fm, (pl, dt) => {
        if (dt == null) {
            op(pl);
            return;
        };

        let [title] = dt;

        if (!title) {
            pl.tell("§d[§eOneTitle§d] §r未输入称号昵称");
            return;
        }
        player.push({
            "title": title
        });
        pl.tell('§d[§eOneTitle§d] §r称号"' + title + '§r"为' + pldt.realName + '添加成功');
        pldt.tell('§d[§eOneTitle§d] §r称号"' + title + '§r"由' + pl.realName + '为你添加成功');
        db.set(pldt.xuid, player);
    });
}
function remove(pl) {       //商店移除称号
    let fm = mc.newSimpleForm();
    let shop = db.get("shop");

    if (!shop) {
        pl.tell('§d[§eOneTitle§d] §r商店无数据');
        return;
    }

    fm.setTitle("§1§l移除称号");
    fm.setContent("§c请选择");

    shop.forEach(i => {
        fm.addButton(`${i.title}`);
    });

    pl.sendForm(fm, (pl, id) => {
        if (id == null) {
            op(pl);
            return;
        }
        if (shop[id]) {
            pl.sendModalForm("移除称号", `你确定要移除 ${shop[id].title} 吗？\n\n本操作不可撤销!`, "我确定", "我再想想", (pl, arg) => {
                if (arg == null) {
                    remove(pl);
                    return;
                }
                if (arg == 1) {
                    pl.tell('§d[§eOneTitle§d] §r称号"' + shop[id].title + '§r"移除成功');
                    shop.splice(id, 1);
                    db.set('shop', shop);
                }
            });
        }
        else {
            pl.tell('§d[§eOneTitle§d] §r称号移除失败,可能称号已被移除');
        }
    });
}
function removeplayer(pl, pldt) {       //移除玩家称号
    let player = db.get(pldt.xuid);
    let fm = mc.newSimpleForm();

    fm.setTitle("§1§l移除称号");
    fm.setContent("§c请选择");

    player.forEach(i => {
        fm.addButton(`${i.title}`);
    });

    pl.sendForm(fm, (pl, id) => {
        if (id == null) {
            op(pl);
            return;
        }
        if (player[id]) {
            pl.sendModalForm("移除称号", `你确定要移除 ${player[id].title} 吗？\n\n本操作不可撤销!`, "我确定", "我再想想", (pl, arg) => {
                if (arg == null) {
                    removeplayer(pl);
                    return;
                }
                if (arg == 1) {
                    let players = db.get('use');
                    let DefaultTitle = config.get("DefaultTitle");
                    if (players[pl.xuid][0].use == player[id].title) {
                        pl.tell('§d[§eOneTitle§d] §r' + pldt.realName + '的称号已从"' + players[pl.xuid][0].use + '§r"切换为初始称号"' + DefaultTitle + '"');
                        players[pl.xuid].splice(0, 1);
                        players[pl.xuid].push({
                            "use": DefaultTitle
                        });
                        db.set('use', players);
                        log(players)
                    }
                    pl.tell('§d[§eOneTitle§d] §r成功移除 ' + pldt.realName + '的称号"' + player[id].title + '§r"');
                    player.splice(id, 1);
                    db.set(pldt.xuid, player);
                }
            });
        }
    });
}
function modifyplayer(pl, pldt) {       //选择需要修改的玩家
    let player = db.get(pldt.xuid);
    let fm = mc.newSimpleForm();

    fm.setTitle("§1§l修改玩家称号");
    fm.setContent("§c请选择");

    player.forEach(i => {
        fm.addButton(`${i.title}`);
    });

    pl.sendForm(fm, (pl, id) => {
        if (id == null) {
            return;
        }
        modifysplayer(pl, id, pldt);
    });
}
function modify(pl) {       //选择需要修改的玩家
    let fm = mc.newSimpleForm();
    let shop = db.get("shop");
    if (!shop) {
        pl.tell('§d[§eOneTitle§d] §r商店无数据,请添加后重试');
        return;
    }

    fm.setTitle("§1§l称号商店");
    fm.setContent("§c请选择");

    shop.forEach(i => {
        fm.addButton(`${i.title}\n价格:${i.money}`);
    });

    pl.sendForm(fm, (pl, id) => {
        if (id == null) {
            admin(pl);
            return;
        }
        modifys(pl, id);
    });
}
function modifys(pl, item) {
    let shop = db.get("shop");
    let items = shop[item];
    let fm = mc.newCustomForm();
    fm.setTitle("§l§1修改称号");
    fm.addInput("称号昵称", "", items.title);
    fm.addInput("所需金币数量", "", items.money);

    pl.sendForm(fm, (pl, dt) => {
        if (dt == null) {
            modify(pl);
            return;
        };

        let [title, money] = dt;

        if (!title) {
            pl.tell("§d[§eOneTitle§d] §r未输入称号昵称");
            return;
        }
        if (!money) {
            pl.tell("§d[§eOneTitle§d] §r未输入称号所需金币");
            return;
        }
        //let Nmoney = parseInt(money);       //这里转成数字类型表单添加所需金币数量就会失败
        if (isNaN(Number(money, 10)) && money != 0) {
            pl.tell("§d[§eOneTitle§d] §r金币请写为数字");
            return;
        }
        pl.tell('§d[§eOneTitle§d] §r称号"' + items.title + '§r" "' + items.money + '"成功修改为"' + title + '§r" "' + money + '"');
        shop[item].money = money;
        shop[item].title = title;
        db.set('shop', shop);
    });
}
function modifysplayer(pl, item, pldt) {
    let player = db.get(pldt.xuid);
    let items = player[item];
    let fm = mc.newCustomForm();
    fm.setTitle("§l§1修改称号");
    fm.addInput("称号昵称", "", items.title);

    pl.sendForm(fm, (pl, dt) => {
        if (dt == null) {
            modifyplayer(pl)
            return;
        };

        let [title] = dt;

        if (!title) {
            pl.tell('§d[§eOneTitle§d] §r未输入称号昵称');
            return;
        }
        pl.tell('§d[§eOneTitle§d] §r' + pldt.realName + '的称号"' + items.title + '成功修改为"' + title + '§r"');
        player[item].title = title;
        db.set(pldt.xuid, player);
    });
}
function op(pl) {       //OP更改玩家称号大概功能 新增 移除 修改称号名字？
    let fm = mc.newSimpleForm();
    fm.setTitle("§1§l管理玩家称号");
    fm.setContent("§c欢迎管理员" + pl.realName);
    fm.addButton("§1管理在线玩家", "textures/ui/icon_steve");
    //fm.addButton("§2管理全部玩家", "textures/ui/multiplayer_glyph_color");
    //fm.addButton("§3搜索玩家昵称", "textures/ui/magnifyingGlass");

    pl.sendForm(fm, (pl, id) => {
        switch (id) {
            case 0:
                OnlinePlayers(pl);
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
function OnlinePlayers(pl) {
    let fm = mc.newSimpleForm();
    fm.setTitle(`§1管理在线玩家`);
    fm.setContent(`请选择你要管理的玩家`)

    let OnlinePlayers = mc.getOnlinePlayers();
    OnlinePlayers.forEach((player) => {
        fm.addButton(player.realName);
    });

    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) {
            op(pl);
        }
        else {
            if (OnlinePlayers[arg].xuid != undefined) {
                TitlePlayer(pl, OnlinePlayers[arg]);
            }
            else {
                pl.tell('§d[§eOneTitle§d] §r目标玩家已离线');
            }
        }
    });
}
function TitlePlayer(pl, pldt) {
    let fm = mc.newSimpleForm();
    fm.setTitle(`管理玩家称号`);
    fm.setContent(`已选择玩家 ${pldt.realName}\n请选择你要进行的操作`)
    fm.addButton(`新增玩家称号`);
    fm.addButton(`移除玩家称号`);
    fm.addButton(`修改玩家称号`);
    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) {
            op(pl);
        }
        switch (arg) {
            case 0:
                addplayer(pl, pldt);
                break;
            case 1:
                removeplayer(pl, pldt);
                break;
            case 2:
                modifyplayer(pl, pldt);
                break;
            default:
                op(pl);
                break;
        }
    });
}
function title(xuid) {     //获取玩家使用称号用于导出API
    let players = db.get('use');

    if (!players) {
        return 'ERROR';     //在正常使用时不可能为此项
    }
    if (!players[xuid]) {
        return '无数据';
    }
    else {
        return players[xuid][0].use;
    }

}
mc.listen("onJoin", (pl) => {
    if (pl.isSimulatedPlayer()) { return true; }
    //db.delete(pl.xuid);       //调试使用
    //db.delete('use');

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
        players = {};
        db.set('use', players);
    }

    if (!players.hasOwnProperty(pl.xuid)) {
        log(pl.realName + '首次进入给予初始称号' + DefaultTitle);
        players[pl.xuid] = [];
        players[pl.xuid].push({
            "use": DefaultTitle
        });
        db.set('use', players);
        pl.tell('§d[§eOneTitle§d] §r您已获得初始称号§r"' + players[pl.xuid][0].use + '§r" 输入 /tsp 即可管理称号');
    }
});

mc.listen("onChat", (pl, msg) => {      //这个我改一下        静音问题先记录
    if (pl.isSimulatedPlayer()) { return true; }
    if (EnabledChat) {
        let use = title(pl.xuid);
        mc.broadcast("[" + use + "§r] <" + pl.realName + "§r> " + msg);
        return false;
    }
    else {
        return true;
    }
});
ll.exports(title, "Title", "TitleMsg");     //适配旧版本API
ll.exports(title, "OneTitle", "TitleMsg");

log("插件加载成功 - - - 感谢231项目的支持");
