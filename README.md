## HP BIOS 仿真工具

<font color="red"> **!!仅用于交流学习使用，请以实际 BIOS 界面为准!!**</font>

文档最新版本: 1.0

工具最新版本: 1.0

### 功能介绍

1. 制作 BIOS 界面模拟图
2. 支持导出 HTML & JSON 格式

### 项目简介

##### unit-menu.json

拼接模板：

```json
[
    {
        "label": {
            "zh": "标签",
            "en": "label"
        },
        "description ": "描述",
        "id": "组件ID",
        "type": "list",
        "value": "",
        "min": 0,
        "max": 15,
        "checked": true,
        "available": true,
        "hidden": false,
        "default": true,
        "func": ["选项功能"],
        "children": [
            {
                "label": {
                    "zh": "标签",
                    "en": "label"
                },
                "description ": "描述",
                "id": "组件ID",
                "type": "list",
                "value": "",
                "min": 0,
                "max": 15,
                "checked": true,
                "available": true,
                "hidden": false,
                "default": true,
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
        "label": {
            "zh":"标签",
            "en":"label"
        },
        "description ":"描述",
        // 英文标签名，有空格用-拼接
        "id": "组件ID",
        "type":"menu | list | number | checked | group",
        "props":{},
        // 是否可用
        "available": true,
        // 是否隐藏
        "hidden": false | true,
        // 默认显示
        "default": true,
        // 用于注释支持功能
        "func":["选项功能"],
        // 按此进行先后排序
        "order": 1,
        "children": [
            {
                "label": {
                    "zh":"标签",
                    "en":"label"
                },
                "description ":"描述",
                "id": "组件ID",
                "type":"list",
                "props":{"value": "",
                "min":0,
                "max":15,
                "checked":true,}
                "available": true,
                "hidden": false,
                "default": true,
                "children":[]
            },
            {
                "label": {
                    "zh":"标签",
                    "en":"label"
                },
                "description ":"描述",
                "id": "组件ID",
                "type":"number",
                "prop":{
                    "min":0,
                    "max":15,
                    "step": 0,
                },
                "available": true,
                "hidden": false,
                "default": true,
                "children":[]
            }
        ]
    }
]
```
