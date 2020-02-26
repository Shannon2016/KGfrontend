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
        <el-menu-item index="/extractStruct">
          <i class="el-icon-menu"></i>
          <span slot="title">结构化数据抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractPic">
          <i class="el-icon-menu"></i>
          <span slot="title" >图片抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractVedio" class="is-active">
          <i class="el-icon-document"></i>
          <span slot="title">视频抽取</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        视频抽取
        <el-button type="primary" class="darkBtn headbutton" size="small" @click="onUpload">上传与分析</el-button>
      </div>
      <!-- 上传窗口-->
      <div id="upload" v-if="isUpload">
        <el-card class="box-card">
        <div slot="header" class="clearfix">
            <span>语料上传</span>
            <i class="el-icon-close" style="float: right; padding: 3px 0" @click="cancelUpload"></i>
        </div>
        <el-upload
            class="upload-demo"
            drag
            ref="upload"
            :auto-upload="false"
            accept=".mp4"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-remove="handleRemove"
            :on-change="handleAddFile"
            :file-list="uploadList"
            :limit="1"
            :on-exceed="handleExceed"
            multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
            仅支持上传mp4文件<br>
            限制上传1个视频<br>
            </div>
        </el-upload>
        <el-button size="small" @click="cancelUpload">取消</el-button>
        <el-button style="margin-left: 10px;" class="darkBtn" size="small" type="primary" @click="submitUpload">上传并分析</el-button>
        </el-card>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <div class="main">
        <div v-if="!flag" style="margin-left:50px;">提示：请先上传视频进行分析</div>
        <div class="resultContainer" style="height:50px;" v-if="vedioList.length!==0">
          <div class="picName title">序号</div>
          <div class="picStyle title">抽取结果</div>
          <div class="graphStyle title">实体关系展示</div>
        </div>
        <div v-for="(item, index) in vedioList" v-bind:key="index">
          <div class="resultContainer">
            <div class="picName">
              <span style="position:relative; top:230px;">
                视频{{index + 1}}
              </span>
            </div>
            <div class="picStyle" style="display:flex; align-items:center;">
              <video :src="item" controls="controls" style="width:100%;">
                      </video>
              <!-- <el-image :src="item.src"  fit="contain">
                  <div slot="placeholder" class="image-slot">
                      加载中<span class="dot">...</span>
                  </div>
              </el-image> -->
            </div>
            <v-echart :id="'graph'+index" class="graphStyle" :options="item.options"></v-echart>
          </div>
        </div>
         <!-- <el-tabs style="margin:0 15px;">
          <el-tab-pane label="抽取结果" name="first">
            视频展示
            <div v-if="!flag">请先上传文件分析</div>
            <div class="picContainer" v-else>
                <el-carousel trigger="click" style="height:100%;" :autoplay="false">
                    <el-carousel-item v-for="item in vedioList" :key="item" style="height:100%;">
                      <video :src="item" controls="controls" style="width:100%;">
                      </video>
                    </el-carousel-item>
                </el-carousel>
            </div>
          </el-tab-pane>
          <el-tab-pane label="图谱展示" name="second">
            <div v-if="!flag">请先上传文件分析</div>
            <div v-show="flag" id="daddy">
              <div>
                请选择要查看的图片：
                <el-select v-model="optIndex" size="small">
                  <el-option
                    v-for="(item, index) in optList"
                    :key="index"
                    :label="item"
                    :value="index">
                  </el-option>
                </el-select>
                <el-button @click="onSelect" class="blueBtn" size="small">确定</el-button>
              </div>
              <div id="graph" style="width:1000px; height:750px;"></div>
            </div>
          </el-tab-pane>
        </el-tabs> -->
      </div>
    </el-main>
  </el-container>
</template>

