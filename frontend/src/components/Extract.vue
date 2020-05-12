<template>
  <el-container
    v-loading="fullscreenLoading"
    element-loading-text="模型测试中，离开将中断测试……">
    <!--内容块-->
    <el-main v-if="isList">
      <!--顶部-->
      <div class="header">
        文本抽取
        <!--<el-button type="primary" class="darkBtn headbutton" size="small" @click="isUpload=true">上传与分析</el-button>-->
        <!--<el-button type="primary" class="darkBtn headbutton" size="small" >训练</el-button>-->
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--      列表页-->
      <div class="main" >
        <div class="top-tip">
          <span>请选择算法：</span>
          <el-select v-model="algorithm" placeholder size="small" style="margin-left:20px;">
            <el-option v-for="(item, index) in algorithmList" :key="index" :label="item" :value="item"></el-option>
          </el-select>

          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseTable">文本输入</el-button>

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
            @click="modelTest"
          >模型测试</el-button>
        </div>
        <!--文书列表-->
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading">
          <el-col :span="12">
            <el-table
              :data="trainData.slice((curPageTrain - 1) * 10, curPageTrain * 10)"
              :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
              height="626"
              style="width:97%"
              border>
              <el-table-column
                prop="title"
                label="训练数据">
              </el-table-column>
              <el-table-column
                label="操作"
                width="100"
                align="center">
                <template slot-scope="scope">
                  <el-button class="blueBtn" @click="handleAnalysis(scope.row)" type="primary" plain size="small">浏览</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页符-->
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="fileCountTrain"
              :current-page.sync="curPageTrain"
              @current-change="handleCurrentChangeTrain">
              </el-pagination>
        <!--</el-pagination> -->
          </el-col>
          <el-col :span="12">
            <el-table
              :data="testData.slice((curPageTest - 1) * 10, curPageTest * 10)"
              :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
              height="626"
              style="width:97%;"
              border>
              <el-table-column
                prop="title"
                label="测试数据">
              </el-table-column>
              <el-table-column
                label="操作"
                width="100"
                align="center">
                <template slot-scope="scope">
                  <el-button class="blueBtn" @click="handleAnalysis(scope.row)" type="primary" plain size="small">浏览</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="fileCountTest"
              :current-page.sync="curPageTest"
              @current-change="handleCurrentChangeTest">
              </el-pagination>
          </el-col>
        </el-row>
      </div>

      <!--文书内容-->
      <el-dialog :title="selectTitle" :visible.sync="diaVisible">
          <pre style="word-break: break-word;word-wrap: break-word;white-space: break-spaces;">
            {{textData}}
          </pre>
      </el-dialog>
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
        <div id="graph" style="width: 1000px;height:800px;"></div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  let echarts = require('echarts');
  let myChart;

  export default {
    name: 'Extract',
    data () {
      return {
        isList:true,
        fileCount:0,
        isUpload:false,
        curPage:1,
        //上传的文件列表
        fileList: [],
        //表格数据 训练集与测试集
        testData: [],
        trainData: [],
        //选中行
        choosenRow:{},
        //三元组数据
        tripleData:[],
        algorithm:"",
        algorithmList:[
          "正则表达式","深度学习算法"
        ],
        //弹出框可视
        diaVisible:false,
        selectTitle:"文书名",
        fileCountTest:0,
        curPageTest:1,
        curPageTrain:1,
        fileCountTrain:0,
        loadingRes:false,
        textData:'',
        fullscreenLoading:false,
      }
    },

    methods: {
      showGraph(){
        this.isList=false;
        let categories=[
          {name:'属性A'},
          {name:'属性B'},
        ];
        let option ={
          // 图的标题
          title: {
            text: "图谱"
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
              repulsion: 2500,
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
            //data: graphPoint,
            //links: graphLink,
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
      modelTest(){
        this.fullscreenLoading = true;
        let fd = new FormData();
        fd.append('algorithm', this.algorithm);
        console.log(this.algorithm)
        this.$http.post(
          'http://49.232.95.141:8000/pic/text_test',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
            console.log(res)
            this.fullscreenLoading = false;
            if(res.data[0]===0){
              this.$alert('<p><strong>实体抽取效率： <i>' + res.data[1] + '</i> 条/秒</strong></p>' +
                '<p><strong>关系抽取效率： <i>' + res.data[2] + '</i> 条/秒</strong></p>', this.algorithm + '模型测试结果', {
                dangerouslyUseHTMLString: true
              });
            }
            else{
              this.$alert('<p><strong>实体抽取准确率： <i>' + res.data[1] + '</i> </strong></p>' +
                '<p><strong>实体抽取召回率： <i>' + res.data[2] + '</i> </strong></p>', this.algorithm + '模型测试结果', {
                dangerouslyUseHTMLString: true
              });
            }
          }).catch((res) => {

          })
      },
      //选择算法，显示对应测试集和训练集
      chooseTable(){
        let fd = new FormData();
        fd.append('algorithm', this.algorithm);
        this.loadingRes = true;
        this.$http.post(
          'http://49.232.95.141:8000/pic/load_textData',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
             console.log(res)
            this.trainData = res.data[0].map((cur) => {
              return {title:cur};
            });
            this.testData = res.data[1].map((cur) => {
              return {title:cur};
            });
            this.fileCountTest = this.testData.length;
            this.fileCountTrain = this.trainData.length;

            this.loadingRes = false;
          }).catch((res) => {
            console.log(res)
            alert('出错了！')
            this.loadingRes = false;
          })
      },
      handleCurrentChangeTest(cpage) {
        this.curPageTest = cpage;
      },
      handleCurrentChangeTrain(cpage) {
        this.curPageTrain = cpage;
      },
      //查看文书内容
      handleAnalysis(row){
        this.selectTitle = row.title;
        let fd = new FormData();
        fd.append('algorithm', this.algorithm);
        fd.append('filename', row.title);
        console.log(this.algorithm)
        this.loadingRes = true;
        this.$http.post(
          'http://49.232.95.141:8000/pic/view_textData',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
            console.log(res.data)
            this.textData = res.data;
            this.loadingRes = false;
          }).catch((res) =>{
            console.log(res)
            this.loadingRes = false;
          })
        this.diaVisible=true;

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

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
  .el-submenu{
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
    width: 47%;
    display: inline-block;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  }
  /*分页符*/
  .el-pagination{
    right: 60px;
    height: 10%;
    text-align: right;
    margin-top: 40px;
  }

  /*echarts*/

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
