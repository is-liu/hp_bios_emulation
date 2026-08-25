import Utils from './js/utils.js';

const config = {
    unitMenu: null,
    template: null,
    language: 'zh'
};

const domList = {
    $nav: null,
    $main: null,
    $backBox: null,
    $content: null
}

const cssSelecter = {
    hidden: 'hidden',
    notAvailable: 'not-available',
    checked: 'checked',
    clickable: 'clickable'
}

let debouncedShow = null;


/**
 * 初始化
 */
async function initApp() {
    // try {
    const [data1, data2] = await Promise.all([
        Utils.getConfig("./config/unit-menu.json"),
        Utils.getConfig("./config/props-mapping.json"),
        $.ready // jQuery 的 ready 方法支持 Promise 风格（或者写 $(document).ready()）
    ]);

    config.unitMenu = data1;
    config.template = data2;

    domList.$main = $("#main");
    domList.$nav = $("#nav");
    domList.$backBox = $("#backBox");

    console.log("配置加载成功。", config);

    bindLanguageSwitch();
    bindNavClick();
    window.addEventListener('hashchange', onHashChange);
    debouncedShow = debounce(updateSidePanel, 300);

    renderNav();

    // 首次渲染
    if (!window.location.hash) {
        window.location.hash = '#/' + getDefaultPath();
    } else {
        onHashChange();
    }

}

initApp();

// ---------------------- 路由工具 ----------------------

function getCurrentPath() {
    const hash = window.location.hash.slice(1);
    return hash ? hash.split('/').filter(Boolean) : ['Main'];
}

function findNodeByPath(pathArr, conf = config.unitMenu) {
    if (!Array.isArray(conf)) {
        console.warn('findNodeByPath: conf is not an array', conf);
        return null;
    }
    if (!pathArr || pathArr.length === 0) return null;
    const [first, ...rest] = pathArr;
    for (let node of conf) {
        if (node.id === first) {
            if (rest.length === 0) return node;
            if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                return findNodeByPath(rest, node.children);
            }
            return null;
        }
    }
    return null;
}

function getParentPath(pathArr) {
    return pathArr.length > 1 ? pathArr.slice(0, -1) : null;
}

/**
 * 获取到默认首页
 */
function getDefaultPath() {
    for (let conf of config.unitMenu) {
        if (conf.default) {
            return conf.id
        }
    }
    return config[0];
}

// ---------------------- 渲染核心（严格使用模板） ----------------------

/**
 * 渲染导航
 */
function renderNav() {
    domList.$nav.empty();
    let template = config.template.template.nav.li;
    for (let c of config.unitMenu) {
        if (c.type === 'page') {
            domList.$nav.append(template.replace('${btn-id}', c.id).replace('${TEXT-INNER}', c.label[config.language]))
        }
    }
}


/**
 * 渲染指定路径的页面
 */
function renderPage(pathArr) {
    console.log("渲染页面", pathArr)
    const path = pathArr || getCurrentPath();
    const node = findNodeByPath(path);
    if (!node) {
        window.location.hash = '#/' + getDefaultPath();
        return;
    }

    domList.$main.empty();

    const pageTemplate = config.template.template.page.li;
    console.log("导入page模板", pageTemplate)
    domList.$main.append(pageTemplate.replace(/\$\{unit-id\}/g, 'content'));
    domList.$content = $("#content")

    console.log("渲染子节点", node.children)
    buildContentHtml(domList.$content, node.children || [], path);

    //子级点击事件（委托给 .clickable）
    bindClick(path);

    // 提示文字事件
    bindSideTips();

    // 4. 返回按钮
    const parentPath = getParentPath(path);
    domList.$backBox.empty();
    if (parentPath) {
        domList.$backBox.prepend(config.template.template.backbtn);
        domList.$backBox.find('.back-btn').on('click', function () {
            window.location.hash = '#/' + parentPath.join('/');
        });
    }

    // 5. 更新右侧面板
    updateSidePanel(node);
}

/**
 * 构建页面
 * @param {Document} parentDom - 父节点Dom
 * @param {Array} children - 子节点数组
 * @param {Array} currentPath - 当前路径（用于高亮，暂未使用）
 * @returns {string} HTML 字符串
 */
