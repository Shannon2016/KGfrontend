<template>
  <el-container>
    <!-- 左侧导航栏-->
    <el-aside width="200px">
      <el-menu
        default-active=""
        class="el-menu-vertical-demo"
        background-color="#343643"
        text-color="#fff"
        active-text-color="#fff"
        :router="true">
        <el-menu-item index="/extract">
          <i class="el-icon-menu"></i>
          <span slot="title">文本抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractStruct" class="is-active">
          <i class="el-icon-menu"></i>
          <span slot="title">结构化数据抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractPic">
          <i class="el-icon-menu"></i>
          <span slot="title" >图片抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractVedio">
          <i class="el-icon-document"></i>
          <span slot="title">视频抽取</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--内容块实体对齐-->
    <el-main v-if="isList">
      <!--顶部-->
      <div class="header">
        结构化数据抽取
        <el-button type="primary" class="darkBtn headbutton" size="small" @click="isUpload=true">上传与分析</el-button>
        <el-button type="primary" class="darkBtn headbutton" size="small" >训练</el-button>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main" >
        <!-- 上传窗口-->
        <div id="upload" v-if="isUpload">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>数据上传</span>
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
              :file-list="fileList"
              multiple>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">
                仅支持上传csv文件、xlsx文件<br>
              </div>
            </el-upload>
            <el-button size="small" @click="cancelUpload">取消</el-button>
            <el-button style="margin-left: 10px;" class="darkBtn" size="small" type="primary" @click="submitUpload">上传并分析</el-button>
          </el-card>
        </div>
        <!--表格查看-->
        <div class="top-tip">
          请选择表格：
          <el-select v-model="tableIndex" placeholder="" size="small" style="margin-left:20px;">
            <el-option
              v-for="(item, index) in properties"
              :key="index"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseTable">确定</el-button>
          <el-button type="primary" class="darkBtn" size="small" style="float:right; margin-right:20px;" @click="goMark">属性去噪</el-button>
        </div>

        <!--结构化数据列表-->
        <el-table
          :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          height="626"
          border>
          <el-table-column
            v-for="(item, index) in columnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label">
          </el-table-column>
        </el-table>
        <!-- 分页符-->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="fileCount"
          :page-size="20"
          @current-change="handleCurrentChange"
          :current-page="curPage">
        </el-pagination>
        
      </div>
    </el-main>
    <!--分析页-->
    <el-main v-show="!isList">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="isList=true"></i>
        <span style="margin-left:10px;font-size:large;font-weight:bold;">实体对齐</span>
        <el-button class="headbutton darkBtn" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--用户操作-->
      <div style="margin:10px 0;">
        <span>选择用于训练集、测试集的样例比例：</span>
        <el-select v-model="portion" placeholder="请选择" size="small">
          <el-option
            v-for="item in portionList"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
        
        <span style="margin-left:20px;">标记样例总数：</span>
        <el-input v-model="markSum" type="number" style="width:250px;" size="small"></el-input>

        <el-button class="darkBtn" size="small" @click="submitMarks" style="float:right; margin-right:20px;">提交</el-button>
      </div>
      <div style="margin:20px 0;">
        <span>现有正样例：{{positiveCount}}个</span>
        <el-button class="blueBtn" size="small" @click="setPositive" style="margin-left:15px;">设为正样例</el-button>
        
        <span style="margin-left:50px;">现有负样例：{{negativeCount}}个</span>
        <el-button class="blueBtn" size="small" @click="setNegative" style="margin-left:15px;">设为负样例</el-button>
      </div>

      <!--结构化数据列表-->
      <div id="tablePart" >
        <el-checkbox-group v-model="checkList">
          <el-table
            :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
            :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
            height="626"
            border
            >
            <el-table-column width="40">
              <template slot-scope="scope">
                <el-checkbox :label="scope.row.index">{{""}}</el-checkbox>
              </template>
            </el-table-column>
            <el-table-column
              v-for="(item, index) in columnNames"
              :key="index"
              :prop="item.prop"
              :label="item.label">
            </el-table-column>
          </el-table>
        </el-checkbox-group>
        <!-- 分页符-->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="fileCount"
          :page-size="20"
          @current-change="handleCurrentChange"
          :current-page="curPage">
        </el-pagination>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  let echarts = require('echarts');
  let myChart;
  // window.onresize = function() {
  //   document.getElementById("graph").style.width="100%";
  //   document.getElementById("graph").style.height="100%";
  //   myChart.resize();
  // };

  export default {
    name: "ExtractStruct",
    data () {
      return {
        markSum:"",
        isList:true,
        fileCount:0,
        isUpload:false,
        curPage:1,
        //上传的文件列表
        fileList: [],
        //表格数据，结构化数据列表
        tableData: [],
        //选中行
        choosenRow:{},
        //三元组数据
        tripleData:[],
        rawData:[],
        tableIndex:"",
        choosenInd:[],
        checkList:[],
        negativeCount:0,
        positiveCount:0,
        portion:"",
        portionList:["8:2", "7:3", "6:4"],
        positiveMap:{},
        negativeMap:{},
        properties:[],
        columnNames:[]
      }
    },

    methods: {
      goMark(){
        //加载去噪后数据
        this.tableData = this.tableData.map((cur, index) => {
            cur["index"] = index;
            cur["negativeMark"] = null;
            return cur;
          })
        this.columnNames = [{prop:"index", label:"序号"},{prop:"negativeMark", label:"与x为负例"}].concat(this.columnNames);
        this.isList=false
        this.positiveMap={}
        this.negativeMap={}
      },
      chooseTable() {
        // console.log(this.tableIndex)
        if(this.tableIndex === '') return;

        this.columnNames = []
        this.tableData = []

        let fd = new FormData()
        fd.append('table',this.tableIndex)
        this.$http.post(
          'http://49.232.95.141:8000/pic/view_structData',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
          this.columnNames = res.data[0].map((cur) => {
            return {prop:cur, label:cur}
          })

          let column = res.data[0]
          this.tableData = res.data[1].map((cur) => {
            let res={}
            for(let i = 0; i < column.length; i ++)
              res[column[i]] = cur[i]
            return res
          })

          this.fileCount = res.data[1].length
        }).catch((res) => {
          //请求失败
          console.log(res)
        })
      },
      cancelUpload(){
        this.isUpload=false;
        this.fileList=[];
      },
      submitUpload() {
        this.fileCount = this.tableData.length;
        let now = new Date();
        let date =  now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
        this.$refs.upload.submit();
        for(let i=0;i<this.fileList.length;i++) {
          this.tableData.push({
            date:  date,
            title: this.fileList[i].raw.name
          })
        }
        this.fileCount = this.tableData.length;
        this.isUpload = false;
        this.fileList =[];
      },
      handleRemove(file, fileList) {
        this.fileList = fileList;
      },
      handleAddFile(file,fileList){
        console.log(file);
        console.log(fileList);
        this.fileList = fileList;
      },
      handleCurrentChange(cpage) {
        this.curPage = cpage;
      },
      findIndex(index){
        //简单遍历查找 后期改为二分查找
        for(let i = 0; i < this.tableData.length; i ++) {
          if(this.tableData[i].index === index) return i;
        }
      },
      setPositive(){
        this.checkList = this.checkList.sort()
        let oldCount, newCount, index;
        index = this.checkList[0]
        //计算正例个数
        if(!this.positiveMap[index]) {
          this.positiveMap[index] = new Set();
          oldCount = 0;
        } else {
          oldCount = this.getCombinationNum(this.positiveMap[index].size + 1);
        }
        for(let i = 1; i < this.checkList.length; i ++) {
          this.positiveMap[index].add(this.checkList[i]);
          //删除表中相同正例
          let flag = this.findIndex(this.checkList[i]);
          delete this.tableData[flag];
          this.tableData = this.tableData.filter(item => item)
        }
        newCount = this.getCombinationNum(this.positiveMap[index].size + 1);
        this.positiveCount += newCount - oldCount;

        console.log(this.positiveMap);
        this.checkList = [];
      },
      setNegative(){
        this.checkList = this.checkList.sort()
        let oldCount, newCount, index;
        index = this.checkList[0]
        //计算负例个数
        if(!this.negativeMap[index]) {
          this.negativeMap[index] = new Set();
          oldCount = 0;
        } else {
          oldCount = this.getCombinationNum(this.negativeMap[index].size + 1);
        }
        
        let length = this.checkList.length;
        for(let i = 1; i < length; i ++) {
          if(this.negativeMap[index].has(this.checkList[i])) {
            delete this.checkList[i];
            this.checkList = this.checkList.filter(item => item)
            i--; length--;
            continue;
          }
          this.negativeMap[index].add(this.checkList[i]);
        }
        console.log(this.checkList)

        for(let i = 0; i < this.checkList.length; i ++){
          let indexi = this.findIndex(this.checkList[i]);
          for(let j = 0; j < this.checkList.length; j ++){
            if(i === j) continue;
            // let indexj = this.findIndex(this.checkList[j]);
            if(this.tableData[indexi].negativeMark)
              this.tableData[indexi].negativeMark += ", " + this.checkList[j];
            else this.tableData[indexi].negativeMark = this.checkList[j] + "";
          }
        }

        newCount = this.getCombinationNum(this.negativeMap[index].size + 1);
        this.negativeCount += newCount - oldCount;

        console.log(this.negativeMap);
        this.checkList = [];
      },
      getCombinationNum(n){
        return n * (n - 1) / 2;
      },
      submitMarks(){
        
      },
      //导出三元组
      handleExport(){
        //处理数据
        let data="head,relation,tail\n";
        this.tripleData.forEach(function (item,index) {
          data+=item.source+","+item.name+","+item.target+"\n";
        });
        let filename = this.choosenRow.title.split(".")[0];
        console.log(filename);
        //创建<a>下载文件
        let export_blob = new Blob([data],{type: 'text/csv',endings : 'native'});
        let save_link = document.createElement("a");
        save_link.href = URL.createObjectURL(export_blob);
        save_link.download = filename+".csv";
        save_link.click();
      },
    },
    mounted() {
      this.$http.post(
        'http://49.232.95.141:8000/pic/show_table',
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
        this.properties = res.data
      }).catch((res) => {
        //请求失败
        console.log(res)
      })
    }
  }
