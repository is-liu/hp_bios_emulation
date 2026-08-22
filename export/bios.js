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

// ---------------------- 渲染核心（严格使用模板） ----------------------

/**
 * 渲染指定路径的页面
 */
function renderPage(pathArr) {
    const path = pathArr || getCurrentPath();
    const node = findNodeByPath(path);
    if (!node) {
        window.location.hash = '#/Main';
        return;
    }

    // 1. 更新顶部导航高亮
    const topId = path[0];
    $("#nav li").removeClass('item-active');
    $("#nav li[data-sn='" + topId + "']").addClass('item-active');

    // 2. 清空 tabBox 并生成新内容
    const $tabBox = $("#tabBox");
    $tabBox.empty();

    // 使用 page 模板生成外层结构
    const pageTemplate = config.template.template.page.li;
    let pageHtml = pageTemplate.replace(/\$\{unit-id\}/g, node.id);

    // 生成 content 内部 HTML（递归使用 group/list/checked/input 模板）
    let contentHtml = buildContentHtml(node.children || [], path);
    
    // 将 contentHtml 插入到 <div class='content' id='...'> 内部
    pageHtml = pageHtml.replace(/<div class='content' id='[^']*'>/, function(match) {
        return match + contentHtml;
    });

    $tabBox.append(pageHtml);

    // 3. 绑定子级点击事件（委托给 .clickable）
    $tabBox.find('.clickable').off('click').on('click', function(e) {
        e.preventDefault();
        const targetId = $(this).data('sn');
        if (targetId) {
            const newPath = [...path, targetId];
            window.location.hash = '#/' + newPath.join('/');
        }
    });

    // 4. 返回按钮
    const parentPath = getParentPath(path);
    const $content = $tabBox.find('.content').first();
    $tabBox.find('.back-btn').remove();
    if (parentPath && $content.length) {
        $content.prepend(
            `<div class="back-btn" style="cursor:pointer;color:#0066cc;margin:10px 0 15px 10px;">← 返回上级</div>`
        );
        $content.find('.back-btn').on('click', function() {
            window.location.hash = '#/' + parentPath.join('/');
        });
    }

    // 5. 更新右侧面板
    updateSidePanel(node);
}

/**
 * 递归构建 content 内部的 HTML（不使用 lt/gt，只生成 ul/li）
 * @param {Array} children - 子节点数组
 * @param {Array} currentPath - 当前路径（用于高亮，暂未使用）
 * @returns {string} HTML 字符串
 */
function buildContentHtml(children, currentPath) {
    if (!children || children.length === 0) {
        return `<div class="leaf-item">（无子项）</div>`;
    }

    let html = '';
    for (let child of children) {
        const templateType = child.type;
        const template = config.template.template[templateType];
        if (!template) continue;

        const hasSub = child.children && child.children.length > 0;
        let ulHtml = '';

        // 如果有 ul 模板，生成 ul 包裹
        if (hasSub && template.ul) {
            ulHtml = template.ul.replace(/\$\{unit-id\}/g, child.id);
        }

        // 生成 li（可能多个）
        if (hasSub) {
            for (let sub of child.children) {
                let liHtml = template.li
                    .replace(/\$\{btn-id\}/g, sub.id)
                    .replace(/\$\{TEXT-INNER\}/g, sub.label[config.language] || '')
                    .replace(/\$\{TEXT_INNER\}/g, sub.label[config.language] || '');
                // 处理 hidden / available / default
                liHtml = applyItemProps(liHtml, sub);
                ulHtml += liHtml;
            }
        } else {
            // 无子项，生成自身 li
            let liHtml = template.li
                .replace(/\$\{btn-id\}/g, child.id)
                .replace(/\$\{TEXT-INNER\}/g, child.label[config.language] || '')
                .replace(/\$\{TEXT_INNER\}/g, child.label[config.language] || '');
            liHtml = applyItemProps(liHtml, child);
            ulHtml += liHtml;
        }

        if (hasSub && template.ul) {
            ulHtml += '</ul>';
        }
        html += ulHtml;
    }
    return html;
}

/**
 * 为单个 li 添加属性样式（hidden, available, default）
 */
function applyItemProps(liHtml, item) {
    if (item.hidden) {
        liHtml = liHtml.replace(/<li/, '<li style="display:none"');
    }
    if (!item.available) {
        liHtml = liHtml.replace(/<li/, '<li class="not-available"');
    }
    if (item.default) {
        liHtml = liHtml.replace(/<li/, '<li class="item-active"');
    }
    return liHtml;
}

/**
 * 更新右侧面板（描述 + 功能）
 */
function updateSidePanel(node) {
    const desc = node.description || '';
    const $desc = $('.service-view .description');
    $desc.find('.service-title').siblings().remove();
    if (desc) {
        $desc.append(`<p>${desc}</p>`);
    }

    const funcs = node.func || [];
    const $list = $('.service-view .prompt-list ul');
    $list.empty();
    funcs.forEach(f => $list.append(`<li>${f}</li>`));
}

// ---------------------- 事件绑定 ----------------------

function bindNavClick() {
    $("#nav").on('click', 'li', function() {
        const id = $(this).data('sn');
        if (id) {
            window.location.hash = '#/' + id;
        }
    });
}

function bindLanguageSwitch() {
    $("#languGroup").on('click', 'li', function() {
        $("#languGroup li").removeClass('active');
        $(this).addClass('active');
        config.language = $(this).data('lang');
        renderPage(getCurrentPath());
    });
}

function onHashChange() {
    renderPage(getCurrentPath());
}

console.log('BIOS 应用已启动（严格使用 JSON 模板）');