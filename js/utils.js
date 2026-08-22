
const URLprefix = '';
const getConfig = (uri) => {
    return new Promise((resolve, reject) => {
        $.getJSON(uri)
            .done(resolve)
            .fail((jqXHR, textStatus, errorThrown) => {
                reject(new Error(`加载 ${uri} 失败: ${textStatus} - ${errorThrown}`));
            });
    });
};  

const isNull = (obj) => {
    return obj === null || obj === undefined
}



const splitJSONStr = (json, str) => {
    if( str.length == 0) {
        return json;
    }
    let keySet = str.split('.');
    for (let key of keySet) {
        json = json[key]
    }
    return json;
}


export default {getConfig, isNull, splitJSONStr}