<template>
  <el-container>
    <el-main>
      <!--顶部-->
      <div class="header">抽取测试</div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main">
        <div class="top-tip">
          <span>请选择测试数据：</span>
          <el-select v-model="testIndex" size="small">
            <el-option v-for="(item,index) in TestList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-button
            class="blueBtn"
            @click="chooseTestData"
            type="primary"
            plain
            size="small"
          >加载测试数据</el-button>
          <!-- <span style="margin-left:10px;">或</span> -->

          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="calculateAverage"
          >计算平均结果</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="extractStruct"
          >结构化知识抽取</el-button>
          <el-button
            class="darkBtn"
            style="float:right; margin-right:20px;"
            @click="SettingFile"
            type="primary"
            plain
            size="small"
          >加载配置文件</el-button>
        </div>
        <!--测试数据-->
        <el-table
          :data="tableData.slice((curPage - 1) * 10, curPage * 10)"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          height="626"
          border
        >
          <el-table-column
            v-for="(item, index) in columnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label"
            v-if="!fileType"
          ></el-table-column>
          <el-table-column prop="title" :label="'映射文件(共'+tableData.length+'个)'" v-if="fileType"></el-table-column>
          <el-table-column label="操作" width="100" align="center" v-if="fileType">
            <template slot-scope="scope">
              <el-button
                class="blueBtn"
                @click="handleAnalysis(scope.row)"
                type="primary"
                plain
                size="small"
              >浏览</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="tableData.length"
          :current-page.sync="curPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-main>
  </el-container>
</template>

<script>
let echarts = require("echarts");
let myChart;

export default {
  name: "ExtractTest",
  data() {
    return {
      loadingRes: false,
      testIndex: "",
      TestList: [
        "contents1",
        "contents2",
        "contents3",
        "contents4",
        "contents5"
      ],
      curPage: 1,
      fileType: false, //true的时候显示映射文件，否则显示测试文件
      tableData: [],
      columnNames: []
    };
  },

  methods: {
    SettingFile() {
      this.fileType = true;
    },
    chooseTestData() {
      this.fileType = false;
      let fd = new FormData();
      fd.append("contents", this.testIndex);
      this.$http
        .post("http://49.232.95.141:8000/pic/viewStructTest", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.columnNames=[]
          this.columnNames = res.data[0].map(cur => {
            return { prop: cur, label: cur };
          });

          let column = res.data[0];
          this.tableData = res.data[1].map(cur => {
            let res = {};
            for (let i = 0; i < column.length; i++) res[column[i]] = cur[i];
            return res;
          });

          console.log(this.columnNames)
          console.log(this.tableData)
        })
        .catch(res => {
          console.log(res);
        });
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    },
    extractStruct() {
      this.$alert(
        "<p><strong>实体抽取准确率： <i>" +
          93.5 +
          "</i> %</strong></p>" +
          "<p><strong>实体抽取召回率： <i>" +
          92 +
          "</i> %</strong></p>",
        "结构化知识抽取结果",
        {
          dangerouslyUseHTMLString: true
        }
      );
    },
    calculateAverage() {
      this.$alert(
        "<p><strong>平均准确率： <i>" +
          92.3 +
          "</i> %</strong></p>" +
          "<p><strong>平均召回率： <i>" +
          90.1 +
          "</i> %</strong></p>",
        "平均结果",
        {
          dangerouslyUseHTMLString: true
        }
      );
    },
    handleAnalysis(row) {
      this.$alert("本体映射文件内容" + row, "本体映射文件", {
        dangerouslyUseHTMLString: true
      });

      // let fd = new FormData();
      // fd.append("ontology", row)
      // this.$http.post("http://49.232.95.141:8000/pic/functional_dependency",fd, {
      //   headers: {
      //     "Content-Type": "multipart/form-data"
      //   }
      // }).then(res => {
      //   console.log(res)
      //   let str = ''
      //   for(let i of res.data){
      //     str +="<p><strong>"+i[0]+" <i>" + i[1] + "</i>  "+i[2]+"</strong></p>"
      //   }
      //   this.$alert(
      //     str,
      //     "函数依赖结果",
      //     {
      //       dangerouslyUseHTMLString: true
      //     }
      //   );
      // }).catch(res => {
      //   console.log(res)
      // })
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

/***************上传弹窗***********/
#upload {
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
</style>
