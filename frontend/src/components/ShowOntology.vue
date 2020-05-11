<template>
  <el-container>
    <!--内容块实体对齐-->
    <el-main>
      <!--顶部-->
      <div class="header">本体展示</div>
      <el-divider></el-divider>
      <!--中心-->
      <div>
        <span style="margin-left:10px;">请选择本体类型：</span>
        <el-select v-model="typeSelect" placeholder size="small" style="margin-left:20px;">
          <el-option v-for="(item, index) in typeList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
        <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="showOntology">确定</el-button>
      </div>
      <div class="result" style="margin-bottom:50px;">
        <div
          id="kgPic"
          v-loading="loadingResGraph"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.1)"
        >
          <div id="graph" style="height:800px; width:1200px;"></div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { option } from "../js/echartSettings";
let echarts = require("echarts");
let myChart;
export default {
  name: "ShowOntology",
  data() {
    return {
      typeSelect: "",
      loadingResGraph: false,
      typeList: ["本体库1", "本体库2", "本体库3", "本体库4"]
    };
  },
  methods: {
    showOntology() {
      this.loadingResGraph = true;
      let fd = new FormData();
      fd.append("ontology", this.typeSelect);
      this.$http
        .post("http://49.232.95.141:8000/pic/view_ontology", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          let graphPoint = [];
          let graphLink = [];
          let pointName = new Set();
          for (let i = 0; i < res.data.length; i++) {
            let tmp = {};
            tmp.entity1 = res.data[i][0];
            tmp.relation = res.data[i][1];
            tmp.entity2 = res.data[i][2];
            if (!pointName.has(tmp.entity1)) {
              pointName.add(tmp.entity1);
              graphPoint.push({
                name: tmp.entity1,
                category: 0
              });
            }
            if (!pointName.has(tmp.entity2)) {
              pointName.add(tmp.entity2);
              graphPoint.push({
                name: tmp.entity2,
                category: 1
              });
            }
            graphLink.push({
              source: tmp.entity1,
              target: tmp.entity2,
              name: tmp.relation,
              des: tmp.relation
            });
          }
          let Myoption = JSON.parse(JSON.stringify(option));
          Myoption["series"][0]["data"] = graphPoint;
          Myoption["series"][0]["links"] = graphLink;
          Myoption["series"][0]["edgeLabel"]["normal"]["formatter"] = function (x) {
            return x.data.name;
          };

          let categories = [{
            name: "本体-中心",
            symbol: "diamond",
            itemStyle:{color:"#749f83"}
          }, {
            name: "本体-非中心",
            symbol: "diamond",
            itemStyle:{color:"#91c7ae"}
          }];

          Myoption["series"][0]["categories"] = categories;
          Myoption["legend"] = []
          Myoption['legend'].push({
            data: categories.map(function (a) {
                return {name:a.name,icon:a.symbol}
            })
          })

          myChart = echarts.init(document.getElementById("graph"));
          // 绘制图表
          myChart.setOption(Myoption, true);
          this.loadingResGraph = false;
        })
        .catch(res => {
          //请求失败
          alert("出错了");
          console.log(res);
          this.loadingResGraph = false;
        });
    }
  }
};
</script>

<style scoped>
html,
body,
.el-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
}
/****************整体布局*******************/

body > .el-container {
  width: 100%;
  height: 100%;
}
.el-aside {
  background-color: #343643;
  min-height: calc(100% - 60px);
}
.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: left;
  height: 100%;
  background-color: #f1f2f6;
}

/**************左侧导航栏***************/
.is-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-right: 4px solid #5775fb !important;
}
.el-menu-item {
  text-align: left;
  width: 200px;
}
.el-submenu {
  text-align: left;
  width: 200px;
}
/**************内容顶部***************/
.header {
  width: 100%;
  height: 20px;
  line-height: 20px;
  text-align: left;
  margin-left: 20px;
  font-weight: bold;
  font-size: large;
}
.headbutton {
  float: right;
  margin-right: 40px;
}
.top-tip {
  margin-top: -10px;
  margin-bottom: 10px;
  padding-left: 20px;
}
/*************内容中心*************/
.main {
  line-height: 30px;
  height: 90%;
  width: 100%;
}
/*表格*/
.el-table {
  height: 80%;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
/*分页符*/
.el-pagination {
  right: 60px;
  height: 10%;
  text-align: right;
  margin-top: 40px;
}

.el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: #5775fb !important;
}
.el-pagination.is-background .el-pager li:hover {
  color: #5775fb !important;
}

/***********按钮样式***********/
.blueBtn {
  margin-left: 5%;
  background-color: #eff0ff;
  border: 1px solid #5775fb;
  color: #5775fb;
}

.blueBtn:hover,
.blueBtn:active,
.blueBtn:focus {
  background-color: #5775fb;
  color: #ffffff;
}

.darkBtn {
  background-color: #5775fb;
  border: 1px solid #5775fb;
  color: #ffffff;
}
.darkBtn:hover {
  background-color: #708bf7;
}

.result {
  width: 100%;
}

#kgPic {
  height: 800px;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  background-color: #fff;
}
</style>
