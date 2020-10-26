<template>
  <el-container v-loading="fullscreenLoading" element-loading-text="正在处理中，请稍候……">
    <!--内容块-->

    <!-- 上传窗口-->
    <div class="upload" v-if="isUpload">

      <el-card class="box-card" style="text-align: center">
        <div slot="header" class="clearfix">
          <span>文件上传</span>
          <i class="el-icon-close" style="float: right; padding: 3px 0" @click="cancelUpload"></i>
        </div>
        <el-upload
          class="upload-demo"
          drag
          ref="upload"
          :auto-upload="false"
          accept=".xlsx,.csv"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-remove="handleRemove"
          :on-change="handleAddFile"
          :file-list="uploadFileList"
          multiple>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">
            仅支持上传csv文件、xlsx文件<br>
          </div>
        </el-upload>
        <el-button size="small" @click="cancelUpload">取消</el-button>
        <el-button style="margin-left: 10px;" class="darkBtn" size="small" type="primary" @click="submitUpload">上传</el-button>
      </el-card>
    </div>

    <!--测试结果-->
    <!--<div class="upload" v-show="showResult">-->
      <!--<el-card class="box-card">-->
        <!--<div slot="header" class="clearfix" style="text-align: center">-->
          <!--<span>测试结果</span>-->
          <!--<i class="el-icon-close" style="float: right; padding: 3px 0;" @click="showResult=false"></i>-->
        <!--</div>-->
        <!--<div>-->
          <!--<span style="font-weight:bold;">实际实体数量：</span>{{realEntityCount}}个-->
        <!--</div>-->
        <!--<div style="margin-top:10px;">-->
          <!--<span style="font-weight:bold;">抽取实体数量：</span>{{extractEntityCount}}个-->
        <!--</div>-->
        <!--<div style="margin-top:10px;">-->
          <!--<span style="font-weight:bold;">错误识别实体数量：</span>{{wrongEntityCount}}个-->
        <!--</div>-->
        <!--<div style="margin-top:10px;" id="autoPara">-->
          <!--<span style="font-weight:bold;">被标记文本：</span>-->
          <!--<p id="para" style="text-align: left"></p>-->
        <!--</div>-->
      <!--</el-card>-->
    <!--</div>-->

    <el-main v-if="isList">
      <!--顶部-->
      <div class="header">
        模型预测
       </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--      列表页-->
      <div class="main">
        <div class="top-tip">
          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin:0 20px 0 0;"
            @click="isUpload=true"
          >上传文件</el-button>
        </div>
        <div class="top-tip">

          <span style="margin-left:0px;" >请选择训练模型：</span>
          <el-select v-model="modelIndex" placeholder size="small" style="margin-left:10px;width: 170px">
            <el-option
              v-for="(item, index) in modelList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
          <el-button
            style="margin-left:20px;"
            class="blueBtn"
            size="small"
            @click="loadModel"
          >加载训练模型</el-button>

          <el-button
            type="primary"
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="modelPredict"
          >模型预测</el-button>
        </div>
        <!--文书列表-->
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
        >
          <el-col :span="12">
            <el-table
              :data="testData.slice((curPageTrain - 1) * 10, curPageTrain * 10)"
              :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
              height="626"
              style="width:97%"
              border
            >
              <el-table-column prop="title" label="输入数据"></el-table-column>
              <el-table-column label="操作" width="100" align="center">
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
            <!-- 分页符-->
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="fileCountTest"
              :current-page.sync="curPageTrain"
              @current-change="handleCurrentChangeTrain"
            ></el-pagination>
            <!--</el-pagination> -->
          </el-col>
          <el-col
            :span="12"
            style="background-color:#FFF;height:625px;overflow-y: scroll; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)"
          >
            <div class="tableHeader">
              文件浏览
              <span v-if="textData===''">(选择文件以浏览内容)</span>
            </div>
            <div style="padding:0 15px;">
              <pre style="word-break: break-word;word-wrap: break-word;white-space: break-spaces;">{{textData}}</pre>
            </div>
          </el-col>
        </el-row>
      </div>

      <!--文书内容-->
      <!-- <el-dialog :title="selectTitle" :visible.sync="diaVisible">
          <pre style="word-break: break-word;word-wrap: break-word;white-space: break-spaces;">
            {{textData}}
          </pre>
      </el-dialog>-->
    </el-main>

  </el-container>
</template>

