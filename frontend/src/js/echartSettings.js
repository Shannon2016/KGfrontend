let categories = [{
        name: "概念与实体-中心",
        symbol: "circle"
    },{
        name: "概念与实体-非中心",
        symbol: "circle"
    }, {
        name: "关系-中心",
        symbol: "triangle"
    }, {
        name: "关系-非中心",
        symbol: "triangle"
    }, {
        name: "实体与属性-中心",
        symbol: "rect"
    },{
        name: "实体与属性-非中心",
        symbol: "rect"
    }];

let option = {
    // 提示框的配置
    tooltip: {
        formatter: function (x) {
            return x.data.des;
        }
    },
    // 工具箱
    toolbox: {
        // 显示工具箱
        show: true,
        feature: {
            mark: {
                show: true
            },
            // 还原
            restore: {
                show: true
            },
            // 保存为图片
            saveAsImage: {
                show: true
            }
        }
    },
    color: ['#2f4554', "#61a0a8", "#749f83", "#91c7ae", "#ca8622", "#F7C172"],
    legend: [
        {
            // selectedMode: 'single',
            data: categories.map(function (a) {
                return {name:a.name,icon:a.symbol}
            })
        }
    ],

    series: [
        {
            symbol: "rect",
            type: "graph", // 类型:关系图
            layout: "force", //图的布局，类型为力导图
            symbolSize: 40, // 调整节点的大小
            roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [2, 10],
            edgeLabel: {
                normal: {
                    textStyle: {
                        fontSize: 20
                    }
                }
            },
            force: {
                repulsion: 2500,
                edgeLength: [10, 50]
            },
            draggable: true,
            lineStyle: {
                normal: {
                    width: 2,
                    color: "#4b565b"
                }
            },
            edgeLabel: {
                normal: {
                    show: true,
                    formatter: function (x) {
                        return x.data.name;
                    }
                }
            },
            label: {
                normal: {
                    show: true,
                    textStyle: {}
                }
            },
            // 数据
            data: [],
            links: [],
            categories: categories
        }
    ],
    grid: {
        top: "10px",
        bottom: "10px",
        height: "10px",
        width: "10px"
    }
};

export {option}