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
            <el-menu-item index="/extractStruct" class="is-active">知识抽取</el-menu-item>
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
            <el-menu-item index="/showDict">预处理</el-menu-item>
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
    <el-main>
      <!--顶部-->
      <div class="header" v-if="!graphFlag">结构化数据抽取</div>
      <el-divider v-if="!graphFlag"></el-divider>
      <!--中心-->
      <div class="main" v-if="!graphFlag">
        <!--表格查看-->
        <div class="top-tip">
          <span>请选择表格：</span>
          <el-select v-model="tableIndex" placeholder size="small" style="margin-left:20px;">
            <el-option v-for="(item, index) in properties" :key="index" :label="item" :value="item"></el-option>
          </el-select>

          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseTable">确定</el-button>

          <span style="margin-left:10px;">请选择本体类型：</span>
          <el-select v-model="typeSelect" placeholder size="small" style="margin-left:20px;">
            <el-option v-for="(item, index) in typeList" :key="index" :label="item" :value="item"></el-option>
          </el-select>

          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="showGraph"
          >图谱展示</el-button>
          <el-button
            type="primary"
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="onReflect"
          >建立映射</el-button>
          <el-button
            type="primary"
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="loadData"
          >加载数据</el-button>
        </div>
        <!--表格部分-->
        <el-table
          :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          :cell-style="cellStyle"
          border
          height="626"
        >
          <el-table-column
            v-for="(item, index) in columnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label"
          ></el-table-column>
        </el-table>
        <!-- 分页符-->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="fileCount"
          :page-size="20"
          @current-change="handleCurrentChange"
          :current-page="curPage"
        ></el-pagination>
      </div>
      <div class="main" v-if="graphFlag">
        <div class="header">
          <i class="el-icon-back" @click="graphFlag=false"></i>
        </div>
        <el-divider></el-divider>
        <div class="result" style="margin-bottom:50px;">
          <!--关系图谱-->
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
      </div>
    </el-main>
  </el-container>
</template>

<script>
import {option} from '../js/echartSettings'
export default {
  name: "ExtractStruct",
  data() {
    return {
      tableIndex: "",
      properties: [],
      tableData: [],
      curPage: 1,
      columnNames: [],
      fileCount: 0,
      loadingResGraph: false,
      graphFlag: false,
      reflectTable:false,
      highlight:[],
      typeSelect: "",
      typeList: ["本体1", "本体2", "本体3"]
    };
  },
  methods: {
    onReflect() {
      this.highlight.push(2)
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (this.highlight.indexOf(columnIndex) !== -1) {
        return `background-color:#FDF6EC ;`;
      } else {
        return "";
      }
    },
    chooseTable() {
      // console.log(this.tableIndex)
      if (this.tableIndex === "") return;

      this.columnNames = [];
      this.tableData = [];

      let fd = new FormData();
      fd.append("table", this.tableIndex);
      this.$http
        .post("http://49.232.95.141:8000/pic/view_structData", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.columnNames = res.data[0].map(cur => {
            return { prop: cur, label: cur };
          });

          let column = res.data[0];
          this.tableData = res.data[1].map(cur => {
            let res = {};
            for (let i = 0; i < column.length; i++) res[column[i]] = cur[i];
            return res;
          });
          // this.rawData = res.data[1];

          this.fileCount = res.data[1].length;
        })
        .catch(res => {
          //请求失败
          console.log(res);
        });
    },
    //展示图谱
    showGraph() {
      this.graphFlag = true;
      this.loadingResGraph = true;
      this.$http
        .post("http://49.232.95.141:8000/pic/show_structTuple", {
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
          Myoption['series'][0]['data'] = graphPoint;
          Myoption['series'][0]['links'] = graphLink;
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
    },
    loadData() {
      this.$http
        .post("http://49.232.95.141:8000/pic/show_table", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.properties = res.data;
        })
        .catch(res => {
          //请求失败
          console.log(res);
        });
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
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
  display: block;
}
.el-menu-item {
  text-align: left;
  width: 200px;
}
.el-submenu {
  text-align: left;
  width: 200px;
}
/*************内容中心*************/
.main {
  line-height: 30px;
  height: 90%;
  width: 100%;
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
.top-tip {
  margin-top: -10px;
  margin-bottom: 10px;
  padding-left: 20px;
}
/*表格*/
.el-table {
  height: 80%;
  width: 100%;
  /*box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);*/
}
.el-table--border,
.el-table--group {
  border: 0;
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

.textBtn {
  color: #606266;
  text-decoration: underline;
}

.textBtn:hover {
  color: #7c7c7c;
}
/*关系图*/
#kgPic {
  height: 800px;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  background-color: #fff;
}
.result {
  width: 100%;
}
</style>
