<template>
  <el-container>
    <!-- 左侧导航栏-->
    <el-aside width="200px">
      <el-menu
        default-active
        class="el-menu-vertical-demo"
        background-color="#343643"
        text-color="#fff"
        active-text-color="#fff"
        :router="true"
      >
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-s-grid"></i>
            <span>结构化数据抽取</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/showOntology">本体展示</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <el-menu-item index="/extractStruct">知识抽取</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <el-menu-item index="/entityMatch">实体对齐</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-document"></i>
            <span>文本抽取</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/showDict" class="is-active">预处理</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <el-menu-item index="/extract">知识抽取</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-menu-item index="/extractPic">
          <i class="el-icon-picture-outline"></i>
          <span slot="title">图片抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractVedio">
          <i class="el-icon-video-camera"></i>
          <span slot="title">视频抽取</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--内容块实体对齐-->
    <el-main>
      <!--顶部-->
      <div class="header">文本预处理</div>
      <el-divider></el-divider>
      <!--中心-->
      <div class="top-tip">
        <span style="margin-left:10px;">请选择词典：</span>
        <el-select v-model="typeSelect" placeholder size="small" style="margin-left:20px;">
          <el-option v-for="(item, index) in typeList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
        <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="showDict">确定</el-button>

        <el-button
          type="primary"
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click=""
        >文本纠错</el-button>
        <el-button
          type="primary"
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click=""
        >OCR识别</el-button>
        <el-button
          type="primary"
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click=""
        >标注</el-button>
        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click=""
        >分词</el-button>
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
        <!--表格部分-->
        <el-table
          :data="tableData"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          border
        >
          <el-table-column
            v-for="(item, index) in columnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label"
          ></el-table-column>
        </el-table>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { option } from "../js/echartSettings";
export default {
  name: "ShowDict",
  data() {
    return {
      typeSelect: "",
      loadingResGraph: false,
      typeList: ["词典1", "词典2", "词典3"],
      columnNames:[],
      tableData:[],
    };
  },
  methods: {
    showDict() {
      this.loadingResGraph = true;
      this.$http
        .post("http://49.232.95.141:8000/pic/view_ontology", {
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
              name: tmp.relation
            });
          }
          let Myoption = option;
          Myoption["series"][0]["data"] = graphPoint;
          Myoption["series"][0]["links"] = graphLink;
          myChart = echarts.init(document.getElementById("graph"));
          // 绘制图表
          myChart.setOption(Myoption, true);
          this.loadingResGraph = false;
        })
        .catch(res => {
          //请求失败
          alert("出错了");
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
</style>
