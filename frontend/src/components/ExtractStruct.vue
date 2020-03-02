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
    <!--内容块-->
    <el-main v-if="isList">
      <!--顶部-->
      <div class="header">
        结构化数据抽取
        <el-button type="primary" class="darkBtn headbutton" size="small" @click="isUpload=true">上传与分析</el-button>
        <el-button type="primary" class="darkBtn headbutton" size="small" >训练</el-button>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--      列表页-->
      <div class="main" >
        <div class="top-tip">
          数据总量:{{fileCount}}
        </div>
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
        <!--结构化数据列表-->
        <el-table
          :data="tableData.slice((curPage - 1) * 10, curPage * 10)"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          height="626"
          border>
          <el-table-column
            prop="title"
            label="标题">
          </el-table-column>
          <el-table-column
            prop="date"
            label="上传时间"
            width="180">
          </el-table-column>
          <el-table-column
            label="操作"
            width="100"
            align="center">
            <template slot-scope="scope">
              <el-button class="blueBtn" @click="handleAnalysis(scope.row)" type="primary" plain size="small">分析</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页符-->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="fileCount"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-main>
    <!--分析页-->
    <el-main v-show="!isList">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="isList=true"></i>
        <el-button type="primary" class="headbutton" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <div class="main" id="daddy">
        <div id="graph" style="width: 1600px;height:800px;"></div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  let echarts = require('echarts');
  let myChart;
  window.onresize = function() {
    document.getElementById("graph").style.width="100%";
    document.getElementById("graph").style.height="100%";
    myChart.resize();
  };

  export default {
    name: "ExtractStruct",
    data () {
      return {
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
      }
    },

    methods: {
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

        // for(let i = 0; i < 9; i ++){
        //   this.tableData.push({
        //     date: '2016-05-03',
        //     title: '文书'+i
        //   })
        // }
        // this.fileCount = this.tableData.length;
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
      handleAnalysis(row){
        console.log(row);
        this.choosenRow = row;
        this.isList = false;
        //需根据返回值修改
        this.tripleData =[
          {
            source: 'node01',
            target: 'node02',
            name: 'link01',
            des: 'link01des'
          }, {
            source: 'node01',
            target: 'node03',
            name: 'link02',
            des: 'link02des'
          }, {
            source: 'node01',
            target: 'node04',
            name: 'link03',
            des: 'link03des'
          }, {
            source: 'node01',
            target: 'node05',
            name: 'link04',
            des: 'link05des'
          }];
        let graphPoint=[
          {
            name: 'node01',
            des: 'nodedes01',
            symbolSize: 70,
            category: 0,
          }, {
            name: 'node02',
            des: 'nodedes02',
            symbolSize: 50,
            category: 1,
          }, {
            name: 'node03',
            des: 'nodedes3',
            symbolSize: 50,
            category: 1,
          }, {
            name: 'node04',
            des: 'nodedes04',
            symbolSize: 50,
            category: 1,
          }, {
            name: 'node05',
            des: 'nodedes05',
            symbolSize: 50,
            category: 1,
          }
        ];
        let categories=[
          {name:'属性A'},
          {name:'属性B'},
        ];
        let option ={
          // 图的标题
          title: {
            text: row.name
          },
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
          legend: [{
            // selectedMode: 'single',
            data: categories.map(function (a) {
              return a.name;
            })
          }],
          series: [{
            type: 'graph', // 类型:关系图
            layout: 'force', //图的布局，类型为力导图
            symbolSize: 40, // 调整节点的大小
            roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [2, 10],
            edgeLabel: {
              normal: {
                textStyle: {
                  fontSize: 20
                }
              }
            },
            force: {
              repulsion: 2500,//节点间的斥力因子。
              gravity : 1,//节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
              edgeLength: [10, 50]
            },
            draggable: true,
            lineStyle: {
              normal: {
                width: 2,
                color: '#4b565b',
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
            data: graphPoint,
            links: this.tripleData,
            categories: categories,
          }],
          grid:{
            top:"10px",
            bottom:"10px",
            height:"10px",
            width:"10px"
          }
        }

        myChart= echarts.init(document.getElementById('graph'));
        // 绘制图表
        myChart.setOption(option);
      },

      //导出三元组
      handleExport(){
        //处理数据
        let data="";
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
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
