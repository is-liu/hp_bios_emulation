
const URLprefix = '';
const getConfig = (uri) => {
    $.getJSON(uri, function(data) {
        // 操作 DOM，填充内容
        console.log(JSON.stringify(data))
    });
}

const isNull = (obj) => {
    return obj === null || obj === undefined
}


export default {getConfig, isNull}