function buildContentHtml(parentDom, children, currentPath) {
    if (!children || children.length === 0) {
        return `<div class="leaf-item">（无子项）</div>`;
    }
    let groupId = -1;
    let parent = parentDom;

    for (let child of children) {
        const templateType = child.type;
        const template = config.template.template[templateType];
        if (!template) continue;

        if (groupId != child.group) {
            groupId = child.group;
            parentDom.append(template.ul.replace(/\$\{unit-id\}/g, child.id + groupId));
            parent = $("#" + child.id + groupId)
        }

        let childId = appendDom(parent, template.li, child);
        applyItemProps($("#" + childId), child)

    }
    return parent;
}

/**
 * 创建节点
 * @param {Document} dom 
 * @param {String} template 
 * @param {config.unitMenu} conf 
 */
function appendDom(dom, template, conf) {
    template = template.replace(/\$\{btn-id\}/g, conf.id)
        .replace(/\$\{TEXT-INNER\}/g, conf.label[config.language] || '')
        .replace(/\$\{TEXT_INNER\}/g, conf.label[config.language] || '')
        .replace(/\$\{unit-id\}/g, conf.id);
    dom.append(template)

    return conf.id
}

/**
 * 绑定信息
 * @param {Document} dom 
 * @param {config.unitMenu} conf 
 */
function applyItemProps(dom, conf) {
    if (conf.hidden) {
        dom.addClass(cssSelecter.hidden);
    }
    if (!conf.available) {
        dom.addClass(cssSelecter.notAvailable)
    }
    if (conf.clickable) {
        dom.addClass(cssSelecter.clickable)
    }
    if (conf.checked) {
        dom.prop('checked', true)
    }

}

/**
 * 更新右侧面板（描述 + 功能）
 */
function updateSidePanel() {
    const $el = $(this);
    const id = $el.data('sn');        // 从 data-sn 获取节点 id
    if (!id) {
        $('#description').text('未指定标识');
        return;
    }
    const conf = findNodeById(id);
    if (!conf) {
        $('#description').text('未找到对应项');
        return;
    }
    let $promptList = $("#promptList");
    $promptList.empty();
    for (let str in conf.func) {
        $promptList.append(config.template.template.promptList.replace('${TEXT-INNER}', str))
    }
    const desc = conf.description || conf['description '] || '无描述';
    $('#description').text(desc);
}


// ---------------------- 事件绑定 ----------------------

/**
 * 导航点击
 */
function bindNavClick() {
    domList.$nav.on('click', 'li', function () {
        const id = $(this).data('sn');
        if (id) {
            window.location.hash = '#/' + id;
        }
    });
}

/**
 * 子级点击函数
 */
function bindClick(path) {
    domList.$content.find('.clickable').off('click').on('click', function (e) {
        e.preventDefault();
        const targetId = $(this).data('sn');
        if (targetId) {
            const newPath = [...path, targetId];
            window.location.hash = '#/' + newPath.join('/');
        }
    });
}



/**
 * 提示描述
 */
function bindSideTips() {
    domList.$content
        .off('mouseenter', '.show-descr')   // 避免重复绑定
        .on('mouseenter', '.show-descr', function (e) {
            debouncedShow.call(this, e);
        })
        .on('mouseleave', '.show-descr', function () {
            debouncedShow.cancel();
        });
}


/**
 * 切换语言
 */
function bindLanguageSwitch() {
    $("#languGroup").on('click', 'li', function () {
        $("#languGroup li").removeClass('active');
        $(this).addClass('active');
        config.language = $(this).data('lang');
        renderNav()
        renderPage(getCurrentPath());
    });
}

function onHashChange() {
    renderPage(getCurrentPath());
}

//----------------工具函数--------------
function findNodeById(id, tree = config.unitMenu) {
    if (!Array.isArray(tree)) return null;
    for (let node of tree) {
        if (node.id === id) return node;
        if (node.children && node.children.length) {
            const found = findNodeById(id, node.children);
            if (found) return found;
        }
    }
    return null;
}

/**
 * 通用防抖函数
 * @param {Function} fn  - 要执行的函数
 * @param {number}   delay - 延迟毫秒数
 * @returns {Function} 防抖处理后的函数
 */
function debounce(fn, delay) {
    let timer = null;
    const debounced = function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
    debounced.cancel = function () {
        clearTimeout(timer);
    };
    return debounced;
}