<script>
  import { option } from "../../../js/echartSettings";
  let echarts = require("echarts");
  let myChart;

  export default {
    name: "Predict",
    data() {
      return {
        entitySum:0,
        realEntityCount: 0,
        extractEntityCount: 1,
        wrongEntityCount: 2,
        showResult: false,
        isList: true,
        fileCount: 0,
        isUpload: false,
        curPage: 1,
        fileIndex: "",
        uploadFileList:[],
        //表格数据 测试集
        testData: [],
        // trainData: [],
        //选中行
        choosenRow: {},
        //三元组数据
        tripleData: [],
        algorithm: "",
        algorithmList: ["正则表达式", "深度学习算法"],
        //弹出框可视
        diaVisible: false,
        selectTitle: "",
        fileCountTest: 0,
        curPageTest: 1,
        curPageTrain: 1,
        fileCountTrain: 0,
        loadingRes: false,
        textData: "",
        fullscreenLoading: false,
        loadingResGraph: false,
        entityRelationFlag: true,
        inputEntity1: "",
        inputRelation: "",
        inputEntity2: "",
        level: 1,
        levelList: [
          {
            label: "一级查询",
            value: 1
          },
          {
            label: "二级查询",
            value: 2
          },
          {
            label: "三级查询",
            value: 3
          }
        ],
        //计算平均召回率和准确率
        recallSet: [],
        accurateSet: [],
        //模型列表
        modelIndex: "",
        modelList: [
          "ckpt_1", "ckpt_2", "ckpt_3", "ckpt_4", "ckpt_5"
        ],
        //图谱
        graphWidth:"100%",
        graphHeight:"100%",
      };

    },

    methods: {
      highLight(sta, end, color, content) {
        let str = content;
        return content = str.slice(0, sta) +
          "<strong style='background:" + color + "'>" +
          str.slice(sta, end + 1) +
          "</strong>" +
          str.slice(end + 1);
      },
      //模型预测==接口
      modelPredict() {
        this.fullscreenLoading = true;
        let fd = new FormData();
        fd.append("contents", this.fileIndex);
        if (this.selectTitle === "") {
          this.$message({
            message: "请先查看文书！",
            type: "warning"
          });
          this.fullscreenLoading = false;
          return;
        }

        fd.append("filename", this.selectTitle);
        this.$http
          .post("http://39.102.71.123:23352/pic/textTestDemo", fd, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then(res => {
            console.log(res);
            this.fullscreenLoading = false;
            let content = res.data[0];
            // let div = document.createElement("p");
            // div.id = "para";
            let tagSet = [];
            for (let i = 1; i < 4; i++) {//遍历所有标记
              for (let j = 0; j < res.data[i].length; j++) {
                tagSet.push({
                  sta: res.data[i][j][1],
                  end: res.data[i][j][2],
                  type: i
                })
              }
            }
            ;
            //排序
            tagSet = [].concat(tagSet.sort((obj1, obj2) => {
              if (obj1.sta >= obj2.sta)
                return 1;
              else
                return -1;
            }));
            console.log(tagSet)
            //高亮
            let offset = 0;
            for (let i = 0; i < tagSet.length; i++) {
              if (tagSet[i].type === 1) {
                content = this.highLight(tagSet[i].sta + offset, tagSet[i].end + offset, "green", content);
                offset += 42;
              }
              else if (tagSet[i].type === 2) {
                content = this.highLight(tagSet[i].sta + offset, tagSet[i].end + offset, "red", content);
                offset += 40;
              } else if (tagSet[i].type === 3) {
                content = this.highLight(tagSet[i].sta + offset, tagSet[i].end + offset, "yellow", content);
                offset += 43;
              }
            }
            // //37+color位移
            // for(let i=0;i<res.data[1].length;i++){
            //   content=this.highLight(res.data[1][i][1]+42*i,res.data[1][i][2]+42*i,"green",content);
            // }
            // let offset1=42*res.data[1].length;
            // for(let j=0;j<res.data[2].length;j++){
            //   content=this.highLight(res.data[2][j][1]+offset1+40*j,res.data[2][j][2]+offset1+40*j,"red",content);
            // }
            // let offset2 = offset1+40*res.data[2].length;
            // for(let k=0;k<res.data[3].length;k++){
            //   content=this.highLight(res.data[3][k][1]+offset2+43*k,res.data[3][k][2]+offset2+43*k,"yellow",content);
            // }
            let div = document.getElementById("para")
            div.innerHTML = content.replace(/\n/g, "<br>");
            // div.style = "text-align:left";
            // document.getElementById("autoPara").appendChild(div);
            this.realEntityCount = res.data[4];
            this.extractEntityCount = res.data[5];
            this.wrongEntityCount = res.data[6];

            this.showResult = true;
          })
          .catch(res => {
            console.log(res);
            this.fullscreenLoading = false;
          });
      },
      //显示文件列表==接口
      getTable() {
        this.textData = "";
        this.fileCountTest = 0;
        this.loadingRes = true;
        let fd = new FormData();
        fd.append("contents", this.fileIndex)
        this.$http
          .post("http://39.102.71.123:23352/pic/loadTextDataDL", fd, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then(res => {
            console.log(res)
            this.textData = "";
            this.testData = res.data[0].map(cur => {
              return {title: cur};
            });
            this.fileCountTest = this.testData.length;
            this.entitySum = res.data[1]
            this.loadingRes = false;
          })
          .catch(res => {
            console.log(res);
            alert("出错了！");
            this.loadingRes = false;
          });
      },
      loadModel() {
        let fd = new FormData();
        fd.append("model", this.modelIndex)
        this.$http
          .post("http://39.102.71.123:23352/pic/loadModel", fd, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then(res => {
            console.log(res)
            this.$message({
              message: "加载模型" + this.modelIndex + "成功！",
              type: "success"
            });
          })
          .catch(res => {
            console.log(res);
            alert("出错了！");
          });
      },
      cancelUpload(){
        this.isUpload=false;
        this.uploadFileList=[];
      },
      //上传文件==接口
      submitUpload() {
        if(!this.uploadFileList.length){
          this.$message.error("请选择上传文件！")
          return;
        }
        this.$refs.upload.submit();

        for(let i=0;i<this.uploadFileList.length;i++) {
          for(let j=0;j<this.testData.length;j++) {
            if (this.testData[j].title===this.uploadFileList[i]) {
              this.$message.error("该文件已存在，请选择其他文件！")
              return;
            }
          }
          console.log(this.uploadFileList)
        }

        this.isUpload = false;
        this.uploadFileList =[];
      },
      handleRemove(file, uploadFileList) {
        this.uploadFileList = uploadFileList;
      },
      handleAddFile(file,uploadFileList){
        this.uploadFileList = uploadFileList;
      },
      handleCurrentChangeTest(cpage) {
        this.curPageTest = cpage;
      },
      handleCurrentChangeTrain(cpage) {
        this.curPageTrain = cpage;
      },
      //查看文书内容==接口
      handleAnalysis(row) {
        this.selectTitle = row.title;
        let fd = new FormData();
        let url = ""
        if (this.algorithm === "深度学习算法") {
          url = "viewTextDL"
          fd.append("contents", this.fileIndex)
        } else url = "viewTextDataRE"
        fd.append("filename", row.title);

        this.loadingRes = true;
        this.$http
          .post("http://39.102.71.123:23352/pic/" + url, fd, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then(res => {
            // console.log(JSON.stringify(res.data));
            this.textData = res.data;
            this.loadingRes = false;
          })
          .catch(res => {
            console.log(res);
            this.loadingRes = false;
          });
        this.diaVisible = true;
      },
      handleExport() {
        //处理数据
        let data = "";
        this.tripleData.forEach(function (item, index) {
          data += item.source + "," + item.name + "," + item.target + "\n";
        });
        let filename = this.choosenRow.title.split(".")[0];
        console.log(filename);
        //创建<a>下载文件
        let export_blob = new Blob([data], {
          type: "text/csv",
          endings: "native"
        });
        let save_link = document.createElement("a");
        save_link.href = URL.createObjectURL(export_blob);
        save_link.download = filename + ".csv";
        save_link.click();
      }
    },
  }
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
    margin-bottom: 20px;
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
  #daddy {
    height: 800px;
    width: 100%;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    background-color: #fff;
  }

  .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #5775fb !important;
  }
  .el-pagination.is-background .el-pager li:hover {
    color: #5775fb !important;
  }

  /***************上传弹窗***********/
  .upload{
    text-align: center;
    z-index: 99;
    position: fixed;
    top: 20%;
    left: 30%;
    right: 30%;
  }
  .upload-demo{
    margin-bottom: 20px;
  }
  .el-upload__tip{
    padding-left: 30%;
    text-align: left;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
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

  .tableHeader {
    height: 55px;
    width: 100%;
    background-color: #ebeef7;
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
  .el-card{
    text-align: left;
  }
  .el-card__body{
    text-align:left;
  }
</style>
