<template>
  <el-container
    v-loading="fullscreenLoading"
    element-loading-text="模型测试中，离开将中断测试……"
  >
    <div class="upload" v-show="showSingleResult">
      <el-card class="box-card">
        <div slot="header" class="clearfix" style="text-align: center">
          <span>预测结果</span>
          <i
            class="el-icon-close"
            style="float: right; padding: 3px 0"
            @click="showSingleResult = false"
          ></i>
        </div>
        <div style="padding: 0 15px; margin-top: 10px">
          <video
            v-if="singleSrc !== ''"
            :src="singleSrc"
            controls="controls"
            style="width: 100%"
          ></video>
        </div>
      </el-card>
    </div>

    <!-- 分类结果 -->
    <el-dialog title="分类" :visible.sync="showClassify" width="30%">
      <video :src="classifySrc" controls="controls" style="width: 100%"></video>
      <div style="margin-top: 20px">分类结果：{{ classifyResult }}</div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showClassify = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 上传视频 -->
    <!-- <div class="upload" v-if="isUpload">
      <el-card class="box-card" style="text-align: center">
        <div slot="header" class="clearfix">
          <span>文件上传</span>
          <i
            class="el-icon-close"
            style="float: right; padding: 3px 0"
            @click="cancelUpload"
          ></i>
        </div>
        <el-upload
          class="upload-demo"
          drag
          ref="upload"
          :auto-upload="false"
          accept=".mp4"
          :limit="1"
          action=""
          :on-remove="handleRemove"
          :on-change="handleAddFile"
          :file-list="uploadFileList"
          multiple
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">仅支持上传mp4文件<br /></div>
        </el-upload>
        <el-button size="small" @click="cancelUpload">取消</el-button>
        <el-button
          style="margin-left: 10px"
          class="darkBtn"
          size="small"
          type="primary"
          @click="submitUpload"
          >上传</el-button
        >
      </el-card>
    </div> -->
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        <i
          class="el-icon-back"
          @click="
            resultFlag = false;
            graphFlag = false;
          "
          v-if="resultFlag || graphFlag"
          style="margin-right: 10px"
        ></i>
        <i class="el-icon-back" v-if="!sourceFlag" @click="backToSource" style="margin-right:10px;"></i>
        视频分类
        <!--<el-button-->
        <!--type="primary"-->
        <!--class="darkBtn headbutton"-->
        <!--size="small"-->
        <!--style="float:right; margin-right:20px;"-->
        <!--@click="showGraph"-->
        <!--v-if="!resultFlag&&!graphFlag"-->
        <!--&gt;加入图谱</el-button>-->

        <!-- <el-button
          class="darkBtn headbutton"
          size="small"
          @click="isUpload = true"
          v-if="!resultFlag && !graphFlag"
          >上传文件</el-button
        > -->
        <el-button
          class="darkBtn headbutton"
          size="small"
          @click="testResult"
          v-if="!resultFlag"
          >查看测试结果</el-button
        >
        <el-button
          class="darkBtn headbutton"
          size="small"
          @click="modelTest"
          v-if="!resultFlag"
          >模型测试</el-button
        >
        <el-button
          class="blueBtn headbutton"
          size="small"
          @click="loadList"
          v-if="!resultFlag"
          :disabled="btnDis"
        >加载测试视频</el-button
        >
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--      列表页-->
      <div class="main" v-if="!resultFlag && !graphFlag">
        <el-row class="top-tip" v-if="tabDis == 2">
          <span>请选择分类目录：</span>
          <el-select
            v-model="fileIndex"
            placeholder
            size="small"
            style="margin-left: 10px"
          >
            <el-option
              v-for="(item, index) in fileList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>

          <el-button
            style="margin-left: 20px"
            class="blueBtn"
            size="small"
            @click="chooseTable"
          >加载数据</el-button>
        </el-row>

        <div id="matchInfo" v-if="vedioList.length !== 0">
          已有测试数据数量 : {{ vedioList.length }}
        </div>
        <div id="matchInfo1" v-if="tabDis == 2 && testSum != 0">
          该分类下的数据总数 : {{ testSum }}
        </div>
        <!--文书列表-->
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
        >
          <el-col :span="12">
            <el-table
              :data="vedioList.slice((curPage - 1) * 10, curPage * 10)"
              :header-cell-style="{ background: '#F6F7FB', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
              v-if="tabDis == 1"
            >
              <el-table-column prop="title" label="测试数据"></el-table-column>
              <el-table-column label="浏览" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleShow(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >浏览</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column label="分类" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleClassify(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >分类</el-button
                  >
                </template>
              </el-table-column>
              <!-- <el-table-column label="预测" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleAnalysis(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >预测</el-button
                  >
                </template>
              </el-table-column> -->
            </el-table>
            <el-table
              :data="testData.slice((curPage - 1) * 10, curPage * 10)"
              :header-cell-style="{ background: '#F6F7FB', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
              v-if="tabDis == 2"
            >
              <el-table-column prop="title1" label="测试数据"></el-table-column>
              <el-table-column label="浏览" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleShow1(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >浏览</el-button
                  >
                </template>
              </el-table-column>
              <!-- <el-table-column label="分类" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleClassify(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >分类</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column label="预测" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleAnalysis(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >预测</el-button
                  >
                </template>
              </el-table-column> -->
            </el-table>
            <!-- 分页符-->
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="vedioList.length"
              :current-page.sync="curPage"
              @current-change="handleCurrentChange"
              v-if="tabDis == 1"
            ></el-pagination>
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="testData.length"
              :current-page.sync="curPage"
              @current-change="handleCurrentChange"
              v-if="tabDis == 2"
            ></el-pagination>
            <!--</el-pagination> -->
          </el-col>
          <el-col
            :span="12"
            style="
              background-color: #fff;
              min-height: 625px;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            "
          >
            <div class="tableHeader">
              视频浏览
              <span v-if="src === ''">(选择视频以浏览内容)</span>
            </div>
            <div style="padding: 0 15px; margin-top: 100px">
              <video
                v-if="src !== ''"
                :src="src"
                controls="controls"
                style="width: 100%"
              ></video>
            </div>
          </el-col>
        </el-row>
      </div>
      <div
        class="main"
        style="display: flex; flex-direction: column"
        v-if="resultFlag"
      >
        <!--<div style="text-align:center;font-size:large;">-&#45;&#45;&#45;&#45;以下内容仅为随机展示的部分结果-&#45;&#45;&#45;&#45;</div>-->
        <!--<div class="picStyle" v-for="(item, index) in resultList" :key="index">-->
        <!--<video :src="item" controls="controls" style="width:100%;"></video>-->
        <!--<div style="text-align: center;font-weight: bold;width: 100%">-->
        <!--视频{{index + 1}}-->
        <!--</div>-->
        <!--</div>-->

        <!--结果列表-->
        <el-row>
          <el-col :span="12">
            <el-table
              :data="
                resultList.slice((curPageResult - 1) * 10, curPageResult * 10)
              "
              :header-cell-style="{ background: '#F6F7FB', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
            >
              <el-table-column prop="title" label="结果列表"> </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleAnalysisResult(scope.row.url)"
                    type="primary"
                    plain
                    size="small"
                    >浏览</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页符-->
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="resultList.length"
              :current-page.sync="curPageResult"
              @current-change="handleCurrentChangeResult"
            ></el-pagination>
            <!--</el-pagination> -->
          </el-col>
          <el-col
            :span="12"
            style="
              background-color: #fff;
              min-height: 625px;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            "
          >
            <div class="tableHeader">视频浏览</div>
            <div style="padding: 0 15px; margin-top: 100px">
              <video
                v-if="resultSrc !== ''"
                :src="resultSrc"
                controls="controls"
                style="width: 100%"
              ></video>
            </div>
          </el-col>
        </el-row>
      </div>
      <!--图谱搜索页-->
      <div class="main" v-if="graphFlag">
        <el-input
          v-model="inputEntity"
          style="width: 450px"
          placeholder="请输入实体名称"
        ></el-input>
        <el-button
          style="margin-left: 20px; height: 40px"
          class="darkBtn"
          size="small"
          @click="onSearchClick"
          >搜索</el-button
        >
        <div id="kgPic">
          <div
            id="graph"
            :style="{ width: graphWidth, height: graphHeight }"
          ></div>
        </div>
      </div>
    </el-main>

    <!-- 分析页 -->
    <!-- <el-main v-show="!isList">
      <div class="header">
        <i class="el-icon-back" @click="isList=true"></i>
        <el-button type="primary" class="headbutton" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-divider></el-divider>
      <div class="main" id="daddy">
        <div id="graph" style="width: 1000px;height:800px;"></div>
      </div>
    </el-main>-->
  </el-container>
</template>

<script>
let echarts = require("echarts");
let myChart;

import { option } from "../../js/echartSettings";
export default {
  name: "VideoPredict",
  data() {
    return {
      isUpload: "",
      showClassify: false,
      classifySrc: "",
      classifyResult: "分类结果-视频",
      graphFlag: false,
      inputEntity: "",
      resultFlag: false,
      curPage: 1,
      curPageResult: 1,
      tabDis: 1,
      testSum: 0,
      sourceFlag: true,
      fileIndex: "",
      fileList: [
        "Sea_cloudy",
        "Sea_night",
        "Sea_sunny",
      ],
      btnDis: false,
      //上传的文件列表
      uploadFileList: [],
      //表格数据 测试集
      vedioList: [],
      testData: [],
      //选中行
      choosenRow: {},
      //三元组数据
      tripleData: [],
      //弹出框可视
      selectTitle: "文书名",
      loadingRes: false,
      fullscreenLoading: false,
      src: "",
      resultList: [],
      resultSrc: "",
      //单个结果
      showSingleResult: false,
      singleSrc: "",
      //图谱
      graphWidth: "100%",
      graphHeight: "100%",
    };
  },

  methods: {
    submitUpload() {
      let fd = new FormData();
      fd.append("video", this.uploadFileList[0].raw)
      console.log(this.uploadFileList)
      this.$http
        .post("http://39.102.71.123:30001/pic/video_detect_submit", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }).then(res => {
          this.loadList()
          this.isUpload = false;
        }).catch(res =>{

        })
    },
    cancelUpload() {
      this.isUpload = false;
      this.uploadFileList = [];
    },
    handleRemove(file, uploadFileList) {
      this.uploadFileList = uploadFileList;
    },
    handleAddFile(file, uploadFileList) {
      this.uploadFileList = uploadFileList;
    },
    onSearchClick() {
      let fd = new FormData();
      fd.append("entity", this.inputEntity);
      this.$http
        .post("http://39.102.71.123:30001/pic/search_entity", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
          if (res.data.length === 0) {
            this.$message({
              message: "未搜索到该实体！",
              type: "warning",
            });
            return;
          }
          let graphPoint = [
            {
              name: res.data,
              category: 1,
            },
          ];
          let Myoption = JSON.parse(JSON.stringify(option));
          Myoption["series"][0]["data"] = graphPoint;

          myChart = echarts.init(document.getElementById("graph"));
          // 绘制图表
          myChart.setOption(Myoption, true);
        })
        .catch((res) => {
          console.log(res);
        });
    },
    showGraph() {
      this.graphFlag = true;
      this.$http
        .post("http://39.102.71.123:30001/pic/JSTextJoinKG", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((res) => {
          console.log(res);
        });
      this.inputEntity = "";
    },
    //返回按钮
    backToSource() {
      this.sourceFlag = true;
      this.tabDis = 1;
      this.testData = [];
      this.btnDis = false;
      this.testSum = 0;
      this.src = "";
      this.resultList = [];
      this.selectTitle = "";
      this.fileIndex = "";
    },
    //加载测试视频
    loadList() {
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:30001/pic/video_detect", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res)
          this.vedioList = res.data.map((cur) => {
            return { title: cur };
          });

          this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
          alert("出错了！");
          this.loadingRes = false;
        });
    },
    //模型测试
    modelTest() {
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:30001/pic/video_detect_classification_all", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res)
          this.loadingRes = false;
          this.$alert(
            "<p><strong>视频总数量： <i>" +
            res.data[0] +
            "</i> 个</strong></p>" +
            "<p><strong>视频分类正确数量： <i>" +
            res.data[1] +
            "</i> 个</strong></p>" +
            "<p><strong>视频分类错误数量： <i>" +
            res.data[2] +
            "</i> 个</strong></p>" +
            "<p><strong>视频分类准确率： <i>" +
            res.data[3] +
            "</i> %</strong></p>" ,
            "模型测试结果",
            {
              dangerouslyUseHTMLString: true
            }
          );
        })
        .catch((res) => {
          console.log(res);
          alert("出错了！");
          this.loadingRes = false;
        });
    },
    //查看测试结果
    testResult() {
      this.sourceFlag = false;
      this.tabDis = 2;
      this.src = "";
      this.vedioList = [];
      this.btnDis = true;
    },
    //加载数据
    chooseTable() {
      console.log(this.fileIndex);
      if(this.fileIndex != "") {
        let fd = new FormData();
        fd.append("classfication",this.fileIndex);
        this.$http
          .post("http://39.102.71.123:30001/pic/video_detect_classification_results_1", fd, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(res => {
            console.log("res",res);
            this.testSum = res.data[1];
            this.testData = res.data[0].map(cur => {
              return { title1: cur }
            });
            this.fullscreenLoading = false;
          })
          .catch(error => {
            console.log(error);
            alert("出错了！");
            this.fullscreenLoading = false;
          })
      }else if(this.fileIndex == "") {
        this.$message({
          message: "请先选择分类！",
          type: "warning"
        })
      }
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    },
    handleCurrentChangeResult(cpage) {
      this.curPageResult = cpage;
    },
    //查看视频内容 浏览
    handleShow(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:30001/pic/video_detect_view", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res)
          this.src = res.data;
          this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
          this.loadingRes = false;
        });
    },
    //浏览
    handleShow1(row){
      console.log("row:",row);
      this.loadingRes = true;
      this.selectTitle = row.title1;
      let fd = new FormData();
      fd.append("filename",row.title1);
      this.$http
        .post("http://39.102.71.123:30001/pic/video_detect_classification_results_2", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(res => {
          console.log("res.data",res.data);
          this.src = res.data;
          this.loadingRes = false;
        })
        .catch(error => {
          console.log(error);
          this.loadingRes = false;
        })
    },
    handleClassify(row) {
      this.loadingRes = true;
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      //   this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:30001/pic/video_detect_classification", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          this.classifySrc = res.data[0];
          this.classifyResult = res.data[1];
          this.showClassify = true;
            this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
            this.loadingRes = false;
        });
    },
    //预测单个
    handleAnalysis(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:30001/pic/video_detect_predict", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          this.showSingleResult = true;
          this.singleSrc = res.data;
          this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
          this.loadingRes = false;
        });
    },

    handleAnalysisResult(row) {
      this.resultSrc = row;
    },
  },
  mounted(){
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
  min-height: calc(100% - 0px);
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
  margin: 20px 0 0 20px;
  /* font-weight: bold; */
  /* font-size: 1.17em; */
}
.headbutton {
  float: right;
  margin-right: 20px;
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
  width: 47%;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
/*分页符*/
.el-pagination {
  right: 60px;
  height: 10%;
  text-align: right;
  margin-top: 40px;
}

/*echarts*/

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
  bottom: 5%;
  overflow: inherit;
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
  border: 1px solid #108cee;
  color: #5775fb;
}

.blueBtn:hover,
.blueBtn:active,
.blueBtn:focus {
  background-color: #108cee;
  color: #ffffff;
}

.darkBtn {
  background-color: #108cee;
  border: 1px solid #108cee;
  color: #ffffff;
}
.darkBtn:hover {
  background-color: #108cee;
}

.tableHeader {
  height: 55px;
  width: 96.2%;
  background-color: #f6f7fb;
  color: #606266;
  line-height: 55px;
  padding: 0 10px;
  font-weight: bold;
  font-size: 14px;
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
#matchInfo1 {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 8px 16px;
  width: 95%;
  padding: 8px 16px;
  border-radius: 10px;
  margin: 0 0 15px 10px;
  font-size: 13px;
}
.picStyle {
  width: 60%;
  align-self: center;
  margin-top: 20px;
}
.picStyle:first {
  width: 60%;
  align-self: center;
}
</style>
