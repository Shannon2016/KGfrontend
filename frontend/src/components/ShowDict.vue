<template>
  <el-container>
    <!--内容块预处理-->
    <el-main v-if="!isSearch">
      <!--顶部-->
      <div class="header">文本预处理</div>
      <el-divider></el-divider>
      <!--中心-->
      <div class="top-tip">
        <span style="margin-left:10px;">请选择词典：</span>
        <el-select v-model="typeSelect" placeholder size="small" style="margin-left:20px;">
          <el-option v-for="(item, index) in typeList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
        <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="showDict">确定</el-button>


        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click="joinGraph"
        >加入图谱</el-button>
        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click="loadTagDirectory"
        >加载标注目录</el-button>
        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click="loadJS"
        >加载JS文书</el-button>
      </div>

      <div class="result" style="margin-bottom:50px;height:100%" v-show="!isList"
        v-loading="loadingRes"
        element-loading-text="正在加载中，请稍等……"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.1)">
        <span v-if="tipFlag" style="margin-left:30px;margin-top:20px;font-weight: bold">请选择词典进行查看</span>
        <div style="text-align:center;">
          <el-tag
            v-for="(item, index) in tags.slice((curPage - 1) * 100, curPage * 100)"
            :key="index"
            :type="tagType"
            class="tagStyle">
            {{item}}
          </el-tag>
        </div>
        <el-pagination
          v-if="paginationFlag"
          background
          layout="prev, pager, next, jumper"
          :total="dictCount"
          :current-page.sync="curPage"
          :page-size="100"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>

      <div v-if="isList">
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading">
          <el-col :span="12">
            <el-table
              :data="tableData.slice((curPageFile - 1) * 10, curPageFile * 10)"
              :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
              height="626"
              style="width:97%"
              border>
              <el-table-column
                prop="title"
                label="文书名">
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
              :total="fileCount"
              :current-page.sync="curPageFile"
              @current-change="handleCurrentChangeFile">
            </el-pagination>
            <!--</el-pagination> -->
          </el-col>
          <el-col :span="12" style="background-color:#FFF;min-height:625px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)">
            <div class="tableHeader">文件浏览
              <span v-if="textData===''">(选择文件以浏览内容)</span>
            </div>
            <div style="padding:0 15px;">
                <pre style="word-break: break-word;word-wrap: break-word;white-space: break-spaces;">
                  {{textData}}
                </pre>
            </div>
          </el-col>
        </el-row>
      </div>

    </el-main>
    <el-main v-show="isSearch">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="isSearch=false"></i>
        </div>
      <el-divider></el-divider>
      <el-input v-model="inputEntity" placeholder="实体名" style="width:450px;"></el-input>
      <el-button style="margin-left:20px;height: 40px" class="darkBtn" size="small" @click="searchGraph">搜索</el-button>

      <!--中心-->
      <div class="main" id="daddy" v-show="isGraph"
           v-loading="loadingResGraph"
           element-loading-text="正在加载中，请稍等……"
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(0, 0, 0, 0.2)">
        <div id="graph" style="width: 1200px;height:800px;"></div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  import {option} from '../js/echartSettings'
  let echarts = require('echarts');
  let myChart;
export default {
  name: "ShowDict",
  data() {
    return {
      typeSelect: "",
      loadingRes: false,
      typeList: ["通用词典", "军语词典", "地名词典"],
      columnNames:[],
      fileCount:0,
      tableData:[],
      curPageFile:1,
      dictCount:0,
      curPage:1,
      tags:[],
      tagType:'',
      //列表浏览相关
      selectTitle:"",
      textData:"",
      isList:false,
      //图谱搜索相关
      isSearch:false,
      inputEntity:"",
      loadingResGraph:false,
      isGraph:false,
    };
  },
  methods: {
    searchGraph(){
      let fd = new FormData();
      fd.append("entity", this.inputEntity);
      this.$http
        .post("http://49.232.95.141:8000/neo/", fd)
        .then(res => {
          console.log(res.data);
          if(res.data.length===0){
            this.$message({
                message: "未搜索到该实体！",
                type: "warning"
              });
              return;
          }
          this.isGraph=true;
          let graphPoint=[{
            name: res.data,
            category: 1,
          }];
          let Myoption = JSON.parse(JSON.stringify(option));
          Myoption["series"][0]["data"] = graphPoint;

          myChart = echarts.init(document.getElementById("graph"));
          // 绘制图表
          myChart.setOption(Myoption, true);
        }).catch((res)=>{
        console.log(res);
      });
    },
    joinGraph(){
      this.isSearch=true;
      this.isGraph=false;
      this.inputEntity="";
    },
    handleAnalysis(row){
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append('algorithm', "正则表达式");
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

    },
    loadJS(){
      this.isList=true;
      this.loadingRes = true;
      let fd = new FormData();
      fd.append('algorithm', '正则表达式');
      this.$http.post(
        'http://49.232.95.141:8000/pic/load_textData',fd,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
        this.textData = '';
        this.tableData = res.data[1].map((cur) => {
          return {title:cur};
        });
        this.fileCount = this.tableData.length;
        this.loadingRes = false;
        console.log(this.tableData)
        console.log(this.fileCount)

      }).catch((res) => {
        console.log(res)
        alert('出错了！')
        this.loadingRes = false;
      })
    },
    loadTagDirectory(){
      this.isList=true;
      this.loadingRes = true;
      let fd = new FormData();
      fd.append('algorithm', '正则表达式');
      this.$http.post(
        'http://49.232.95.141:8000/pic/load_textData',fd,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
        this.textData = '';
        this.tableData = res.data[1].map((cur) => {
          return {title:cur};
        });
        this.fileCount = this.tableData.length;
        this.loadingRes = false;
        console.log(this.tableData)
        console.log(this.fileCount)

      }).catch((res) => {
        console.log(res)
        alert('出错了！')
        this.loadingRes = false;
      })
    },
    showDict() {
      this.isList=false;
      this.loadingRes = true;
      this.curPage = 1;
      let fd = new FormData();
      fd.append('dict', this.typeSelect+".csv")
      this.$http
        .post("http://49.232.95.141:8000/pic/show_dict", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.tags = res.data.map(cur => {
            return cur[0];
          })
          this.dictCount = res.data.length;
          if(this.typeSelect === '军语词典') this.tagType = 'success';
          else if (this.typeSelect === '地名词典') this.tagType = 'warning';
          else this.tagType = '';
          this.loadingRes = false;
        })
        .catch(res => {
          //请求失败
          console.log(res)
          this.loadingRes = false;
        });
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    },
    handleCurrentChangeFile(cpageFile) {
      this.curPageFile = cpageFile;
    }
  },
  computed: {
    tipFlag: function(){
      return (!this.loadingRes && this.tags.length === 0)
    },
    paginationFlag: function() {
      return (!this.loadingRes && this.tags.length > 0)
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

.tagStyle{
  width:150px;
  text-align: center;
  margin-top:20px;
  margin-left:20px;
}

.tableHeader{
  height:55px;
  width:100%;
  background-color:#EBEEF7;
  color:#606266;
  line-height:55px;
  padding: 0 10px;
  font-weight:bold;
  font-size: 14px;
}
</style>
