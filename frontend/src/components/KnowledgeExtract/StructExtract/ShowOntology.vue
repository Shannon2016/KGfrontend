<template>
  <el-container>
    <!--内容块实体对齐-->
    <el-main>
      <!--顶部-->
      <div class="header">模式文件上传</div>
      <el-divider></el-divider>
      <!--中心-->
      <div class="top-tip">
        <!-- <span>请选择本体：</span>
        <el-select v-model="typeSelect" placeholder size="small" style="margin-left:20px;">
          <el-option v-for="(item, index) in typeList" :key="index" :label="item" :value="item"></el-option>
        </el-select> -->
        <!-- <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="showOntology">确定</el-button> -->
        <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="isUpload=true">上传</el-button>

      </div>
      <div class="result" style="margin-bottom:50px;margin-top:-10px">
        <div
          id="kgPic"
          v-loading="loadingResGraph"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.1)"
        >
          <div id="graph" :style="{width: graphWidth,height:graphHeight}"></div>
        </div>
      </div>

      <!-- 上传窗口-->
      <div id="upload" v-if="isUpload">

        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>模式文件上传</span>
            <i class="el-icon-close" style="float: right; padding: 3px 0" @click="cancelUpload"></i>
          </div>
          <el-form :model="uploadForm" label-position="left" label-width="80px">
            <el-form-item label="图谱名称:">
              <el-input v-model="uploadForm.name"></el-input>
            </el-form-item>
          </el-form>
          <el-upload
            class="upload-demo"
            drag
            ref="upload"
            :auto-upload="false"
            accept=".csv"
            action=""
            :on-remove="handleRemove"
            :on-change="handleAddFile"
            :file-list="fileList"
            :limit="1">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              仅支持上传csv文件<br>
            </div>
          </el-upload>
          <el-button size="small" @click="cancelUpload">取消</el-button>
          <el-button style="margin-left: 10px;" class="darkBtn" size="small" type="primary" @click="submitUpload">确定</el-button>
        </el-card>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { option } from "../../../js/echartSettings";
let echarts = require("echarts");
let myChart;
export default {
  name: "ShowOntology",
  data() {
    return {
      typeSelect: "",
      loadingResGraph: false,
      typeList: ["本体1", "本体2", "本体3", "本体4"],
      //图谱
      graphWidth:"100%",
      graphHeight:"100%",
      isUpload:false,
      uploadForm:{
        name:'',
      },
      fileCount:0,
      //上传的文件列表
      fileList: [],
    };
  },
  methods: {
    showOntology() {
      this.loadingResGraph = true;
      let fd = new FormData();
      fd.append("ontology", this.typeSelect);
      this.$http
        .post("http://39.102.71.123:30001/pic/view_ontology", fd, {
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
            tmp.entity1 = res.data[i][0]+"";
            tmp.relation = res.data[i][1]+"";
            tmp.entity2 = res.data[i][2]+"";
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
            itemStyle:{color:"#7fb90e"}
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
    },
    cancelUpload(){
      this.isUpload=false;
      this.fileList=[];
    },
    submitUpload() {
      if(this.typeList.indexOf(this.uploadForm.name)!==-1){
        this.$message.error("图谱名称不能重复，请重新输入！")
        return;
      }
      if(!this.fileList.length||!this.uploadForm.name){
        this.$message.error("请完善输入信息并选择上传文件！")
        return;
      }
      let fd = new FormData()
      fd.append("csv_file", this.fileList[0].raw)
      fd.append('ontology_name',this.uploadForm.name)
      this.$http.post(
        'http://39.102.71.123:30001/pic/submit_ontology_data', fd,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
        console.log(res)
      }).catch(res=>{
        console.log(res)
      });
      // this.$refs.upload.submit();
      for(let i=0;i<this.fileList.length;i++) {
        console.log(this.fileList)
      }
      // 添加到列表
      this.typeList.push(this.uploadForm.name);

      this.isUpload = false;
      this.fileList =[];
      this.uploadForm.name='';
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    handleAddFile(file,fileList){
      this.fileList = fileList;
    },
    loadList(){
      this.$http.post(
        'http://39.102.71.123:30001/pic/ontology_source',
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
        console.log(res)
        this.typeList = res.data;
      }).catch(res=>{
        console.log(res)
      });
    }
  },
  mounted(){
    this.loadList()
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
  margin-right: 40px;
}
.top-tip {
  margin-top: -10px;
  margin-bottom: 10px;
  padding-left: 20px;
}
/***************上传弹窗***********/
#upload{
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
