if (window.innerWidth > 420) {
    location.href = './iframe.html'
}
window.onload = function () {
    window.onresize = function () {
        if (window.innerWidth > 420) {
            location.href = './iframe.html'
        }
    }
}

// const host = 'http://139.196.17.13:8083';
const host = ''

// 背景颜色、文字、图片、旋转速度
// 自定义奖品
var turnplate = {
    restaraunts: [], //奖品
    colors: [], //奖品背景颜色
    outsideRadius: 344, //大转盘外圆的半径
    textRadius: 260, //大转盘奖品位置距离圆心的距离
    insideRadius: 136, //大转盘内圆的半径
    startAngle: 0, //开始角度

    bRotate: false, //false:停止;ture:旋转
};

turnplate.restaraunts = [
    {
        id: 1,
        name: "一等奖",
        color: "#FFECF0",
        img: "",
        img_object: undefined,
    },
    {
        id: 2,
        name: "二等奖",
        color: "#FFFFFF",
        img: "",
        img_object: undefined,
    },
    {
        id: 999,
        name: "谢谢参与",
        color: "#FFECF0",
        img: "",
        img_object: undefined,
    },
    {
        id: 3,
        name: "三等奖",
        color: "#ffffff",
        img: "",
        img_object: undefined,
    },
    {
        id: 3,
        name: "其他奖品",
        color: "#FFECF0",
        img: "",
        img_object: undefined,
    },
    {
        id: 999,
        name: "谢谢参与",
        color: "#ffffff",
        img: "",
        img_object: undefined,
    },
];

let uniqueId = getQueryString('uniqueId')

uniqueId = 1;

var vvue = new Vue({
    el: document.getElementById("app"),
    data: {
        turnplate_count: 3, // 抽奖次数
        show: false,
    },
    mounted() {
        this.getPrizeList();
    },
    methods: {
        renderTurnplate(){
            var list = [];
            for (var v of turnplate.restaraunts) {
                list.push(getImg(v.img));
            }
            Promise.all(list).then((result_list) => {
                for (var i in turnplate.restaraunts) {
                    turnplate.restaraunts[i]["img_object"] = result_list[i];
                }
                drawRouletteWheel();
            });
            document.getElementById('app').style.visibility = 'visible';
        },
        getPrizeList() {
            $.ajax({
                type: 'get',
                url: host + '/award/api/getAllShop',
                data: {},
                dataType: 'json',
                success: (res) => {
                    console.log(res);
                    let idx = 0;
                    let list = res.map(item => {
                        return {
                            id: item.id,
                            name: item.shopName,
                            color: ++idx % 2 == 0 ? "#FFECF0" : '#ffffff',
                            img: "",
                            img_object: undefined,
                        }
                    });
                    turnplate.restaraunts = list;
                    this.renderTurnplate();
                }
            })
        },
        // 点击抽奖事件
        getPrize() {
            if (turnplate.bRotate) return;
            turnplate.bRotate = true;

            let res_prize_id = 1
            for (var i = 0; i < turnplate.restaraunts.length; i++) {
                if (turnplate.restaraunts[i]['id'] == res_prize_id) {
                    console.log(i, turnplate.restaraunts[i],)
                    this.rotate(i);
                    break;
                }
            }
        },
        rotate(index) {
            if (this.turnplate_count == 0) {
                vant.Dialog.alert({
                    title: '提示',
                    message: '无可用抽奖次数'
                })
                return;
            }
            this.turnplate_count = this.turnplate_count - 1;
            var obj = turnplate.restaraunts[index];
            index = index + 1;
            var angles = index * (360 / turnplate.restaraunts.length) - 360 / (turnplate.restaraunts.length * 2);
            if (angles < 270) {
                angles = 270 - angles;
            } else {
                angles = 360 - angles + 270;
            }
            $("#wheel_canvas").stopRotate();
            $("#wheel_canvas").rotate({
                angle: 0,
                animateTo: angles + 3600,
                duration: 5000,
                // animateTo: angles + 3600,
                // duration: 1000,
                callback: () => {
                    // this.output = "output:" + obj.name;
                    // console.log(this.output);
                    turnplate.bRotate = false;
                    if (obj.name == '谢谢参与') {
                        vant.Dialog.alert({
                            title: '提示',
                            message: '谢谢参与',
                        }).then(() => {
                            // on close
                        });
                        return;
                    }
                    vant.Dialog.alert({
                        title: '提示',
                        message: '恭喜获得' + obj.name,
                    }).then(() => {
                        // on close
                    });
                },
            });
        }
    },
});