</script>

<style scoped>
  html,body,.el-container{
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
    background-color: #E9EEF3;
    color: #333;
    text-align: left;
    height: 100%;
    background-color: #F1F2F6;
  }

  /**************左侧导航栏***************/
  .is-active {
    background-color: rgba(255,255,255,0.2) !important;
    border-right: 4px solid #5775FB !important;
  }
  .el-menu-item{
    text-align: left;
    width: 200px;
  }

  /**************内容顶部***************/
  .header{
    width: 100%;
    height: 20px;
    line-height: 20px;
    text-align: left;
    margin-left: 20px;
    font-weight: bold;
    font-size: large;
  }
  .headbutton{
    float: right;
    margin-right: 40px;
  }
  .top-tip{
    margin-top: -10px;
    margin-bottom: 10px;
    padding-left: 20px;
  }
  /*************内容中心*************/
  .main{
    line-height: 30px;
    height: 90%;
    width: 100%;
  }
  /*表格*/
  .el-table{
    height: 80%;
    width: 100%;
    /*box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);*/
  }
  .el-table--border, .el-table--group{
    border: 0;
  }
  /*分页符*/
  .el-pagination{
    right: 60px;
    height: 10%;
    text-align: right;
    margin-top: 40px;
  }

  .el-pagination.is-background .el-pager li:not(.disabled).active{
    background-color: #5775FB !important;
  }
  .el-pagination.is-background .el-pager li:hover{
    color: #5775FB !important;
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

  /***********按钮样式***********/
  .blueBtn{
    background-color: #EFF0FF;
    border: 1px solid #5775FB;
    color: #5775FB;
  }

  .blueBtn:hover,.blueBtn:active, .blueBtn:focus{
    background-color: #5775FB;
    color: #FFFFFF;
  }

  .darkBtn{
    background-color: #5775FB;
    border: 1px solid #5775FB;
    color: #FFFFFF;
  }
  .darkBtn:hover{
    background-color: #708BF7;
  }
</style>
