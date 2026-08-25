## HP BIOS 仿真工具

<font color="red"> **!!仅用于交流学习使用，请以实际 BIOS 界面为准!!**</font>

文档最新版本: 0.1

工具最新版本: 0.1

### 功能介绍

1. 制作 BIOS 界面模拟图
2. 支持导出 HTML & JSON 格式
3. 

### 项目简介

##### unit-menu.json

拼接模板：

```json
[
    {
        "label": {
            "zh": "主要",
            "en": "Main"
        },
        "group-label": "",
        "description ": "描述",
        "id": "Main",
        "type": "page",
        "props": {
            "value": "",
            "min": 0,
            "max": 15,
            "checked": true
        },
        "available": true,
        "hidden": false,
        "default": true,
        "goback": false,
        "func": ["选项功能"],
        "order": 1,
        "clickable": true,
        "group": -1,
        "children": [
            {
                "label": {
                    "zh": "系统信息",
                    "en": "system information"
                },
                "group-label": "组标签",
                "description ": "information描述",
                "id": "system-information",
                "type": "list",
                "props": {
                    "value": "",
                    "min": 0,
                    "max": 15,
                    "checked": true
                },
                "available": true,
                "hidden": false,
                "default": true,
                "clickable": true,
                "group": 1,
                "func":[],
                "children": []
            }
        ]
    }
]
```

模板注释：

```json
[
    {
        // 展示标记
        "label": {
            "zh": "主要",
            "en": "Main"
        },
        // 页面显示小字
        "group-label": "",
        "description ": "描述",
        // 唯一代码，以label.en拼接，空格转-，例: a b 拼接为a-b
        "id": "Main",
        // 选项类型 page|list|group|input-text|input-number
        "type": "page",
        "props": {
            "value": "",
            "min": 0,
            "max": 15,
            "checked": true
        },
        // 是否可用，不可用选项不可点击，但仍显示
        "available": true,
        // 是否隐藏
        "hidden": false,
        // 是否默认选中
        "default": true,
        // 是否有返回选项
        "goback": false,
        // 此选项具备功能
        "func": ["选项功能"],
        // 选项排序
        "order": 1,
        // 是否可以点击跳转
        "clickable": true,
        // 组标记
        "group": -1,
        "children": [
            {
                "label": {
                    "zh": "系统信息",
                    "en": "system information"
                },
                "group-label": "组标签",
                "description ": "information描述",
                "id": "system-information",
                "type": "list",
                "props": {
                    "value": "",
                    "min": 0,
                    "max": 15,
                    "checked": true
                },
                "available": true,
                "hidden": false,
                "default": true,
                "clickable": true,
                "group": 1,
                "func":[],
                "children": []
            }
        ]
    }
]
```
