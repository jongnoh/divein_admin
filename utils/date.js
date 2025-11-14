
class dateUtils
{
    getKSTDateString() {
    let today = new Date().toLocaleDateString("ja-jp");
    today = today.replace("/", "-").replace("/", "-");
    return today;
}
    getKSTDateStringOfTwoWeeksAgo() {
    let today = new Date();
    today.setDate(today.getDate() - 14);
    let twoWeeksAgo = today.toLocaleDateString("ja-jp");
    twoWeeksAgo = twoWeeksAgo.replace("/", "-").replace("/", "-");
    return twoWeeksAgo;
}
getLatestMonday() {
    const today = new Date();
    const day = today.getDay(); // 0=일요일, 1=월요일, 2=화요일, ..., 6=토요일
    
    let diff;
    if (day === 1) {
        // 월요일이면 지난주 월요일 (7일 전)
        diff = today.getDate() - 7;
    } else {
        // 화~일요일이면 그 주 월요일
        diff = today.getDate() - day + (day === 0 ? -6 : 1);
    }
    
    const targetMonday = new Date(today.setDate(diff));
    return targetMonday.toLocaleDateString("ja-JP");
}
getTodayDateObject(){
    const todayString = this.getKSTDateString();
    const todayDateObject = new Date(todayString);
    return todayDateObject;
}
getAWeekAgoDateObject(){
    const todayString = this.getKSTDateString();
    const todayDateObject = new Date(todayString);
    todayDateObject.setDate(todayDateObject.getDate() - 7);
    return todayDateObject;
}
}
module.exports = dateUtils