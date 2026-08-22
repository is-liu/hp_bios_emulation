import utils from './utils.js';
import Utils from './utils.js'

const config = {
    unitMenu: null,
    template: null,
    language: 'zh'
}

const props = {
    uri: ''
}



/**
 * 初始化
 */
async function initApp() {
    const [data1, data2] = await Promise.all([
        Utils.getConfig("../config/unit-menu.json"),
        Utils.getConfig("../config/props-mapping.json"),
        $.ready // jQuery 的 ready 方法支持 Promise 风格（或者写 $(document).ready()）
    ]);

    config.unitMenu = data1;
    config.template = data2;

    console.log("配置加载成功。", config)

    initPage();
    changeLangu();
    changeTab($("#nav"), "li", $("#tabBox"));
}

initApp();

/**
 * 加载页面内容
 */
const initPage = () => {
    props.uri = ''

    let conf = config.unitMenu
    $("#nav").empty();
    let tmpInd = 0, defInd = 0;
    for (let c of conf) {
        if (!c.hidden)
        createDom($("#nav"), config.template.template.nav.li, c);
        createDom($("#tabBox"), config.template.template.page.li, c);
        createChild($("#" + c.id).last(), c.children)
        if (c.default) {
            props.uri = c.id
            defInd = tmpInd
        }
        tmpInd++;
    }

    // 默认渲染页面
    // console.log(1)
    // changeTab($("#nav"), "li", $("#tabBox"));

}

const createChild = (parentDom, conf) => {
    console.log("parentDom", parentDom)
    if (utils.isNull(conf)) {
        return;
    }
    let newDomId
    if (conf instanceof Array) {
        for (let c of conf) {
            let temp = config.template.template[c.type]
            let domStr;
            if (c.children.length === 0) {
                domStr = temp["li"]
            } else {
                domStr = temp["ul"];
            }
            newDomId = createDom(parentDom, domStr, c)
            createChild($("#" + newDomId), c);
            console.log(domStr)
            // let newDom = parentDom.children().last();
        }
    } else if (conf instanceof Object) {
        createDom(parentDom, config.template.template[conf.type]['li'], conf)
    }
}

/**
 * 创建组件
 * @param {Document} dom 
 * @param {String} childStr 
 */
const createDom = (dom, childStr, c) => {
    childStr = childStr.replace('${unit-id}', c.id).replace('${btn-id}', c.id).replace("${TEXT-INNER}", c.label[config.language])
    dom.append(childStr)
    let newDom = dom.children().last();
    if (c.hidden) {
        newDom.css("display", "hidden")
    }
    if (c.props.checked) {
        newDom.add("checked");
    }
    if (!c.available) {
        newDom.addClass("not-available");
    } else if(c.clickable){
        
    }
    if (c.default) {
        newDom.addClass("item-active")
    }
    return c.id;
}

/**
 * 切换语言
 */
const changeLangu = () => {
    $("#languGroup").on('click', 'li', function (e) {
        let list = $("#languGroup").children("li");
        for (let li of list) {
            $(li).removeClass('active');
        }
        $(this).addClass("active")
        config.language = $(this).data('lang')

        initPage()
    })
}

/**
 * 
 * @param {Document} parentDom 
 * @param {String} target 
 * @param {Document} tabDom
 */
const changeTab = (parentDom, target, tabDom) => {
    console.log(target)
    parentDom.on('click', target, function () {
        var index = $(this).closest(parentDom).find(target).index(this);
        var child = tabDom.children()
        for (let c of child) {
            $(c).removeClass("item-active")
        }
        $(child[index]).addClass("item-active")
    })
}