<script>
  let echarts = require('echarts');
  let myChart;
  let categories=[
    {name:'属性A'},
    {name:'属性B'},
  ];
  export default {
    name: 'ExtractPic',
    data () {
      return {
        vedioList: [],
        isUpload:false,
        uploadList:[],
        optList:[],
        flag:false,
        optIndex:''
      }
    },

    methods: {
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      onUpload(){
        this.isUpload = true;
      },
      cancelUpload(){
        this.isUpload=false;
        this.uploadList=[];
      },
      submitUpload() {
        //上传
//         let fd = new FormData()
//         fd.append('video',this.uploadList[0].raw)
//         this.$http.post(
//           'http://127.0.0.1:8000/video/extract',fd,
//           {
//          headers: {
//           'Content-Type': 'multipart/form-data'
//           }
//         }).then((res) => {
//             //成功 发起分析的请求
//           console.log(res)
//           this.vedioList = []
//           //设置echarts
//           let option ={
//             // 图的标题
//             title: {
//               text: 'test'
//             },
//             // 提示框的配置
//             tooltip: {
//               formatter: function (x) {
//                 return x.data.des;
//               }
//             },
//             // 工具箱
//             toolbox: {
//               // 显示工具箱
//               show: true,
//               feature: {
//                 mark: {
//                   show: true
//                 },
//                 // 还原
//                 restore: {
//                   show: true
//                 },
//                 // 保存为图片
//                 saveAsImage: {
//                   show: true
//                 }
//               }
//             },
//             legend: [{
//               // selectedMode: 'single',
//               data: categories.map(function (a) {
//                 return a.name;
//               })
//             }],
//             series: [{
//               type: 'graph', // 类型:关系图
//               layout: 'force', //图的布局，类型为力导图
//               symbolSize: 40, // 调整节点的大小
//               roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
//               edgeSymbol: ['circle', 'arrow'],
//               edgeSymbolSize: [2, 10],
//               edgeLabel: {
//                 normal: {
//                   textStyle: {
//                     fontSize: 20
//                   }
//                 }
//               },
//               force: {
//                 repulsion: 2500,
//                 edgeLength: [10, 50]
//               },
//               draggable: true,
//               lineStyle: {
//                 normal: {
//                   width: 2,
//                   color: '#4b565b',
//                 }
//               },
//               edgeLabel: {
//                 normal: {
//                   show: true,
//                   formatter: function (x) {
//                     return x.data.name;
//                   }
//                 }
//               },
//               label: {
//                 normal: {
//                   show: true,
//                   textStyle: {}
//                 }
//               },
//               // 数据
//               data: [{
//                 name: 'node01',
//                 des: 'nodedes01',
//                 symbolSize: 70,
//                 category: 0,
//               }, {
//                 name: 'node02',
//                 des: 'nodedes02',
//                 symbolSize: 50,
//                 category: 1,
//               }, {
//                 name: 'node03',
//                 des: 'nodedes3',
//                 symbolSize: 50,
//                 category: 1,
//               }, {
//                 name: 'node04',
//                 des: 'nodedes04',
//                 symbolSize: 50,
//                 category: 1,
//               }, {
//                 name: 'node05',
//                 des: 'nodedes05',
//                 symbolSize: 50,
//                 category: 1,
//               }],
//               links: [{
//                 source: 'node01',
//                 target: 'node02',
//                 name: 'link01',
//                 des: 'link01des'
//               }, {
//                 source: 'node01',
//                 target: 'node03',
//                 name: 'link02',
//                 des: 'link02des'
//               }, {
//                 source: 'node01',
//                 target: 'node04',
//                 name: 'link03',
//                 des: 'link03des'
//               }, {
//                 source: 'node01',
//                 target: 'node05',
//                 name: 'link04',
//                 des: 'link05des'
//               }],
//               categories: categories,
//             }],
//             grid:{
//               top:"10px",
//               bottom:"10px",
//               height:"10px",
//               width:"10px"
//             }
//           }
//           this.vedioList.push({src:res.data, options:option})
//         }).catch((res) => {
//           //请求失败
          
//         })
        
        //前端测试
        //设置echarts
        let option ={
          // 图的标题
          title: {
            text: 'test'
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
            data: [{
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
            }],
            links: [{
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
            }],
            categories: categories,
          }],
          grid:{
            top:"10px",
            bottom:"10px",
            height:"10px",
            width:"10px"
          }
        }
        this.vedioList=[];
        this.vedioList.push({src:"https://vdept.bdstatic.com/766c61556a637862494d525073497967/7168786b72575243/2fdfac5ac676dae096ae25bc9c5174f9e3e80c313b38d89c35da8272a09144ca64f32cf743c8a7c74223a4e449954793.mp4?auth_key=1581744001-0-0-72974359bb3fe4e6c0416d25ee7e6b0a", options:option});
        //测试结束
        this.flag = true;
        this.isUpload = false;
      },
      handleRemove(file, fileList) {
        this.uploadList = fileList;
      },
      handleAddFile(file,fileList){
        console.log(file);
        console.log(fileList);
        this.uploadList = fileList;
      }
    }
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

  #daddy{
    width:100%;
    height: 100%;
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
  /*视频及echarts样式*/
  .resultContainer{
    height: 500px;
    width: 100%;
    padding:0 20px;
    display: flex;
    justify-content: center;
  }

  .picStyle{
    height:100%;
    width:600px;
    /* border-right: solid 1px #DCDFE6; */
    padding-right: 40px;
    padding-left: 40px;
  }

  .graphStyle{
    height:100%;
    width:600px;
    padding-left: 40px;
  }

  .el-image{
      height:100% !important;
  }

  .title{
    text-align: center;
    font-weight: bold;
    font-size: large;
    padding-bottom: 30px;
  }

  .picName{
    width:50px;
    text-align: center;
    /* border-right: solid 1px #DCDFE6; */
    padding-right: 40px;
  }
</style>

