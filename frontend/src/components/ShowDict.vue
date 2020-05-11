<template>
  <el-container>
    <!--内容块实体对齐-->
    <el-main>
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
          type="primary"
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click=""
        >文本纠错</el-button>
        <el-button
          type="primary"
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click=""
        >OCR识别</el-button>
        <el-button
          type="primary"
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click=""
        >标注</el-button>
        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click=""
        >分词</el-button>
      </div>
      <div class="result" style="margin-bottom:50px;height:100%"
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
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
        <!-- 表格部分
        <el-table
          :data="tableData"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          border
        >
          <el-table-column
            v-for="(item, index) in columnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label"
          ></el-table-column>
        </el-table>
      </div> -->
    </el-main>
  </el-container>
</template>

<script>
import { option } from "../js/echartSettings";
export default {
  name: "ShowDict",
  data() {
    return {
      typeSelect: "",
      loadingRes: false,
      typeList: ["通用词典", "军语词典", "地名词典"],
      columnNames:[],
      tableData:[],
      dictCount:0,
      curPage:1,
      tags:[],
      tagType:''
    };
  },
  methods: {
    showDict() {
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
</style>
