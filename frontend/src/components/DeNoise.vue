<template>
  <el-container>
    <div
      v-loading.fullscreen.lock="loadingRes"
      element-loading-text="正在处理中，请稍等……"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    ></div>
    <el-main>
      <!--顶部-->
      <div class="header">属性去躁</div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main">
        <!--表格查看-->
        <!--<div class="top-tip" v-if="sourceFlag">-->
        <!--<span>请选择数据源：</span>-->
        <!--<el-select v-model="sourceIndex" placeholder size="small" style="margin-left:52px;">-->
        <!--<el-option v-for="(item, index) in sourceList" :key="index" :label="item" :value="item"></el-option>-->
        <!--</el-select>-->
        <!--<el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseSource">确定</el-button>-->
        <!--</div>-->
        <div class="top-tip">
          <span>请选择表格：</span>
          <el-select v-model="tableIndex" placeholder size="small" style="margin-left:20px;">
            <el-option v-for="(item, index) in tableList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseTable">确定</el-button>

          <!--v-if="graphBtn"-->
          <el-button
            type="primary"
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="deNoise"
          >属性去噪</el-button>
          <div style="float:right; margin-right:20px;">
            <span style="margin-left:20px;">请选择属性去躁方法：</span>
            <el-select
              v-model="algorithm"
              style="width:150px;margin-left: 5px;"
              placeholder="请选择算法"
              size="small"
            >
              <el-option v-for="item in algorithmList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </div>
        </div>
        <!--用户操作-->
        <!--<div style="margin-left:20px;margin-bottom: 10px;" v-if="!sourceFlag">-->
        <!--<span>属性去躁方法：</span>-->
        <!--<el-select v-model="algorithm" style="margin-left: 5px;" placeholder="请选择方法" size="small">-->
        <!--<el-option v-for="item in algorithmList" :key="item" :label="item" :value="item"></el-option>-->
        <!--</el-select>-->
        <!--</div>-->

        <!--表格部分-->
        <el-table
          :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
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
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: "DeNoise",
  data() {
    return {
      sourceFlag: true,
      sourceIndex: "",
      sourceList: ["数据源1", "数据源2"],
      tableList: ["演示数据", "表格2"],
      isList: false,
      fileCount: 0,
      curPage: 1,
      //表格数据，结构化数据列表
      rawData: [],
      tableIndex: "",
      tableData: [],
      columnNames: [],
      //选中行
      choosenRow: {},
      choosenInd: [],
      //三元组数据
      tripleData: [],
      //上次已标记的map
      pastSumMap: {},
      loadingRes: false,
      loadingResGraph: false,
      algorithm: "",
      algorithmList: ["函数依赖"]
    };
  },
  methods: {
    chooseSource() {
      if (this.sourceIndex === "") {
        this.$message({
          message: "请先选择数据源",
          type: "warning"
        });
        return;
      }

      this.sourceFlag = false;
      // this.tableList = [];
      // this.tableIndex="";
      //
      // let fd = new FormData();
      // fd.append("source", this.sourceIndex);
      // this.$http
      //   .post("http://49.232.95.141:8000/pic/view_structData", fd, {
      //     headers: {
      //       "Content-Type": "multipart/form-data"
      //     }
      //   })
      //   .then(res => {
      //     console.log(res);
      //     this.sourceFlag=false;
      //   })
      //   .catch(res => {
      //     //请求失败
      //     console.log(res);
      //   });
    },
    chooseTable() {
      // console.log(this.tableIndex)
      if (this.tableIndex === "") {
        this.$message({
          message: "请先选择表格",
          type: "warning"
        });
        return;
      }

      this.columnNames = [];
      this.tableData = [];
      this.loadingRes = true;
      let fd = new FormData();
      fd.append("table", this.tableIndex);
      this.$http
        .post("http://49.232.95.141:8000/pic/view_noise_data", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.columnNames = res.data[0].map(cur => {
            return { prop: cur, label: cur };
          });

          let column = res.data[0];
          this.tableData = res.data[1].map(cur => {
            let res = {};
            for (let i = 0; i < column.length; i++) res[column[i]] = cur[i];
            return res;
          });
          this.rawData = res.data[1];

          this.fileCount = res.data[1].length;
          this.loadingRes = false;
        })
        .catch(res => {
          //请求失败
          console.log(res);
          this.loadingRes = false;
        });
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    },
    deNoise() {
      if (this.tableIndex === "") {
        this.$message({
          message: "请先加载数据",
          type: "warning"
        });
        return;
      }

      if (this.algorithm === "") {
        this.$message({
          message: "请先选择去噪方法",
          type: "warning"
        });
        return;
      }

      this.loadingRes = true;
      let fd = new FormData();
      fd.append("table", this.tableIndex);
      this.$http
        .post("http://49.232.95.141:8000/pic/data_filter", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.rawData = [].concat(res.data[1]);

          this.columnNames = [].concat(
            res.data[0].map(cur => {
              return { prop: cur, label: cur };
            })
          );

          //加载去噪后数据替换在tableData中
          this.tableData = [].concat(
            res.data[1].map(cur => {
              let res = {};
              for (let i = 0; i < this.columnNames.length; i++)
                res[this.columnNames[i].prop] = cur[i];
              return res;
            })
          );
          this.fileCount = res.data[1].length;
          this.loadingRes = false;
        })
        .catch(res => {
          //请求失败
          console.log(res);
          this.loadingRes = false;
        });
    },
    init() {
      this.$http
        .post("http://49.232.95.141:8000/pic/load_noise_data", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.tableIndex = "";
          this.tableList = res.data;
        })
        .catch(res => {
          //请求失败
          console.log(res);
        });
    }
  },

  mounted() {
    this.init();
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

#matchInfo {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 8px 16px;
  width: 95%;
  padding: 8px 16px;
  border-radius: 10px;
  margin: 0 0 15px 10px;
  font-size: 13px;
}
.el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: #5775fb !important;
}
.el-pagination.is-background .el-pager li:hover {
  color: #5775fb !important;
}

/***************上传弹窗***********/
.upload {
  text-align: center;
  z-index: 99;
  position: fixed;
  top: 20%;
  left: 30%;
  right: 30%;
}
.upload-demo {
  margin-bottom: 20px;
}
.el-upload__tip {
  padding-left: 30%;
  text-align: left;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
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
