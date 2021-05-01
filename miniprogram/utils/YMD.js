//获取标准的时间格式yyyy-mm-dd ，而非时间戳
export default function timetrans(originDate) {
    var date = new Date(originDate);
    
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());

    // var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    // var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ' ';
    return Y + M + D;
}