function drawRouletteWheel() {
    var canvas = document.getElementById("wheel_canvas");
    let width = 844;
    canvas.width = width;
    canvas.height = width;
    if (canvas.getContext) {
        //根据奖品个数计算圆周角度
        var arc = Math.PI / (turnplate.restaraunts.length / 2);
        var ctx = canvas.getContext("2d");
        //在给定矩形内清空一个矩形
        ctx.clearRect(0, 0, 844, 844);
        //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
        ctx.strokeStyle = "#FFFFFF";
        //font 属性设置或返回画布上文本内容的当前字体属性
        ctx.font = "34px Microsoft YaHei";
        for (var i = 0; i < turnplate.restaraunts.length; i++) {
            var angle = turnplate.startAngle + i * arc;
            ctx.fillStyle = turnplate.restaraunts[i].color;
            ctx.beginPath();
            //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
            ctx.arc(422, 422, turnplate.outsideRadius, angle, angle + arc, false);
            ctx.arc(422, 422, turnplate.insideRadius, angle + arc, angle, true);
            ctx.stroke();
            ctx.fill();
            //锁画布(为了保存之前的画布状态)
            ctx.save();

            //----绘制奖品开始----
            ctx.fillStyle = "#555555";
            var text = turnplate.restaraunts[i].name;
            var line_height = 34;
            //translate方法重新映射画布上的 (0,0) 位置
            ctx.translate(
                422 + Math.cos(angle + arc / 2) * turnplate.textRadius,
                422 + Math.sin(angle + arc / 2) * turnplate.textRadius
            );

            //rotate方法旋转当前的绘图
            ctx.rotate(angle + arc / 2 + Math.PI / 2);

            /** 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) **/
            if (text.indexOf("M") > 0) {
                var texts = text.split("M");
                for (var j = 0; j < texts.length; j++) {
                    ctx.font = j == 0 ? "bold 40px Microsoft YaHei" : "34px Microsoft YaHei";
                    if (j == 0) {
                        ctx.fillText(texts[j] + "M", -ctx.measureText(texts[j] + "M").width / 2, j * line_height);
                    } else {
                        ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                    }
                }
            } else if (text.indexOf("M") == -1 && text.length > 7) {
                //奖品名称长度超过一定范围
                text = text.substring(0, 7) + "||" + text.substring(7);
                var texts = text.split("||");
                for (var j = 0; j < texts.length; j++) {
                    ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                }
            } else {
                //在画布上绘制填色的文本。文本的默认颜色是黑色
                //measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
                ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            }

            //添加对应图标
            var img = turnplate.restaraunts[i].img_object;
            if (img) ctx.drawImage(img, -30, 30, 68, 68);

            //把当前画布返回（调整）到上一个save()状态之前
            ctx.restore();
            //----绘制奖品结束----
        }
    }
}

function getImg(path) {
    if (path == "" || path.endsWith("/") || path.endsWith("\\")) return undefined;
    return new Promise((resolve) => {
        var img = document.createElement("img");
        img.src = path;
        img.onload = () => resolve(img);

        // 超时处理
        setTimeout(() => {
            resolve(undefined);
        }, 2000);
    });
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return r[2];
    return "";
}