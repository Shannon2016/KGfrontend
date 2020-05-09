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
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-document"></i>
            <span>文本抽取</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/showDict">词典展示</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <el-menu-item index="/extract">知识抽取</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-s-grid"></i>
            <span>结构化数据抽取</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/showOntoloty"   class="is-active">本体展示</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <el-menu-item index="/extractStruct">知识抽取</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <el-menu-item index="/entityMatch">实体对齐</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-menu-item index="/extractPic">
          <i class="el-icon-picture-outline"></i>
          <span slot="title" >图片抽取</span>
        </el-menu-item>
        <el-menu-item index="/extractVedio">
          <i class="el-icon-video-camera"></i>
          <span slot="title">视频抽取</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--内容块实体对齐-->
    <div
      v-loading.fullscreen.lock="loadingRes"
      element-loading-text="正在处理中，请稍等……"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"></div>
    <el-main>
      <!--顶部-->
      <div class="header">
        本体展示
      </div>
      <el-divider></el-divider>
      <!--中心-->
    </el-main>
  </el-container>
</template>

<script>
    export default {
        name: "ShowOntoloty",
      data(){
          return{
            loadingRes:false,
          }
      },
      methods:{

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

  /***********按钮样式***********/
  .blueBtn{
    margin-left: 5%;
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
